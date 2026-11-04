import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../supabase';
import { GOLD, GOLD_INK, CREAM, MUTED, SERIF, SURFACE, SURFACE2, BORDER, ON_GOLD, DANGER, DANGER_BORDER, GOLD_SOFT, GOLD_BORDER } from './theme';
import Loading from './Loading';
import Banner from './Banner';
import PageHeader from './PageHeader';

const labelStyle = { display: 'block', fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', color: GOLD_INK, margin: '0 0 6px' };
const fieldBase = { width: '100%', boxSizing: 'border-box', background: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: 6, color: CREAM, fontSize: 14, padding: '10px 12px', fontFamily: 'inherit' };
const ghostBtn = { background: 'transparent', color: CREAM, border: `1px solid ${BORDER}`, borderRadius: 6, padding: '7px 13px', fontSize: 12.5, cursor: 'pointer' };

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
    return <div style={{ color: DANGER, fontSize: 14 }}>Couldn’t load the content. Refresh to try again.</div>;
  }

  return (
    <section>
      <PageHeader eyebrow="Content" title="Interview Code Content">
        Edit the four-pillar content clients see. Changes go live on their next page load.
      </PageHeader>

      <Banner kind={message?.kind} style={{ marginBottom: 16 }}>{message?.text}</Banner>

      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '20px 20px', marginBottom: 22 }}>
        <Field label="Tagline" value={draft.tagline} onChange={(v) => setTop('tagline', v)} />
        <Field label="Title" value={draft.title} onChange={(v) => setTop('title', v)} />
        <Field label="Subtitle" value={draft.subtitle} onChange={(v) => setTop('subtitle', v)} />
        <Field label="Intro" value={draft.intro} onChange={(v) => setTop('intro', v)} rows={3} />
        <Field label="Philosophy" value={draft.philosophy} onChange={(v) => setTop('philosophy', v)} rows={3} />
        <Field label="Before you begin" value={draft.before_you_begin} onChange={(v) => setTop('before_you_begin', v)} rows={2} />
        <Field label="The Axis Standard (closer)" value={draft.standard} onChange={(v) => setTop('standard', v)} rows={3} />
      </div>

      {draft.pillars.map((p, i) => (
        <div key={p.__key} style={{ background: GOLD_SOFT, border: `1px solid ${GOLD_BORDER}`, borderRadius: 12, padding: '18px 20px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 16, color: GOLD_INK }}>Pillar {p.number || i + 1}</div>
            <button type="button" onClick={() => removePillar(i)} style={{ ...ghostBtn, color: DANGER, borderColor: DANGER_BORDER }}>Remove pillar</button>
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
                <button type="button" onClick={() => removeFocus(i, j)} aria-label="Remove focus point" style={{ ...ghostBtn, flexShrink: 0, color: DANGER, borderColor: DANGER_BORDER }}>×</button>
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
          style={{ background: GOLD, color: ON_GOLD, border: 'none', borderRadius: 7, padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Saving…' : 'Save content'}
        </button>
      </div>
    </section>
  );
}
