import { isConfigured } from '../supabase';
import { GOLD, GOLD_INK, CREAM, MUTED, SERIF, SURFACE, SURFACE2, BORDER, ON_GOLD, DANGER, DANGER_SOFT, DANGER_BORDER } from './theme';
import ThemeToggle from './ThemeToggle';

// Shared field/button styles for Login and Signup, on themed tokens.
export const fieldStyle = {
  width: '100%', boxSizing: 'border-box', padding: '12px 14px', marginTop: 7, borderRadius: 8,
  border: `1px solid ${BORDER}`, background: SURFACE2, color: CREAM, fontSize: 15, outline: 'none',
  fontFamily: 'inherit',
};

export const labelStyle = { display: 'block', fontSize: 13, color: MUTED };

export function primaryBtnStyle(disabled) {
  return {
    width: '100%', marginTop: 24, padding: '13px', borderRadius: 8, border: 'none',
    background: GOLD, color: ON_GOLD, fontWeight: 700, fontSize: 15,
    cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.7 : 1,
  };
}

// Branded split auth screen (AXIS-19): a navy brand panel beside a themed form
// card. The theme toggle sits top-right so it's reachable before signing in.
export default function AuthCard({ eyebrow, showConfigWarning = false, children }) {
  return (
    <div className="ax-auth">
      <div className="ax-auth-brand">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
          <img src="/assets/logo.jpeg" alt="CareerPulse Axis" width="44" height="44" style={{ borderRadius: 9, objectFit: 'cover' }} />
          <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 20 }}>CareerPulse Axis</span>
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ letterSpacing: '.2em', textTransform: 'uppercase', fontSize: 11.5, color: '#C9A227', fontWeight: 600, marginBottom: 14 }}>
            The Axis Interview Code
          </div>
          <h2 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 'clamp(24px,3vw,32px)', lineHeight: 1.2, margin: '0 0 14px' }}>
            We don’t cram questions.<br />We master the position.
          </h2>
          <p style={{ color: '#C7CEDE', fontSize: 14.5, lineHeight: 1.65, maxWidth: 360, margin: 0 }}>
            Sign in to your portal for the four winning pillars of interview readiness and to manage your CV.
          </p>
        </div>
        <div style={{ fontSize: 12.5, color: '#8C97B2', position: 'relative', zIndex: 1 }}>
          © CareerPulse Axis
        </div>
      </div>

      <div className="ax-auth-form">
        <div className="ax-auth-toggle"><ThemeToggle /></div>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '34px 32px', boxShadow: 'var(--ax-shadow)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <img src="/assets/logo.jpeg" alt="" width="30" height="30" style={{ borderRadius: 7, objectFit: 'cover' }} />
              <div>
                <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 17, color: CREAM, lineHeight: 1.1 }}>CareerPulse Axis</div>
                <div style={{ letterSpacing: '.16em', textTransform: 'uppercase', fontSize: 10, color: GOLD_INK }}>{eyebrow}</div>
              </div>
            </div>

            {showConfigWarning && !isConfigured && (
              <div style={{ marginBottom: 18, padding: '10px 12px', borderRadius: 6, background: DANGER_SOFT, border: `1px solid ${DANGER_BORDER}`, color: DANGER, fontSize: 13, lineHeight: 1.5 }}>
                Portal not configured — add your Supabase URL and key to <code>.env</code>.
              </div>
            )}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
