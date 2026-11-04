import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../supabase';
import { GOLD, CREAM, MUTED, SERIF } from './theme';

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ['pdf', 'doc', 'docx'];

const ext = (name) => (name.split('.').pop() || '').toLowerCase();

// Turn a stored path ("<uid>/<timestamp>-<name>") back into the friendly file
// name we showed on upload, by stripping the folder and the timestamp prefix.
const displayName = (path) => (path || '').split('/').pop().replace(/^\d+-/, '');

// Make a file name safe for a storage key: keep letters, numbers, dot, dash,
// underscore; collapse everything else to a single underscore.
const safeName = (name) => name.replace(/[^a-zA-Z0-9._-]+/g, '_').replace(/_+/g, '_');

// AXIS-08: the client uploads their own CV so the admin can work from it. Files
// go to the private "cvs" bucket under "<user_id>/…" (the storage policy keys
// off that first folder), and each upload adds a cv_uploads row (source
// 'client'). We show the most recent one with a signed download link.
export default function CvUpload() {
  const { user } = useAuth();
  const [state, setState] = useState({ loading: true, current: null, error: false });
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null); // { kind: 'error' | 'ok', text }
  const inputRef = useRef(null);
  // Guards the post-await state writes so leaving the page mid-fetch doesn't
  // set state on an unmounted component. Reset to true on every mount — under
  // StrictMode the cleanup runs once on the throwaway first mount, and the ref
  // would otherwise stay false and trap load() before it can set state.
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const load = useCallback(async () => {
    if (!supabase || !user) { setState({ loading: false, current: null, error: !supabase }); return; }
    setState((s) => ({ ...s, loading: true, error: false }));
    const { data, error } = await supabase
      .from('cv_uploads')
      .select('id, storage_path, created_at')
      .eq('user_id', user.id)
      .eq('source', 'client')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!mountedRef.current) return;
    if (error) setState({ loading: false, current: null, error: true });
    else setState({ loading: false, current: data || null, error: false });
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const onPick = async (e) => {
    const file = e.target.files?.[0];
    // Let the same file be re-picked later by clearing the input value.
    if (inputRef.current) inputRef.current.value = '';
    if (!file || !supabase || !user) return;
    setMessage(null);

    if (!ALLOWED.includes(ext(file.name))) {
      setMessage({ kind: 'error', text: 'Please upload a PDF, DOC or DOCX file.' });
      return;
    }
    if (file.size > MAX_BYTES) {
      setMessage({ kind: 'error', text: 'That file is over 5 MB. Please upload a smaller file.' });
      return;
    }

    setUploading(true);
    const path = `${user.id}/${Date.now()}-${safeName(file.name)}`;
    const up = await supabase.storage.from('cvs').upload(path, file, {
      contentType: file.type || undefined,
      upsert: false,
    });
    if (up.error) {
      setUploading(false);
      setMessage({ kind: 'error', text: 'Upload failed — please try again.' });
      return;
    }
    // Record the upload. If this row insert fails, remove the orphaned object
    // so storage and the table don't drift.
    const ins = await supabase.from('cv_uploads').insert({ user_id: user.id, storage_path: path, source: 'client' });
    setUploading(false);
    if (ins.error) {
      await supabase.storage.from('cvs').remove([path]);
      setMessage({ kind: 'error', text: 'Upload failed — please try again.' });
      return;
    }
    setMessage({ kind: 'ok', text: 'CV uploaded.' });
    load();
  };

  const download = async () => {
    if (!supabase || !state.current) return;
    setMessage(null);
    const name = displayName(state.current.storage_path);
    // Ask Supabase to serve the file as an attachment, then trigger it with a
    // temporary <a download>. A download isn't a pop-up, so blockers (Brave,
    // Safari) don't suppress it the way they do window.open after an await.
    const { data, error } = await supabase.storage.from('cvs').createSignedUrl(state.current.storage_path, 60, { download: name });
    if (error || !data?.signedUrl) { setMessage({ kind: 'error', text: 'Couldn’t open your CV right now. Please try again.' }); return; }
    const a = document.createElement('a');
    a.href = data.signedUrl;
    a.download = name;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const hasCurrent = Boolean(state.current);

  return (
    <section style={{ marginTop: 34, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 10, padding: '22px 22px' }}>
      <h2 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 20, margin: '0 0 4px', color: CREAM }}>Your CV</h2>
      <p style={{ color: MUTED, fontSize: 13.5, margin: '0 0 18px', lineHeight: 1.6 }}>
        Upload your CV so we can prepare your interview readiness alongside the job description. PDF, DOC or DOCX, up to 5 MB.
      </p>

      {message && (
        <div style={{ marginBottom: 14, padding: '9px 12px', borderRadius: 4, fontSize: 13,
          background: message.kind === 'error' ? 'rgba(242,184,181,.12)' : 'rgba(201,162,39,.12)',
          border: `1px solid ${message.kind === 'error' ? 'rgba(242,184,181,.4)' : 'rgba(201,162,39,.4)'}`,
          color: message.kind === 'error' ? '#F2B8B5' : GOLD }}>
          {message.text}
        </div>
      )}

      {state.loading ? (
        <div style={{ color: MUTED, fontSize: 14 }}>Loading…</div>
      ) : state.error ? (
        <div style={{ color: '#F2B8B5', fontSize: 14 }}>Couldn’t load your CV. Refresh to try again.</div>
      ) : (
        <>
          {hasCurrent ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 8, padding: '13px 15px', marginBottom: 16 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14.5, color: CREAM, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {displayName(state.current.storage_path)}
                </div>
                <div style={{ fontSize: 12.5, color: MUTED, marginTop: 3 }}>
                  Uploaded {new Date(state.current.created_at).toLocaleDateString()}
                </div>
              </div>
              <button type="button" onClick={download}
                style={{ background: 'transparent', color: CREAM, border: '1px solid rgba(255,255,255,.3)', borderRadius: 3, padding: '8px 14px', fontSize: 13, cursor: 'pointer' }}>
                Download
              </button>
            </div>
          ) : (
            <div style={{ color: MUTED, fontSize: 14, marginBottom: 16 }}>No CV uploaded yet.</div>
          )}

          <input ref={inputRef} type="file" accept=".pdf,.doc,.docx" onChange={onPick} style={{ display: 'none' }} id="cv-file" />
          <label htmlFor="cv-file"
            style={{ display: 'inline-block', background: GOLD, color: '#131F38', borderRadius: 3, padding: '9px 16px', fontSize: 13.5, fontWeight: 600, cursor: uploading ? 'default' : 'pointer', opacity: uploading ? 0.6 : 1, pointerEvents: uploading ? 'none' : 'auto' }}>
            {uploading ? 'Uploading…' : hasCurrent ? 'Replace CV' : 'Upload CV'}
          </label>
        </>
      )}
    </section>
  );
}
