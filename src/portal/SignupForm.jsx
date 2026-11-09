import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { isConfigured } from '../supabase';
import { fieldStyle, labelStyle, primaryBtnStyle } from './AuthCard';
import PasswordInput from './PasswordInput';
import { DANGER, GOLD_INK, CREAM, MUTED, SERIF, DANGER_SOFT, DANGER_BORDER } from './theme';

const SENIORITY = ['Entry level', 'Mid level', 'Senior', 'Management', 'Executive'];
const EMPLOYMENT = ['Employed & looking', 'Unemployed', 'Student', 'Career-changer'];

const sectionStyle = {
  marginTop: 20, marginBottom: 4, fontSize: 11, fontWeight: 700,
  letterSpacing: '0.12em', textTransform: 'uppercase', color: GOLD_INK,
};
const optionalHint = { color: MUTED, fontWeight: 400, textTransform: 'none', letterSpacing: 0 };

// Blank -> null so optional fields don't store empty strings in the profile.
const clean = (v) => {
  const t = v.trim();
  return t === '' ? null : t;
};

// The create-account fields (AXIS-21), extracted so they can live inside the
// signup modal (AXIS-22). On success the auth listener sets the session and the
// host screen (Login) redirects by role — this component doesn't navigate. With
// email confirmation on there's no session, so it shows a "check your email"
// message and calls onDone so the modal can close if the host wants.
export default function SignupForm({ onDone }) {
  const { signUp } = useAuth();
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
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [awaitConfirm, setAwaitConfirm] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
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
    };
    const { data, error: signUpError } = await signUp(email.trim(), password, fullName.trim(), profile);
    if (signUpError) { setError(signUpError.message); setBusy(false); return; }
    // No session = email confirmation is on; show the confirm message. With a
    // session, the host screen's own session check redirects by role.
    if (!data?.session) { setAwaitConfirm(true); setBusy(false); }
  };

  const disabled = busy || !isConfigured;

  const header = (
    <div style={{ marginBottom: 18 }}>
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
      <form onSubmit={onSubmit}>
        <div style={{ ...sectionStyle, marginTop: 0 }}>Your account</div>
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

        <div style={sectionStyle}>Contact</div>
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

        <div style={sectionStyle}>Where you’re headed</div>
        <label style={labelStyle}>
          Target role / position
          <input type="text" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} required style={fieldStyle} />
        </label>
        <label style={{ ...labelStyle, marginTop: 16 }}>
          Target industry / sector
          <input type="text" value={targetIndustry} onChange={(e) => setTargetIndustry(e.target.value)} required style={fieldStyle} />
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

        <div style={sectionStyle}>This job search</div>
        <label style={labelStyle}>
          Employment status
          <select value={employmentStatus} onChange={(e) => setEmploymentStatus(e.target.value)} required style={fieldStyle}>
            <option value="">Select…</option>
            {EMPLOYMENT.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label style={{ ...labelStyle, marginTop: 16 }}>
          What’s driving the change? <span style={optionalHint}>(optional)</span>
          <textarea value={changeDriver} onChange={(e) => setChangeDriver(e.target.value)} rows={3} placeholder="New field, redundancy, growth…" style={{ ...fieldStyle, resize: 'vertical' }} />
        </label>

        {error && <div style={{ marginTop: 16, color: DANGER, fontSize: 13 }}>{error}</div>}

        <button type="submit" disabled={disabled} style={primaryBtnStyle(disabled)}>
          {busy ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </>
  );
}
