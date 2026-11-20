import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { isConfigured } from '../supabase';
import Loading from './Loading';
import AuthCard, { fieldStyle, labelStyle, primaryBtnStyle } from './AuthCard';
import Modal from './Modal';
import SignupForm from './SignupForm';
import PasswordInput from './PasswordInput';
import GoogleButton from './GoogleButton';
import { INTERVIEW_PRICE } from '../payments.js';
import { DANGER, GOLD_INK, MUTED, CREAM, GOLD_SOFT, GOLD_BORDER } from './theme';

// Email + password sign-in. On success the auth listener sets the session and
// the <Navigate> below redirects to /portal, where RoleLanding routes by role.
export default function Login() {
  const { session, loading, signIn } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  // Opens automatically when arriving from the /portal/signup redirect.
  const [showSignup, setShowSignup] = useState(Boolean(location.state?.signup));
  // WHY the modal was opened, captured once at mount — not read from the router
  // on every render. Router state sticks to the history entry (it even survives
  // a reload), so deriving this live meant that after arriving from a "buy" CTA,
  // every later click of the plain "Sign up" button still showed the purchase
  // panel. Clicking Sign up is its own intent and clears the reason.
  const [signupReason, setSignupReason] = useState(
    location.state?.signup ? (location.state?.buy ?? null) : null
  );
  const buying = signupReason === 'interview-code';

  const openSignup = () => { setSignupReason(null); setShowSignup(true); };

  if (loading) return <Loading />;
  // Always land at /portal and let RoleLanding pick the dashboard by the current
  // user's role. We deliberately ignore any saved `from` path: after a client
  // signs out from /portal/client and an admin signs in, honouring `from` would
  // strand the admin on the client screen (AXIS-20).
  if (session) return <Navigate to="/portal" replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    const { error: signInError } = await signIn(email.trim(), password);
    if (signInError) { setError(signInError.message); setBusy(false); }
    // On success the auth listener sets the session and the <Navigate> above redirects.
  };

  const disabled = busy || !isConfigured;

  return (
    <AuthCard eyebrow="Portal Sign In" showConfigWarning>
      {/* AXIS-43: above the form, because someone who uses Google should not
          have to read past a password field to find it. */}
      <GoogleButton onError={setError} />
      <form onSubmit={onSubmit}>
        <label style={labelStyle}>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" style={fieldStyle} />
        </label>
        <label style={{ ...labelStyle, marginTop: 16 }}>
          Password
          <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
        </label>

        {error && <div style={{ marginTop: 16, color: DANGER, fontSize: 13 }}>{error}</div>}

        <button type="submit" disabled={disabled} style={primaryBtnStyle(disabled)}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>

        <div style={{ marginTop: 18, fontSize: 13.5, color: MUTED, textAlign: 'center' }}>
          Need an account?{' '}
          <button type="button" onClick={openSignup} style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', color: GOLD_INK, fontWeight: 600, cursor: 'pointer' }}>
            Sign up
          </button>
        </div>
      </form>

      {showSignup && (
        <Modal onClose={() => setShowSignup(false)} label="Create your account">
          {/* Arrived from the Interview Code "Get Access" button: they are trying
              to BUY, not to sign in. This sits INSIDE the modal because the modal
              auto-opens over the login card — anything behind it is unseen. */}
          {buying && (
            <div style={{ marginBottom: 18, padding: '13px 15px', borderRadius: 9, background: GOLD_SOFT, border: `1px solid ${GOLD_BORDER}` }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: CREAM, marginBottom: 5 }}>
                Create your profile to buy the Interview Code
              </div>
              <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.6 }}>
                Your profile is where we switch on your 30 days, so you need one before you pay.
                It takes a minute, then you can buy for {INTERVIEW_PRICE} straight from the portal.
                Already registered? Close this to sign in.
              </div>
            </div>
          )}
          <SignupForm onDone={() => setShowSignup(false)} />
        </Modal>
      )}
    </AuthCard>
  );
}
