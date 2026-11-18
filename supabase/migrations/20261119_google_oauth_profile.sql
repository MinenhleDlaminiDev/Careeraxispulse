-- ============================================================================
-- AXIS-43 — Google sign-up / sign-in.
-- Run once in the Supabase SQL Editor. Safe to re-run (idempotent).
--
-- Google hands back only three things: name, email and a picture URL. Two
-- consequences for the profile row:
--
--   1. The name arrives under 'name', not the 'full_name' our own signup form
--      sends. handle_new_user now accepts either.
--
--   2. The picture is a PUBLIC https URL. profiles.avatar_path is a PATH into
--      the PRIVATE 'avatars' bucket, which Avatar.jsx turns into a short-lived
--      signed URL — it cannot sign a foreign URL, so putting Google's link in
--      that column would silently show initials instead of the photo. External
--      photos therefore get their own column, and Avatar prefers an uploaded
--      avatar_path over it. A Google user who later uploads a photo keeps that
--      one, because the upload wins.
--
-- Everything else a Google user is missing (phone, location, target role and
-- so on) is collected by the completion gate in the app, not here. The row is
-- deliberately created incomplete rather than guessed at.
-- ============================================================================

alter table public.profiles
  add column if not exists avatar_url text;

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
    skills, education,
    avatar_url
  )
  values (
    new.id,
    -- Our signup form sends full_name; Google sends name. coalesce also drops
    -- an empty string, so a blank one doesn't beat a usable fallback.
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      nullif(trim(new.raw_user_meta_data ->> 'name'), '')
    ),
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
    -- `->` not `->>`: these two stay jsonb arrays (AXIS-42).
    new.raw_user_meta_data -> 'skills',
    new.raw_user_meta_data -> 'education',
    -- Google uses 'picture'; some providers use 'avatar_url'. Take either.
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'avatar_url'), ''),
      nullif(trim(new.raw_user_meta_data ->> 'picture'), '')
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
