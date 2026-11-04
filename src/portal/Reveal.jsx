import { useEffect, useRef, useState } from 'react';

// Fades a section up as it scrolls into view. Reduced-motion (or no
// IntersectionObserver) renders it fully visible with no animation, so content
// is never hidden behind an effect that didn't run.
const reduced =
  typeof window !== 'undefined' &&
  !!window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function Reveal({ children, style, delay = 0 }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(reduced);

  useEffect(() => {
    if (shown || !ref.current || typeof IntersectionObserver === 'undefined') { setShown(true); return; }
    const el = ref.current;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } }),
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shown]);

  return (
    <div
      ref={ref}
      style={{
        ...style,
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : 'translateY(16px)',
        transition: reduced ? 'none' : `opacity .6s ease ${delay}ms, transform .6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
