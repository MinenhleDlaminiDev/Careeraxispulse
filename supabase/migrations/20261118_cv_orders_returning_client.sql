-- ============================================================================
-- AXIS-41 — returning CV-revamp clients pay returning prices.
-- Run once in the Supabase SQL Editor. Safe to re-run (idempotent).
--
-- Two pieces:
--
--   1. public.cv_orders — every revamp the admin confirms gets a row. This is
--      the history, and it is what makes "returning" self-maintaining: once the
--      first order is recorded, the next purchase is automatically priced as a
--      returning one. No flag to remember to tick.
--
--   2. public.profiles.returning_client — the manual override, for the clients
--      the admin served before this system existed and who therefore have no
--      order history to derive from.
--
-- A client is returning when returning_client is true OR they have at least one
-- confirmed cv_orders row. The OR is the whole mechanism; nothing writes the
-- flag automatically, so the two sources never fight each other.
--
-- SECURITY: returning_client decides what a client is charged, so it is added
-- to the AXIS-28 privilege guard alongside role and access expiry. Without that
-- a client could tick it on their own profile row (the profiles_self_update
-- policy lets them update their own row) and hand themselves the lower price.
-- cv_orders is admin-write-only for the same reason.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. cv_orders
-- ---------------------------------------------------------------------------
create table if not exists public.cv_orders (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  -- Matches the CV_TIERS keys in src/payments.js.
  tier         text not null check (tier in ('entry', 'mid', 'senior', 'executive')),
  -- What was actually charged, in rand. Nullable because an order recorded
  -- after the fact may not have the amount to hand.
  amount       numeric(10, 2),
  status       text not null default 'confirmed' check (status in ('pending', 'confirmed', 'refunded')),
  -- Was THIS order charged at the returning price? History, not a gate — the
  -- gate is the existence of a confirmed row.
  is_returning boolean not null default false,
  note         text,
  created_at   timestamptz not null default now()
);

create index if not exists cv_orders_user_created_idx
  on public.cv_orders (user_id, created_at desc);

alter table public.cv_orders enable row level security;

-- A client reads their own orders (so the portal can price their next revamp)
-- and can never write one. Only admins create or change them.
drop policy if exists cv_orders_select on public.cv_orders;
create policy cv_orders_select on public.cv_orders
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists cv_orders_admin_write on public.cv_orders;
create policy cv_orders_admin_write on public.cv_orders
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 2. profiles.returning_client + the privilege guard
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists returning_client boolean not null default false;

-- Same function as AXIS-28, with returning_client added to the locked set.
create or replace function public.profiles_block_privilege_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    -- Role and access can never be self-set (no privilege escalation);
    -- returning_client decides the price a client is charged, so it is the same
    -- kind of field (AXIS-41); id and email are the auth identity, kept in sync
    -- with auth.users, so a client can't drift them out of band either.
    if new.role is distinct from old.role
       or new.interview_access_expires_at is distinct from old.interview_access_expires_at
       or new.returning_client is distinct from old.returning_client
       or new.id is distinct from old.id
       or new.email is distinct from old.email then
      raise exception 'Not allowed to change role, access, returning status, id or email';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard_privilege on public.profiles;
create trigger profiles_guard_privilege
  before update on public.profiles
  for each row execute function public.profiles_block_privilege_change();
