-- ============================================================================
-- AXIS-21 — expand profiles with non-CV signup fields.
-- Run once in the Supabase SQL Editor. Safe to re-run (idempotent).
--
-- Adds the fields a CV does not carry (target role, intent, job-search context)
-- and teaches the signup trigger to copy them from the auth metadata.
-- ============================================================================

alter table public.profiles
  add column if not exists phone             text,
  add column if not exists location          text,
  add column if not exists linkedin_url      text,
  add column if not exists target_role       text,
  add column if not exists target_industry   text,
  add column if not exists seniority_level   text,
  add column if not exists target_companies  text,
  add column if not exists employment_status text,
  add column if not exists change_driver     text;

-- Replace handle_new_user so a new signup lands these fields on the profile row.
-- The frontend passes them in raw_user_meta_data; blank optional fields arrive
-- as null (the form sends null, not '').
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id, full_name, email, role,
    phone, location, linkedin_url,
    target_role, target_industry, seniority_level, target_companies,
    employment_status, change_driver
  )
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.email,
    'client',
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'location',
    new.raw_user_meta_data ->> 'linkedin_url',
    new.raw_user_meta_data ->> 'target_role',
    new.raw_user_meta_data ->> 'target_industry',
    new.raw_user_meta_data ->> 'seniority_level',
    new.raw_user_meta_data ->> 'target_companies',
    new.raw_user_meta_data ->> 'employment_status',
    new.raw_user_meta_data ->> 'change_driver'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
