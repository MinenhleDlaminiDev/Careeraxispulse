import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabase';
import { GOLD, CREAM, MUTED, SERIF } from './theme';
import Loading from './Loading';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function accessState(expiry) {
  if (!expiry) return { label: 'No access', active: false };
  const d = new Date(expiry);
  if (d > new Date()) return { label: `Active · until ${d.toLocaleDateString()}`, active: true };
  return { label: `Expired ${d.toLocaleDateString()}`, active: false };
}

// Admin tool: list clients and grant/revoke 30-day Interview Code access. This
// is the manual step that ties a confirmed Paystack payment to a client's
// access. Writes rely on the profiles admin RLS (admins only).
export default function AccessManagement() {
  const [state, setState] = useState({ loading: true, clients: [], error: false });
  const [busy, setBusy] = useState(() => new Set());
  const [actionError, setActionError] = useState('');
  const [confirmingId, setConfirmingId] = useState(null);

  const load = useCallback(async () => {
    if (!supabase) { setState({ loading: false, clients: [], error: true }); return; }
    setState((s) => ({ ...s, loading: true, error: false }));
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, interview_access_expires_at')
      .eq('role', 'client')
      .order('email');
    if (error) setState({ loading: false, clients: [], error: true });
    else setState({ loading: false, clients: data || [], error: false });
  }, []);

  useEffect(() => { load(); }, [load]);

  const setExpiry = useCallback(async (id, value) => {
    if (!supabase) return;
    setActionError('');
    setBusy((prev) => new Set(prev).add(id));
    const { data, error } = await supabase
      .from('profiles')
      .update({ interview_access_expires_at: value })
      .eq('id', id)
      .select('interview_access_expires_at')
      .single();
    setBusy((prev) => { const n = new Set(prev); n.delete(id); return n; });
    // On success update just this row; on failure the row is untouched (we never
    // changed it optimistically), so show an error rather than wiping the list.
    if (!error && data) {
      setState((s) => ({
        ...s,
        clients: s.clients.map((c) => (c.id === id ? { ...c, interview_access_expires_at: data.interview_access_expires_at } : c)),
      }));
    } else {
      setActionError('Couldn’t update access — please try again.');
    }
  }, []);

  const grant = (id) => setExpiry(id, new Date(Date.now() + THIRTY_DAYS_MS).toISOString());
  const revoke = (id) => { setConfirmingId(null); setExpiry(id, null); };

  if (state.loading) return <Loading label="Loading clients…" />;

  return (
    <section>
      <h2 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 20, margin: '0 0 4px', color: CREAM }}>
        Client Access
      </h2>
      <p style={{ color: MUTED, fontSize: 13.5, margin: '0 0 18px' }}>
        Grant or revoke 30-day Interview Code access after confirming a payment.
      </p>

      {actionError && (
        <div style={{ marginBottom: 14, padding: '9px 12px', borderRadius: 4, background: 'rgba(242,184,181,.12)', border: '1px solid rgba(242,184,181,.4)', color: '#F2B8B5', fontSize: 13 }}>
          {actionError}
        </div>
      )}

      {state.error ? (
        <div style={{ color: '#F2B8B5', fontSize: 14 }}>Couldn’t load clients. Refresh to try again.</div>
      ) : state.clients.length === 0 ? (
        <div style={{ color: MUTED, fontSize: 14 }}>No client accounts yet.</div>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 10 }}>
          {state.clients.map((c) => {
            const s = accessState(c.interview_access_expires_at);
            const isBusy = busy.has(c.id);
            return (
              <li key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 8, padding: '14px 16px' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 15, color: CREAM, fontWeight: 600 }}>{c.full_name || '—'}</div>
                  <div style={{ fontSize: 13, color: MUTED, overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.email}</div>
                  <div style={{ fontSize: 12.5, marginTop: 4, color: s.active ? GOLD : MUTED }}>{s.label}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {s.active ? (
                    confirmingId === c.id ? (
                      <>
                        <button type="button" onClick={() => revoke(c.id)} disabled={isBusy}
                          style={{ background: '#B5544C', color: CREAM, border: 'none', borderRadius: 3, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: isBusy ? 'default' : 'pointer', opacity: isBusy ? 0.6 : 1 }}>
                          {isBusy ? '…' : 'Confirm revoke'}
                        </button>
                        <button type="button" onClick={() => setConfirmingId(null)} disabled={isBusy}
                          style={{ background: 'transparent', color: MUTED, border: '1px solid rgba(255,255,255,.2)', borderRadius: 3, padding: '8px 12px', fontSize: 13, cursor: 'pointer' }}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button type="button" onClick={() => setConfirmingId(c.id)} disabled={isBusy}
                        style={{ background: 'transparent', color: CREAM, border: '1px solid rgba(255,255,255,.3)', borderRadius: 3, padding: '8px 14px', fontSize: 13, cursor: isBusy ? 'default' : 'pointer', opacity: isBusy ? 0.6 : 1 }}>
                        {isBusy ? '…' : 'Revoke'}
                      </button>
                    )
                  ) : (
                    <button type="button" onClick={() => grant(c.id)} disabled={isBusy}
                      style={{ background: GOLD, color: '#131F38', border: 'none', borderRadius: 3, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: isBusy ? 'default' : 'pointer', opacity: isBusy ? 0.6 : 1 }}>
                      {isBusy ? '…' : 'Grant 30 days'}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
