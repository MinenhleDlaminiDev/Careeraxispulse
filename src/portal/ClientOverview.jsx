import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import PageHeader from './PageHeader';
import { GOLD, GOLD_INK, CREAM, MUTED, SERIF, SURFACE, BORDER, GOLD_SOFT, GOLD_BORDER, ON_GOLD } from './theme';

// Client landing page (AXIS-19): a greeting, access status at a glance, and
// quick links into the two things a client does here.
export default function ClientOverview() {
  const { profile, hasInterviewAccess } = useAuth();
  const firstName = profile?.full_name ? profile.full_name.split(' ')[0] : '';
  const expiry = profile?.interview_access_expires_at;

  const statusLine = hasInterviewAccess
    ? `Active · until ${new Date(expiry).toLocaleDateString()}`
    : expiry ? 'Expired' : 'Not active yet';

  return (
    <div>
      <PageHeader eyebrow="Overview" title={`Welcome${firstName ? `, ${firstName}` : ''}.`}>
        Your space for the Axis Interview Code and your CV. Pick up where you left off below.
      </PageHeader>

      <div style={{ background: hasInterviewAccess ? GOLD_SOFT : SURFACE, border: `1px solid ${hasInterviewAccess ? GOLD_BORDER : BORDER}`, borderRadius: 12, padding: '18px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 12.5, letterSpacing: '.1em', textTransform: 'uppercase', color: GOLD_INK, marginBottom: 4 }}>Interview Code access</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: CREAM }}>{statusLine}</div>
        </div>
        <Link to="/portal/client/interview" style={{ background: GOLD, color: ON_GOLD, borderRadius: 6, padding: '10px 18px', fontSize: 14, fontWeight: 600 }}>
          {hasInterviewAccess ? 'Open Interview Code' : 'View details'}
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14 }}>
        <QuickCard to="/portal/client/interview" title="Interview Code" body="The four winning pillars of interview readiness." />
        <QuickCard to="/portal/client/cv" title="My CV" body="Upload your CV so we can prepare alongside the job description." />
      </div>
    </div>
  );
}

function QuickCard({ to, title, body }) {
  return (
    <Link to={to} style={{ display: 'block', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '18px 18px' }}>
      <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 17, color: CREAM, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.6 }}>{body}</div>
      <div style={{ marginTop: 12, fontSize: 13, color: GOLD_INK, fontWeight: 600 }}>Open →</div>
    </Link>
  );
}
