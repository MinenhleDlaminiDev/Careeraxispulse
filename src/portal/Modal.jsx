import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { EASE } from '../motion.js';

// Generic themed dialog (AXIS-22). Dimmed backdrop, centred card that scrolls
// with the page on small screens, closes on Esc / backdrop click / the ✕, and
// locks body scroll while open. AXIS-25: the backdrop fades in and the card
// rises + scales in so the dialog arrives rather than snapping.
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
    <motion.div
      className="ax-modal-backdrop"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: EASE }}
    >
      <motion.div
        className="ax-modal-card" ref={cardRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label={label}
        initial={{ opacity: 0, y: 10, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.28, ease: EASE }}
      >
        <button type="button" className="ax-modal-close" onClick={onClose} aria-label="Close">×</button>
        {children}
      </motion.div>
    </motion.div>
  );
}
