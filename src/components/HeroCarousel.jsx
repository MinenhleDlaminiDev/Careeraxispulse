import { useState, useEffect, useRef, useCallback } from 'react';

// Infinite hero carousel: slide 1 is the existing banner, slide 2 promotes
// The Axis Interview Code. Cross-fades, auto-advances, pauses on hover, honours
// reduced-motion, and supports swipe. Swap slide 2's inner block for a real
// Interview Code banner image when one is supplied (same aspect ratio).
const SLIDES = 2;
const INTERVAL = 6000;

function Chevron({ dir }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {dir === 'left' ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 18 15 12 9 6" />}
    </svg>
  );
}

export default function HeroCarousel() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  // Reduced-motion users still get rotation, just without the cross-fade.
  const [reduced] = useState(() => typeof window !== 'undefined' && !!window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const touchX = useRef(null);

  const next = useCallback(() => setI(p => (p + 1) % SLIDES), []);
  const prev = useCallback(() => setI(p => (p - 1 + SLIDES) % SLIDES), []);

  // Auto-advance; re-arms on manual change (dep on i), pauses on hover/focus,
  // and stays still for reduced-motion users.
  useEffect(() => {
    if (paused) return undefined;
    const t = setInterval(() => setI(p => (p + 1) % SLIDES), INTERVAL);
    return () => clearInterval(t);
  }, [paused, i]);

  const onTouchStart = e => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = e => {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) (dx < 0 ? next() : prev());
    touchX.current = null;
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Highlights"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{ position: 'relative', width: '100%', aspectRatio: '1600 / 853', overflow: 'hidden', background: 'linear-gradient(180deg,#0E1830 0%,#1E3054 100%)' }}
    >
      {/* Slide 1 — current banner */}
      <div style={{ position: 'absolute', inset: 0, opacity: i === 0 ? 1 : 0, transition: reduced ? 'none' : 'opacity .8s ease', pointerEvents: i === 0 ? 'auto' : 'none' }} aria-hidden={i !== 0}>
        <img src="/assets/banner.jpeg" alt="CareerPulse Axis. Align. Elevate. Thrive. Founder Sinovuyo Mgogo" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>

      {/* Slide 2 — The Axis Interview Code */}
      <a href="/interview-code" aria-hidden={i !== 1} tabIndex={i === 1 ? 0 : -1} style={{ position: 'absolute', inset: 0, opacity: i === 1 ? 1 : 0, transition: reduced ? 'none' : 'opacity .8s ease', pointerEvents: i === 1 ? 'auto' : 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 'clamp(8px,1.6vw,18px)', padding: '0 24px', background: "linear-gradient(rgba(14,24,48,.72),rgba(14,24,48,.72)), url('/assets/interview-code-slide2.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', color: '#F4EFE4' }}>
        <div style={{ letterSpacing: '.22em', textTransform: 'uppercase', fontSize: 'clamp(9px,1.4vw,12.5px)', fontWeight: 600, color: '#C9A227' }}>New · Interview Readiness</div>
        <div style={{ fontFamily: "'Source Serif 4',serif", fontWeight: 600, fontSize: 'clamp(22px,4.6vw,52px)', lineHeight: 1.05 }}>The Axis <span style={{ color: '#C9A227' }}>Interview Code</span></div>
        <div style={{ fontSize: 'clamp(11px,1.8vw,17px)', color: '#B9C0D2', maxWidth: '560px', lineHeight: 1.5 }}>Our four winning pillars of interview readiness. Master the position, not just the questions.</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', justifyContent: 'center', marginTop: 'clamp(2px,0.6vw,6px)' }}>
          <span style={{ background: '#C9A227', color: '#131F38', padding: 'clamp(8px,1.2vw,14px) clamp(16px,2.4vw,30px)', borderRadius: '3px', fontWeight: 600, fontSize: 'clamp(12px,1.6vw,15.5px)' }}>Get Access →</span>
          <span style={{ fontSize: 'clamp(10px,1.4vw,13.5px)', color: '#8A94AC' }}>R50 · 30-day access</span>
        </div>
      </a>

      {/* bottom fade (matches the original hero) */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '18%', background: 'linear-gradient(to bottom, rgba(14,24,48,0), #0E1830)', pointerEvents: 'none' }} />

      <button type="button" className="hc-arrow" style={{ left: '14px' }} aria-label="Previous slide" onClick={prev}><Chevron dir="left" /></button>
      <button type="button" className="hc-arrow" style={{ right: '14px' }} aria-label="Next slide" onClick={next}><Chevron dir="right" /></button>

      <div className="hc-dots" role="tablist" aria-label="Choose slide">
        {Array.from({ length: SLIDES }).map((_, n) => (
          <button key={n} type="button" className="hc-dot" role="tab" aria-current={i === n} aria-label={`Slide ${n + 1}`} onClick={() => setI(n)} />
        ))}
      </div>
    </section>
  );
}
