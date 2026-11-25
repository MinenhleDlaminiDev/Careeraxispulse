-- ============================================================================
-- AXIS-56 - Every Axis Interview Code sale gets a row, forever.
-- Run once in the Supabase SQL Editor. Safe to re-run (idempotent).
--
-- THE PROBLEM. profiles.interview_access_expires_at is the only Axis Code
-- field there has ever been, and it holds the CURRENT expiry. That makes it
-- useless as a sales record:
--
--   * a revoke writes null, so the proof the client ever paid is erased
--   * a renewal overwrites the old expiry, so two sales read as one
--   * the purchase date is never stored at all, only guessable as
--     expiry minus 30 days, and only while nobody has ever extended
--
-- THE FIX. public.access_grants, one row per grant, never updated and never
-- deleted by the app. The expiry column stays exactly as it is: it answers
-- "does this client have access right now", which is a different question and
-- the one every gate in the portal asks. Two questions, two fields.
--
-- WHY A TRIGGER AND NOT REACT. The same lesson AXIS-54 paid for. A trigger
-- catches every route into the data: the admin Clients grid, the client detail
-- page, the Supabase table editor, a raw API call. A write inside
-- setAccessExpiry() in src/portal/clientAccess.js would only catch the button.
-- The WHEN clause below is copied verbatim from on_access_granted_email, so
-- the email and the log fire off exactly the same event and can never
-- disagree about what happened.
--
-- NO AMOUNT COLUMN. The trigger cannot know what was actually charged, and a
-- column nothing is able to set is worse than no column. Reporting values
-- these at the INTERVIEW_PRICE list price (R90, src/payments.js) and says so
-- on screen. An amount arrives when there is a field to type it into, the way
-- cv_orders.amount works.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. The table
-- ---------------------------------------------------------------------------
create table if not exists public.access_grants (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  -- When the sale happened. For a live grant this is now(); for the one-off
  -- backfill below it is an estimate, which is what `source` is for.
  granted_at timestamptz not null default now(),
  -- The expiry this grant set. Kept on the row so history survives the next
  -- renewal overwriting the profiles column.
  expires_at timestamptz not null,
  -- 'grant' = logged by the trigger as it happened, so the date is exact.
  -- 'backfill' = reconstructed from the profiles column when this migration
  -- first ran, so the date is expiry minus 30 days and may be wrong. Reporting
  -- can mark these rather than presenting a guess as a fact.
  source     text not null default 'grant' check (source in ('grant', 'backfill')),
  note       text
);

-- Per-client history, newest first (the client detail page).
create index if not exists access_grants_user_granted_idx
  on public.access_grants (user_id, granted_at desc);
-- Sales over time, for the reporting screen.
create index if not exists access_grants_granted_idx
  on public.access_grants (granted_at desc);

alter table public.access_grants enable row level security;

-- A client reads their own purchase history and can never write one. Only
-- admins write, and in practice only the trigger does, which runs as definer
-- and so is not bound by these policies at all.
drop policy if exists access_grants_select on public.access_grants;
create policy access_grants_select on public.access_grants
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists access_grants_admin_write on public.access_grants;
create policy access_grants_admin_write on public.access_grants
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 2. The trigger
-- ---------------------------------------------------------------------------
-- Logging must never break the grant that caused it. Same rule the AXIS-54
-- emails follow: a failed log cannot undo a client's access. The exception
-- block swallows and warns.
create or replace function public.log_access_grant()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.access_grants (user_id, granted_at, expires_at, source)
  values (new.id, now(), new.interview_access_expires_at, 'grant');
  return new;
exception when others then
  raise warning '[access_grants] could not log the grant for %: %', new.id, sqlerrm;
  return new;
end;
$$;

-- The WHEN clause is on_access_granted_email's, word for word. A future date
-- is a sale; null is a revoke and logs nothing, which is the whole reason the
-- history outlives the revoke.
drop trigger if exists on_access_grant_logged on public.profiles;
create trigger on_access_grant_logged
  after update of interview_access_expires_at on public.profiles
  for each row
  when (
    new.interview_access_expires_at is distinct from old.interview_access_expires_at
    and new.interview_access_expires_at is not null
    and new.interview_access_expires_at > now()
  )
  execute function public.log_access_grant();

-- ---------------------------------------------------------------------------
-- 3. One-off backfill
-- ---------------------------------------------------------------------------
-- Every client who holds an expiry today gets one reconstructed row, dated 30
-- days before that expiry because THIRTY_DAYS_MS is the only period the portal
-- has ever granted. Clients whose access was already revoked are
-- unrecoverable: there is nothing left to reconstruct from, and that is the
-- cost of having had no log until now.
--
-- Clients only. Admin accounts carry an expiry from testing and are not sales.
-- The not-exists guard is what makes re-running this file harmless.
insert into public.access_grants (user_id, granted_at, expires_at, source, note)
select
  p.id,
  p.interview_access_expires_at - interval '30 days',
  p.interview_access_expires_at,
  'backfill',
  'Reconstructed from profiles.interview_access_expires_at when AXIS-56 shipped. The date is an estimate.'
from public.profiles p
where p.role = 'client'
  and p.interview_access_expires_at is not null
  and not exists (
    select 1 from public.access_grants g where g.user_id = p.id
  );
