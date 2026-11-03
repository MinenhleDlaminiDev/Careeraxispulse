-- ============================================================================
-- CareerPulse Axis — portal backend (AXIS-01)
-- Paste this whole file into the Supabase SQL Editor and run it once.
-- Safe to re-run: tables use "if not exists" and policies are dropped first.
--
-- What it creates:
--   • profiles          — one row per auth user (role + 30-day access expiry)
--   • interview_content — the editable 4-pillar content (one JSON row)
--   • cv_uploads        — a record per uploaded CV (client or admin)
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
  created_at                  timestamptz not null default now()
);

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
  source       text not null check (source in ('client', 'admin')),
  created_at   timestamptz not null default now()
);

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
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.email,
    'client'
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
alter table public.notifications     enable row level security;

-- profiles: a client reads only their own row; admins read all. Writes are
-- admin-only, so a client can never grant itself access or make itself admin.
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_admin_write on public.profiles;
create policy profiles_admin_write on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

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
  "pillars": [
    {
      "number": "01",
      "title": "Master the Role",
      "subtitle": "Understand what you are interviewing for before preparing what you are going to say.",
      "intro": "The job description is your starting point. Study it carefully to understand what the organisation expects from the person appointed to the position.",
      "focus": [
        "Identify the position’s core responsibilities.",
        "Understand the required competencies, qualifications and experience.",
        "Determine what successful performance in the role would involve.",
        "Identify the operational needs or challenges the position is intended to address, where these are clear."
      ],
      "principle": "You cannot communicate your suitability for a position you do not understand."
    },
    {
      "number": "02",
      "title": "Research the Organisation",
      "subtitle": "Understand the organisation behind the opportunity.",
      "intro": "A job title tells you what you are applying for. Organisational research helps you understand the environment in which you will be expected to deliver.",
      "focus": [
        "Understand what the organisation does and whom it serves.",
        "Research its industry, operations and key priorities.",
        "Review its values, mission and relevant recent developments.",
        "Consider how the position contributes to its broader objectives."
      ],
      "principle": "Strong preparation connects the position to the organisation’s purpose."
    },
    {
      "number": "03",
      "title": "Build Your Evidence",
      "subtitle": "Know what makes you relevant to the position and be prepared to explain it.",
      "intro": "Your CV may have helped secure the interview. Now you need to communicate the experience, knowledge and capabilities behind it.",
      "focus": [
        "Revisit your CV alongside the job description.",
        "Identify experiences and competencies relevant to the position.",
        "Recall specific responsibilities, contributions, challenges and outcomes.",
        "Prepare to explain your involvement clearly, without exaggeration."
      ],
      "principle": "Don’t simply repeat your CV. Explain the value behind it."
    },
    {
      "number": "04",
      "title": "Connect, Simulate & Refine",
      "subtitle": "Bring the role, the employer’s requirements and your experience into one conversation.",
      "intro": "Use what you have learned about the position and the organisation to practise explaining your suitability, including when questions take an unexpected direction.",
      "focus": [
        "Use the complete job description to develop role-specific practice questions.",
        "Where helpful, use an AI tool to generate questions based on the position’s responsibilities, competencies and requirements.",
        "Connect your responses to genuine evidence from your CV and experience.",
        "Refine your explanations for accuracy and relevance, rather than memorising answers."
      ],
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
