import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../supabase';
import { GOLD, GOLD_INK, CREAM, MUTED, SERIF, SURFACE2, BORDER, ON_GOLD, DANGER, DANGER_BORDER, GOLD_SOFT, GOLD_BORDER } from './theme';
import Loading from './Loading';
import Banner from './Banner';
import PageHeader from './PageHeader';
import { Presentation } from './InterviewAccess';
import { setNavGuard, clearNavGuard } from './navGuard';

const labelStyle = { display: 'block', fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', color: GOLD_INK, margin: '0 0 6px' };
const fieldBase = { width: '100%', boxSizing: 'border-box', background: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: 6, color: CREAM, fontSize: 14, padding: '10px 12px', fontFamily: 'inherit' };
const ghostBtn = { background: 'transparent', color: CREAM, border: `1px solid ${BORDER}`, borderRadius: 6, padding: '7px 13px', fontSize: 12.5, cursor: 'pointer' };
const dangerGhost = { ...ghostBtn, color: DANGER, borderColor: DANGER_BORDER };

// Strip the UI-only __key (module-level so fetch/save/compare all share it).
const stripKeys = (d) => ({ ...d, pillars: (d.pillars || []).map(({ __key, ...rest }) => rest) });
const fmtSaved = (ts) => new Date(ts).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

// A textarea that grows to fit its content, so long copy isn't trapped in a
// tiny scroll box (AXIS-32).
function AutoGrowTextarea({ value, onChange, minRows = 2 }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }, [value]);
  return (
    <textarea ref={ref} rows={minRows} value={value ?? ''} onChange={onChange}
      style={{ ...fieldBase, lineHeight: 1.55, overflow: 'hidden', resize: 'none' }} />
  );
}

function Field({ label, value, onChange, rows, hint }) {
  return (
    <label style={{ display: 'block', marginBottom: 14 }}>
      <span style={labelStyle}>{label}</span>
      {rows
        ? <AutoGrowTextarea value={value} minRows={rows} onChange={(e) => onChange(e.target.value)} />
        : <input type="text" style={fieldBase} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />}
      {hint && <span style={{ display: 'block', fontSize: 11, color: MUTED, marginTop: 5 }}>{(value || '').length} characters</span>}
    </label>
  );
}

// AXIS-10: the admin edits the Interview Code content in-app, replacing the
// manual SQL step. It's a structured form (never raw JSON) so the shape the
// client page renders can't be broken. AXIS-32 adds a sticky action bar, unsaved
// -change tracking + a leave guard, pillar reorder/collapse, discard, and a
// last-saved stamp. Reads/writes the single interview_content row (admin RLS).
export default function ContentEditor() {
  const [load, setLoad] = useState({ loading: true, id: null, error: false });
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [message, setMessage] = useState(null); // save error only
  const [collapsed, setCollapsed] = useState(() => new Set()); // pillar __keys collapsed
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const mountedRef = useRef(true);
  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  // Last-saved snapshot: the raw content (for Discard) + its JSON (for the dirty
  // compare). Refs, so updating them doesn't itself trigger a render.
  const savedContentRef = useRef(null);
  const savedJsonRef = useRef(null);

  // Stable React keys for pillars so reordering/removing doesn't remap data.
  const keySeq = useRef(0);
  const withKey = useCallback((p) => ({ ...p, __key: keySeq.current++ }), []);

  const fetchContent = useCallback(async () => {
    if (!supabase) { setLoad({ loading: false, id: null, error: true }); return; }
    setLoad((s) => ({ ...s, loading: true, error: false }));
    const { data, error } = await supabase.from('interview_content').select('id, content, updated_at').limit(1).maybeSingle();
    if (!mountedRef.current) return;
    if (error || !data) { setLoad({ loading: false, id: null, error: true }); return; }
    const content = data.content || {};
    const pillars = (Array.isArray(content.pillars) ? content.pillars : []).map(withKey);
    const built = { ...content, pillars };
    setDraft(built);
    savedContentRef.current = content;
    savedJsonRef.current = JSON.stringify(stripKeys(built));
    setLastSavedAt(data.updated_at ? new Date(data.updated_at).getTime() : null);
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
  const movePillar = (i, dir) => setDraft((d) => {
    const j = i + dir;
    if (j < 0 || j >= d.pillars.length) return d;
    const arr = [...d.pillars];
    [arr[i], arr[j]] = [arr[j], arr[i]];
    return { ...d, pillars: arr };
  });
  const toggleCollapse = (key) => setCollapsed((prev) => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });

  // Dirty = the draft differs from the last saved snapshot.
  const dirty = draft != null && savedJsonRef.current != null && JSON.stringify(stripKeys(draft)) !== savedJsonRef.current;

  // Warn before a full page unload (reload / tab close) while dirty.
  useEffect(() => {
    if (!dirty) return;
    const h = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);

  // Warn before in-app navigation (sidebar / sign-out) while dirty.
  useEffect(() => {
    const fn = () => (dirty ? 'You have unsaved content changes. Leave and discard them?' : null);
    setNavGuard(fn);
    return () => clearNavGuard(fn);
  }, [dirty]);

  const save = async () => {
    if (!supabase || !load.id || !draft) return;
    setMessage(null);
    setSaving(true);
    const content = stripKeys(draft);
    const { error } = await supabase
      .from('interview_content')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', load.id);
    if (!mountedRef.current) return;
    setSaving(false);
    if (error) { setMessage({ kind: 'error', text: 'Couldn’t save — please try again.' }); return; }
    savedContentRef.current = content;
    savedJsonRef.current = JSON.stringify(content);
    setLastSavedAt(Date.now());
  };

  const discard = () => {
    if (dirty && !window.confirm('Discard unsaved changes and restore the last saved content?')) return;
    const saved = savedContentRef.current || {};
    const pillars = (Array.isArray(saved.pillars) ? saved.pillars : []).map(withKey);
    setDraft({ ...saved, pillars });
    setMessage(null);
  };

  if (load.loading) return <Loading label="Loading content…" />;
  if (load.error || !draft) {
    return <div style={{ color: DANGER, fontSize: 14 }}>Couldn’t load the content. Refresh to try again.</div>;
  }

  const saveBtnStyle = { background: GOLD, color: ON_GOLD, border: 'none', borderRadius: 7, padding: '10px 20px', fontSize: 14, fontWeight: 700, cursor: (!dirty || saving) ? 'default' : 'pointer', opacity: (!dirty || saving) ? 0.55 : 1 };
  const barGhost = { background: 'transparent', color: CREAM, border: `1px solid ${BORDER}`, borderRadius: 7, padding: '10px 16px', fontSize: 13.5, fontWeight: 600, cursor: saving ? 'default' : 'pointer' };

  return (
    <section>
      <PageHeader eyebrow="Content" title="Interview Code Content">
        Edit the four-pillar content clients see. Changes go live on their next page load.
      </PageHeader>

      {/* Sticky action bar: status + Discard / Preview / Save, always reachable. */}
      <div className="ax-editbar">
        <div className="ax-editbar-status">
          {dirty
            ? <span className="ax-dirty"><span className="ax-dirty-dot" />Unsaved changes</span>
            : <span className="ax-saved">✓ All saved{lastSavedAt ? ` · ${fmtSaved(lastSavedAt)}` : ''}</span>}
        </div>
        <div className="ax-editbar-actions">
          <button type="button" onClick={discard} disabled={!dirty || saving}
            style={{ ...barGhost, color: DANGER, borderColor: DANGER_BORDER, opacity: (!dirty || saving) ? 0.5 : 1, cursor: (!dirty || saving) ? 'default' : 'pointer' }}>
            Discard
          </button>
          <button type="button" onClick={() => setPreviewing(true)} disabled={saving} style={barGhost}>⤢ Preview</button>
          <button type="button" onClick={save} disabled={!dirty || saving} style={saveBtnStyle}>
            {saving ? 'Saving…' : 'Save content'}
          </button>
        </div>
      </div>

      {message?.kind === 'error' && <Banner kind="error" style={{ marginBottom: 16 }}>{message.text}</Banner>}

      <div className="ax-card" style={{ padding: '20px 20px', marginBottom: 22 }}>
        <Field label="Tagline" value={draft.tagline} onChange={(v) => setTop('tagline', v)} hint />
        <Field label="Title" value={draft.title} onChange={(v) => setTop('title', v)} hint />
        <Field label="Subtitle" value={draft.subtitle} onChange={(v) => setTop('subtitle', v)} />
        <Field label="Intro" value={draft.intro} onChange={(v) => setTop('intro', v)} rows={3} />
        <Field label="Philosophy" value={draft.philosophy} onChange={(v) => setTop('philosophy', v)} rows={3} />
        <Field label="Before you begin" value={draft.before_you_begin} onChange={(v) => setTop('before_you_begin', v)} rows={2} />
        <Field label="The Axis Standard (closer)" value={draft.standard} onChange={(v) => setTop('standard', v)} rows={3} />
      </div>

      {draft.pillars.map((p, i) => {
        const isCollapsed = collapsed.has(p.__key);
        return (
          <div key={p.__key} style={{ background: GOLD_SOFT, border: `1px solid ${GOLD_BORDER}`, borderRadius: 14, padding: isCollapsed ? '14px 20px' : '18px 20px', marginBottom: 16, boxShadow: 'var(--ax-card-shadow)' }}>
            <div className="ax-pillar-head" style={{ marginBottom: isCollapsed ? 0 : 14 }}>
              <button type="button" className="ax-collapse-btn" onClick={() => toggleCollapse(p.__key)}
                aria-expanded={!isCollapsed} aria-label={isCollapsed ? 'Expand pillar' : 'Collapse pillar'}>
                {isCollapsed ? '▸' : '▾'}
              </button>
              <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 16, color: GOLD_INK, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Pillar {p.number || i + 1}{isCollapsed && (p.title ? ` — ${p.title}` : ' — Untitled')}
              </div>
              <button type="button" onClick={() => movePillar(i, -1)} disabled={i === 0} aria-label="Move pillar up"
                style={{ ...ghostBtn, padding: '6px 10px', opacity: i === 0 ? 0.4 : 1, cursor: i === 0 ? 'default' : 'pointer' }}>↑</button>
              <button type="button" onClick={() => movePillar(i, 1)} disabled={i === draft.pillars.length - 1} aria-label="Move pillar down"
                style={{ ...ghostBtn, padding: '6px 10px', opacity: i === draft.pillars.length - 1 ? 0.4 : 1, cursor: i === draft.pillars.length - 1 ? 'default' : 'pointer' }}>↓</button>
              <button type="button" onClick={() => removePillar(i)} style={dangerGhost}>Remove</button>
            </div>

            {!isCollapsed && (
              <>
                <Field label="Number" value={p.number} onChange={(v) => setPillar(i, 'number', v)} />
                <Field label="Title" value={p.title} onChange={(v) => setPillar(i, 'title', v)} />
                <Field label="Subtitle" value={p.subtitle} onChange={(v) => setPillar(i, 'subtitle', v)} rows={2} />
                <Field label="Intro" value={p.intro} onChange={(v) => setPillar(i, 'intro', v)} rows={3} />

                <div style={{ marginBottom: 14 }}>
                  <span style={labelStyle}>Your Focus</span>
                  {(p.focus || []).map((f, j) => (
                    <div key={j} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <input type="text" value={f} onChange={(e) => setFocus(i, j, e.target.value)} style={fieldBase} />
                      <button type="button" onClick={() => removeFocus(i, j)} aria-label="Remove focus point" style={{ ...dangerGhost, flexShrink: 0 }}>×</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => addFocus(i)} style={ghostBtn}>+ Add focus point</button>
                </div>

                <Field label="The Axis Principle" value={p.principle} onChange={(v) => setPillar(i, 'principle', v)} rows={2} />
              </>
            )}
          </div>
        );
      })}

      <button type="button" onClick={addPillar} style={{ ...ghostBtn, marginBottom: 22 }}>+ Add pillar</button>

      {/* Live preview of the current (unsaved) edits in the real client deck. */}
      {previewing && <Presentation c={stripKeys(draft)} preview onClose={() => setPreviewing(false)} />}
    </section>
  );
}
