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
