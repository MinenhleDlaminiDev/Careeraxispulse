import { useAuth } from './AuthContext';
import Shell from './Shell';
import AccessManagement from './AccessManagement';
import ContentEditor from './ContentEditor';

// Admin landing. Client access management (AXIS-09) and the content editor
// (AXIS-10) live here; the CV tools (AXIS-11/12) will join them.
export default function AdminHome() {
  const { profile } = useAuth();

  return (
    <Shell area="Admin">
      <h1 style={{ fontFamily: "'Source Serif 4',serif", fontWeight: 700, fontSize: 28, margin: '0 0 8px' }}>
        Admin{profile?.full_name ? ` · ${profile.full_name}` : ''}
      </h1>
      <p style={{ color: '#B9C0D2', margin: '0 0 24px' }}>Manage access, content and CVs.</p>

      <AccessManagement />
      <ContentEditor />
    </Shell>
  );
}
