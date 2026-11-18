import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { AuthProvider, useAuth } from './AuthContext';
import { ThemeProvider, useTheme } from './ThemeContext';
import { NotificationsProvider } from './NotificationsContext';
import ProtectedRoute from './ProtectedRoute';
import Login from './Login';
import Signup from './Signup';
import CompleteProfile from './CompleteProfile';
import ClientHome from './ClientHome';
import AdminHome from './AdminHome';

// Single lazy entry for the whole portal (mounted at /portal/* in main.jsx).
// ThemeProvider + AuthProvider wrap it once, so moving between portal screens
// never re-inits auth or theme. Paths below are relative to /portal.
function RoleLanding() {
  const { isAdmin } = useAuth();
  return <Navigate to={isAdmin ? '/portal/admin' : '/portal/client'} replace />;
}

// Every portal page starts at the top (AXIS-35). The marketing side gets this
// from Layout.jsx, but the portal is mounted OUTSIDE that Layout (AXIS-02), so
// it had no scroll reset at all — leaving a long screen left you part-way down
// the next one. Applies on every device.
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'auto' }); }, [pathname]);
  return null;
}

// The themed root: data-theme drives the light/dark CSS tokens on .ax-portal.
function PortalRoot() {
  const { theme } = useTheme();
  return (
    <div className="ax-portal" data-theme={theme} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* reducedMotion="never": the portal plays its transitions (the hub→sidebar
          card morph especially) even when the OS/browser has reduced-motion on.
          This is a deliberate product choice (AXIS-24) — the morph is the portal's
          signature entry and the user asked for it to always play. */}
      <MotionConfig reducedMotion="never">
        <ScrollToTop />
        {/* AXIS-13: inside the Router (it refetches on route change) and inside
            AuthProvider (it needs the signed-in user), wrapping the routes so
            both bells in PortalLayout share one list and one unread count. */}
        <NotificationsProvider>
        <Routes>
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          {/* AXIS-43: the completion gate. allowIncomplete is what lets this
              one route be reached while the profile is still missing fields;
              every other protected route redirects here until it is done. */}
          <Route path="complete-profile" element={<ProtectedRoute allowIncomplete><CompleteProfile /></ProtectedRoute>} />
          <Route index element={<ProtectedRoute><RoleLanding /></ProtectedRoute>} />
          <Route path="client/*" element={<ProtectedRoute><ClientHome /></ProtectedRoute>} />
          <Route path="admin/*" element={<ProtectedRoute requireAdmin><AdminHome /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/portal" replace />} />
        </Routes>
        </NotificationsProvider>
      </MotionConfig>
    </div>
  );
}

export default function Portal() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PortalRoot />
      </AuthProvider>
    </ThemeProvider>
  );
}
