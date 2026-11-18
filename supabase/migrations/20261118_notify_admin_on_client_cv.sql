-- ============================================================================
-- AXIS-13 — tell the admins when a client uploads a CV.
-- Run once in the Supabase SQL Editor. Safe to re-run (idempotent).
--
-- Why a trigger rather than an insert from the app: the notifications RLS
-- (AXIS-01) is `notifications_admin_insert`, so only an admin may create a
-- notification. A client uploading their own CV therefore cannot write one for
-- the admin, and loosening that policy would let any signed-in client post
-- messages into anyone's bell. A SECURITY DEFINER trigger writes the row with
-- the function owner's rights instead, and the only thing that can fire it is a
-- genuine cv_uploads insert — which RLS already restricts to the file's owner.
--
-- The whole body is wrapped in an exception block on purpose: a notification is
-- never worth failing an upload over. If this errors, the CV still lands and the
-- admin simply doesn't get a bell.
-- ============================================================================

create or replace function public.notify_admins_of_client_cv()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  begin
    if new.source = 'client' then
      insert into public.notifications (user_id, message)
      select p.id,
             coalesce(nullif(trim(c.full_name), ''), c.email, 'A client')
               || ' uploaded a CV.'
      from public.profiles p
      cross join (
        select full_name, email from public.profiles where id = new.user_id
      ) c
      where p.role = 'admin';
    end if;
  exception when others then
    -- Swallow it. The upload is the thing that matters.
    null;
  end;
  return new;
end;
$$;

drop trigger if exists cv_uploads_notify_admins on public.cv_uploads;
create trigger cv_uploads_notify_admins
  after insert on public.cv_uploads
  for each row execute function public.notify_admins_of_client_cv();
