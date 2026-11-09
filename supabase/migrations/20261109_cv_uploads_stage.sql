-- ============================================================================
-- AXIS-11 — CV stage column
-- Paste into the Supabase SQL Editor and run once. Safe to re-run.
--
-- Adds cv_uploads.stage so we can tell an ORIGINAL CV (the one to work from —
-- uploaded by the client, or added by the admin as a to-do) apart from a
-- REVISED CV (the finished version the admin delivers back).
--
-- We deliberately do NOT overload cv_uploads.source for this. source answers
-- "who uploaded it" (client/admin) and the client My CV page already filters on
-- it; stage answers a separate question, so it gets its own column.
-- ============================================================================

alter table public.cv_uploads
  add column if not exists stage text not null default 'original';

-- Add the check constraint on its own so re-running the file doesn't error.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'cv_uploads_stage_check') then
    alter table public.cv_uploads
      add constraint cv_uploads_stage_check check (stage in ('original', 'revised'));
  end if;
end $$;

-- Existing rows take the 'original' default, which is correct: every CV on file
-- before this migration is an original (client uploads or admin to-do copies).
