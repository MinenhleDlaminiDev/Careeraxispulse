import { supabase } from '../supabase';

// AXIS-13 — one place that writes a notification row.
//
// Every caller behaves the same because of the rule baked in here: this NEVER
// throws and never reports failure upward. A notification is a courtesy on top
// of an action that already succeeded — access was granted, a CV was delivered
// — and none of those should be undone or shown as an error because a row in
// `notifications` didn't write. The caller does not check a return value.
//
// Only an admin can insert (the notifications_admin_insert policy from
// AXIS-01), so every call here belongs to an admin action. The one
// client-triggered notification — "a client uploaded a CV" for the admins —
// cannot go through this helper at all and is written by a SECURITY DEFINER
// trigger instead: supabase/migrations/20261118_notify_admin_on_client_cv.sql.
export async function notify(userId, message) {
  if (!supabase || !userId || !message) return;
  try {
    const { error } = await supabase.from('notifications').insert({ user_id: userId, message });
    // Logged, not surfaced: useful in the console while developing, invisible
    // to the client, and the calling action still reports its own success.
    if (error) console.warn('[notify] not written:', error.message);
  } catch (err) {
    console.warn('[notify] not written:', err?.message || err);
  }
}

// The wording lives here so the bell reads consistently wherever rows come from.
export const MESSAGES = {
  accessGranted: (expiry) => `Your Axis Interview Code access is active until ${new Date(expiry).toLocaleDateString()}.`,
  revisedCv: 'Your revised CV is ready. Open My CV to download it.',
};
