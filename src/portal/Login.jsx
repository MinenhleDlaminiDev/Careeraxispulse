import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { isConfigured } from '../supabase';
import Loading from './Loading';

// Minimal sign-in so the scaffold can establish a session and load a profile.
// The full sign up / log in / log out experience is AXIS-06.
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

  const field = {
    width: '100%', padding: '11px 13px', marginTop: 6, borderRadius: 4,
    border: '1px solid rgba(255,255,255,.2)', background: 'rgba(255,255,255,.06)',
    color: '#F4EFE4', fontSize: 15, outline: 'none',
  };

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 22 }}>
      <form onSubmit={onSubmit} style={{ width: '100%', maxWidth: 380, background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 10, padding: '30px 26px' }}>
        <div style={{ fontFamily: "'Source Serif 4',serif", fontWeight: 700, fontSize: 22, marginBottom: 4 }}>
          CareerPulse Axis
        </div>
        <div style={{ letterSpacing: '.18em', textTransform: 'uppercase', fontSize: 11, color: '#C9A227', marginBottom: 22 }}>
          Portal Sign In
        </div>

        {!isConfigured && (
          <div style={{ marginBottom: 18, padding: '10px 12px', borderRadius: 4, background: 'rgba(242,184,181,.12)', border: '1px solid rgba(242,184,181,.4)', color: '#F2B8B5', fontSize: 13, lineHeight: 1.5 }}>
            Portal not configured — add your Supabase URL and key to <code>.env</code>.
          </div>
        )}

        <label style={{ display: 'block', fontSize: 13, color: '#B9C0D2' }}>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" style={field} />
        </label>
        <label style={{ display: 'block', fontSize: 13, color: '#B9C0D2', marginTop: 16 }}>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" style={field} />
        </label>

        {error && <div style={{ marginTop: 16, color: '#F2B8B5', fontSize: 13 }}>{error}</div>}

        <button
          type="submit"
          disabled={busy || !isConfigured}
          style={{ width: '100%', marginTop: 22, padding: '12px', borderRadius: 4, border: 'none', background: '#C9A227', color: '#131F38', fontWeight: 600, fontSize: 15, cursor: busy || !isConfigured ? 'default' : 'pointer', opacity: busy || !isConfigured ? 0.7 : 1 }}
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
