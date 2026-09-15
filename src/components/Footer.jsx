import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ background: 'linear-gradient(180deg,#0E1830 0%,#1E3054 100%)', color: '#B9C0D2' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '64px 32px 40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '48px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="30" height="30" viewBox="0 0 34 34">
              <circle cx="17" cy="17" r="16" fill="#C9A227"></circle>
              <polyline points="6,17 12,17 14,10 17,24 19,13 21,17 28,17" fill="none" stroke="#0E1830" strokeWidth="1.8"></polyline>
            </svg>
            <span style={{ fontFamily: "'Source Serif 4',serif", fontWeight: 700, fontSize: '18px', color: '#F4EFE4' }}>CareerPulse <span style={{ color: '#C9A227' }}>Axis</span></span>
          </div>
          <p style={{ fontSize: '14px', lineHeight: '1.6', margin: 0, maxWidth: '320px' }}>Align. Elevate. Thrive. Professional CV writing, interview readiness, and employability guidance.</p>
          <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
            <a href="https://www.linkedin.com/company/careerpulse-axis/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" style={{ color: '#B9C0D2', display: 'inline-flex' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"/></svg>
            </a>
            <a href="https://www.tiktok.com/@careerpulseaxis_" target="_blank" rel="noopener noreferrer" aria-label="TikTok" style={{ color: '#B9C0D2', display: 'inline-flex' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.6 5.82a4.28 4.28 0 0 1-1.01-2.82h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5 2.59 2.59 0 0 1-2.59-2.59 2.59 2.59 0 0 1 3.39-2.46V9.7a5.66 5.66 0 0 0-.8-.06 5.68 5.68 0 1 0 5.68 5.68V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3a4.28 4.28 0 0 1-3.29-1.48z"/></svg>
            </a>
            <a href="https://www.facebook.com/profile.php?id=61588297205406" target="_blank" rel="noopener noreferrer" aria-label="Facebook" style={{ color: '#B9C0D2', display: 'inline-flex' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z"/></svg>
            </a>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
          <div style={{ fontWeight: 600, color: '#F4EFE4', marginBottom: '4px' }}>Quick links</div>
          <Link to="/services" style={{ color: '#B9C0D2' }}>Services</Link>
          <Link to="/xislab" style={{ color: '#B9C0D2' }}>XisLab Apex</Link>
          <Link to="/ebook" style={{ color: '#B9C0D2' }}>eBook</Link>
          <Link to="/about" style={{ color: '#B9C0D2' }}>About</Link>
          <Link to="/refund-policy" style={{ color: '#B9C0D2' }}>Refund Policy</Link>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
          <div style={{ fontWeight: 600, color: '#F4EFE4', marginBottom: '4px' }}>Contact</div>
          <a href="mailto:sinovuyo.mgogo@careerpulseaxis.co.za" style={{ color: '#B9C0D2' }}>sinovuyo.mgogo@careerpulseaxis.co.za</a>
          <a href="https://wa.me/27710203982" style={{ color: '#B9C0D2' }}>071 020 3982 (WhatsApp)</a>
        </div>
      </div>
      <div style={{ borderTop: '1px solid #1B2A4A', padding: '20px 32px', textAlign: 'center', fontSize: '13px', color: '#8A94AC' }}>© 2026 CareerPulse Axis. All rights reserved.</div>
    </footer>
  );
}
