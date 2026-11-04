import { useAuth } from './AuthContext';
import Shell from './Shell';
import InterviewAccess from './InterviewAccess';
import CvUpload from './CvUpload';

// Client landing. A slim greeting, the gated Interview Code content (AXIS-07,
// which handles both the has-access and waiting states), then CV upload
// (AXIS-08).
export default function ClientHome() {
  const { profile } = useAuth();
  const firstName = profile?.full_name ? profile.full_name.split(' ')[0] : '';

  return (
    <Shell area="Client">
      <div style={{ color: '#B9C0D2', fontSize: 13.5, marginBottom: 20 }}>
        Welcome{firstName ? `, ${firstName}` : ''}.
      </div>
      <InterviewAccess />
      <CvUpload />
    </Shell>
  );
}
