-- ============================================================================
-- AXIS-37 — the 'videos' bucket for the Interview Code videos.
--
-- The videos are the paid product, so the bucket stays PRIVATE and the app
-- hands out short-lived signed URLs. A public bucket would mean one shared
-- link lets anyone watch forever without paying, and the URLs are guessable
-- from the bucket name.
--
-- Read access mirrors the content itself: you need live Interview Code access
-- (or be an admin). has_interview_access() is the same helper the
-- interview_content policy uses, so access can never drift between the text
-- and the videos.
--
-- Note: this also forces the bucket private if it was created public.
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('videos', 'videos', false)
on conflict (id) do update set public = false;

-- Clients with live access (and admins) may READ. No folder-per-user rule here:
-- unlike 'cvs' and 'avatars' these are one shared set of files, not per-person
-- uploads, so the gate is the access flag rather than the path.
drop policy if exists videos_read on storage.objects;
create policy videos_read on storage.objects
  for select
  using (
    bucket_id = 'videos'
    and (public.has_interview_access() or public.is_admin())
  );

-- Only admins may add, replace or delete a video.
drop policy if exists videos_admin_write on storage.objects;
create policy videos_admin_write on storage.objects
  for all
  using (bucket_id = 'videos' and public.is_admin())
  with check (bucket_id = 'videos' and public.is_admin());
