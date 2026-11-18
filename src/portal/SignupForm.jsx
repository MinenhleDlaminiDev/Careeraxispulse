import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { isConfigured } from '../supabase';
import { fieldStyle, labelStyle, primaryBtnStyle } from './AuthCard';
import PasswordInput from './PasswordInput';
import { SENIORITY, EMPLOYMENT, INDUSTRIES, SKILLS, clean, cleanList, cleanEducation } from './profileFields';
import MultiSelect from './MultiSelect';
import EducationFields from './EducationFields';
import { DANGER, GOLD_INK, CREAM, MUTED, SERIF, BORDER, DANGER_SOFT, DANGER_BORDER } from './theme';

// AXIS-42 added step 4. Skills and education are heavy fields, so they sit on
// their own optional step at the end rather than lengthening "Your goals" —
// and nothing on step 4 is required, so a client in a hurry just presses
// Create account and fills them in later from the profile editor.
const STEPS = [
  { label: 'Your account', fun: 'First things first — let’s set up your login. 👋' },
  { label: 'About you', fun: 'Nice to meet you. So, how do we reach you?' },
  { label: 'Your goals', fun: 'Almost there — tell us where you’re headed. 🎯' },
  { label: 'Skills & education', fun: 'Last step, and it’s optional. Add what you can now, or fill it in later from your profile.' },
];
const LAST_STEP = STEPS.length;

const optionalHint = { color: MUTED, fontWeight: 400, textTransform: 'none', letterSpacing: 0 };
const funStyle = { color: MUTED, fontSize: 13.5, lineHeight: 1.5, margin: '0 0 18px' };
const secondaryBtn = {
  padding: '13px 18px', borderRadius: 8, border: `1px solid ${BORDER}`,
  background: 'transparent', color: CREAM, fontWeight: 600, fontSize: 15, cursor: 'pointer',
};

// The create-account fields (AXIS-21), as a 3-step wizard inside the signup
// modal (AXIS-22). Only the current step is rendered, so the browser validates
// just that step's required fields on "Continue"; values persist in state across
// steps. On success the auth listener sets the session and the host screen
// (Login) redirects by role — this component doesn't navigate.
export default function SignupForm({ onDone }) {
  const { signUp } = useAuth();
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [targetIndustry, setTargetIndustry] = useState('');
  const [seniority, setSeniority] = useState('');
  const [targetCompanies, setTargetCompanies] = useState('');
  const [employmentStatus, setEmploymentStatus] = useState('');
  const [changeDriver, setChangeDriver] = useState('');
  const [skills, setSkills] = useState([]);
  const [education, setEducation] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [awaitConfirm, setAwaitConfirm] = useState(false);

  const doSignup = async () => {
    setError('');
    setBusy(true);
    const profile = {
      phone: clean(phone),
      location: clean(location),
      linkedin_url: clean(linkedin),
      target_role: clean(targetRole),
      target_industry: clean(targetIndustry),
      seniority_level: clean(seniority),
      target_companies: clean(targetCompanies),
      employment_status: clean(employmentStatus),
      change_driver: clean(changeDriver),
      // Arrays, not strings — the signup trigger reads these with `->` and
      // stores them as jsonb (AXIS-42). Empty becomes null, never [].
      skills: cleanList(skills),
      education: cleanEducation(education),
    };
    const { data, error: signUpError } = await signUp(email.trim(), password, fullName.trim(), profile);
    if (signUpError) { setError(signUpError.message); setBusy(false); return; }
    // No session = email confirmation is on; show the confirm message. With a
    // session, the host screen's own session check redirects by role.
    if (!data?.session) { setAwaitConfirm(true); setBusy(false); }
  };

  // The current step's fields are the only ones in the DOM, so the browser's
  // own required-field validation runs on submit before this fires.
  const onSubmit = (e) => {
    e.preventDefault();
    if (step < LAST_STEP) { setError(''); setStep(step + 1); return; }
    doSignup();
  };

  const disabled = busy || !isConfigured;

  const header = (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 19, color: CREAM, lineHeight: 1.15 }}>Create your account</div>
      <div style={{ letterSpacing: '.16em', textTransform: 'uppercase', fontSize: 10, color: GOLD_INK, marginTop: 3 }}>CareerPulse Axis Portal</div>
    </div>
  );

  if (awaitConfirm) {
    return (
      <>
        {header}
        <div style={{ color: MUTED, fontSize: 14.5, lineHeight: 1.6 }}>
          Almost there — we’ve sent a confirmation link to <strong style={{ color: CREAM }}>{email.trim()}</strong>.
          Confirm your email, then <Link to="/portal/login" onClick={onDone} style={{ color: GOLD_INK, fontWeight: 600 }}>sign in</Link>.
        </div>
      </>
    );
  }

  return (
    <>
      {header}
      {!isConfigured && (
        <div style={{ marginBottom: 18, padding: '10px 12px', borderRadius: 6, background: DANGER_SOFT, border: `1px solid ${DANGER_BORDER}`, color: DANGER, fontSize: 13, lineHeight: 1.5 }}>
          Portal not configured — add your Supabase URL and key to <code>.env</code>.
        </div>
      )}

      <div className="ax-steps">
        <div className="ax-steps-track">
          <div className="ax-steps-fill" style={{ width: `${(step / LAST_STEP) * 100}%` }} />
        </div>
        <div className="ax-steps-label">Step {step} of {LAST_STEP} · {STEPS[step - 1].label}</div>
      </div>
      <p style={funStyle}>{STEPS[step - 1].fun}</p>

      <form onSubmit={onSubmit}>
        {step === 1 && (
          <>
            <label style={labelStyle}>
              Full name
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required autoComplete="name" style={fieldStyle} />
            </label>
            <label style={{ ...labelStyle, marginTop: 16 }}>
              Email
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" style={fieldStyle} />
            </label>
            <label style={{ ...labelStyle, marginTop: 16 }}>
              Password
              <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete="new-password" />
            </label>
          </>
        )}

        {step === 2 && (
          <>
            <label style={labelStyle}>
              Phone / WhatsApp
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required autoComplete="tel" style={fieldStyle} />
            </label>
            <label style={{ ...labelStyle, marginTop: 16 }}>
              Location (city, province)
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} required style={fieldStyle} />
            </label>
            <label style={{ ...labelStyle, marginTop: 16 }}>
              LinkedIn profile <span style={optionalHint}>(optional)</span>
              <input type="url" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/…" style={fieldStyle} />
            </label>
            <label style={{ ...labelStyle, marginTop: 16 }}>
              Employment status
              <select value={employmentStatus} onChange={(e) => setEmploymentStatus(e.target.value)} required style={fieldStyle}>
                <option value="">Select…</option>
                {EMPLOYMENT.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
          </>
        )}

        {step === 3 && (
          <>
            <label style={labelStyle}>
              Target role / position
              <input type="text" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} required style={fieldStyle} />
            </label>
            <label style={{ ...labelStyle, marginTop: 16 }}>
              Target industry / sector
              <select value={targetIndustry} onChange={(e) => setTargetIndustry(e.target.value)} required style={fieldStyle}>
                <option value="">Select…</option>
                {INDUSTRIES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label style={{ ...labelStyle, marginTop: 16 }}>
              Seniority level
              <select value={seniority} onChange={(e) => setSeniority(e.target.value)} required style={fieldStyle}>
                <option value="">Select…</option>
                {SENIORITY.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label style={{ ...labelStyle, marginTop: 16 }}>
              Companies you’re targeting <span style={optionalHint}>(optional)</span>
              <input type="text" value={targetCompanies} onChange={(e) => setTargetCompanies(e.target.value)} placeholder="Separate with commas" style={fieldStyle} />
            </label>
            <label style={{ ...labelStyle, marginTop: 16 }}>
              What’s driving the change? <span style={optionalHint}>(optional)</span>
              <textarea value={changeDriver} onChange={(e) => setChangeDriver(e.target.value)} rows={3} placeholder="New field, redundancy, growth…" style={{ ...fieldStyle, resize: 'vertical' }} />
            </label>
          </>
        )}

        {step === 4 && (
          <>
            <div style={labelStyle}>
              Skills &amp; competencies <span style={optionalHint}>(optional)</span>
            </div>
            <MultiSelect value={skills} onChange={setSkills} options={SKILLS} placeholder="Search skills, or type your own…" />

            <div style={{ ...labelStyle, marginTop: 22 }}>
              Education &amp; qualifications <span style={optionalHint}>(optional)</span>
            </div>
            <EducationFields value={education} onChange={setEducation} />
          </>
        )}

        {error && <div style={{ marginTop: 16, color: DANGER, fontSize: 13 }}>{error}</div>}

        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          {step > 1 && (
            <button type="button" onClick={() => { setError(''); setStep(step - 1); }} style={secondaryBtn}>
              Back
            </button>
          )}
          <button type="submit" disabled={disabled} style={{ ...primaryBtnStyle(disabled), marginTop: 0, flex: 1 }}>
            {busy ? 'Creating account…' : step < LAST_STEP ? 'Continue' : 'Create account'}
          </button>
        </div>
      </form>
    </>
  );
}
