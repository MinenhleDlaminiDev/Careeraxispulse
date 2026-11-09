import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabase';
import { GOLD, ON_GOLD, MUTED, DANGER } from './theme';
import Loading from './Loading';
import Banner from './Banner';
import PageHeader from './PageHeader';
import { initials } from './format';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

// Access state → badge tone + label. Gold = live, danger = expired, neutral = none.
function accessState(expiry) {
  if (!expiry) return { tone: 'neutral', label: 'No access' };
  const d = new Date(expiry);
  if (d > new Date()) return { tone: 'gold', label: `Active · until ${d.toLocaleDateString()}` };
  return { tone: 'danger', label: `Expired ${d.toLocaleDateString()}` };
}

const goldBtn = {
  background: GOLD, color: ON_GOLD, border: 'none', borderRadius: 8,
  padding: '8px 15px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
};
const dangerBtn = {
  background: 'var(--ax-danger)', color: 'var(--ax-bg-solid)', border: 'none', borderRadius: 8,
  padding: '8px 15px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
};

// Admin tool: list clients and grant/revoke 30-day Interview Code access. This is
// the manual step that ties a confirmed Paystack payment to a client's access.
// Writes rely on the profiles admin RLS (admins only). Styled to match the CV
// workspace — elevated cards, avatars, status badges (AXIS-23).
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
    <div>
      <PageHeader eyebrow="Clients" title="Client Access">
        Grant or revoke 30-day Interview Code access after confirming a payment.
      </PageHeader>

      <Banner kind="error" style={{ marginBottom: 14 }}>{actionError}</Banner>

      {state.error ? (
        <div style={{ color: DANGER, fontSize: 14 }}>Couldn’t load clients. Refresh to try again.</div>
      ) : state.clients.length === 0 ? (
        <div className="ax-card" style={{ padding: '34px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ax-text)' }}>No client accounts yet</div>
          <div style={{ fontSize: 14, color: MUTED, marginTop: 6 }}>Clients appear here once they sign up.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {state.clients.map((c) => {
            const s = accessState(c.interview_access_expires_at);
            const isBusy = busy.has(c.id);
            const active = s.tone === 'gold';
            return (
              <section key={c.id} className="ax-card" style={{ padding: '20px 20px 22px' }}>
                <header style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                  <div className="ax-avatar">{initials(c.full_name, c.email)}</div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ax-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.full_name || 'Unnamed client'}</div>
                    <div style={{ fontSize: 13, color: MUTED, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.email}</div>
                  </div>
                  <span className={`ax-badge ax-badge-${s.tone}`}>{s.label}</span>
                </header>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--ax-border)' }}>
                  {active ? (
                    confirmingId === c.id ? (
                      <>
                        <button type="button" onClick={() => revoke(c.id)} disabled={isBusy} style={{ ...dangerBtn, opacity: isBusy ? 0.6 : 1 }}>
                          {isBusy ? '…' : 'Confirm revoke'}
                        </button>
                        <button type="button" className="ax-iconbtn" onClick={() => setConfirmingId(null)} disabled={isBusy}>Cancel</button>
                      </>
                    ) : (
                      <button type="button" className="ax-iconbtn" onClick={() => setConfirmingId(c.id)} disabled={isBusy}>
                        {isBusy ? '…' : 'Revoke access'}
                      </button>
                    )
                  ) : (
                    <button type="button" onClick={() => grant(c.id)} disabled={isBusy} style={{ ...goldBtn, opacity: isBusy ? 0.6 : 1 }}>
                      {isBusy ? '…' : 'Grant 30 days'}
                    </button>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
