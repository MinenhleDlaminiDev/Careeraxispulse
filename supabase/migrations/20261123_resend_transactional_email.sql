-- ============================================================================
-- AXIS-54 — Transactional email through Resend.
-- Run once in the Supabase SQL Editor. Safe to re-run (idempotent).
--
-- Three emails, all triggered by rows the app already writes, so there is no
-- React change anywhere in this ticket:
--
--   1. Welcome            — a client profile is created (form OR Google)
--   2. Order confirmed    — an admin records a CV revamp order
--   3. Access activated   — an admin grants Interview Code access
--
-- WHY POSTGRES AND NOT AN EDGE FUNCTION
-- The Resend key must never reach the browser: Vite inlines every VITE_* value
-- into a public bundle. That rules out sending from the client. The textbook
-- home would be a Supabase Edge Function, but that needs the Supabase CLI,
-- Docker and a deploy step this project has never used. Everything here is SQL
-- pasted into the dashboard editor, which is how all 12 migrations have gone in.
-- The trade: HTML inside SQL is uglier than a template file, and a failed send
-- is quieter. If that stops being acceptable, the trigger points below do not
-- change when the sending moves to a function.
--
-- THE RULE THAT MATTERS MOST
-- An email is a courtesy on top of something that already worked. A dead
-- Resend, a missing key or a network failure must NEVER undo a created
-- account, a recorded order or a granted access period. Every function below
-- swallows its own errors. This is the same rule src/portal/notify.js states
-- for the in-portal bell, and it applies harder here because these run inside
-- the transaction that did the real work.
--
-- BEFORE THIS WORKS, three things are needed outside the repo:
--   1. Verify send.careerpulseaxis.co.za in Resend (add the DNS records it
--      gives, in the cPanel Zone Editor). The SUBDOMAIN, not the root: the root
--      already sends the business mailbox's mail, and a domain may carry only
--      one SPF record, so a second at the root would break it. Until the
--      subdomain verifies, Resend only delivers to the account owner's address.
--   2. Store the API key in Supabase Vault as RESEND_API_KEY. Never in the
--      repo, never in .env, for the same reason the service_role key is banned.
--   3. Point Supabase Auth SMTP at Resend, so the confirmation and
--      password-reset emails stop coming from Supabase's generic sender.
-- ============================================================================

-- pg_net is what actually makes the HTTP call. It is the same extension behind
-- Supabase's own database webhooks. It creates its own `net` schema, so do not
-- add a `with schema` clause here: that fails on extensions that place their
-- own schema. If this line errors, enable pg_net from the dashboard instead,
-- under Database then Extensions, and re-run from the next statement.
create extension if not exists pg_net;

-- ---------------------------------------------------------------------------
-- Addresses. Edit these two lines if the business mailbox changes.
--
-- The FROM address must sit on the domain verified in Resend. That is the
-- SUBDOMAIN send.careerpulseaxis.co.za, not the root domain, and deliberately
-- so: the root already sends real mail from cPanel, a domain may carry only one
-- SPF record, and adding a second at the root would have broken the mailbox the
-- business actually uses. Keeping Resend on its own subdomain leaves that
-- untouched.
--
-- Mail is SENT as noreply@ because nobody monitors it, but REPLY-TO points at
-- the real mailbox, so a client hitting reply reaches a person. Note that
-- cPanel mailbox is near its quota (see the mailbox quota note), which is a
-- separate problem but one that would swallow replies if it fills.
-- ---------------------------------------------------------------------------
create or replace function public.app_email_from()
returns text language sql immutable as $$
  select 'CareerPulse Axis <noreply@send.careerpulseaxis.co.za>'
$$;

create or replace function public.app_email_reply_to()
returns text language sql immutable as $$
  select 'sinovuyo.mgogo@careerpulseaxis.co.za'
$$;

-- ---------------------------------------------------------------------------
-- The one place that talks to Resend.
--
-- SECURITY DEFINER because Vault is not readable by ordinary roles, and these
-- run as whoever inserted the row. net.http_post is asynchronous: it queues the
-- request and returns immediately, so a slow Resend cannot stall the insert
-- that triggered it.
-- ---------------------------------------------------------------------------
create or replace function public.app_send_email(
  p_to      text,
  p_subject text,
  p_html    text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_key text;
begin
  if p_to is null or btrim(p_to) = '' then
    raise warning '[app_send_email] no recipient, nothing sent';
    return;
  end if;

  select decrypted_secret into v_key
  from vault.decrypted_secrets
  where name = 'RESEND_API_KEY'
  limit 1;

  if v_key is null or btrim(v_key) = '' then
    -- Expected state until the key is stored. Loud in the logs, invisible to
    -- the client, and the surrounding action still succeeds.
    raise warning '[app_send_email] RESEND_API_KEY missing from Vault, skipping send to %', p_to;
    return;
  end if;

  perform net.http_post(
    url     := 'https://api.resend.com/emails',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || v_key,
      'Content-Type',  'application/json'
    ),
    body    := jsonb_build_object(
      'from',     public.app_email_from(),
      'reply_to', public.app_email_reply_to(),
      'to',       jsonb_build_array(p_to),
      'subject',  p_subject,
      'html',     p_html
    ),
    timeout_milliseconds := 5000
  );
exception when others then
  -- The whole point of this function: never propagate.
  raise warning '[app_send_email] send to % failed: %', p_to, sqlerrm;
end;
$$;

revoke all on function public.app_send_email(text, text, text) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Shared layout, so the three emails look like one business.
--
-- Table-based and inline-styled on purpose: Gmail strips <style> blocks, and
-- Outlook ignores most modern layout. Brand colours match src/index.css
-- (navy #131F38, gold #C9A227, cream #F4EFE4).
--
-- No em or en dashes anywhere in the copy, per AXIS-51.
-- ---------------------------------------------------------------------------
create or replace function public.app_email_layout(
  p_heading   text,
  p_body_html text,
  p_cta_label text default null,
  p_cta_url   text default null
)
returns text
language sql
immutable
as $$
  select concat(
    '<!doctype html><html><body style="margin:0;padding:0;background:#F4EFE4;">',
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4EFE4;padding:24px 12px;">',
    '<tr><td align="center">',
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border:1px solid #E7E2D6;border-radius:6px;overflow:hidden;">',

    -- Masthead. Logo and wordmark sit in a two-cell table rather than side by
    -- side divs, because Outlook ignores inline-block and would stack them.
    --
    -- The logo is the live file the site already serves, so there is nothing
    -- extra to host or keep in step. It is a square JPEG with a white
    -- background, so it gets a white rounded tile, which is how the portal
    -- already renders it against navy.
    --
    -- The wordmark stays as TEXT next to it on purpose. Most clients block
    -- images until the reader allows them, and without this the email would
    -- open as an anonymous navy bar with a broken image icon.
    '<tr><td style="background:#131F38;padding:20px 28px;">',
    '<table role="presentation" cellpadding="0" cellspacing="0"><tr>',
    '<td style="padding-right:12px;" valign="middle">',
    '<img src="https://careerpulseaxis.co.za/assets/logo.jpeg" width="44" height="44" alt="CareerPulse Axis" ',
    'style="display:block;width:44px;height:44px;border:0;border-radius:6px;background:#FFFFFF;">',
    '</td>',
    '<td valign="middle">',
    '<div style="font-family:Georgia,''Times New Roman'',serif;font-size:19px;font-weight:700;color:#F4EFE4;">',
    'CareerPulse <span style="color:#C9A227;">Axis</span></div>',
    '<div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#C9A227;padding-top:5px;">',
    'Align. Elevate. Thrive.</div>',
    '</td>',
    '</tr></table>',
    '</td></tr>',

    -- Gold rule
    '<tr><td style="height:3px;background:#C9A227;line-height:3px;font-size:0;">&nbsp;</td></tr>',

    -- Body
    '<tr><td style="padding:30px 28px 8px;">',
    '<h1 style="margin:0 0 16px;font-family:Georgia,''Times New Roman'',serif;font-size:23px;line-height:1.25;font-weight:600;color:#131F38;">',
    p_heading, '</h1>',
    p_body_html,
    '</td></tr>',

    -- Optional call to action
    case when p_cta_url is null then '' else concat(
      '<tr><td style="padding:10px 28px 30px;">',
      '<a href="', p_cta_url, '" style="display:inline-block;background:#C9A227;color:#131F38;',
      'font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;text-decoration:none;',
      'padding:14px 26px;border-radius:3px;">', coalesce(p_cta_label, 'Open your portal'), '</a>',
      '</td></tr>'
    ) end,

    -- Footer
    '<tr><td style="background:#FAF7F0;border-top:1px solid #E7E2D6;padding:20px 28px;',
    'font-family:Arial,Helvetica,sans-serif;font-size:12.5px;line-height:1.6;color:#8A94AC;">',
    -- Contact details in the footer, so every email says how to reach a human
    -- without anyone having to hit reply on a noreply address.
    'CareerPulse Axis, South Africa<br>',
    'Office hours: Monday to Friday (closed weekends)<br>',
    '<a href="mailto:sinovuyo.mgogo@careerpulseaxis.co.za" style="color:#8A94AC;">sinovuyo.mgogo@careerpulseaxis.co.za</a><br>',
    'WhatsApp 071 020 3982<br>',
    '<a href="https://careerpulseaxis.co.za/privacy" style="color:#8A94AC;">Privacy Policy</a> &nbsp;|&nbsp; ',
    '<a href="https://careerpulseaxis.co.za/terms" style="color:#8A94AC;">Terms of Service</a>',
    '</td></tr>',

    '</table></td></tr></table></body></html>'
  )
$$;

-- Shared paragraph style, so the three templates stay consistent.
create or replace function public.app_email_p(p_text text)
returns text language sql immutable as $$
  select concat(
    '<p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:15px;',
    'line-height:1.65;color:#56607A;">', p_text, '</p>'
  )
$$;

-- ---------------------------------------------------------------------------
-- 1. Welcome, once the address is CONFIRMED.
--
-- Not on the profiles insert, which was the first instinct and is wrong. The
-- profile row is created the moment someone signs up, while email_confirmed_at
-- is still null. Welcoming there means the email lands in the same breath as
-- "confirm your email", and it means welcoming addresses that were typed wrong
-- or made up, which is exactly what confirmation exists to catch.
--
-- So this hangs off auth.users instead, and covers both routes:
--   - a form signup confirms later, which is an UPDATE setting email_confirmed_at
--   - a Google signup arrives already confirmed, which is an INSERT
--
-- The name is read from raw_user_meta_data rather than from profiles, so this
-- does not depend on whether handle_new_user has run yet. Same coalesce as that
-- function uses: our form sends full_name, Google sends name.
--
-- Clients only: the admin check reads the profile if it exists, and an absent
-- profile is treated as a client, because handle_new_user defaults to 'client'.
-- ---------------------------------------------------------------------------
create or replace function public.app_email_welcome()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
  v_role text;
begin
  select role into v_role from public.profiles where id = new.id;
  if v_role is distinct from 'client' and v_role is not null then
    return new;
  end if;

  v_name := coalesce(
    nullif(split_part(btrim(new.raw_user_meta_data ->> 'full_name'), ' ', 1), ''),
    nullif(split_part(btrim(new.raw_user_meta_data ->> 'name'), ' ', 1), ''),
    'there'
  );

  perform public.app_send_email(
    new.email,
    'Welcome to CareerPulse Axis',
    public.app_email_layout(
      'Welcome, ' || v_name || '.',
      concat(
        public.app_email_p('Your CareerPulse Axis account is ready. This is where your CV, your revamps and your interview preparation all live.'),
        public.app_email_p('If you have not finished your profile yet, that is the next step. It is what we work from when we prepare your CV, so the more of it you fill in, the better the result.'),
        -- Never "reply to this email": it is sent from noreply@, so a reply
        -- goes nowhere a person is watching. Name the address the marketing
        -- site already uses, which is the one the business actually reads.
        public.app_email_p('Any questions, email <a href="mailto:sinovuyo.mgogo@careerpulseaxis.co.za" style="color:#C9A227;">sinovuyo.mgogo@careerpulseaxis.co.za</a> or send a WhatsApp to 071 020 3982.')
      ),
      'Open your portal',
      'https://careerpulseaxis.co.za/portal'
    )
  );
  return new;
exception when others then
  raise warning '[welcome email] %', sqlerrm;
  return new;
end;
$$;

-- Form signup: the address is confirmed later, so wait for that moment.
drop trigger if exists on_user_confirmed_email on auth.users;
create trigger on_user_confirmed_email
  after update of email_confirmed_at on auth.users
  for each row
  when (old.email_confirmed_at is null and new.email_confirmed_at is not null)
  execute function public.app_email_welcome();

-- Google signup: already confirmed on arrival, so there is no later update to
-- wait for. Without this trigger, Google clients would never be welcomed.
drop trigger if exists on_user_created_confirmed_email on auth.users;
create trigger on_user_created_confirmed_email
  after insert on auth.users
  for each row
  when (new.email_confirmed_at is not null)
  execute function public.app_email_welcome();

-- Left over from the first draft of this migration, which welcomed on the
-- profiles insert. Dropped so a re-run cannot leave both in place and send the
-- welcome twice.
drop trigger if exists on_profile_created_email on public.profiles;
drop function if exists public.app_email_on_profile_created();

-- ---------------------------------------------------------------------------
-- 2. CV revamp order confirmed, when an admin records it.
--
-- Confirmed orders only. A 'pending' row is a note to the admin, not something
-- to tell the client about, and a 'refunded' row is handled by a conversation.
--
-- Amount is nullable on cv_orders (an order recorded after the fact may not
-- have it), so the copy has to read correctly without it.
-- ---------------------------------------------------------------------------
create or replace function public.app_email_on_order_recorded()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email  text;
  v_name   text;
  v_tier   text;
  v_amount text;
begin
  if new.status is distinct from 'confirmed' then
    return new;
  end if;

  select p.email, coalesce(nullif(split_part(btrim(p.full_name), ' ', 1), ''), 'there')
    into v_email, v_name
  from public.profiles p
  where p.id = new.user_id;

  v_tier := case new.tier
    when 'entry'     then 'Entry level'
    when 'mid'       then 'Mid-level'
    when 'senior'    then 'Senior level'
    when 'executive' then 'Executive'
    else new.tier
  end;

  -- "R220", not "R220.00". Every price on the site is written without cents,
  -- and an order email that disagrees with the price list looks careless. The
  -- cents are kept when they are not zero, because then they are real.
  v_amount := case
    when new.amount is null then ''
    else ' at R' || regexp_replace(trim(to_char(new.amount, 'FM999999990.00')), '\.00$', '')
  end;

  perform public.app_send_email(
    v_email,
    'Your CV revamp is confirmed',
    public.app_email_layout(
      'Thank you, ' || v_name || '.',
      concat(
        public.app_email_p('We have your payment for a <strong style="color:#131F38;">' || v_tier || ' CV revamp</strong>' || v_amount || ', and work is starting.'),
        public.app_email_p('Turnaround is 3 to 4 working days, Monday to Friday, subject to current capacity and how much work is involved. Weekends and public holidays are not counted.'),
        public.app_email_p('Make sure your current CV is uploaded in the portal, because that is what we build from. Your finished CV will appear in the same place, and we will email you when it is ready.')
      ),
      'Go to My CV',
      'https://careerpulseaxis.co.za/portal/client/cv'
    )
  );
  return new;
exception when others then
  raise warning '[order email] %', sqlerrm;
  return new;
end;
$$;

drop trigger if exists on_order_recorded_email on public.cv_orders;
create trigger on_order_recorded_email
  after insert on public.cv_orders
  for each row execute function public.app_email_on_order_recorded();

-- ---------------------------------------------------------------------------
-- 3. Interview Code access activated.
--
-- Fires when the expiry moves to a future date, which covers a first grant and
-- a renewal alike. It deliberately does NOT fire on a revoke, because the WHEN
-- clause requires a future date.
--
-- The wording is kept in step with MESSAGES.accessGranted in
-- src/portal/notify.js, so the email and the in-portal bell agree.
-- ---------------------------------------------------------------------------
create or replace function public.app_email_on_access_granted()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name   text;
  v_expiry text;
begin
  v_name   := coalesce(nullif(split_part(btrim(new.full_name), ' ', 1), ''), 'there');
  v_expiry := to_char(new.interview_access_expires_at at time zone 'Africa/Johannesburg', 'DD Mon YYYY');

  perform public.app_send_email(
    new.email,
    'Your Axis Interview Code access is live',
    public.app_email_layout(
      'You are in, ' || v_name || '.',
      concat(
        public.app_email_p('Your access to the Axis Interview Code is active until <strong style="color:#131F38;">' || v_expiry || '</strong>.'),
        public.app_email_p('Inside are the four winning pillars of interview readiness, with the videos and the practical application for each. Work through them in order, and come back as often as you like while your access runs.'),
        public.app_email_p('Master the position, not just the questions.')
      ),
      'Open the Interview Code',
      'https://careerpulseaxis.co.za/portal/client/interview'
    )
  );
  return new;
exception when others then
  raise warning '[access email] %', sqlerrm;
  return new;
end;
$$;

drop trigger if exists on_access_granted_email on public.profiles;
create trigger on_access_granted_email
  after update of interview_access_expires_at on public.profiles
  for each row
  when (
    new.interview_access_expires_at is distinct from old.interview_access_expires_at
    and new.interview_access_expires_at is not null
    and new.interview_access_expires_at > now()
  )
  execute function public.app_email_on_access_granted();
