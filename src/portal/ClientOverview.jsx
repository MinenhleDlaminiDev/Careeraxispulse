import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import PageHeader from './PageHeader';
import { GOLD, GOLD_INK, CREAM, MUTED, SERIF, ON_GOLD } from './theme';
import { Stagger, Item } from '../components/Reveal.jsx';

// Client landing page (AXIS-19, restyled AXIS-23): a greeting, access status at a
// glance, and quick links into the two things a client does here.
export default function ClientOverview() {
  const { profile, hasInterviewAccess } = useAuth();
  const firstName = profile?.full_name ? profile.full_name.split(' ')[0] : '';
  const expiry = profile?.interview_access_expires_at;

  // Access as a status badge: gold = live, danger = expired, neutral = not yet.
  const access = hasInterviewAccess
    ? { tone: 'gold', label: `Active · until ${new Date(expiry).toLocaleDateString()}` }
    : expiry ? { tone: 'danger', label: 'Expired' } : { tone: 'neutral', label: 'Not active yet' };

  return (
    <div>
      <PageHeader eyebrow="Overview" title={`Welcome${firstName ? `, ${firstName}` : ''}.`}>
        Your space for the Axis Interview Code and your CV. Pick up where you left off below.
      </PageHeader>

      <section className="ax-card" style={{ padding: '18px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 11.5, letterSpacing: '.1em', textTransform: 'uppercase', color: GOLD_INK, fontWeight: 700, marginBottom: 8 }}>Interview Code access</div>
          <span className={`ax-badge ax-badge-${access.tone}`}>{access.label}</span>
        </div>
        <Link to="/portal/client/interview" style={{ background: GOLD, color: ON_GOLD, borderRadius: 8, padding: '10px 18px', fontSize: 14, fontWeight: 600 }}>
          {hasInterviewAccess ? 'Open Interview Code' : 'View details'}
        </Link>
      </section>

      <Stagger style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14 }}>
        <Item><QuickCard to="/portal/client/interview" title="Interview Code" body="The four winning pillars of interview readiness." /></Item>
        <Item><QuickCard to="/portal/client/cv" title="My CV" body="Upload your CV so we can prepare alongside the job description." /></Item>
      </Stagger>
    </div>
  );
}

function QuickCard({ to, title, body }) {
  return (
    <Link to={to} className="ax-card ax-quick" style={{ display: 'block', padding: '18px 18px' }}>
      <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 17, color: CREAM, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.6 }}>{body}</div>
      <div style={{ marginTop: 12, fontSize: 13, color: GOLD_INK, fontWeight: 600 }}>Open →</div>
    </Link>
  );
}
