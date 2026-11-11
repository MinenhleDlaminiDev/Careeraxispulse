import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { GOLD, ON_GOLD, MUTED, DANGER } from './theme';
import Loading from './Loading';
import Banner from './Banner';
import PageHeader from './PageHeader';
import Avatar from './Avatar';
import { accessState, setAccessExpiry, THIRTY_DAYS_MS } from './clientAccess';
import { Stagger, Item } from '../components/Reveal.jsx';

const goldBtn = {
  background: GOLD, color: ON_GOLD, border: 'none', borderRadius: 8,
  padding: '8px 15px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
};
const dangerBtn = {
  background: 'var(--ax-danger)', color: 'var(--ax-bg-solid)', border: 'none', borderRadius: 8,
  padding: '8px 15px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
};
const ellipsis = { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };

// A short access word for the card badge (the full "Active · until …" lives on
// the detail page).
const shortAccess = (tone) => (tone === 'gold' ? 'Active' : tone === 'danger' ? 'Expired' : 'No access');

function MetaRow({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: 8, fontSize: 13 }}>
      <span style={{ color: MUTED, minWidth: 74, flexShrink: 0 }}>{label}</span>
      <span style={{ color: 'var(--ax-text)', ...ellipsis }}>{value || '—'}</span>
    </div>
  );
}

// Admin Clients (AXIS-29): a card grid of every client — photo, access badge and
// a few key details at a glance — each card linking to its own detail page.
// Grant/revoke 30-day Interview Code access stays here for a quick action after
// confirming a payment; the full profile + CVs live on /clients/:id.
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
      .select('id, full_name, email, interview_access_expires_at, avatar_path, target_role, location')
      .eq('role', 'client')
      .order('email');
    if (error) { setState({ loading: false, clients: [], error: true }); return; }
    // CV counts per client — one query, tallied client-side (admins read all
    // cv_uploads via RLS).
    const { data: cvs } = await supabase.from('cv_uploads').select('user_id');
    const counts = new Map();
    for (const r of cvs || []) counts.set(r.user_id, (counts.get(r.user_id) || 0) + 1);
    const clients = (data || []).map((c) => ({ ...c, cvCount: counts.get(c.id) || 0 }));
    setState({ loading: false, clients, error: false });
  }, []);

  useEffect(() => { load(); }, [load]);

  const setExpiry = useCallback(async (id, value) => {
    setActionError('');
    setBusy((prev) => new Set(prev).add(id));
    const { data, error } = await setAccessExpiry(id, value);
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
      <PageHeader eyebrow="Clients" title="Clients">
        Manage your clients — open a client for their full profile and CVs, or grant and revoke Interview Code access here.
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
        <Stagger style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: 16 }}>
          {state.clients.map((c) => {
            const s = accessState(c.interview_access_expires_at);
            const isBusy = busy.has(c.id);
            const active = s.tone === 'gold';
            const to = `/portal/admin/clients/${c.id}`;
            return (
              <Item as="div" key={c.id} className="ax-card" style={{ padding: '20px 20px 22px', display: 'flex', flexDirection: 'column' }}>
                <Link to={to} style={{ display: 'block', color: 'inherit', textDecoration: 'none' }}>
                  <header style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                    <Avatar path={c.avatar_path} name={c.full_name} email={c.email} />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ax-text)', ...ellipsis }}>{c.full_name || 'Unnamed client'}</div>
                      <div style={{ fontSize: 13, color: MUTED, ...ellipsis }}>{c.email}</div>
                    </div>
                    <span className={`ax-badge ax-badge-${s.tone}`}>{shortAccess(s.tone)}</span>
                  </header>

                  <div style={{ marginTop: 15, display: 'flex', flexDirection: 'column', gap: 7 }}>
                    <MetaRow label="Target role" value={c.target_role} />
                    <MetaRow label="Location" value={c.location} />
                    <MetaRow label="CVs" value={c.cvCount ? `${c.cvCount} file${c.cvCount === 1 ? '' : 's'}` : 'None'} />
                  </div>
                </Link>

                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 9, marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--ax-border)' }}>
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
                  <Link to={to} className="ax-iconbtn" style={{ marginLeft: 'auto', textDecoration: 'none' }}>View →</Link>
                </div>
              </Item>
            );
          })}
        </Stagger>
      )}
    </div>
  );
}
