import { useAuth } from './AuthContext';

// Shared frame for the signed-in portal: brand bar + sign-out, content below.
export default function Shell({ area, children }) {
  const { profile, signOut } = useAuth();
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '14px 22px', borderBottom: '1px solid rgba(201,162,39,.25)', background: 'rgba(14,24,48,.55)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{ fontFamily: "'Source Serif 4',serif", fontWeight: 700, fontSize: 18 }}>CareerPulse Axis</span>
          <span style={{ letterSpacing: '.18em', textTransform: 'uppercase', fontSize: 11, color: '#C9A227' }}>{area}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {profile?.email && <span style={{ fontSize: 13, color: '#B9C0D2' }}>{profile.email}</span>}
          <button
            type="button"
            onClick={async () => { const { error } = await signOut(); if (error) console.error('Sign out failed:', error.message); }}
            style={{ background: 'transparent', color: '#F4EFE4', border: '1px solid rgba(255,255,255,.25)', borderRadius: 3, padding: '7px 14px', fontSize: 13, cursor: 'pointer' }}
          >
            Sign out
          </button>
        </div>
      </header>
      <main style={{ flex: 1, padding: '28px 22px', maxWidth: 920, width: '100%', margin: '0 auto' }}>
        {children}
      </main>
    </div>
  );
}
