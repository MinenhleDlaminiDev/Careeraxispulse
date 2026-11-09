import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../supabase';
import { GOLD, CREAM, MUTED, SURFACE, BORDER, ON_GOLD, DANGER, GOLD_INK } from './theme';
import Banner from './Banner';
import PageHeader from './PageHeader';
import { ACCEPT, validateCvFile, uploadCv, downloadCv, displayName } from './cvStorage';

// AXIS-08: the client uploads their own CV so the admin can work from it. The
// file goes to the private "cvs" bucket and a cv_uploads row (source 'client').
// AXIS-12: the admin delivers a finished CV back (stage 'revised'); we show the
// latest one here in a "Your finished CV" section so it reaches the client.
export default function CvUpload() {
  const { user } = useAuth();
  const [state, setState] = useState({ loading: true, current: null, finished: null, error: false });
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null); // { kind: 'error' | 'ok', text }
  const inputRef = useRef(null);
  // Guards the post-await state writes so leaving the page mid-fetch doesn't set
  // state on an unmounted component. Reset to true on every mount — under
  // StrictMode the cleanup runs once on the throwaway first mount, and the ref
  // would otherwise stay false and trap load() before it can set state.
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const load = useCallback(async () => {
    if (!supabase || !user) { setState({ loading: false, current: null, finished: null, error: !supabase }); return; }
    setState((s) => ({ ...s, loading: true, error: false }));
    // Fetch the client's CVs newest-first, then pick their own latest upload
    // (source 'client') and the latest finished CV the admin delivered
    // (stage 'revised'). One round-trip instead of two.
    const { data, error } = await supabase
      .from('cv_uploads')
      .select('id, storage_path, source, stage, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (!mountedRef.current) return;
    if (error) { setState({ loading: false, current: null, finished: null, error: true }); return; }
    const rows = data || [];
    const current = rows.find((r) => r.source === 'client') || null;
    const finished = rows.find((r) => r.stage === 'revised') || null;
    setState({ loading: false, current, finished, error: false });
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const onPick = async (e) => {
    const file = e.target.files?.[0];
    // Let the same file be re-picked later by clearing the input value.
    if (inputRef.current) inputRef.current.value = '';
    if (!file || !supabase || !user) return;
    setMessage(null);

    const invalid = validateCvFile(file);
    if (invalid) { setMessage({ kind: 'error', text: invalid }); return; }

    setUploading(true);
    const { error } = await uploadCv({ userId: user.id, file, source: 'client', stage: 'original' });
    setUploading(false);
    if (error) { setMessage({ kind: 'error', text: 'Upload failed — please try again.' }); return; }
    setMessage({ kind: 'ok', text: 'CV uploaded.' });
    load();
  };

  const download = async (cv) => {
    if (!cv) return;
    setMessage(null);
    const { ok } = await downloadCv(cv.storage_path);
    if (!ok) setMessage({ kind: 'error', text: 'Couldn’t open your CV right now. Please try again.' });
  };

  const hasCurrent = Boolean(state.current);

  return (
    <div>
      <PageHeader eyebrow="My CV" title="Your CV">
        Upload your CV so we can prepare your interview readiness alongside the job description. PDF, DOC or DOCX, up to 5 MB.
      </PageHeader>

      {/* AXIS-12: the finished CV the admin delivered back, shown first when present. */}
      {state.finished && (
        <section className="ax-card" style={{ padding: '18px 20px 20px', marginBottom: 16, borderColor: 'var(--ax-gold-border)' }}>
          <div style={{ letterSpacing: '.12em', textTransform: 'uppercase', fontSize: 11, color: GOLD_INK, fontWeight: 700, marginBottom: 12 }}>Your finished CV</div>
          <div className="ax-cv-item">
            <div className="ax-file-ic" style={{ color: GOLD_INK }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 19, height: 19 }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M9 13h6M9 17h4" />
              </svg>
            </div>
            <div style={{ minWidth: 0, flex: '1 1 150px' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: CREAM, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName(state.finished.storage_path)}</div>
              <div style={{ fontSize: 12.5, color: MUTED, marginTop: 2 }}>Delivered {new Date(state.finished.created_at).toLocaleDateString()}</div>
            </div>
            <button type="button" onClick={() => download(state.finished)} style={{ background: GOLD, color: ON_GOLD, border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Download
            </button>
          </div>
        </section>
      )}

      <section style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '22px 22px' }}>
        <Banner kind={message?.kind} style={{ marginBottom: 16 }}>{message?.text}</Banner>

        {state.loading ? (
          <div style={{ color: MUTED, fontSize: 14 }}>Loading…</div>
        ) : state.error ? (
          <div style={{ color: DANGER, fontSize: 14 }}>Couldn’t load your CV. Refresh to try again.</div>
        ) : (
          <>
            {hasCurrent ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, color: CREAM, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {displayName(state.current.storage_path)}
                  </div>
                  <div style={{ fontSize: 12.5, color: MUTED, marginTop: 3 }}>
                    Uploaded {new Date(state.current.created_at).toLocaleDateString()}
                  </div>
                </div>
                <button type="button" onClick={() => download(state.current)}
                  style={{ background: 'transparent', color: CREAM, border: `1px solid ${BORDER}`, borderRadius: 6, padding: '9px 16px', fontSize: 13, cursor: 'pointer' }}>
                  Download
                </button>
              </div>
            ) : (
              <div style={{ color: MUTED, fontSize: 14, marginBottom: 16 }}>No CV uploaded yet.</div>
            )}

            <input ref={inputRef} type="file" accept={ACCEPT} onChange={onPick} style={{ display: 'none' }} id="cv-file" />
            <label htmlFor="cv-file"
              style={{ display: 'inline-block', background: GOLD, color: ON_GOLD, borderRadius: 7, padding: '11px 18px', fontSize: 14, fontWeight: 600, cursor: uploading ? 'default' : 'pointer', opacity: uploading ? 0.6 : 1, pointerEvents: uploading ? 'none' : 'auto' }}>
              {uploading ? 'Uploading…' : hasCurrent ? 'Replace CV' : 'Upload CV'}
            </label>
          </>
        )}
      </section>
    </div>
  );
}
