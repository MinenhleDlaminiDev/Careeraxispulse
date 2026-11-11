import { useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../supabase';
import Modal from './Modal';
import { fieldStyle, labelStyle, primaryBtnStyle } from './AuthCard';
import { SENIORITY, EMPLOYMENT, clean } from './profileFields';
import { DANGER, GOLD_INK, CREAM, MUTED, SERIF, BORDER } from './theme';

const optionalHint = { color: MUTED, fontWeight: 400, textTransform: 'none', letterSpacing: 0 };
const secondaryBtn = {
  padding: '13px 18px', borderRadius: 8, border: `1px solid ${BORDER}`,
  background: 'transparent', color: CREAM, fontWeight: 600, fontSize: 15, cursor: 'pointer',
};
const groupLabel = { letterSpacing: '.12em', textTransform: 'uppercase', fontSize: 11, color: GOLD_INK, fontWeight: 700, margin: '22px 0 2px' };

// Client self-service profile editor (AXIS-30). Prefilled from the signed-in
// profile; saves the same AXIS-21 fields the signup wizard collects. role, access,
// id and email are NOT here and can't be changed — the profiles guard trigger
// (shipped with AXIS-28) rejects any such change from a signed-in non-admin.
export default function EditProfileForm({ onClose }) {
  const { user, profile, refreshProfile } = useAuth();
  const [form, setForm] = useState(() => ({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    location: profile?.location || '',
    linkedin_url: profile?.linkedin_url || '',
    employment_status: profile?.employment_status || '',
    target_role: profile?.target_role || '',
    target_industry: profile?.target_industry || '',
    seniority_level: profile?.seniority_level || '',
    target_companies: profile?.target_companies || '',
    change_driver: profile?.change_driver || '',
  }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!supabase || !user) return;
    setError('');
    setBusy(true);
    const payload = {
      full_name: clean(form.full_name),
      phone: clean(form.phone),
      location: clean(form.location),
      linkedin_url: clean(form.linkedin_url),
      employment_status: clean(form.employment_status),
      target_role: clean(form.target_role),
      target_industry: clean(form.target_industry),
      seniority_level: clean(form.seniority_level),
      target_companies: clean(form.target_companies),
      change_driver: clean(form.change_driver),
    };
    const { error: updErr } = await supabase.from('profiles').update(payload).eq('id', user.id);
    setBusy(false);
    if (updErr) { setError('Couldn’t save your changes. Please try again.'); return; }
    refreshProfile();
    onClose();
  };

  return (
    <Modal onClose={onClose} label="Edit profile">
      <div style={{ marginBottom: 4 }}>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 19, color: CREAM }}>Edit your profile</div>
        <div style={{ letterSpacing: '.16em', textTransform: 'uppercase', fontSize: 10, color: GOLD_INK, marginTop: 3 }}>CareerPulse Axis Portal</div>
      </div>

      <form onSubmit={onSubmit}>
        <div style={groupLabel}>About you</div>
        <label style={{ ...labelStyle, marginTop: 10 }}>
          Full name
          <input type="text" value={form.full_name} onChange={set('full_name')} required autoComplete="name" style={fieldStyle} />
        </label>
        <label style={{ ...labelStyle, marginTop: 16 }}>
          Phone / WhatsApp
          <input type="tel" value={form.phone} onChange={set('phone')} required autoComplete="tel" style={fieldStyle} />
        </label>
        <label style={{ ...labelStyle, marginTop: 16 }}>
          Location (city, province)
          <input type="text" value={form.location} onChange={set('location')} required style={fieldStyle} />
        </label>
        <label style={{ ...labelStyle, marginTop: 16 }}>
          LinkedIn profile <span style={optionalHint}>(optional)</span>
          <input type="url" value={form.linkedin_url} onChange={set('linkedin_url')} placeholder="https://linkedin.com/in/…" style={fieldStyle} />
        </label>
        <label style={{ ...labelStyle, marginTop: 16 }}>
          Employment status
          <select value={form.employment_status} onChange={set('employment_status')} required style={fieldStyle}>
            <option value="">Select…</option>
            {EMPLOYMENT.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>

        <div style={groupLabel}>Your goals</div>
        <label style={{ ...labelStyle, marginTop: 10 }}>
          Target role / position
          <input type="text" value={form.target_role} onChange={set('target_role')} required style={fieldStyle} />
        </label>
        <label style={{ ...labelStyle, marginTop: 16 }}>
          Target industry / sector
          <input type="text" value={form.target_industry} onChange={set('target_industry')} required style={fieldStyle} />
        </label>
        <label style={{ ...labelStyle, marginTop: 16 }}>
          Seniority level
          <select value={form.seniority_level} onChange={set('seniority_level')} required style={fieldStyle}>
            <option value="">Select…</option>
            {SENIORITY.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label style={{ ...labelStyle, marginTop: 16 }}>
          Companies you’re targeting <span style={optionalHint}>(optional)</span>
          <input type="text" value={form.target_companies} onChange={set('target_companies')} placeholder="Separate with commas" style={fieldStyle} />
        </label>
        <label style={{ ...labelStyle, marginTop: 16 }}>
          What’s driving the change? <span style={optionalHint}>(optional)</span>
          <textarea value={form.change_driver} onChange={set('change_driver')} rows={3} placeholder="New field, redundancy, growth…" style={{ ...fieldStyle, resize: 'vertical' }} />
        </label>

        {error && <div style={{ marginTop: 16, color: DANGER, fontSize: 13 }}>{error}</div>}

        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button type="button" onClick={onClose} style={secondaryBtn}>Cancel</button>
          <button type="submit" disabled={busy} style={{ ...primaryBtnStyle(busy), marginTop: 0, flex: 1 }}>
            {busy ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
