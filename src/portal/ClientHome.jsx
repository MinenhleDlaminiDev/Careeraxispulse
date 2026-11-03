import { useAuth } from './AuthContext';
import Shell from './Shell';

// Client landing placeholder. The real client pages — Interview Access
// (AXIS-07) and CV upload (AXIS-08) — plug in here.
export default function ClientHome() {
  const { profile, hasInterviewAccess } = useAuth();

  return (
    <Shell area="Client">
      <h1 style={{ fontFamily: "'Source Serif 4',serif", fontWeight: 700, fontSize: 28, margin: '0 0 8px' }}>
        Welcome{profile?.full_name ? `, ${profile.full_name}` : ''}
      </h1>
      <p style={{ color: '#B9C0D2', margin: '0 0 24px' }}>Your CareerPulse Axis portal.</p>

      <div style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 8, padding: '18px 20px' }}>
        <div style={{ letterSpacing: '.16em', textTransform: 'uppercase', fontSize: 11, color: '#C9A227', marginBottom: 6 }}>
          Interview Code Access
        </div>
        {hasInterviewAccess ? (
          <p style={{ margin: 0 }}>
            Active until{' '}
            <strong>{new Date(profile.interview_access_expires_at).toLocaleDateString()}</strong>. The four pillars page will appear here.
          </p>
        ) : (
          <p style={{ margin: 0, color: '#B9C0D2' }}>
            You don’t have active access yet. Once your payment is confirmed, access is granted for 30 days.
          </p>
        )}
      </div>
    </Shell>
  );
}
