import { isConfigured } from '../supabase';

// Shared bits for the portal's Login and Signup screens so the two stay in sync.
export const fieldStyle = {
  width: '100%', padding: '11px 13px', marginTop: 6, borderRadius: 4,
  border: '1px solid rgba(255,255,255,.2)', background: 'rgba(255,255,255,.06)',
  color: '#F4EFE4', fontSize: 15, outline: 'none',
};

export const labelStyle = { display: 'block', fontSize: 13, color: '#B9C0D2' };

export function primaryBtnStyle(disabled) {
  return {
    width: '100%', marginTop: 22, padding: '12px', borderRadius: 4, border: 'none',
    background: '#C9A227', color: '#131F38', fontWeight: 600, fontSize: 15,
    cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.7 : 1,
  };
}

// Centered navy card with the brand header, an eyebrow, and the shared
// "not configured" banner. Wraps the form (or any content) passed as children.
export default function AuthCard({ eyebrow, showConfigWarning = false, children }) {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 22 }}>
      <div style={{ width: '100%', maxWidth: 380, background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 10, padding: '30px 26px' }}>
        <div style={{ fontFamily: "'Source Serif 4',serif", fontWeight: 700, fontSize: 22, marginBottom: 4 }}>
          CareerPulse Axis
        </div>
        <div style={{ letterSpacing: '.18em', textTransform: 'uppercase', fontSize: 11, color: '#C9A227', marginBottom: 22 }}>
          {eyebrow}
        </div>
        {showConfigWarning && !isConfigured && (
          <div style={{ marginBottom: 18, padding: '10px 12px', borderRadius: 4, background: 'rgba(242,184,181,.12)', border: '1px solid rgba(242,184,181,.4)', color: '#F2B8B5', fontSize: 13, lineHeight: 1.5 }}>
            Portal not configured — add your Supabase URL and key to <code>.env</code>.
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
