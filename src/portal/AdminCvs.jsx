import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../supabase';
import { MUTED, DANGER, GOLD, ON_GOLD } from './theme';
import Loading from './Loading';
import Banner from './Banner';
import PageHeader from './PageHeader';
import { ACCEPT, displayName, validateCvFile, uploadCv, downloadCv } from './cvStorage';
import { Stagger, Item } from '../components/Reveal.jsx';

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

const PlusIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const UploadIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M12 16V4m0 0 4 4m-4-4-4 4M4 20h16" />
  </svg>
);

const goldBtn = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
  background: GOLD, color: ON_GOLD, border: 'none', borderRadius: 8,
  padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
};

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
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
        {cvs.map((cv) => <CvRow key={cv.id} cv={cv} onDownload={onDownload} />)}
      </ul>
    </div>
  );
}

// AXIS-11/12: the admin's CV workspace. CVs live in the private "cvs" bucket and
// cv_uploads table; admins read/write all via RLS. We load the uploads and the
// matching profiles separately (cv_uploads.user_id references auth.users, not
// profiles, so there's no FK to embed on) and group by client. Originals (client
// uploads or admin to-do copies) sit apart from the revised CVs the admin
// delivers. The admin can add an original (to-do) CV or deliver a revised one;
// downloads use short-lived signed URLs.
export default function AdminCvs() {
  const [state, setState] = useState({ loading: true, clients: [], error: false });
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(null);                      // { clientId, stage } mid-upload
  const [message, setMessage] = useState(null);                // { clientId, kind, text }
  const inputRef = useRef(null);
  const pendingRef = useRef(null);                             // { clientId, stage }

  const load = useCallback(async () => {
    if (!supabase) { setState({ loading: false, clients: [], error: true }); return; }
    setState((s) => ({ ...s, loading: true, error: false }));

    const { data: uploads, error: upErr } = await supabase
      .from('cv_uploads')
      .select('id, user_id, storage_path, stage, created_at')
      .order('created_at', { ascending: false });
    if (upErr) { setState({ loading: false, clients: [], error: true }); return; }

    // Every client (so the admin can add a to-do CV even before a client uploads).
    const { data: profs, error: pErr } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('role', 'client');
    if (pErr) { setState({ loading: false, clients: [], error: true }); return; }

    const byId = new Map();
    for (const p of profs || []) byId.set(p.id, { ...p, originals: [], revised: [] });
    for (const u of uploads || []) {
      let c = byId.get(u.user_id);
      if (!c) { c = { id: u.user_id, full_name: null, email: null, originals: [], revised: [] }; byId.set(u.user_id, c); }
      (u.stage === 'revised' ? c.revised : c.originals).push(u);
    }
    // Clients with CVs first (most to act on), then the rest, each alphabetical.
    const clients = [...byId.values()].sort((a, b) => {
      const an = a.originals.length + a.revised.length, bn = b.originals.length + b.revised.length;
      if ((an === 0) !== (bn === 0)) return an === 0 ? 1 : -1;
      return (a.full_name || a.email || '').localeCompare(b.full_name || b.email || '');
    });

    setState({ loading: false, clients, error: false });
  }, []);

  useEffect(() => { load(); }, [load]);

  const download = useCallback(async (cv) => {
    setActionError('');
    const { ok } = await downloadCv(cv.storage_path);
    if (!ok) setActionError('Couldn’t open that CV right now. Please try again.');
  }, []);

  const startUpload = (clientId, stage) => {
    setMessage(null);
    pendingRef.current = { clientId, stage };
    inputRef.current?.click();
  };

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (inputRef.current) inputRef.current.value = '';
    const pending = pendingRef.current;
    pendingRef.current = null;
    if (!file || !pending) return;

    const invalid = validateCvFile(file);
    if (invalid) { setMessage({ clientId: pending.clientId, kind: 'error', text: invalid }); return; }

    setBusy({ clientId: pending.clientId, stage: pending.stage });
    const { error } = await uploadCv({ userId: pending.clientId, file, source: 'admin', stage: pending.stage });
    setBusy(null);
    if (error) { setMessage({ clientId: pending.clientId, kind: 'error', text: 'Upload failed — please try again.' }); return; }
    setMessage({ clientId: pending.clientId, kind: 'ok', text: pending.stage === 'revised' ? 'Revised CV delivered.' : 'Original CV added.' });
    load();
  };

  if (state.loading) return <Loading label="Loading client CVs…" />;

  return (
    <div>
      <PageHeader eyebrow="CVs" title="Client CVs">
        Review the CVs clients upload and deliver the finished versions back to them.
      </PageHeader>

      <Banner kind="error" style={{ marginBottom: 14 }}>{actionError}</Banner>

      {/* One hidden picker, reused for every card via pendingRef. */}
      <input ref={inputRef} type="file" accept={ACCEPT} onChange={onFile} style={{ display: 'none' }} />

      {state.error ? (
        <div style={{ color: DANGER, fontSize: 14 }}>Couldn’t load client CVs. Refresh to try again.</div>
      ) : state.clients.length === 0 ? (
        <div className="ax-card" style={{ padding: '34px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ax-text)' }}>No clients yet</div>
          <div style={{ fontSize: 14, color: MUTED, marginTop: 6 }}>Client CVs will appear here once people sign up and upload.</div>
        </div>
      ) : (
        <Stagger style={{ display: 'grid', gap: 16 }}>
          {state.clients.map((c) => {
            const count = c.originals.length + c.revised.length;
            const isBusy = busy?.clientId === c.id;
            return (
              <Item as="section" key={c.id} className="ax-card" style={{ padding: '20px 20px 22px' }}>
                <header style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                  <div className="ax-avatar">{initials(c.full_name, c.email)}</div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ax-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.full_name || 'Unnamed client'}
                    </div>
                    <div style={{ fontSize: 13, color: MUTED, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.email || '—'}</div>
                  </div>
                  <span style={{ fontSize: 12.5, color: MUTED, flexShrink: 0 }}>{count === 0 ? 'No CV' : `${count} file${count === 1 ? '' : 's'}`}</span>
                </header>

                {count === 0 && (
                  <div style={{ marginTop: 16, fontSize: 13.5, color: MUTED }}>No CV on file yet.</div>
                )}
                <Group label="Original" cvs={c.originals} onDownload={download} />
                <Group label="Revised" cvs={c.revised} onDownload={download} />

                {message?.clientId === c.id && (
                  <Banner kind={message.kind} style={{ marginTop: 14 }}>{message.text}</Banner>
                )}

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--ax-border)' }}>
                  <button type="button" className="ax-iconbtn" onClick={() => startUpload(c.id, 'original')} disabled={isBusy}>
                    {PlusIcon}<span>{isBusy && busy.stage === 'original' ? 'Adding…' : 'Add original CV'}</span>
                  </button>
                  <button type="button" onClick={() => startUpload(c.id, 'revised')} disabled={isBusy} style={{ ...goldBtn, opacity: isBusy ? 0.6 : 1, cursor: isBusy ? 'default' : 'pointer' }}>
                    {UploadIcon}<span>{isBusy && busy.stage === 'revised' ? 'Uploading…' : 'Upload revised CV'}</span>
                  </button>
                </div>
              </Item>
            );
          })}
        </Stagger>
      )}
    </div>
  );
}
