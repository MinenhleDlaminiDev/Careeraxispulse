import { useAuth } from './AuthContext';
import Shell from './Shell';

// Admin landing placeholder. The real admin tools — access management
// (AXIS-09), content editor (AXIS-10) and CV handling (AXIS-11/12) — plug in here.
const SECTIONS = [
  { title: 'Client Access', note: 'Grant or revoke 30-day Interview Code access (AXIS-09).' },
  { title: 'Interview Content', note: 'Edit the four-pillar copy (AXIS-10).' },
  { title: 'CVs', note: 'Upload and manage client CVs (AXIS-11 / AXIS-12).' },
];

export default function AdminHome() {
  const { profile } = useAuth();

  return (
    <Shell area="Admin">
      <h1 style={{ fontFamily: "'Source Serif 4',serif", fontWeight: 700, fontSize: 28, margin: '0 0 8px' }}>
        Admin{profile?.full_name ? ` · ${profile.full_name}` : ''}
      </h1>
      <p style={{ color: '#B9C0D2', margin: '0 0 24px' }}>Manage access, content and CVs.</p>

      <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))' }}>
        {SECTIONS.map((s) => (
          <div key={s.title} style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 8, padding: '18px 20px' }}>
            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 6 }}>{s.title}</div>
            <div style={{ fontSize: 13.5, color: '#B9C0D2', lineHeight: 1.5 }}>{s.note}</div>
          </div>
        ))}
      </div>
    </Shell>
  );
}
