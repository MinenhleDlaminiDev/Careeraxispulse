import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { GOLD, ON_GOLD, MUTED, DANGER, GOLD_INK, SERIF } from './theme';
import Loading from './Loading';
import Banner from './Banner';
import Avatar from './Avatar';
import Modal from './Modal';
import { fieldStyle, labelStyle } from './AuthCard';
import { accessState, setAccessExpiry, THIRTY_DAYS_MS } from './clientAccess';
import { downloadCv, displayName } from './cvStorage';
import { fmtDate } from './format';
import { asList, educationLine } from './profileFields';
import {
  TIER_OPTIONS, ORDER_STATUSES, orderLine, listOrders, recordOrder, deleteOrder,
  setReturningClient, suggestedAmount, isListPrice,
} from './revampOrders';

const ellipsis = { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
const goldBtn = {
  background: GOLD, color: ON_GOLD, border: 'none', borderRadius: 8,
  padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
};
const dangerBtn = {
  background: 'var(--ax-danger)', color: 'var(--ax-bg-solid)', border: 'none', borderRadius: 8,
  padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
};

const FileIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M9 13h6M9 17h4" />
  </svg>
);
const DownloadIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 19h16" />
  </svg>
);

// One field row inside a detail card. `value` may be a string or a node (e.g. a
// LinkedIn link); empty values render as an em dash so the layout stays even.
function DetailCard({ title, rows }) {
  return (
    <section className="ax-card" style={{ padding: '20px 22px' }}>
      <p className="ax-grouplabel">{title}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
        {rows.map(([label, value]) => (
          <div key={label} style={{ display: 'flex', gap: 12, fontSize: 14, flexWrap: 'wrap' }}>
            <span style={{ color: MUTED, minWidth: 128, flexShrink: 0 }}>{label}</span>
            <span style={{ color: 'var(--ax-text)', flex: 1, minWidth: 0, wordBreak: 'break-word' }}>
              {value == null || value === '' ? 'Not set' : value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function CvRow({ cv, onDownload }) {
  const revised = cv.stage === 'revised';
  return (
    <li className="ax-cv-item">
      <div className="ax-file-ic">{FileIcon}</div>
      <div style={{ minWidth: 0, flex: '1 1 150px' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ax-text)', ...ellipsis }}>{displayName(cv.storage_path)}</div>
        <div style={{ fontSize: 12.5, color: MUTED, marginTop: 2 }}>{fmtDate(cv.created_at)} · {cv.source === 'admin' ? 'From admin' : 'From client'}</div>
      </div>
      <span className={`ax-badge ax-badge-${revised ? 'revised' : 'original'}`}>{revised ? 'Revised' : 'Original'}</span>
      <button type="button" className="ax-iconbtn" onClick={() => onDownload(cv)} aria-label={`Download ${displayName(cv.storage_path)}`}>
        {DownloadIcon}<span>Download</span>
      </button>
    </li>
  );
}

// AXIS-47: the client's permission to have their CV sent to employers.
//
// The consent is required at signup and the client has no switch of their own,
// so this card is the ONLY place it can be withdrawn. Someone who emails asking
// to stop being shared is handled here. Turning it back on from the admin side
// is deliberately not offered — that would be the admin consenting on the
// client's behalf, which is not consent. If they want back in, they tick it
// themselves: clearing it makes their profile incomplete, so the completion
// gate asks them again next time they sign in.
function CvSharingConsent({ client, onChange }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const on = client.cv_sharing_consent === true;
  // Signed up before AXIS-47 shipped, so they were never asked. Not the same
  // as refusing, and not the same as agreeing — say so plainly rather than
  // showing "Withdrawn", which would read as a decision they never made.
  const exempt = (client.cv_consent_required ?? true) !== true && !on;

  const withdraw = async () => {
    setError('');
    setBusy(true);
    const { data, error: err } = await supabase
      .from('profiles')
      .update({ cv_sharing_consent: false, cv_sharing_consent_at: null })
      .eq('id', client.id)
      .select('cv_sharing_consent, cv_sharing_consent_at')
      .single();
    setBusy(false);
    setConfirming(false);
    if (err || !data) { setError('Couldn’t update that. Please try again.'); return; }
    onChange(data);
  };

  return (
    <section className="ax-card" style={{ padding: '20px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 4 }}>
        <p className="ax-grouplabel" style={{ margin: 0 }}>CV sharing</p>
        <span className={`ax-badge ax-badge-${on ? 'gold' : exempt ? 'neutral' : 'danger'}`} style={{ marginLeft: 'auto' }}>
          {on ? 'Consented' : exempt ? 'Never asked' : 'Withdrawn'}
        </span>
      </div>
      <p style={{ margin: '0 0 14px', fontSize: 13.5, color: MUTED, lineHeight: 1.6 }}>
        {on
          ? `They agreed on ${fmtDate(client.cv_sharing_consent_at)} that their CV and profile may be shared with employers and recruiters looking for candidates.`
          : exempt
            ? 'This account predates the consent box, so they were never asked. Don’t send their CV to employers without asking them directly first.'
            : 'Their CV must NOT be sent to employers or recruiters. They will be asked again next time they sign in.'}
      </p>

      <Banner kind="error" style={{ marginBottom: 14 }}>{error}</Banner>

      {on && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, paddingTop: 14, borderTop: '1px solid var(--ax-border)' }}>
          {confirming ? (
            <>
              <button type="button" onClick={withdraw} disabled={busy} style={{ ...dangerBtn, opacity: busy ? 0.6 : 1 }}>
                {busy ? '…' : 'Yes, stop sharing'}
              </button>
              <button type="button" className="ax-iconbtn" onClick={() => setConfirming(false)} disabled={busy}>Cancel</button>
            </>
          ) : (
            <button type="button" className="ax-iconbtn" onClick={() => setConfirming(true)} disabled={busy}>
              Withdraw consent
            </button>
          )}
        </div>
      )}
    </section>
  );
}

// AXIS-41: the admin's side of returning-client pricing.
//
// Two controls, because there are two ways a client can be returning:
//   • "Record a revamp order" writes the history the portal derives from. Once
//     one confirmed order exists, the client's NEXT revamp is priced as a
//     returning one automatically.
//   • "Returning client" is the manual override, for the clients served before
//     this page existed and who have no history to derive from.
//
// Both are admin-only in the database (cv_orders is admin-write, and
// returning_client sits in the profiles privilege guard), so a client can't
// hand themselves the lower price.
function RevampOrders({ client, onFlagChange }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState(null);
  const [form, setForm] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    listOrders(client.id).then(({ orders: rows, error: err }) => {
      if (!active) return;
      if (err) setError('Couldn’t load revamp orders.');
      setOrders(rows);
      setLoading(false);
    });
    return () => { active = false; };
  }, [client.id]);

  const confirmed = orders.some((o) => o.status === 'confirmed');
  const flagged = !!client.returning_client;
  const returning = flagged || confirmed;

  const toggleFlag = async () => {
    setError('');
    setBusy(true);
    const { data, error: err } = await setReturningClient(client.id, !flagged);
    setBusy(false);
    if (err || !data) { setError('Couldn’t change that. Please try again.'); return; }
    onFlagChange(data.returning_client);
  };

  // Opening the form picks sensible defaults: the tier is left unchosen, and
  // "charged the returning price" starts at whatever this client is today.
  const openForm = () => {
    setError('');
    setForm({ tier: '', amount: '', isReturning: returning, status: 'confirmed', note: '' });
    setAdding(true);
  };

  // Changing the tier (or the returning tick) refills the amount with that
  // tier's list price — but only while the field still holds a list price, so a
  // figure the admin typed themselves is never overwritten.
  const setTier = (tier) => setForm((f) => ({
    ...f, tier, amount: isListPrice(f.amount) ? suggestedAmount(tier, f.isReturning) : f.amount,
  }));
  const setIsReturning = (isReturning) => setForm((f) => ({
    ...f, isReturning, amount: isListPrice(f.amount) ? suggestedAmount(f.tier, isReturning) : f.amount,
  }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    const { data, error: err } = await recordOrder({ userId: client.id, ...form });
    setBusy(false);
    if (err || !data) { setError('Couldn’t save that order. Please try again.'); return; }
    setOrders((o) => [data, ...o]);
    setAdding(false);
  };

  // A mis-recorded order changes what the client is charged next time, so it
  // has to be removable. Two taps, like revoking access.
  const remove = async (id) => {
    setError('');
    setBusy(true);
    const { error: err } = await deleteOrder(id);
    setBusy(false);
    setRemoving(null);
    if (err) { setError('Couldn’t remove that order. Please try again.'); return; }
    setOrders((o) => o.filter((row) => row.id !== id));
  };

  return (
    <section className="ax-card" style={{ padding: '20px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 4 }}>
        <p className="ax-grouplabel" style={{ margin: 0 }}>CV revamp orders</p>
        <span className={`ax-badge ax-badge-${returning ? 'gold' : 'neutral'}`} style={{ marginLeft: 'auto' }}>
          {returning ? 'Returning client' : 'First-time client'}
        </span>
      </div>
      <p style={{ margin: '0 0 16px', fontSize: 13, color: MUTED, lineHeight: 1.6 }}>
        {returning
          ? `They see returning prices${confirmed ? ' because an order is recorded below' : ' because the override below is on'}${confirmed && flagged ? ' and the override is on' : ''}.`
          : 'They see first-time prices. Record an order, or turn on the override, to change that.'}
      </p>

      <Banner kind="error" style={{ marginBottom: 14 }}>{error}</Banner>

      {loading ? (
        <div style={{ fontSize: 14, color: MUTED }}>Loading orders…</div>
      ) : orders.length === 0 ? (
        <div style={{ fontSize: 14, color: MUTED }}>No revamp orders recorded yet.</div>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
          {orders.map((o) => (
            <li key={o.id} className="ax-cv-item">
              <div style={{ minWidth: 0, flex: '1 1 150px' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ax-text)' }}>{orderLine(o)}</div>
                <div style={{ fontSize: 12.5, color: MUTED, marginTop: 2 }}>
                  {fmtDate(o.created_at)}{o.note ? ` · ${o.note}` : ''}
                </div>
              </div>
              {removing === o.id ? (
                <>
                  <button type="button" onClick={() => remove(o.id)} disabled={busy} style={{ ...dangerBtn, opacity: busy ? 0.6 : 1 }}>
                    {busy ? '…' : 'Confirm'}
                  </button>
                  <button type="button" className="ax-iconbtn" onClick={() => setRemoving(null)} disabled={busy}>Cancel</button>
                </>
              ) : (
                <button type="button" className="ax-iconbtn" onClick={() => setRemoving(o.id)} disabled={busy}>Remove</button>
              )}
            </li>
          ))}
        </ul>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 9, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--ax-border)' }}>
        <button type="button" onClick={openForm} disabled={busy} style={{ ...goldBtn, opacity: busy ? 0.6 : 1 }}>
          Record a revamp order
        </button>
        <label className="ax-switch" style={{ marginLeft: 'auto' }}>
          <input type="checkbox" checked={flagged} onChange={toggleFlag} disabled={busy} />
          <span>Returning client (override)</span>
        </label>
      </div>

      {adding && form && (
        <Modal onClose={() => setAdding(false)} label="Record a revamp order">
          <form onSubmit={submit}>
            {/* paddingRight clears the Modal's ✕, which floats at top right. */}
            <div style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 700, color: 'var(--ax-text)', marginBottom: 4, paddingRight: 30 }}>
              Record a revamp order
            </div>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: MUTED, lineHeight: 1.6 }}>
              For {client.full_name || client.email}. A confirmed order makes them a returning client for their next revamp.
            </p>

            <label style={labelStyle}>
              Tier
              <select value={form.tier} onChange={(e) => setTier(e.target.value)} required style={fieldStyle}>
                <option value="">Choose a tier…</option>
                {TIER_OPTIONS.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
              </select>
            </label>

            <label style={{ ...labelStyle, marginTop: 14 }}>
              Amount paid (rand)
              <input type="text" inputMode="decimal" value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                placeholder="Leave blank if you don’t have it" style={fieldStyle} />
            </label>

            <label style={{ ...labelStyle, marginTop: 14 }}>
              Status
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} style={fieldStyle}>
                {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>

            <label style={{ ...labelStyle, marginTop: 14 }}>
              Note (optional)
              <input type="text" value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                placeholder="Paystack reference, or anything worth remembering" style={fieldStyle} />
            </label>

            <label className="ax-switch" style={{ marginTop: 16 }}>
              <input type="checkbox" checked={form.isReturning} onChange={(e) => setIsReturning(e.target.checked)} />
              <span>Charged at the returning price</span>
            </label>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, marginTop: 20 }}>
              <button type="submit" disabled={busy || !form.tier} style={{ ...goldBtn, opacity: busy || !form.tier ? 0.6 : 1 }}>
                {busy ? 'Saving…' : 'Save order'}
              </button>
              <button type="button" className="ax-iconbtn" onClick={() => setAdding(false)} disabled={busy}>Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}

// Dedicated client page (AXIS-29): the full profile the admin now collects
// (contact + career goals), their CVs with download, and grant/revoke access —
// reached from a card on /clients. Admin-only via the profiles/cv_uploads RLS.
export default function ClientDetail() {
  const { id } = useParams();
  const [state, setState] = useState({ loading: true, client: null, cvs: [], error: false });
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [actionError, setActionError] = useState('');

  const load = useCallback(async () => {
    if (!supabase || !id) { setState({ loading: false, client: null, cvs: [], error: true }); return; }
    setState((s) => ({ ...s, loading: true, error: false }));
    const { data: client, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_path, avatar_url, interview_access_expires_at, created_at, phone, location, linkedin_url, target_role, target_industry, seniority_level, target_companies, employment_status, change_driver, skills, education, returning_client, cv_sharing_consent, cv_sharing_consent_at, cv_consent_required')
      .eq('id', id)
      .maybeSingle();
    if (error || !client) { setState({ loading: false, client: null, cvs: [], error: true }); return; }
    const { data: cvs } = await supabase
      .from('cv_uploads')
      .select('id, storage_path, source, stage, created_at')
      .eq('user_id', id)
      .order('created_at', { ascending: false });
    setState({ loading: false, client, cvs: cvs || [], error: false });
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const setExpiry = async (value) => {
    setActionError('');
    setBusy(true);
    const { data, error } = await setAccessExpiry(id, value);
    setBusy(false);
    if (!error && data) {
      setState((s) => ({ ...s, client: { ...s.client, interview_access_expires_at: data.interview_access_expires_at } }));
    } else {
      setActionError('Couldn’t update access. Please try again.');
    }
  };
  const grant = () => setExpiry(new Date(Date.now() + THIRTY_DAYS_MS).toISOString());
  const revoke = () => { setConfirming(false); setExpiry(null); };

  const download = async (cv) => {
    setActionError('');
    const { ok } = await downloadCv(cv.storage_path);
    if (!ok) setActionError('Couldn’t open that CV right now. Please try again.');
  };

  const back = (
    <Link to="/portal/admin/clients" style={{ display: 'inline-block', fontSize: 13, fontWeight: 600, color: GOLD_INK, textDecoration: 'none', marginBottom: 14 }}>
      ← All clients
    </Link>
  );

  if (state.loading) return <Loading label="Loading client…" />;

  if (state.error || !state.client) {
    return (
      <div>
        {back}
        <div className="ax-card" style={{ padding: '28px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ax-text)' }}>Couldn’t load this client</div>
          <div style={{ fontSize: 14, color: MUTED, marginTop: 6 }}>They may no longer exist. Go back to the client list.</div>
        </div>
      </div>
    );
  }

  const c = state.client;
  const s = accessState(c.interview_access_expires_at);
  const active = s.tone === 'gold';
  const linkedin = c.linkedin_url
    ? <a href={c.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ color: GOLD_INK }}>{c.linkedin_url}</a>
    : null;

  return (
    <div>
      {back}

      <section className="ax-card" style={{ padding: '22px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <Avatar path={c.avatar_path} src={c.avatar_url} name={c.full_name} email={c.email} size={64} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontFamily: SERIF, fontSize: 21, fontWeight: 700, color: 'var(--ax-text)', ...ellipsis }}>{c.full_name || 'Unnamed client'}</div>
            <div style={{ fontSize: 13.5, color: MUTED, ...ellipsis }}>{c.email}</div>
            {c.created_at && <div style={{ fontSize: 12.5, color: MUTED, marginTop: 4 }}>Joined {fmtDate(c.created_at)}</div>}
          </div>
          <span className={`ax-badge ax-badge-${s.tone}`}>{s.label}</span>
        </div>

        <Banner kind="error" style={{ marginTop: 14 }}>{actionError}</Banner>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--ax-border)' }}>
          {active ? (
            confirming ? (
              <>
                <button type="button" onClick={revoke} disabled={busy} style={{ ...dangerBtn, opacity: busy ? 0.6 : 1 }}>
                  {busy ? '…' : 'Confirm revoke'}
                </button>
                <button type="button" className="ax-iconbtn" onClick={() => setConfirming(false)} disabled={busy}>Cancel</button>
              </>
            ) : (
              <button type="button" className="ax-iconbtn" onClick={() => setConfirming(true)} disabled={busy}>
                {busy ? '…' : 'Revoke access'}
              </button>
            )
          ) : (
            <button type="button" onClick={grant} disabled={busy} style={{ ...goldBtn, opacity: busy ? 0.6 : 1 }}>
              {busy ? '…' : 'Grant 30 days'}
            </button>
          )}
        </div>
      </section>

      <div style={{ display: 'grid', gap: 16, marginTop: 16 }}>
        <DetailCard title="Contact" rows={[
          ['Phone / WhatsApp', c.phone],
          ['Location', c.location],
          ['LinkedIn', linkedin],
        ]} />
        {/* AXIS-42: the two list fields get their own card — chips and a list
            of qualifications do not fit the label/value rows above. */}
        <section className="ax-card" style={{ padding: '20px 22px' }}>
          <p className="ax-grouplabel">Skills &amp; education</p>
          <div style={{ fontSize: 13, color: MUTED, marginBottom: 8 }}>Skills</div>
          {asList(c.skills).length === 0 ? (
            <div style={{ fontSize: 14, color: MUTED, marginBottom: 18 }}>Not set</div>
          ) : (
            <div className="ax-chips" style={{ marginBottom: 18 }}>
              {asList(c.skills).map((s) => <span key={s} className="ax-chip ax-chip-static">{s}</span>)}
            </div>
          )}
          <div style={{ fontSize: 13, color: MUTED, marginBottom: 8 }}>Education &amp; qualifications</div>
          {asList(c.education).length === 0 ? (
            <div style={{ fontSize: 14, color: MUTED }}>Not set</div>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 7 }}>
              {asList(c.education).map((row, i) => (
                <li key={i} style={{ fontSize: 14, color: 'var(--ax-text)', lineHeight: 1.5, wordBreak: 'break-word' }}>
                  {educationLine(row)}
                </li>
              ))}
            </ul>
          )}
        </section>

        <DetailCard title="Career goals" rows={[
          ['Target role', c.target_role],
          ['Target industry', c.target_industry],
          ['Seniority', c.seniority_level],
          ['Target companies', c.target_companies],
          ['Employment status', c.employment_status],
          ['What’s driving the change', c.change_driver],
        ]} />

        {/* AXIS-47: whether this client's CV may go to employers, and when
            they agreed. Clearing it is how a withdrawal request is honoured —
            the client has no switch of their own, so it has to live here. */}
        <CvSharingConsent
          client={c}
          onChange={(row) => setState((s) => ({ ...s, client: { ...s.client, ...row } }))}
        />

        {/* AXIS-41: order history + the manual override that together decide
            whether this client sees returning prices. */}
        <RevampOrders
          client={c}
          onFlagChange={(value) => setState((s) => ({ ...s, client: { ...s.client, returning_client: value } }))}
        />

        <section className="ax-card" style={{ padding: '20px 22px' }}>
          <p className="ax-grouplabel">CVs</p>
          {state.cvs.length === 0 ? (
            <div style={{ color: MUTED, fontSize: 14 }}>No CVs uploaded yet.</div>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
              {state.cvs.map((cv) => <CvRow key={cv.id} cv={cv} onDownload={download} />)}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
