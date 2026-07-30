import { useState, useEffect, useRef, useCallback } from 'react';
import ITEMS from '../testimonials.data.js';

export default function Testimonials() {
  const [idx, setIdx] = useState(null);
  const [loading, setLoading] = useState(false);
  const triggerRef = useRef(null); // thumbnail that opened the lightbox
  const dialogRef = useRef(null);
  const touchX = useRef(null);

  const open = (i, e) => { triggerRef.current = e.currentTarget; setLoading(true); setIdx(i); };
  const close = useCallback(() => setIdx(null), []);
  const go = useCallback((d) => { setLoading(true); setIdx(i => (i + d + ITEMS.length) % ITEMS.length); }, []);

  // Preload the neighbouring full images for instant prev/next.
  useEffect(() => {
    if (idx === null) return;
    [(idx + 1) % ITEMS.length, (idx - 1 + ITEMS.length) % ITEMS.length].forEach(n => {
      const im = new Image(); im.src = ITEMS[n].full;
    });
  }, [idx]);

  // Keyboard nav, scroll lock, and focus trap while the dialog is open.
  useEffect(() => {
    if (idx === null) return;
    const dlg = dialogRef.current;
    const onKey = (e) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'Tab') {
        const f = dlg ? [...dlg.querySelectorAll('button')] : [];
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => dlg?.querySelector('.t-close')?.focus(), 0);
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; clearTimeout(t); };
  }, [idx, close, go]);

  // Return focus to the triggering thumbnail on close.
  useEffect(() => { if (idx === null && triggerRef.current) triggerRef.current.focus(); }, [idx]);

  const onTouchStart = (e) => { touchX.current = e.changedTouches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
    touchX.current = null;
  };

  return (
    <>
      <section style={{ background: 'linear-gradient(180deg,#131F38 0%,#26396A 100%)', color: '#F4EFE4' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '84px 32px 72px', textAlign: 'center' }}>
          <div style={{ letterSpacing: '.2em', textTransform: 'uppercase', fontSize: '12px', fontWeight: 600, color: '#C9A227', marginBottom: '14px' }}>Testimonials</div>
          <h1 style={{ fontFamily: "'Source Serif 4',serif", fontWeight: 600, fontSize: 'clamp(30px,4.5vw,46px)', margin: '0 auto 18px', maxWidth: '760px', textWrap: 'pretty' }}>What our clients say</h1>
          <p style={{ fontSize: '17px', lineHeight: 1.65, color: '#B9C0D2', maxWidth: '620px', margin: '0 auto' }}>Real feedback from professionals who trusted CareerPulse Axis. Click any testimonial to view it full size.</p>
        </div>
      </section>

      <section style={{ maxWidth: '1240px', margin: '0 auto', padding: '64px 32px 32px' }}>
        <div className="t-grid">
          {ITEMS.map((it, i) => (
            <button
              key={i}
              type="button"
              className="t-card"
              style={{ aspectRatio: `${it.w} / ${it.h}` }}
              onClick={(e) => open(i, e)}
              aria-label={`View testimonial ${i + 1} of ${ITEMS.length}`}
            >
              <img src={it.thumb} width={it.w} height={it.h} loading="lazy" decoding="async" alt={`Client testimonial ${i + 1}`} />
              <span className="t-view" aria-hidden="true">View</span>
            </button>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: '760px', margin: '0 auto', padding: '8px 32px 88px', textAlign: 'center' }}>
        <p style={{ fontSize: '15px', color: '#56607A', lineHeight: 1.7, margin: 0 }}>
          All testimonials are verified client feedback. Want to share your success story? <a href="/contact" style={{ color: '#C9A227', fontWeight: 600 }}>Get in touch</a>.
        </p>
      </section>

      {idx !== null && (
        <div
          className="t-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`Testimonial ${idx + 1} of ${ITEMS.length}`}
          ref={dialogRef}
          onClick={close}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <button className="t-close" onClick={close} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></svg>
          </button>
          <button className="t-nav prev" onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label="Previous testimonial">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 5 8 12 15 19" /></svg>
          </button>
          <div className="t-stage" onClick={(e) => e.stopPropagation()}>
            {loading && <span className="t-spinner" aria-hidden="true"></span>}
            <img src={ITEMS[idx].full} alt={`Testimonial ${idx + 1}`} onLoad={() => setLoading(false)} style={{ opacity: loading ? 0 : 1 }} />
          </div>
          <button className="t-nav next" onClick={(e) => { e.stopPropagation(); go(1); }} aria-label="Next testimonial">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 5 16 12 9 19" /></svg>
          </button>
          <div className="t-counter" aria-hidden="true">{idx + 1} / {ITEMS.length}</div>
        </div>
      )}
    </>
  );
}
