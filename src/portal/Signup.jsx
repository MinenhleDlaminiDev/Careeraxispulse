import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { isConfigured } from '../supabase';
import Loading from './Loading';
import AuthCard, { fieldStyle, labelStyle, primaryBtnStyle } from './AuthCard';

// Client registration. The handle_new_user trigger creates the profiles row
// (role 'client', no access) from the metadata here. Handles both email modes:
// confirmation off → the auth listener signs the user in and redirects;
// confirmation on → no session, so show a "check your email" message.
export default function Signup() {
  const { session, loading, signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [awaitConfirm, setAwaitConfirm] = useState(false);

  if (loading) return <Loading />;
  if (session) return <Navigate to="/portal" replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    const { data, error: signUpError } = await signUp(email.trim(), password, fullName.trim());
    if (signUpError) { setError(signUpError.message); setBusy(false); return; }
    // No session means email confirmation is on — the user must confirm first.
    // With a session, the auth listener sets it and the <Navigate> above redirects.
    if (!data?.session) { setAwaitConfirm(true); setBusy(false); }
  };

  const disabled = busy || !isConfigured;

  return (
    <AuthCard eyebrow="Create Account" showConfigWarning={!awaitConfirm}>
      {awaitConfirm ? (
        <div style={{ color: '#B9C0D2', fontSize: 14.5, lineHeight: 1.6 }}>
          Almost there — we’ve sent a confirmation link to <strong style={{ color: '#F4EFE4' }}>{email.trim()}</strong>.
          Confirm your email, then <Link to="/portal/login" style={{ color: '#C9A227' }}>sign in</Link>.
        </div>
      ) : (
        <form onSubmit={onSubmit}>
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
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete="new-password" style={fieldStyle} />
          </label>

          {error && <div style={{ marginTop: 16, color: '#F2B8B5', fontSize: 13 }}>{error}</div>}

          <button type="submit" disabled={disabled} style={primaryBtnStyle(disabled)}>
            {busy ? 'Creating account…' : 'Create account'}
          </button>

          <div style={{ marginTop: 18, fontSize: 13.5, color: '#B9C0D2', textAlign: 'center' }}>
            Already have an account? <Link to="/portal/login" style={{ color: '#C9A227' }}>Sign in</Link>
          </div>
        </form>
      )}
    </AuthCard>
  );
}
