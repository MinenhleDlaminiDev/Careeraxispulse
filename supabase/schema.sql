-- ============================================================================
-- CareerPulse Axis — portal backend (AXIS-01)
-- Paste this whole file into the Supabase SQL Editor and run it once.
-- Safe to re-run: tables use "if not exists" and policies are dropped first.
--
-- What it creates:
--   • profiles          — one row per auth user (role + 30-day access expiry)
--   • interview_content — the editable 4-pillar content (one JSON row)
--   • cv_uploads        — a record per uploaded CV (client or admin)
--   • cv_orders         — a record per confirmed CV revamp purchase
--   • access_grants     — a record per Axis Interview Code sale (AXIS-56)
--   • notifications     — per-user messages
--   • storage bucket 'cvs' (private)
--   • RLS so clients see only their own data and gated content; admins see all
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id                          uuid primary key references auth.users (id) on delete cascade,
  full_name                   text,
  email                       text,
  role                        text not null default 'client' check (role in ('client', 'admin')),
  -- Access is its own field, NEVER overloaded onto role. Null = no access.
  interview_access_expires_at timestamptz,
  -- Non-CV profile fields captured at signup (AXIS-21). All nullable.
  phone                       text,
  location                    text,
  linkedin_url                text,
  target_role                 text,
  target_industry             text,
  seniority_level             text,
  target_companies            text,
  employment_status           text,
  change_driver               text,
  -- Skills and qualifications (AXIS-42), both jsonb arrays. skills is a list of
  -- strings; education a list of {qualification, field_of_study, institution,
  -- year}. Null = never filled in; the app stores null, not [], for an emptied
  -- list so no screen has to tell the two apart.
  skills                      jsonb,
  education                   jsonb,
  -- Profile photo (AXIS-28): path to the object in the private 'avatars'
  -- bucket. Null = fall back to avatar_url, then initials.
  avatar_path                 text,
  -- An EXTERNAL photo URL from an OAuth provider (AXIS-43), e.g. Google's
  -- 'picture'. Kept apart from avatar_path because that one is a storage path
  -- that gets signed — a foreign URL cannot be signed. An uploaded photo wins.
  avatar_url                  text,
  -- Permission to send this client's CV to employers and recruiters (AXIS-47),
  -- with the date it was given. Deliberately NOT in the privilege guard: this
  -- choice belongs to the client, and an admin must be able to clear it when
  -- someone asks to stop being shared.
  cv_sharing_consent          boolean not null default false,
  cv_sharing_consent_at       timestamptz,
  -- Must this client answer at all? New signups must (the default). Clients
  -- who already existed when AXIS-47 shipped were marked false by the
  -- migration and are never asked — they were NOT backfilled to consented,
  -- because recording a consent nobody gave is worse than having none.
  cv_consent_required         boolean not null default true,
  -- Manual "this client has bought a revamp before" override (AXIS-41), for the
  -- clients served before cv_orders existed. Derived history is the normal
  -- route; this is the escape hatch. Guarded like role and access below — it
  -- decides what the client is charged, so they must never set it themselves.
  returning_client            boolean not null default false,
  created_at                  timestamptz not null default now()
);

-- Idempotent migration for databases provisioned before AXIS-28 / AXIS-42 / AXIS-41.
alter table public.profiles add column if not exists avatar_path text;
alter table public.profiles
  add column if not exists skills    jsonb,
  add column if not exists education jsonb;
alter table public.profiles
  add column if not exists returning_client boolean not null default false;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles
  add column if not exists cv_sharing_consent    boolean not null default false,
  add column if not exists cv_sharing_consent_at timestamptz,
  add column if not exists cv_consent_required   boolean not null default true;
-- Grandfather accounts that predate AXIS-47 (see the migration for why they are
-- not backfilled to consented). Guarded so a re-run can't exempt a newer client.
update public.profiles
   set cv_consent_required = false
 where cv_consent_required
   and created_at < now();

create table if not exists public.interview_content (
  id         uuid primary key default gen_random_uuid(),
  -- The four pillars live here as an editable JSON doc (edited via AXIS-10).
  content    jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.cv_uploads (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  storage_path text not null,
  -- source = WHO uploaded it; stage = original (to work from) vs revised
  -- (the finished version the admin delivers). Two separate questions, two
  -- columns — never fold stage into source (the client page filters on source).
  source       text not null check (source in ('client', 'admin')),
  stage        text not null default 'original' check (stage in ('original', 'revised')),
  created_at   timestamptz not null default now()
);

-- One row per CV revamp the admin confirms (AXIS-41). This is the history that
-- decides returning pricing: a client with any confirmed row here is a
-- returning client, so the first revamp bought through the portal automatically
-- prices the next one — nothing has to be remembered.
create table if not exists public.cv_orders (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  -- Matches the CV_TIERS keys in src/payments.js.
  tier         text not null check (tier in ('entry', 'mid', 'senior', 'executive')),
  -- What was actually charged, in rand. Nullable: an order recorded after the
  -- fact may not have the amount to hand.
  amount       numeric(10, 2),
  status       text not null default 'confirmed' check (status in ('pending', 'confirmed', 'refunded')),
  -- Was THIS order charged at the returning price? History, not a gate.
  is_returning boolean not null default false,
  note         text,
  created_at   timestamptz not null default now()
);

create index if not exists cv_orders_user_created_idx
  on public.cv_orders (user_id, created_at desc);

create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  message    text not null,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Helper functions (SECURITY DEFINER so they read profiles WITHOUT tripping
-- the profiles RLS policy — this avoids infinite recursion in the policies).
-- ---------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.has_interview_access()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and interview_access_expires_at is not null
      and interview_access_expires_at > now()
  );
$$;

-- ---------------------------------------------------------------------------
-- Auto-create a profile row whenever someone signs up (role 'client', no
-- access). Runs as definer so it can insert past RLS. (Backs AXIS-06.)
-- ---------------------------------------------------------------------------

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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles          enable row level security;
alter table public.interview_content enable row level security;
alter table public.cv_uploads        enable row level security;
alter table public.cv_orders         enable row level security;
alter table public.notifications     enable row level security;

-- profiles: a client reads only their own row; admins read all. Writes are
-- admin-only, so a client can never grant itself access or make itself admin.
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_admin_write on public.profiles;
create policy profiles_admin_write on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- A client may update their OWN row — profile edits (AXIS-30) and their photo
-- (AXIS-28). The column guard below stops this policy being used to change role
-- or access, so it can never become a self-grant.
drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- Escalation guard: a signed-in non-admin can never change their own role or
-- access expiry. auth.uid() is null for the SQL editor and the service role, so
-- the admin-bootstrap update below and any server-side job are unaffected — only
-- authenticated end users are checked.
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

-- interview_content: readable only with live access (or by admins); admin-only writes.
drop policy if exists interview_content_select on public.interview_content;
create policy interview_content_select on public.interview_content
  for select using (public.has_interview_access() or public.is_admin());

drop policy if exists interview_content_admin_write on public.interview_content;
create policy interview_content_admin_write on public.interview_content
  for all using (public.is_admin()) with check (public.is_admin());

-- cv_uploads: owner or admin.
drop policy if exists cv_uploads_rw on public.cv_uploads;
create policy cv_uploads_rw on public.cv_uploads
  for all using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- cv_orders (AXIS-41): a client reads their own orders, so the portal can price
-- their next revamp, and can never write one. Admin-only writes — this table
-- decides what a client is charged.
drop policy if exists cv_orders_select on public.cv_orders;
create policy cv_orders_select on public.cv_orders
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists cv_orders_admin_write on public.cv_orders;
create policy cv_orders_admin_write on public.cv_orders
  for all using (public.is_admin()) with check (public.is_admin());

-- notifications: owner reads + marks read; only admins create them.
drop policy if exists notifications_select on public.notifications;
create policy notifications_select on public.notifications
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists notifications_update on public.notifications;
create policy notifications_update on public.notifications
  for update using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

drop policy if exists notifications_admin_insert on public.notifications;
create policy notifications_admin_insert on public.notifications
  for insert with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Private storage bucket for CVs + its policies
-- Files are stored under "<user_id>/<filename>", so the first path segment
-- is the owner. Clients touch only their own folder; admins touch everything.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('cvs', 'cvs', false)
on conflict (id) do nothing;

drop policy if exists cvs_owner_rw on storage.objects;
create policy cvs_owner_rw on storage.objects
  for all using (
    bucket_id = 'cvs'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  )
  with check (
    bucket_id = 'cvs'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

-- ---------------------------------------------------------------------------
-- Private storage bucket for profile photos (AXIS-28). Same "<user_id>/<file>"
-- convention as 'cvs': a client touches only their own folder, and admins can
-- read every client's photo for the Clients screens.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', false)
on conflict (id) do nothing;

drop policy if exists avatars_owner_rw on storage.objects;
create policy avatars_owner_rw on storage.objects
  for all using (
    bucket_id = 'avatars'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  )
  with check (
    bucket_id = 'avatars'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

-- ---------------------------------------------------------------------------
-- Seed: the Interview Code content (one row), from the official docx.
-- The admin editor (AXIS-10) edits this; AXIS-07 renders it for clients.
-- ---------------------------------------------------------------------------

insert into public.interview_content (content)
select '{
  "title": "The Axis Interview Code",
  "subtitle": "Our Four Winning Pillars of Interview Readiness",
  "tagline": "We Don’t Cram Questions. We Master the Position.",
  "intro": "The Axis Interview Code gives you access to the four winning pillars behind the CareerPulse Axis approach to interview preparation.",
  "philosophy": "We do not predict interview questions. We master the position by connecting the employer’s objectives and requirements with the experience reflected in our CVs, preparing us to navigate even unexpected questions.",
  "before_you_begin": "Have your CV and the full job description ready before you begin.",
  "intro_video": "intro.mp4",
  "pillars": [
    {
      "number": "01",
      "video": "pillar-1.mp4",
      "title": "Master the Role",
      "subtitle": "Understand what you are interviewing for before preparing what you are going to say.",
      "intro": "The job description is your starting point. Study it carefully to understand what the organisation expects from the person appointed to the position.",
      "focus": [
        "Identify the position’s core responsibilities.",
        "Understand the required competencies, qualifications and experience.",
        "Determine what successful performance in the role would involve.",
        "Identify the operational needs or challenges the position is intended to address, where these are clear."
      ],
      "practical": {
        "lead": "Break down all major responsibilities in the job description and identify the processes, tools and competencies required to perform each one.",
        "example": "If the position requires data analysis, understand how data is collected, cleaned, analysed and interpreted. Identify how tools such as Excel, SQL or Power BI may be used to produce insights that support business decisions.",
        "action": "Practise explaining how you would approach the major responsibilities, including the methods you would use and the expected outcomes. Use possible interview questions to test your understanding of the role."
      },
      "principle": "You cannot communicate your suitability for a position you do not understand."
    },
    {
      "number": "02",
      "video": "pillar-2.mp4",
      "title": "Research the Organisation",
      "subtitle": "Understand the organisation behind the opportunity.",
      "intro": "A job title tells you what you are applying for. Organisational research helps you understand the environment in which you will be expected to deliver.",
      "focus": [
        "Understand what the organisation does and whom it serves.",
        "Research its industry, operations and key priorities.",
        "Review its values, mission and relevant recent developments.",
        "Consider how the position contributes to its broader objectives."
      ],
      "practical": {
        "lead": "Connect relevant findings from your organisational research to the position’s responsibilities and the employer’s objectives.",
        "example": "If an organisation is expanding its digital services, consider how a Data Analyst could contribute through customer trend analysis, performance reporting and identifying opportunities for improvement.",
        "action": "Practise answering possible questions about the organisation, particularly why you want to work there and how your position contributes to its objectives. Support your responses with verified information."
      },
      "principle": "Strong preparation connects the position to the organisation’s purpose."
    },
    {
      "number": "03",
      "video": "pillar-3.mp4",
      "title": "Build Your Evidence",
      "subtitle": "Know what makes you relevant to the position and be prepared to explain it.",
      "intro": "Your CV may have helped secure the interview. Now you need to communicate the experience, knowledge and capabilities behind it.",
      "focus": [
        "Revisit your CV alongside the job description.",
        "Identify experiences and competencies relevant to the position.",
        "Recall specific responsibilities, contributions, challenges and outcomes.",
        "Prepare to explain your involvement clearly, without exaggeration."
      ],
      "practical": {
        "lead": "Match the major job requirements to relevant examples from your CV. Use the STAR method to structure your responses around the Situation, Task, Action and Result, where applicable.",
        "example": "Instead of simply stating “I have data analysis skills,” explain a genuine project where you cleaned data, analysed trends using Excel or Power BI and presented findings to address a specific problem.",
        "action": "Practise answering competency-based questions using genuine examples from your experience, academic projects or transferable skills. Explain your personal contribution and the outcome without exaggeration."
      },
      "principle": "Don’t simply repeat your CV. Explain the value behind it."
    },
    {
      "number": "04",
      "video": "pillar-4.mp4",
      "title": "Connect, Simulate & Refine",
      "subtitle": "Bring the role, the employer’s requirements and your experience into one conversation.",
      "intro": "Use what you have learned about the position and the organisation to practise explaining your suitability, including when questions take an unexpected direction.",
      "focus": [
        "Use the complete job description to develop role-specific practice questions.",
        "Where helpful, use an AI tool to generate questions based on the position’s responsibilities, competencies and requirements.",
        "Connect your responses to genuine evidence from your CV and experience.",
        "Refine your explanations for accuracy and relevance, rather than memorising answers."
      ],
      "practical": {
        "lead": "Use AI tools to generate possible interview questions based on the complete job description and your CV. Ensure the tool receives the full job description so it can identify the responsibilities, required competencies and employer expectations.",
        "prompt": "Act as an interviewer for this position. Analyse the complete job description and my CV. Generate possible technical, behavioural and situational interview questions aligned with the employer’s requirements. Ask me one question at a time, evaluate my responses and suggest improvements based on my actual knowledge, skills and experience.",
        "action": "Select only questions strongly aligned with the position, what the employer is looking for and your actual capabilities. Use these questions to practise applying what you learned across the first three pillars.",
        "caution": "Do not treat every AI-generated question as relevant. Prioritise questions supported by the job description and practise responding naturally rather than memorising answers."
      },
      "principle": "The goal is not to predict every question. It is to understand the position and your evidence well enough to respond when the questions change."
    }
  ],
  "standard": "Master the role. Understand the organisation. Know your experience. Connect all three. When these elements come together, you move beyond anticipating interview questions to understanding the position, its expectations and how your experience aligns with them."
}'::jsonb
where not exists (select 1 from public.interview_content);

-- ---------------------------------------------------------------------------
-- Make yourself the first admin AFTER you have signed up once in the portal:
--   update public.profiles set role = 'admin' where email = 'you@example.com';
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- Private storage bucket for the Interview Code videos (AXIS-37). These are the
-- paid product, so the bucket is private and the app plays them through
-- short-lived signed URLs. Unlike 'cvs' and 'avatars' there is no folder-per-
-- user rule: it's one shared set of files, so the gate is the access flag.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('videos', 'videos', false)
on conflict (id) do update set public = false;

drop policy if exists videos_read on storage.objects;
create policy videos_read on storage.objects
  for select
  using (
    bucket_id = 'videos'
    and (public.has_interview_access() or public.is_admin())
  );

drop policy if exists videos_admin_write on storage.objects;
create policy videos_admin_write on storage.objects
  for all
  using (bucket_id = 'videos' and public.is_admin())
  with check (bucket_id = 'videos' and public.is_admin());

-- ---------------------------------------------------------------------------
-- Axis Interview Code sales history (AXIS-56). profiles.interview_access_
-- expires_at answers "does this client have access right now"; this table
-- answers "who has ever bought it". Two questions, two fields, so a revoke or
-- a renewal can't wipe the sales record. Filled by a trigger rather than by
-- the app, so the Supabase table editor and a raw API call are logged too.
-- The full reasoning is in supabase/migrations/20261125_access_grants.sql,
-- which also carries the one-off backfill. No amount column yet: the trigger
-- cannot know what was charged, so reporting values these at the R90 list
-- price and says so.
-- ---------------------------------------------------------------------------

create table if not exists public.access_grants (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  granted_at timestamptz not null default now(),
  expires_at timestamptz not null,
  -- 'grant' = logged as it happened, exact. 'backfill' = reconstructed from
  -- the profiles column by the AXIS-56 migration, so the date is an estimate.
  source     text not null default 'grant' check (source in ('grant', 'backfill')),
  note       text
);

create index if not exists access_grants_user_granted_idx
  on public.access_grants (user_id, granted_at desc);
create index if not exists access_grants_granted_idx
  on public.access_grants (granted_at desc);

alter table public.access_grants enable row level security;

-- A client reads their own purchase history and can never write one.
drop policy if exists access_grants_select on public.access_grants;
create policy access_grants_select on public.access_grants
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists access_grants_admin_write on public.access_grants;
create policy access_grants_admin_write on public.access_grants
  for all using (public.is_admin()) with check (public.is_admin());

-- Logging can never break the grant that caused it, the same rule the AXIS-54
-- emails follow: a failed log must not undo a client's access.
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

-- Same WHEN clause as the AXIS-54 access email, word for word, so the email
-- and the log fire off one event. A future date is a sale; null is a revoke
-- and logs nothing, which is how history outlives the revoke.
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
