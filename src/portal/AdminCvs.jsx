import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabase';
import { MUTED, DANGER } from './theme';
import Loading from './Loading';
import Banner from './Banner';
import PageHeader from './PageHeader';

// Turn a stored path ("<uid>/<timestamp>-<name>") back into the friendly file
// name, by stripping the folder and the timestamp prefix (same as CvUpload).
const displayName = (path) => (path || '').split('/').pop().replace(/^\d+-/, '');

// Initials for the client avatar — first letters of the name, else the email.
const initials = (name, email) => {
  const src = (name || '').trim();
  if (src) {
    const parts = src.split(/\s+/);
    return ((parts[0][0] || '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
  }
  return (email || '?').slice(0, 2).toUpperCase();
};

const fmtDate = (iso) => new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

const FileIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6M9 13h6M9 17h4" />
  </svg>
);

const DownloadIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 19h16" />
  </svg>
);

// A single CV row: file icon, name + date, stage badge, download.
function CvRow({ cv, onDownload }) {
  const revised = cv.stage === 'revised';
  return (
    <li className="ax-cv-item">
      <div className="ax-file-ic">{FileIcon}</div>
      <div style={{ minWidth: 0, flex: '1 1 150px' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ax-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {displayName(cv.storage_path)}
        </div>
        <div style={{ fontSize: 12.5, color: MUTED, marginTop: 2 }}>{fmtDate(cv.created_at)}</div>
      </div>
      <span className={`ax-badge ax-badge-${revised ? 'revised' : 'original'}`}>{revised ? 'Revised' : 'Original'}</span>
      <button type="button" className="ax-iconbtn" onClick={() => onDownload(cv)} aria-label={`Download ${displayName(cv.storage_path)}`}>
        {DownloadIcon}<span>Download</span>
      </button>
    </li>
  );
}

function Group({ label, cvs, onDownload }) {
  if (!cvs.length) return null;
  return (
    <div style={{ marginTop: 18 }}>
      <p className="ax-grouplabel">{label}</p>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 9 }}>
        {cvs.map((cv) => <CvRow key={cv.id} cv={cv} onDownload={onDownload} />)}
      </ul>
    </div>
  );
}

// AXIS-11: the admin's view of every client's CVs. CVs live in the private
// "cvs" bucket and cv_uploads table; admins can read all via RLS. We load the
// uploads and the matching profiles separately (cv_uploads.user_id references
// auth.users, not profiles, so there's no FK to embed on) and group by client.
// originals (client uploads or admin to-do copies) are shown apart from the
// revised CVs the admin delivers. Downloads use short-lived signed URLs.
export default function AdminCvs() {
  const [state, setState] = useState({ loading: true, clients: [], error: false });
  const [actionError, setActionError] = useState('');

  const load = useCallback(async () => {
    if (!supabase) { setState({ loading: false, clients: [], error: true }); return; }
    setState((s) => ({ ...s, loading: true, error: false }));

    const { data: uploads, error: upErr } = await supabase
      .from('cv_uploads')
      .select('id, user_id, storage_path, stage, created_at')
      .order('created_at', { ascending: false });
    if (upErr) { setState({ loading: false, clients: [], error: true }); return; }

    const ids = [...new Set((uploads || []).map((u) => u.user_id))];
    let profiles = [];
    if (ids.length) {
      const { data: profs, error: pErr } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', ids);
      if (pErr) { setState({ loading: false, clients: [], error: true }); return; }
      profiles = profs || [];
    }

    // Group uploads under each client, keeping the newest-first order.
    const byId = new Map();
    for (const p of profiles) byId.set(p.id, { ...p, originals: [], revised: [] });
    for (const u of uploads || []) {
      let c = byId.get(u.user_id);
      if (!c) { c = { id: u.user_id, full_name: null, email: null, originals: [], revised: [] }; byId.set(u.user_id, c); }
      (u.stage === 'revised' ? c.revised : c.originals).push(u);
    }
    const clients = [...byId.values()].sort((a, b) =>
      (a.full_name || a.email || '').localeCompare(b.full_name || b.email || ''));

    setState({ loading: false, clients, error: false });
  }, []);

  useEffect(() => { load(); }, [load]);

  const download = useCallback(async (cv) => {
    if (!supabase) return;
    setActionError('');
    const name = displayName(cv.storage_path);
    const { data, error } = await supabase.storage.from('cvs').createSignedUrl(cv.storage_path, 60, { download: name });
    if (error || !data?.signedUrl) { setActionError('Couldn’t open that CV right now. Please try again.'); return; }
    const a = document.createElement('a');
    a.href = data.signedUrl;
    a.download = name;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, []);

  if (state.loading) return <Loading label="Loading client CVs…" />;

  return (
    <div>
      <PageHeader eyebrow="CVs" title="Client CVs">
        Review the CVs clients upload and deliver the finished versions back to them.
      </PageHeader>

      <Banner kind="error" style={{ marginBottom: 14 }}>{actionError}</Banner>

      {state.error ? (
        <div style={{ color: DANGER, fontSize: 14 }}>Couldn’t load client CVs. Refresh to try again.</div>
      ) : state.clients.length === 0 ? (
        <div className="ax-card" style={{ padding: '34px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ax-text)' }}>No client CVs yet</div>
          <div style={{ fontSize: 14, color: MUTED, marginTop: 6 }}>When a client uploads a CV, it’ll appear here for you to review.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {state.clients.map((c) => {
            const count = c.originals.length + c.revised.length;
            return (
              <section key={c.id} className="ax-card" style={{ padding: '20px 20px 22px' }}>
                <header style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                  <div className="ax-avatar">{initials(c.full_name, c.email)}</div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ax-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.full_name || 'Unnamed client'}
                    </div>
                    <div style={{ fontSize: 13, color: MUTED, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.email || '—'}</div>
                  </div>
                  <span style={{ fontSize: 12.5, color: MUTED, flexShrink: 0 }}>{count} file{count === 1 ? '' : 's'}</span>
                </header>

                <Group label="Original" cvs={c.originals} onDownload={download} />
                <Group label="Revised" cvs={c.revised} onDownload={download} />
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
