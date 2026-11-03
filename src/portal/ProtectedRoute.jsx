import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Loading from './Loading';

// Gate for authenticated portal routes. Security is enforced by RLS on the
// server; this only decides what the UI shows. requireAdmin keeps clients out
// of admin screens (they get bounced to their own area).
export default function ProtectedRoute({ requireAdmin = false, children }) {
  const { session, profile, profileReady, loading, isAdmin, signOut } = useAuth();
  const location = useLocation();

  if (loading) return <Loading />;
  if (!session) return <Navigate to="/portal/login" replace state={{ from: location }} />;
  if (!profileReady) return <Loading label="Loading your account…" />;

  // Session is valid but the profile couldn't be loaded (missing row, RLS, or a
  // network error). Don't trap the user on a spinner — let them retry or leave.
  if (!profile) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, textAlign: 'center', padding: 22 }}>
        <div style={{ color: '#F2B8B5', fontSize: 15 }}>We couldn’t load your account.</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" onClick={() => window.location.reload()} style={{ background: '#C9A227', color: '#131F38', border: 'none', borderRadius: 3, padding: '8px 16px', fontWeight: 600, cursor: 'pointer' }}>Retry</button>
          <button type="button" onClick={() => signOut()} style={{ background: 'transparent', color: '#F4EFE4', border: '1px solid rgba(255,255,255,.25)', borderRadius: 3, padding: '8px 16px', cursor: 'pointer' }}>Sign out</button>
        </div>
      </div>
    );
  }

  if (requireAdmin && !isAdmin) return <Navigate to="/portal/client" replace />;

  return children;
}
