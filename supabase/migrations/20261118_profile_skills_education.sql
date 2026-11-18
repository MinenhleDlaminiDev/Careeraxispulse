-- ============================================================================
-- AXIS-42 — skills and education on the profile.
-- Run once in the Supabase SQL Editor. Safe to re-run (idempotent).
--
-- Both are jsonb arrays rather than text[]:
--   skills    ["Project Management", "Microsoft Excel", ...]
--   education [{"qualification": "...", "field_of_study": "...",
--               "institution": "...", "year": "..."}, ...]
-- education has to hold objects, and keeping skills in the same shape means
-- supabase-js sends and reads both the same way — a text[] would need its own
-- array handling on every screen for no gain.
--
-- Null = never filled in. The app stores null rather than [] for an emptied
-- list, so no screen has to tell the two apart.
-- ============================================================================

alter table public.profiles
  add column if not exists skills    jsonb,
  add column if not exists education jsonb;

-- Replace handle_new_user so a new signup lands these alongside the AXIS-21
-- fields. `->` (not `->>`) keeps them as jsonb; a signup that sends neither
-- gets null for both, which is exactly the "never filled in" state.
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
    employment_status, change_driver,
    skills, education
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
    new.raw_user_meta_data ->> 'change_driver',
    new.raw_user_meta_data -> 'skills',
    new.raw_user_meta_data -> 'education'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
