import { useEffect, useRef } from 'react';

// Generic themed dialog (AXIS-22). Dimmed backdrop, centred card that scrolls
// with the page on small screens, closes on Esc / backdrop click / the ✕, and
// locks body scroll while open.
export default function Modal({ onClose, label, children }) {
  const cardRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    cardRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="ax-modal-backdrop"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="ax-modal-card" ref={cardRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label={label}>
        <button type="button" className="ax-modal-close" onClick={onClose} aria-label="Close">×</button>
        {children}
      </div>
    </div>
  );
}
