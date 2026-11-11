import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { GOLD, ON_GOLD, MUTED, DANGER, GOLD_INK, SERIF } from './theme';
import Loading from './Loading';
import Banner from './Banner';
import Avatar from './Avatar';
import { accessState, setAccessExpiry, THIRTY_DAYS_MS } from './clientAccess';
import { downloadCv, displayName } from './cvStorage';
import { fmtDate } from './format';

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
              {value == null || value === '' ? '—' : value}
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
      .select('id, full_name, email, avatar_path, interview_access_expires_at, created_at, phone, location, linkedin_url, target_role, target_industry, seniority_level, target_companies, employment_status, change_driver')
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
      setActionError('Couldn’t update access — please try again.');
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
          <Avatar path={c.avatar_path} name={c.full_name} email={c.email} size={64} />
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
        <DetailCard title="Career goals" rows={[
          ['Target role', c.target_role],
          ['Target industry', c.target_industry],
          ['Seniority', c.seniority_level],
          ['Target companies', c.target_companies],
          ['Employment status', c.employment_status],
          ['What’s driving the change', c.change_driver],
        ]} />

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
