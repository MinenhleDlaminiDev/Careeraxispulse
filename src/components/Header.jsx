import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/services', label: 'Services' },
  { to: '/xislab', label: 'XisLab' },
  { to: '/ebook', label: 'eBook' },
  { to: '/testimonials', label: 'Testimonials' },
  { to: '/about', label: 'About' },
  { to: '/refund-policy', label: 'Refund Policy' },
  { to: '/contact', label: 'Contact' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const close = () => setOpen(false);

  const logo = (
    <svg width="34" height="34" viewBox="0 0 34 34">
      <circle cx="17" cy="17" r="16" fill="#C9A227"></circle>
      <polyline points="6,17 12,17 14,10 17,24 19,13 21,17 28,17" fill="none" stroke="#0E1830" strokeWidth="1.8"></polyline>
    </svg>
  );

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(14,24,48,.92)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(201,162,39,.25)' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '14px 32px', display: 'flex', alignItems: 'center', gap: '16px 36px', flexWrap: 'wrap' }}>
        <Link to="/" onClick={close} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {logo}
          <span style={{ fontFamily: "'Source Serif 4',serif", fontWeight: 700, fontSize: '19px', color: '#F4EFE4' }}>CareerPulse <span style={{ color: '#C9A227' }}>Axis</span></span>
        </Link>

        <button
          type="button"
          className={'hamburger' + (open ? ' open' : '')}
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen(o => !o)}
        >
          <span className="bar bar1"></span>
          <span className="bar bar2"></span>
          <span className="bar bar3"></span>
        </button>

        <nav className={'site-nav' + (open ? ' open' : '')} style={{ display: 'flex', gap: '12px 26px', marginLeft: 'auto', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end', fontSize: '14.5px', fontWeight: 500 }}>
          {LINKS.map(l => {
            const active = l.to === pathname;
            return (
              <Link key={l.to} to={l.to} onClick={close} style={{ color: active ? '#C9A227' : '#D9DEEA', fontWeight: active ? 600 : 500 }}>
                {l.label}
              </Link>
            );
          })}
          <Link to="/services" onClick={close} className="btn-book" style={{ background: '#C9A227', color: '#131F38', padding: '10px 20px', borderRadius: '3px', fontWeight: 600 }}>Book a Service</Link>
        </nav>
      </div>
    </header>
  );
}
