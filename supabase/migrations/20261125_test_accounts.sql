-- ============================================================================
-- AXIS-58 - Test accounts stay in the system but stay out of the numbers.
-- Run once in the Supabase SQL Editor. Safe to re-run (idempotent).
--
-- THE PROBLEM. client@careerpulseaxis.co.za is how the portal gets tested, so
-- it must not be deleted. But the Dashboard counts it as a real client, and not
-- in one place: it was inflating the client count, putting a bar on the signup
-- chart, adding an Axis Code sale, adding R90 of revenue, and dragging the
-- paying-client share with it. Five wrong figures from one account.
--
-- THE FIX. A flag on the ACCOUNT, not on any one sale. Every figure on that
-- screen is already counted off the client list, so one filter there removes
-- the account from all five at once. Hiding a single grant would have fixed one
-- of the five and left the rest quietly wrong.
--
-- WHY NOT A THIRD VALUE IN role. role answers "client or admin". This answers
-- "real or test". They are different questions, and a field that answers two
-- has to be unpicked by every query that filters on it. AXIS-41 made the same
-- call with returning_client, and the pipeline's own notes record what putting
-- a second meaning into a status column cost on another project.
--
-- The flag gates nothing, so a client setting it could not steal access. They
-- could, though, quietly take themselves out of the business's own reporting,
-- so it joins role, access expiry and returning_client in the privilege guard.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. The column
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists is_test_account boolean not null default false;

comment on column public.profiles.is_test_account is
  'AXIS-58: a staff test account. Left out of every Dashboard figure, but kept '
  'everywhere else, so it still appears on the Clients screen and can still be '
  'used to test the portal. Never set by a client: see the privilege guard.';

-- Reporting reads every client row and filters in the browser, so no index is
-- needed for this. It exists to be read, not searched on.

-- ---------------------------------------------------------------------------
-- 2. The privilege guard, with the new column added to the locked set
-- ---------------------------------------------------------------------------
-- Same function as AXIS-28 and AXIS-41, recreated because it names its fields
-- one by one. auth.uid() is null in the SQL editor and for the service role, so
-- the update at the bottom of this file is unaffected; only signed-in end users
-- are checked.
create or replace function public.profiles_block_privilege_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    -- Role and access can never be self-set (no privilege escalation);
    -- returning_client decides the price a client is charged (AXIS-41);
    -- is_test_account decides whether they appear in the business's own
    -- reporting (AXIS-58); id and email are the auth identity, kept in sync
    -- with auth.users, so a client can't drift them out of band either.
    if new.role is distinct from old.role
       or new.interview_access_expires_at is distinct from old.interview_access_expires_at
       or new.returning_client is distinct from old.returning_client
       or new.is_test_account is distinct from old.is_test_account
       or new.id is distinct from old.id
       or new.email is distinct from old.email then
      raise exception 'Not allowed to change role, access, returning status, test flag, id or email';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard_privilege on public.profiles;
create trigger profiles_guard_privilege
  before update on public.profiles
  for each row execute function public.profiles_block_privilege_change();

-- ---------------------------------------------------------------------------
-- 3. Flag the one test account there is today
-- ---------------------------------------------------------------------------
-- By email, not by id, so this file reads as what it means and stays correct if
-- the account is ever recreated. The three admin accounts need no flag: the
-- Dashboard only ever counts rows whose role is 'client'.
--
-- To add another test account later, run the same update with its address. To
-- undo one, set the flag back to false; nothing else has to change.
update public.profiles
   set is_test_account = true
 where email = 'client@careerpulseaxis.co.za'
   and is_test_account is distinct from true;
