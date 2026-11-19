-- ============================================================================
-- AXIS-47 — CV-sharing consent, required for NEW profiles only.
-- Run once in the Supabase SQL Editor. Safe to re-run (idempotent).
--
-- The client ticks a box at signup giving CareerPulse Axis permission to share
-- their CV and profile with employers and recruiters looking for candidates.
--
-- THREE columns, and the third is the important one:
--
--   cv_sharing_consent      did they say yes?
--   cv_sharing_consent_at   when? A consent with no date is hard to stand
--                           behind if it is ever questioned, and the date
--                           costs nothing to keep.
--   cv_consent_required     must this client answer at all?
--
-- Clients who already existed when this shipped are NOT required to answer.
-- They carry on exactly as before and the completion gate never stops them.
--
-- Note what is deliberately NOT done here: existing rows are not backfilled to
-- cv_sharing_consent = true. That would record a consent those clients never
-- gave, which is worse than having no consent at all — it would be a false
-- record. They are marked "not required" instead, so the honest answer to
-- "did they agree?" stays "we never asked".
--
-- The backfill below runs over the rows that exist at the moment you run it.
-- Every row inserted afterwards takes the column default of true, so new
-- signups are required to answer with nothing further to maintain.
--
-- NOT in the privilege guard, deliberately. A client setting their own consent
-- is the entire point — unlike role, access or returning_client, this choice
-- belongs to them. profiles_self_update already allows it, and the admin can
-- clear it to honour a withdrawal request.
-- ============================================================================

alter table public.profiles
  add column if not exists cv_sharing_consent    boolean not null default false,
  add column if not exists cv_sharing_consent_at timestamptz,
  add column if not exists cv_consent_required   boolean not null default true;

-- Grandfather everyone who already has an account. `where cv_consent_required`
-- makes the statement safe to re-run: on a second run the rows it already
-- cleared no longer match, so a client who signed up and consented in between
-- is never silently exempted.
update public.profiles
   set cv_consent_required = false
 where cv_consent_required
   and created_at < now();

-- handle_new_user carries the consent through from signup metadata, so a
-- client who ticks the box at signup arrives already consented rather than
-- being asked a second time by the completion gate. cv_consent_required is
-- left at its default of true for every new row.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  consented boolean := coalesce((new.raw_user_meta_data ->> 'cv_sharing_consent')::boolean, false);
begin
  insert into public.profiles (
    id, full_name, email, role,
    phone, location, linkedin_url,
    target_role, target_industry, seniority_level, target_companies,
    employment_status, change_driver,
    skills, education,
    avatar_url,
    cv_sharing_consent, cv_sharing_consent_at
  )
  values (
    new.id,
    -- Our signup form sends full_name; Google sends name (AXIS-43).
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
    -- Google uses 'picture'; some providers use 'avatar_url' (AXIS-43).
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'avatar_url'), ''),
      nullif(trim(new.raw_user_meta_data ->> 'picture'), '')
    ),
    -- AXIS-47. The date is only set when consent is actually true, so an
    -- un-consented row has a null date rather than a misleading one.
    consented,
    case when consented then now() else null end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
