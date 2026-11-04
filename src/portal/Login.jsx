import { useState } from 'react';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { isConfigured } from '../supabase';
import Loading from './Loading';
import AuthCard, { fieldStyle, labelStyle, primaryBtnStyle } from './AuthCard';

// Email + password sign-in. On success the auth listener sets the session and
// the <Navigate> below redirects by role.
export default function Login() {
  const { session, loading, signIn } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (loading) return <Loading />;
  if (session) return <Navigate to={location.state?.from?.pathname || '/portal'} replace />;

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

        {error && <div style={{ marginTop: 16, color: '#F2B8B5', fontSize: 13 }}>{error}</div>}

        <button type="submit" disabled={disabled} style={primaryBtnStyle(disabled)}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>

        <div style={{ marginTop: 18, fontSize: 13.5, color: '#B9C0D2', textAlign: 'center' }}>
          Need an account? <Link to="/portal/signup" style={{ color: '#C9A227' }}>Sign up</Link>
        </div>
      </form>
    </AuthCard>
  );
}
