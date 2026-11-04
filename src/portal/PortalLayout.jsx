import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from './AuthContext';
import ThemeToggle from './ThemeToggle';
import { GOLD, CREAM, MUTED, SERIF, BORDER } from './theme';

// Little inline icon set for the nav (stroke follows currentColor).
const ICONS = {
  home: 'M3 11.5 12 4l9 7.5M5 10v9h5v-5h4v5h5v-9',
  book: 'M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5zM20 19H6.5A2.5 2.5 0 0 0 4 21.5',
  file: 'M6 2h8l4 4v16H6zM14 2v4h4',
  users: 'M16 19v-1.5A3.5 3.5 0 0 0 12.5 14h-5A3.5 3.5 0 0 0 4 17.5V19M10 10.5A3 3 0 1 0 10 4.5a3 3 0 0 0 0 6zM20 19v-1.5a3.5 3.5 0 0 0-2.6-3.4M16 4.7a3 3 0 0 1 0 5.8',
  edit: 'M4 20h4L18.5 9.5a2 2 0 0 0-2.8-2.8L5 17zM14 7l3 3',
};
function Icon({ name }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICONS[name] || ICONS.home} />
    </svg>
  );
}

// The portal shell (AXIS-19): a left sidebar with the logo, role nav, theme
// toggle, email and Sign out, and the routed page in the main pane. The sidebar
// becomes a drawer on narrow screens, opened from the top bar.
export default function PortalLayout({ area, nav, children }) {
  const { profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const brand = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '2px 8px 14px' }}>
      <img src="/assets/logo.jpeg" alt="CareerPulse Axis" width="34" height="34" style={{ borderRadius: 7, objectFit: 'cover' }} />
      <div style={{ lineHeight: 1.1 }}>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 16, color: CREAM }}>CareerPulse Axis</div>
        <div style={{ letterSpacing: '.18em', textTransform: 'uppercase', fontSize: 9.5, color: GOLD }}>{area}</div>
      </div>
    </div>
  );

  return (
    <div className="ax-shell">
      <div className={'ax-scrim' + (open ? ' show' : '')} onClick={close} />

      <aside className={'ax-side' + (open ? ' open' : '')}>
        {brand}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} onClick={close}
              className={({ isActive }) => 'ax-navlink' + (isActive ? ' active' : '')}>
              <Icon name={n.icon} />
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ flex: 1 }} />

        <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <span style={{ fontSize: 12.5, color: MUTED }}>Theme</span>
            <ThemeToggle />
          </div>
          {profile?.email && (
            <div style={{ fontSize: 12.5, color: MUTED, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile.email}</div>
          )}
          <button type="button"
            onClick={async () => { const { error } = await signOut(); if (error) console.error('Sign out failed:', error.message); }}
            style={{ background: 'transparent', color: CREAM, border: `1px solid ${BORDER}`, borderRadius: 7, padding: '9px 12px', fontSize: 13, cursor: 'pointer' }}>
            Sign out
          </button>
        </div>
      </aside>

      <div className="ax-main">
        <div className="ax-topbar">
          <button type="button" className="ax-burger" aria-label="Open menu" onClick={() => setOpen(true)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
          </button>
          <img src="/assets/logo.jpeg" alt="" width="26" height="26" style={{ borderRadius: 6, objectFit: 'cover' }} />
          <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 15, color: CREAM }}>CareerPulse Axis</span>
          <div style={{ marginLeft: 'auto' }}><ThemeToggle /></div>
        </div>
        <main className="ax-content">{children}</main>
      </div>
    </div>
  );
}
