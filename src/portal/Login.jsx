import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { isConfigured } from '../supabase';
import Loading from './Loading';
import AuthCard, { fieldStyle, labelStyle, primaryBtnStyle } from './AuthCard';
import { DANGER, GOLD_INK, MUTED } from './theme';

// Email + password sign-in. On success the auth listener sets the session and
// the <Navigate> below redirects to /portal, where RoleLanding routes by role.
export default function Login() {
  const { session, loading, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

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
      <form onSubmit={onSubmit}>
        <label style={labelStyle}>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" style={fieldStyle} />
        </label>
        <label style={{ ...labelStyle, marginTop: 16 }}>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" style={fieldStyle} />
        </label>

        {error && <div style={{ marginTop: 16, color: DANGER, fontSize: 13 }}>{error}</div>}

        <button type="submit" disabled={disabled} style={primaryBtnStyle(disabled)}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>

        <div style={{ marginTop: 18, fontSize: 13.5, color: MUTED, textAlign: 'center' }}>
          Need an account? <Link to="/portal/signup" style={{ color: GOLD_INK, fontWeight: 600 }}>Sign up</Link>
        </div>
      </form>
    </AuthCard>
  );
}
