import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../supabase';
import { GOLD, CREAM, MUTED, SERIF } from './theme';
import Loading from './Loading';

const labelStyle = { display: 'block', fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', color: GOLD, margin: '0 0 6px' };
const fieldBase = { width: '100%', boxSizing: 'border-box', background: 'rgba(0,0,0,.25)', border: '1px solid rgba(255,255,255,.18)', borderRadius: 4, color: CREAM, fontSize: 14, padding: '9px 11px', fontFamily: 'inherit' };
const ghostBtn = { background: 'transparent', color: CREAM, border: '1px solid rgba(255,255,255,.3)', borderRadius: 3, padding: '6px 12px', fontSize: 12.5, cursor: 'pointer' };

function Field({ label, value, onChange, rows }) {
  const common = { style: rows ? { ...fieldBase, resize: 'vertical', lineHeight: 1.55 } : fieldBase, value: value ?? '', onChange: (e) => onChange(e.target.value) };
  return (
    <label style={{ display: 'block', marginBottom: 14 }}>
      <span style={labelStyle}>{label}</span>
      {rows ? <textarea rows={rows} {...common} /> : <input type="text" {...common} />}
    </label>
  );
}

// AXIS-10: the admin edits the Interview Code content in-app, replacing the
// manual SQL step. It's a structured form (never raw JSON) so the shape the
// client page renders can't be broken. Reads/writes the single
// interview_content row; the admin RLS policy allows the write.
export default function ContentEditor() {
  const [load, setLoad] = useState({ loading: true, id: null, error: false });
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null); // { kind: 'error' | 'ok', text }
  const mountedRef = useRef(true);
  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  // Stable React keys for pillars so removing/reordering one doesn't remap the
  // wrong block to the wrong data. __key is a UI-only field, stripped on save.
  const keySeq = useRef(0);
  const withKey = useCallback((p) => ({ ...p, __key: keySeq.current++ }), []);

  const fetchContent = useCallback(async () => {
    if (!supabase) { setLoad({ loading: false, id: null, error: true }); return; }
    setLoad((s) => ({ ...s, loading: true, error: false }));
    const { data, error } = await supabase.from('interview_content').select('id, content').limit(1).maybeSingle();
    if (!mountedRef.current) return;
    if (error || !data) { setLoad({ loading: false, id: null, error: true }); return; }
    const content = data.content || {};
    const pillars = (Array.isArray(content.pillars) ? content.pillars : []).map(withKey);
    setDraft({ ...content, pillars });
    setLoad({ loading: false, id: data.id, error: false });
  }, [withKey]);

  useEffect(() => { fetchContent(); }, [fetchContent]);

  // --- immutable draft updates ---
  const setTop = (key, value) => setDraft((d) => ({ ...d, [key]: value }));
  const setPillar = (i, key, value) => setDraft((d) => ({ ...d, pillars: d.pillars.map((p, idx) => (idx === i ? { ...p, [key]: value } : p)) }));
  const setFocus = (i, j, value) => setDraft((d) => ({ ...d, pillars: d.pillars.map((p, idx) => (idx === i ? { ...p, focus: (p.focus || []).map((f, fj) => (fj === j ? value : f)) } : p)) }));
  const addFocus = (i) => setDraft((d) => ({ ...d, pillars: d.pillars.map((p, idx) => (idx === i ? { ...p, focus: [...(p.focus || []), ''] } : p)) }));
  const removeFocus = (i, j) => setDraft((d) => ({ ...d, pillars: d.pillars.map((p, idx) => (idx === i ? { ...p, focus: (p.focus || []).filter((_, fj) => fj !== j) } : p)) }));
  const addPillar = () => setDraft((d) => ({ ...d, pillars: [...d.pillars, withKey({ number: String(d.pillars.length + 1).padStart(2, '0'), title: '', subtitle: '', intro: '', focus: [], principle: '' })] }));
  const removePillar = (i) => setDraft((d) => ({ ...d, pillars: d.pillars.filter((_, idx) => idx !== i) }));

  const save = async () => {
    if (!supabase || !load.id || !draft) return;
    setMessage(null);
    setSaving(true);
    // Strip the UI-only __key before persisting so the stored JSON stays clean.
    const content = { ...draft, pillars: draft.pillars.map(({ __key, ...rest }) => rest) };
    const { error } = await supabase
      .from('interview_content')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', load.id);
    if (!mountedRef.current) return;
    setSaving(false);
    setMessage(error ? { kind: 'error', text: 'Couldn’t save — please try again.' } : { kind: 'ok', text: 'Content saved. Clients see it on their next page load.' });
  };

  if (load.loading) return <Loading label="Loading content…" />;
  if (load.error || !draft) {
    return <div style={{ color: '#F2B8B5', fontSize: 14 }}>Couldn’t load the content. Refresh to try again.</div>;
  }

  return (
    <section style={{ marginTop: 40 }}>
      <h2 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 20, margin: '0 0 4px', color: CREAM }}>Interview Code Content</h2>
      <p style={{ color: MUTED, fontSize: 13.5, margin: '0 0 18px' }}>
        Edit the four-pillar content clients see. Changes go live on their next page load.
      </p>

      {message && (
        <div style={{ marginBottom: 16, padding: '9px 12px', borderRadius: 4, fontSize: 13,
          background: message.kind === 'error' ? 'rgba(242,184,181,.12)' : 'rgba(201,162,39,.12)',
          border: `1px solid ${message.kind === 'error' ? 'rgba(242,184,181,.4)' : 'rgba(201,162,39,.4)'}`,
          color: message.kind === 'error' ? '#F2B8B5' : GOLD }}>
          {message.text}
        </div>
      )}

      <div style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 10, padding: '20px 20px', marginBottom: 22 }}>
        <Field label="Tagline" value={draft.tagline} onChange={(v) => setTop('tagline', v)} />
        <Field label="Title" value={draft.title} onChange={(v) => setTop('title', v)} />
        <Field label="Subtitle" value={draft.subtitle} onChange={(v) => setTop('subtitle', v)} />
        <Field label="Intro" value={draft.intro} onChange={(v) => setTop('intro', v)} rows={3} />
        <Field label="Philosophy" value={draft.philosophy} onChange={(v) => setTop('philosophy', v)} rows={3} />
        <Field label="Before you begin" value={draft.before_you_begin} onChange={(v) => setTop('before_you_begin', v)} rows={2} />
        <Field label="The Axis Standard (closer)" value={draft.standard} onChange={(v) => setTop('standard', v)} rows={3} />
      </div>

      {draft.pillars.map((p, i) => (
        <div key={p.__key} style={{ background: 'rgba(201,162,39,.06)', border: '1px solid rgba(201,162,39,.22)', borderRadius: 10, padding: '18px 20px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 16, color: GOLD }}>Pillar {p.number || i + 1}</div>
            <button type="button" onClick={() => removePillar(i)} style={{ ...ghostBtn, color: '#F2B8B5', borderColor: 'rgba(242,184,181,.4)' }}>Remove pillar</button>
          </div>
          <Field label="Number" value={p.number} onChange={(v) => setPillar(i, 'number', v)} />
          <Field label="Title" value={p.title} onChange={(v) => setPillar(i, 'title', v)} />
          <Field label="Subtitle" value={p.subtitle} onChange={(v) => setPillar(i, 'subtitle', v)} rows={2} />
          <Field label="Intro" value={p.intro} onChange={(v) => setPillar(i, 'intro', v)} rows={3} />

          <div style={{ marginBottom: 14 }}>
            <span style={labelStyle}>Your Focus</span>
            {(p.focus || []).map((f, j) => (
              <div key={j} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input type="text" value={f} onChange={(e) => setFocus(i, j, e.target.value)} style={fieldBase} />
                <button type="button" onClick={() => removeFocus(i, j)} aria-label="Remove focus point" style={{ ...ghostBtn, flexShrink: 0, color: '#F2B8B5', borderColor: 'rgba(242,184,181,.4)' }}>×</button>
              </div>
            ))}
            <button type="button" onClick={() => addFocus(i)} style={ghostBtn}>+ Add focus point</button>
          </div>

          <Field label="The Axis Principle" value={p.principle} onChange={(v) => setPillar(i, 'principle', v)} rows={2} />
        </div>
      ))}

      <button type="button" onClick={addPillar} style={{ ...ghostBtn, marginBottom: 22 }}>+ Add pillar</button>

      <div>
        <button type="button" onClick={save} disabled={saving}
          style={{ background: GOLD, color: '#131F38', border: 'none', borderRadius: 3, padding: '11px 22px', fontSize: 14, fontWeight: 700, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Saving…' : 'Save content'}
        </button>
      </div>
    </section>
  );
}
