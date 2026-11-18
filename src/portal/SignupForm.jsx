import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { isConfigured } from '../supabase';
import { fieldStyle, labelStyle, primaryBtnStyle } from './AuthCard';
import PasswordInput from './PasswordInput';
import GoogleButton from './GoogleButton';
import ProfileStepFields, { PROFILE_STEPS, emptyProfileValues, profilePayload } from './ProfileStepFields';
import { DANGER, GOLD_INK, CREAM, MUTED, SERIF, BORDER, DANGER_SOFT, DANGER_BORDER } from './theme';

// AXIS-42 added step 4. Skills and education are heavy fields, so they sit on
// their own optional step at the end rather than lengthening "Your goals" —
// and nothing on step 4 is required, so a client in a hurry just presses
// Create account and fills them in later from the profile editor.
//
// AXIS-43: steps 2-4 are no longer written out here. They come from
// ProfileStepFields, which the completion gate also uses, so the two can never
// ask different questions. Step 1 stays local: it is the only part a Google
// user never sees.
const ACCOUNT_STEP = { label: 'Your account', fun: 'First things first — let’s set up your login. 👋' };
const STEPS = [ACCOUNT_STEP, ...PROFILE_STEPS];
const LAST_STEP = STEPS.length;

const funStyle = { color: MUTED, fontSize: 13.5, lineHeight: 1.5, margin: '0 0 18px' };
const secondaryBtn = {
  padding: '13px 18px', borderRadius: 8, border: `1px solid ${BORDER}`,
  background: 'transparent', color: CREAM, fontWeight: 600, fontSize: 15, cursor: 'pointer',
};

// The create-account fields (AXIS-21), as a 4-step wizard inside the signup
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
  const [values, setValues] = useState(emptyProfileValues);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [awaitConfirm, setAwaitConfirm] = useState(false);

  const set = (key, value) => setValues((v) => ({ ...v, [key]: value }));

  const doSignup = async () => {
    setError('');
    setBusy(true);
    // The same payload shape the completion gate writes, built by the same
    // function — blank strings become null, empty lists become null (AXIS-42).
    const { data, error: signUpError } = await signUp(email.trim(), password, fullName.trim(), profilePayload(values));
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

      {/* AXIS-43: only on step 1. Past that the client is part-way through the
          wizard, and offering Google there would throw away what they typed. */}
      {step === 1 && <GoogleButton label="Sign up with Google" onError={setError} />}

      <div className="ax-steps">
        <div className="ax-steps-track">
          <div className="ax-steps-fill" style={{ width: `${(step / LAST_STEP) * 100}%` }} />
        </div>
        <div className="ax-steps-label">Step {step} of {LAST_STEP} · {STEPS[step - 1].label}</div>
      </div>
      <p style={funStyle}>{STEPS[step - 1].fun}</p>

      <form onSubmit={onSubmit}>
        {step === 1 ? (
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
        ) : (
          <ProfileStepFields stepKey={PROFILE_STEPS[step - 2].key} values={values} set={set} />
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
