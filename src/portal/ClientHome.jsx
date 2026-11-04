import { useAuth } from './AuthContext';
import Shell from './Shell';
import InterviewAccess from './InterviewAccess';

// Client landing. A slim greeting, then the gated Interview Code content
// (AXIS-07), which handles both the has-access and waiting states. CV upload
// (AXIS-08) will join here later.
export default function ClientHome() {
  const { profile } = useAuth();
  const firstName = profile?.full_name ? profile.full_name.split(' ')[0] : '';

  return (
    <Shell area="Client">
      <div style={{ color: '#B9C0D2', fontSize: 13.5, marginBottom: 20 }}>
        Welcome{firstName ? `, ${firstName}` : ''}.
      </div>
      <InterviewAccess />
    </Shell>
  );
}
