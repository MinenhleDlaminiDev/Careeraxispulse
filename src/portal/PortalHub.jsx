import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from './AuthContext';
import ThemeToggle from './ThemeToggle';
import { Icon } from './PortalLayout';
import { GOLD, CREAM, MUTED, SERIF } from './theme';

// AXIS-24: the portal landing. An opaque full-screen overlay (so the sidebar
// behind it is hidden) with a centered grid of cards — one per nav section. Each
// card shares a layoutId with its sidebar nav item, so clicking it morphs the
// cards straight into the already-mounted left navbar (framer-motion) while this
// overlay fades out to reveal the section. The shell stays mounted underneath,
// which keeps the transition light and smooth.
export default function PortalHub({ area, nav }) {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const firstName = profile?.full_name ? profile.full_name.split(' ')[0] : '';

  return (
    <motion.div className="ax-hub" exit={{ opacity: 0 }} transition={{ duration: 0.22, ease: 'easeOut' }}>
      <div className="ax-hub-bar">
        <ThemeToggle />
        <button type="button" className="ax-iconbtn"
          onClick={async () => { const { error } = await signOut(); if (error) console.error('Sign out failed:', error.message); }}>
          Sign out
        </button>
      </div>

      <motion.header className="ax-hub-head"
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
        <div style={{ letterSpacing: '.2em', textTransform: 'uppercase', fontSize: 11, color: GOLD, fontWeight: 600, marginBottom: 10 }}>{area} Portal</div>
        <h1 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 'clamp(26px,4vw,34px)', color: CREAM, margin: '0 0 8px' }}>
          Welcome{firstName ? `, ${firstName}` : ''}.
        </h1>
        <p style={{ color: MUTED, fontSize: 15, margin: 0 }}>Where would you like to go?</p>
      </motion.header>

      <div className="ax-hub-grid" style={{ maxWidth: Math.min(nav.length, 4) * 250 + (Math.min(nav.length, 4) - 1) * 18 }}>
        {nav.map((n, i) => (
          <motion.button
            key={n.to}
            type="button"
            layoutId={`nav-${n.to}`}
            onClick={() => navigate(n.to)}
            className="ax-hub-card"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ layout: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }, duration: 0.4, delay: 0.08 + i * 0.07 }}
            whileHover={{ y: -4 }}
          >
            <span className="ax-hub-ic"><Icon name={n.icon} size={22} /></span>
            <motion.span className="ax-hub-title">{n.label}</motion.span>
            <motion.span className="ax-hub-desc">{n.desc}</motion.span>
            <span className="ax-hub-go">Open →</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
