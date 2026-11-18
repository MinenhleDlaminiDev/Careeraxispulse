import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Loading from './Loading';
import { GOLD, CREAM, ON_GOLD, BORDER, DANGER } from './theme';

// Gate for authenticated portal routes. Security is enforced by RLS on the
// server; this only decides what the UI shows. requireAdmin keeps clients out
// of admin screens (they get bounced to their own area).
//
// AXIS-43 adds a second gate: a client whose profile is missing required fields
// is sent to /portal/complete-profile and cannot reach anything else. It sits
// here rather than in each screen so there is one rule and no route can be
// reached around it. `allowIncomplete` is what the completion screen's own
// route passes, so the gate doesn't redirect it to itself forever.
export default function ProtectedRoute({ requireAdmin = false, allowIncomplete = false, children }) {
  const { session, profile, profileReady, loading, isAdmin, profileComplete, signOut } = useAuth();
  const location = useLocation();

  if (loading) return <Loading />;
  if (!session) return <Navigate to="/portal/login" replace state={{ from: location }} />;
  if (!profileReady) return <Loading label="Loading your account…" />;

  // Session is valid but the profile couldn't be loaded (missing row, RLS, or a
  // network error). Don't trap the user on a spinner — let them retry or leave.
  if (!profile) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, textAlign: 'center', padding: 22 }}>
        <div style={{ color: DANGER, fontSize: 15 }}>We couldn’t load your account.</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" onClick={() => window.location.reload()} style={{ background: GOLD, color: ON_GOLD, border: 'none', borderRadius: 6, padding: '9px 16px', fontWeight: 600, cursor: 'pointer' }}>Retry</button>
          <button type="button" onClick={() => signOut()} style={{ background: 'transparent', color: CREAM, border: `1px solid ${BORDER}`, borderRadius: 6, padding: '9px 16px', cursor: 'pointer' }}>Sign out</button>
        </div>
      </div>
    );
  }

  if (requireAdmin && !isAdmin) return <Navigate to="/portal/client" replace />;

  // AXIS-43: incomplete profile -> the completion step, and nowhere else.
  // profileComplete is already true for admins (see AuthContext), so an admin
  // is never held here by career fields they have no reason to fill in.
  if (!allowIncomplete && !profileComplete) {
    return <Navigate to="/portal/complete-profile" replace />;
  }
  // Already complete but sitting on the completion screen: send them on, so a
  // bookmark or a back-button press doesn't strand them on a finished form.
  if (allowIncomplete && profileComplete) {
    return <Navigate to="/portal" replace />;
  }

  return children;
}
