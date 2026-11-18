import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { supabase } from '../supabase';
import PageHeader from './PageHeader';
import { fieldStyle, labelStyle } from './AuthCard';
import { SENIORITY, EMPLOYMENT, INDUSTRIES, SKILLS, clean, cleanList, cleanEducation, asList, stableJson } from './profileFields';
import MultiSelect from './MultiSelect';
import EducationFields from './EducationFields';
import { GOLD, GOLD_INK, CREAM, MUTED, ON_GOLD, BORDER, DANGER } from './theme';

// Client self-service profile editor (AXIS-36, replacing the single long modal
// from AXIS-30). It is a PAGE, not a dialog: on a phone the old modal was a
// 1043px card inside an 812px viewport — a scroll inside a scroll, with one
// Save at the very bottom and validation errors far off screen.
//
// Each section owns its own draft, dirty state and Save, so a save is small and
// the result lands next to the fields it belongs to. role, email, id and access
// are NOT editable here and cannot be: the profiles guard trigger (AXIS-28)
// rejects any such change from a signed-in non-admin.

// One place describing every field. AXIS-42 turned target_industry into a
// select and added the two list fields — a change to this table, not the form.
//
// `list: true` marks a field whose value is an array, not a string. Those are
// compared and cleaned differently (see ProfileSection), because '' and []
// are not interchangeable and === does not compare arrays.
const FIELDS = {
  full_name: { label: 'Full name', type: 'text', required: true, autoComplete: 'name' },
  phone: { label: 'Phone / WhatsApp', type: 'tel', required: true, autoComplete: 'tel' },
  location: { label: 'Location (city, province)', type: 'text', required: true },
  linkedin_url: { label: 'LinkedIn profile', type: 'url', placeholder: 'https://linkedin.com/in/…' },
  employment_status: { label: 'Employment status', type: 'select', options: EMPLOYMENT, required: true },
  target_role: { label: 'Target role / position', type: 'text', required: true },
  target_industry: { label: 'Target industry / sector', type: 'select', options: INDUSTRIES, required: true },
  seniority_level: { label: 'Seniority level', type: 'select', options: SENIORITY, required: true },
  target_companies: { label: 'Companies you’re targeting', type: 'text', placeholder: 'Separate with commas' },
  change_driver: { label: 'What’s driving the change?', type: 'textarea', rows: 3, placeholder: 'New field, redundancy, growth…' },
  skills: { label: 'Skills & competencies', type: 'skills', list: true },
  education: { label: 'Education & qualifications', type: 'education', list: true },
};

const SECTIONS = [
  {
    key: 'about',
    title: 'About you',
    blurb: 'How we reach you and where you are based.',
    fields: ['full_name', 'phone', 'location', 'linkedin_url', 'employment_status'],
  },
  {
    key: 'goals',
    title: 'Your goals',
    blurb: 'What you are aiming for, so we can prepare against the right roles.',
    fields: ['target_role', 'target_industry', 'seniority_level', 'target_companies', 'change_driver'],
  },
  {
    key: 'background',
    title: 'Skills & education',
    blurb: 'What you can do and what you have studied. This is what a CV is built from.',
    fields: ['skills', 'education'],
  },
];

const optionalHint = { color: MUTED, fontWeight: 400, textTransform: 'none', letterSpacing: 0 };

export default function ProfilePage() {
  const { profile } = useAuth();

  return (
    <div>
      <PageHeader eyebrow="Your profile" title="Edit your profile">
        Keep this current — it is what we work from when we prepare your CV and your interview practice.
      </PageHeader>

      <div style={{ marginBottom: 18 }}>
        <Link to="/portal/client/overview" className="ax-backlink" style={{ fontSize: 13.5, color: GOLD_INK, fontWeight: 600 }}>← Back to overview</Link>
      </div>

      {/* Email and name are shown for context; email can't be changed here. */}
      <section className="ax-card" style={{ padding: '14px 18px', marginBottom: 18 }}>
        <div style={{ fontSize: 12.5, color: MUTED }}>Signed in as</div>
        <div style={{ fontSize: 14.5, color: CREAM, overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile?.email}</div>
      </section>

      {SECTIONS.map((s) => <ProfileSection key={s.key} section={s} />)}
    </div>
  );
}

function ProfileSection({ section }) {
  const { user, profile, refreshProfile } = useAuth();

  // The saved values this section is responsible for, straight off the profile.
  // A list field starts as an array even when the column is null, so the
  // editors never have to deal with a missing value.
  const saved = {};
  section.fields.forEach((k) => {
    saved[k] = FIELDS[k].list ? asList(profile?.[k]) : (profile?.[k] || '');
  });

  const [draft, setDraft] = useState(saved);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [savedAt, setSavedAt] = useState(null);

  // Lists are compared by their JSON: two arrays are never === each other, so
  // the plain comparison would leave Save enabled for ever. stableJson sorts
  // object keys, because jsonb comes back from Postgres in its own key order.
  const dirty = section.fields.some((k) => (FIELDS[k].list
    ? stableJson(draft[k] ?? []) !== stableJson(saved[k] ?? [])
    : (draft[k] || '') !== (saved[k] || '')));

  const set = (k) => (e) => {
    setDraft((d) => ({ ...d, [k]: e.target.value }));
    setSavedAt(null);
  };

  // List editors hand back the whole new array, not a DOM event.
  const setList = (k) => (next) => {
    setDraft((d) => ({ ...d, [k]: next }));
    setSavedAt(null);
  };

  const reset = () => { setDraft(saved); setError(''); setSavedAt(null); };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!supabase || !user || !dirty) return;
    setError('');
    setBusy(true);
    // Only this section's columns are sent, so one section can never overwrite
    // what another section is holding in its own draft.
    const payload = {};
    section.fields.forEach((k) => {
      if (k === 'education') payload[k] = cleanEducation(draft[k]);
      else if (FIELDS[k].list) payload[k] = cleanList(draft[k]);
      else payload[k] = clean(draft[k]);
    });
    const { error: updErr } = await supabase.from('profiles').update(payload).eq('id', user.id);
    setBusy(false);
    if (updErr) { setError('Couldn’t save this section. Please try again.'); return; }
    setSavedAt(new Date());
    refreshProfile();
  };

  return (
    <section className="ax-card" style={{ padding: '20px 20px 18px', marginBottom: 18 }}>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ fontSize: 16.5, fontWeight: 700, color: CREAM, margin: '0 0 4px' }}>{section.title}</h2>
        <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.55 }}>{section.blurb}</div>
      </div>

      {/* Capped so fields stay a comfortable width on desktop — a full-width
          900px box for a phone number looks broken. */}
      <form onSubmit={onSubmit} style={{ maxWidth: 560 }}>
        {section.fields.map((k, i) => (
          <Field
            key={k}
            name={k}
            value={draft[k]}
            onChange={FIELDS[k].list ? setList(k) : set(k)}
            first={i === 0}
          />
        ))}

        {error && (
          <div style={{ marginTop: 14, color: DANGER, fontSize: 13 }}>{error}</div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
          <button type="submit" disabled={!dirty || busy}
            style={{
              padding: '11px 20px', borderRadius: 8, border: 'none', background: GOLD, color: ON_GOLD,
              fontWeight: 700, fontSize: 14.5, cursor: (!dirty || busy) ? 'default' : 'pointer',
              opacity: (!dirty || busy) ? 0.5 : 1,
            }}>
            {busy ? 'Saving…' : 'Save'}
          </button>
          {dirty && !busy && (
            <button type="button" onClick={reset}
              style={{ padding: '11px 16px', borderRadius: 8, border: `1px solid ${BORDER}`, background: 'transparent', color: CREAM, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
              Discard
            </button>
          )}
          <span style={{ fontSize: 12.5, color: dirty ? GOLD_INK : MUTED }}>
            {busy ? '' : dirty ? 'Unsaved changes' : savedAt ? `✓ Saved · ${savedAt.toLocaleTimeString()}` : ''}
          </span>
        </div>
      </form>
    </section>
  );
}

function Field({ name, value, onChange, first }) {
  const f = FIELDS[name];
  const style = { ...labelStyle, marginTop: first ? 0 : 16 };
  const label = (
    <>
      {f.label}{!f.required && <> <span style={optionalHint}>(optional)</span></>}
    </>
  );

  // The two list editors are not <label>-wrapped: each renders several controls
  // of its own, and a label pointing at a group of inputs means nothing.
  if (f.type === 'skills') {
    return (
      <div style={{ marginTop: first ? 0 : 20 }}>
        <div style={labelStyle}>{label}</div>
        <MultiSelect value={value} onChange={onChange} options={SKILLS} placeholder="Search skills, or type your own…" />
      </div>
    );
  }

  if (f.type === 'education') {
    return (
      <div style={{ marginTop: first ? 0 : 22 }}>
        <div style={labelStyle}>{label}</div>
        <EducationFields value={value} onChange={onChange} />
      </div>
    );
  }

  if (f.type === 'select') {
    // AXIS-42: target_industry used to be free text, so a client saved before
    // this change can hold something that is not in INDUSTRIES ("Technology",
    // say). Without this the select would render blank and their answer would
    // silently disappear from the page. Carry the saved value as an extra
    // option so they see it and can keep it or pick from the list.
    const options = value && !f.options.includes(value) ? [value, ...f.options] : f.options;
    return (
      <label style={style}>
        {label}
        <select value={value} onChange={onChange} required={f.required} style={fieldStyle}>
          <option value="">Select…</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </label>
    );
  }

  if (f.type === 'textarea') {
    return (
      <label style={style}>
        {label}
        <textarea value={value} onChange={onChange} rows={f.rows || 3} placeholder={f.placeholder}
          style={{ ...fieldStyle, resize: 'vertical' }} />
      </label>
    );
  }

  return (
    <label style={style}>
      {label}
      <input type={f.type} value={value} onChange={onChange} required={f.required}
        autoComplete={f.autoComplete} placeholder={f.placeholder} style={fieldStyle} />
    </label>
  );
}
