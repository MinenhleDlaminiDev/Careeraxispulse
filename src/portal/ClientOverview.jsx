import { Link } from 'react-router-dom';
import { useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import PageHeader from './PageHeader';
import Avatar from './Avatar';
import EditProfileForm from './EditProfileForm';
import { AVATAR_ACCEPT, validateAvatarFile, uploadAvatar, removeAvatar } from './avatarStorage';
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

      <ProfilePhotoCard />

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

// The client's photo plus add/change/remove controls (AXIS-28). Uploads go to
// the private 'avatars' bucket; refreshProfile() re-reads the row so the new
// photo shows at once here (and in the admin Clients list on their next load).
function ProfilePhotoCard() {
  const { user, profile, refreshProfile } = useAuth();
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const path = profile?.avatar_path || null;

  const onPick = async (e) => {
    const file = e.target.files?.[0];
    if (inputRef.current) inputRef.current.value = '';
    if (!file || !user) return;
    setError('');
    const invalid = validateAvatarFile(file);
    if (invalid) { setError(invalid); return; }
    setBusy(true);
    const { error: upErr } = await uploadAvatar({ userId: user.id, file, previousPath: path });
    setBusy(false);
    if (upErr) { setError('Couldn’t upload that photo. Please try again.'); return; }
    refreshProfile();
  };

  const onRemove = async () => {
    if (!user || !path) return;
    setError('');
    setBusy(true);
    const { error: rmErr } = await removeAvatar({ userId: user.id, path });
    setBusy(false);
    if (rmErr) { setError('Couldn’t remove the photo. Please try again.'); return; }
    refreshProfile();
  };

  return (
    <section className="ax-card" style={{ padding: '18px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
      <Avatar path={path} name={profile?.full_name} email={profile?.email} size={64} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: CREAM, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.full_name || 'Your profile'}</div>
        <div style={{ fontSize: 13, color: MUTED, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.email}</div>
        {error && <div style={{ fontSize: 12.5, color: 'var(--ax-danger)', marginTop: 6 }}>{error}</div>}
      </div>
      <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
        <button type="button" className="ax-iconbtn" onClick={() => setEditing(true)}>Edit profile</button>
        <input ref={inputRef} type="file" accept={AVATAR_ACCEPT} onChange={onPick} style={{ display: 'none' }} id="avatar-file" />
        <label htmlFor="avatar-file" className="ax-iconbtn" style={{ cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.6 : 1, pointerEvents: busy ? 'none' : 'auto' }}>
          {busy ? 'Working…' : path ? 'Change photo' : 'Add photo'}
        </label>
        {path && !busy && <button type="button" className="ax-iconbtn" onClick={onRemove}>Remove</button>}
      </div>

      {editing && <EditProfileForm onClose={() => setEditing(false)} />}
    </section>
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
