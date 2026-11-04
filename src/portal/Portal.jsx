import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';
import Login from './Login';
import Signup from './Signup';
import ClientHome from './ClientHome';
import AdminHome from './AdminHome';

// Single lazy entry for the whole portal (mounted at /portal/* in main.jsx).
// AuthProvider wraps it once, so moving between portal screens never re-inits
// auth. Paths below are relative to /portal. Both the client. and admin.
// subdomains can later serve this same build (AXIS-14).
function RoleLanding() {
  const { isAdmin } = useAuth();
  return <Navigate to={isAdmin ? '/portal/admin' : '/portal/client'} replace />;
}

export default function Portal() {
  return (
    <AuthProvider>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg,#131F38 0%,#26396A 100%)', color: '#F4EFE4', fontFamily: "'Public Sans', sans-serif" }}>
        <Routes>
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route index element={<ProtectedRoute><RoleLanding /></ProtectedRoute>} />
          <Route path="client/*" element={<ProtectedRoute><ClientHome /></ProtectedRoute>} />
          <Route path="admin/*" element={<ProtectedRoute requireAdmin><AdminHome /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/portal" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}
