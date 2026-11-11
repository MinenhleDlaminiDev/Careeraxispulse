import { supabase } from '../supabase';

// Shared Interview Code access helpers (AXIS-29) used by the admin Clients grid
// (AccessManagement) and the client detail page (ClientDetail), so grant/revoke
// behaves identically in both.

export const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

// Access state -> badge tone + label. Gold = live, danger = expired, neutral = none.
export function accessState(expiry) {
  if (!expiry) return { tone: 'neutral', label: 'No access' };
  const d = new Date(expiry);
  if (d > new Date()) return { tone: 'gold', label: `Active · until ${d.toLocaleDateString()}` };
  return { tone: 'danger', label: `Expired ${d.toLocaleDateString()}` };
}

// Grant (pass a future ISO date) or revoke (pass null) a client's access. Returns
// Supabase's { data, error }; the caller updates its own state. Writes rely on the
// profiles admin RLS (admins only).
export async function setAccessExpiry(id, value) {
  if (!supabase) return { data: null, error: new Error('Portal not configured') };
  return supabase
    .from('profiles')
    .update({ interview_access_expires_at: value })
    .eq('id', id)
    .select('interview_access_expires_at')
    .single();
}
