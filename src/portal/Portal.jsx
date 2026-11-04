import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { ThemeProvider, useTheme } from './ThemeContext';
import ProtectedRoute from './ProtectedRoute';
import Login from './Login';
import Signup from './Signup';
import ClientHome from './ClientHome';
import AdminHome from './AdminHome';

// Single lazy entry for the whole portal (mounted at /portal/* in main.jsx).
// ThemeProvider + AuthProvider wrap it once, so moving between portal screens
// never re-inits auth or theme. Paths below are relative to /portal.
function RoleLanding() {
  const { isAdmin } = useAuth();
  return <Navigate to={isAdmin ? '/portal/admin' : '/portal/client'} replace />;
}

// The themed root: data-theme drives the light/dark CSS tokens on .ax-portal.
function PortalRoot() {
  const { theme } = useTheme();
  return (
    <div className="ax-portal" data-theme={theme} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route index element={<ProtectedRoute><RoleLanding /></ProtectedRoute>} />
        <Route path="client/*" element={<ProtectedRoute><ClientHome /></ProtectedRoute>} />
        <Route path="admin/*" element={<ProtectedRoute requireAdmin><AdminHome /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/portal" replace />} />
      </Routes>
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
