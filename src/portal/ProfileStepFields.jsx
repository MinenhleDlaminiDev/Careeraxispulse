import { fieldStyle, labelStyle } from './AuthCard';
import MultiSelect from './MultiSelect';
import EducationFields from './EducationFields';
import {
  SENIORITY, EMPLOYMENT, INDUSTRIES, SKILLS,
  clean, cleanList, cleanEducation, asList,
} from './profileFields';
import { MUTED } from './theme';

// AXIS-43: the profile half of the signup wizard, lifted out of SignupForm so
// the completion gate (CompleteProfile) can ask the SAME questions with the
// SAME validation instead of a second copy that drifts.
//
// Only steps 2-4 live here. Step 1 (name, email, password) stays in SignupForm,
// because a client who signed in with Google already has all three and must
// never be asked to invent a password.
//
// Validation is the browser's own: each step renders alone, so `required` is
// checked on the step's own submit. That is how the wizard already worked —
// keeping it means the gate cannot accept something signup would have refused.

const optionalHint = { color: MUTED, fontWeight: 400, textTransform: 'none', letterSpacing: 0 };

export const PROFILE_STEPS = [
  { key: 'about', label: 'About you', fun: 'Nice to meet you. So, how do we reach you?' },
  { key: 'goals', label: 'Your goals', fun: 'Almost there — tell us where you’re headed. 🎯' },
  {
    key: 'extras',
    label: 'Skills & education',
    fun: 'Last step, and it’s optional. Add what you can now, or fill it in later from your profile.',
  },
];

// A blank set of values for a fresh signup.
export const emptyProfileValues = () => ({
  phone: '', location: '', linkedin_url: '', employment_status: '',
  target_role: '', target_industry: '', seniority_level: '',
  target_companies: '', change_driver: '',
  skills: [], education: [],
});

// Prefill from an existing profile row — what the completion gate needs, since
// a Google user may already have a name, and an older client may have some
// fields filled and others not. Null columns become '' (or []) so the inputs
// stay controlled.
export const profileValuesFrom = (profile) => ({
  ...emptyProfileValues(),
  phone: profile?.phone || '',
  location: profile?.location || '',
  linkedin_url: profile?.linkedin_url || '',
  employment_status: profile?.employment_status || '',
  target_role: profile?.target_role || '',
  target_industry: profile?.target_industry || '',
  seniority_level: profile?.seniority_level || '',
  target_companies: profile?.target_companies || '',
  change_driver: profile?.change_driver || '',
  skills: asList(profile?.skills),
  education: asList(profile?.education),
});

// Values -> the shape both signup metadata and a profiles update expect.
// Blank strings become null, empty lists become null (AXIS-42), never '' or [].
export const profilePayload = (v) => ({
  phone: clean(v.phone),
  location: clean(v.location),
  linkedin_url: clean(v.linkedin_url),
  employment_status: clean(v.employment_status),
  target_role: clean(v.target_role),
  target_industry: clean(v.target_industry),
  seniority_level: clean(v.seniority_level),
  target_companies: clean(v.target_companies),
  change_driver: clean(v.change_driver),
  skills: cleanList(v.skills),
  education: cleanEducation(v.education),
});

// A saved industry that is not in the current INDUSTRIES list would render as a
// blank select and silently vanish on the next save. Carry it as an extra
// option instead — the same guard ProfilePage uses for legacy free-text values.
const withCurrent = (options, value) => (value && !options.includes(value) ? [value, ...options] : options);

// One step's fields. `set(key, value)` updates a single field.
export default function ProfileStepFields({ stepKey, values: v, set }) {
  if (stepKey === 'about') {
    return (
      <>
        <label style={labelStyle}>
          Phone / WhatsApp
          <input type="tel" value={v.phone} onChange={(e) => set('phone', e.target.value)} required autoComplete="tel" style={fieldStyle} />
        </label>
        <label style={{ ...labelStyle, marginTop: 16 }}>
          Location (city, province)
          <input type="text" value={v.location} onChange={(e) => set('location', e.target.value)} required style={fieldStyle} />
        </label>
        <label style={{ ...labelStyle, marginTop: 16 }}>
          LinkedIn profile <span style={optionalHint}>(optional)</span>
          <input type="url" value={v.linkedin_url} onChange={(e) => set('linkedin_url', e.target.value)} placeholder="https://linkedin.com/in/…" style={fieldStyle} />
        </label>
        <label style={{ ...labelStyle, marginTop: 16 }}>
          Employment status
          <select value={v.employment_status} onChange={(e) => set('employment_status', e.target.value)} required style={fieldStyle}>
            <option value="">Select…</option>
            {withCurrent(EMPLOYMENT, v.employment_status).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
      </>
    );
  }

  if (stepKey === 'goals') {
    return (
      <>
        <label style={labelStyle}>
          Target role / position
          <input type="text" value={v.target_role} onChange={(e) => set('target_role', e.target.value)} required style={fieldStyle} />
        </label>
        <label style={{ ...labelStyle, marginTop: 16 }}>
          Target industry / sector
          <select value={v.target_industry} onChange={(e) => set('target_industry', e.target.value)} required style={fieldStyle}>
            <option value="">Select…</option>
            {withCurrent(INDUSTRIES, v.target_industry).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label style={{ ...labelStyle, marginTop: 16 }}>
          Seniority level
          <select value={v.seniority_level} onChange={(e) => set('seniority_level', e.target.value)} required style={fieldStyle}>
            <option value="">Select…</option>
            {withCurrent(SENIORITY, v.seniority_level).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label style={{ ...labelStyle, marginTop: 16 }}>
          Companies you’re targeting <span style={optionalHint}>(optional)</span>
          <input type="text" value={v.target_companies} onChange={(e) => set('target_companies', e.target.value)} placeholder="Separate with commas" style={fieldStyle} />
        </label>
        <label style={{ ...labelStyle, marginTop: 16 }}>
          What’s driving the change? <span style={optionalHint}>(optional)</span>
          <textarea value={v.change_driver} onChange={(e) => set('change_driver', e.target.value)} rows={3} placeholder="New field, redundancy, growth…" style={{ ...fieldStyle, resize: 'vertical' }} />
        </label>
      </>
    );
  }

  return (
    <>
      <div style={labelStyle}>
        Skills &amp; competencies <span style={optionalHint}>(optional)</span>
      </div>
      <MultiSelect value={v.skills} onChange={(next) => set('skills', next)} options={SKILLS} placeholder="Search skills, or type your own…" />

      <div style={{ ...labelStyle, marginTop: 22 }}>
        Education &amp; qualifications <span style={optionalHint}>(optional)</span>
      </div>
      <EducationFields value={v.education} onChange={(next) => set('education', next)} />
    </>
  );
}
