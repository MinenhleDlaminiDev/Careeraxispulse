import { motion } from 'framer-motion';
import { DANGER, DANGER_SOFT, DANGER_BORDER, GOLD_INK, GOLD_SOFT, GOLD_BORDER } from './theme';
import { EASE } from '../motion.js';

// Shared success/error banner for the portal screens (AXIS-18/19). kind 'error'
// or 'ok'. Returns null when there's no text, so callers can render it
// unconditionally. AXIS-25: slides + fades in when a message appears.
export default function Banner({ kind = 'ok', children, style }) {
  if (!children) return null;
  const error = kind === 'error';
  return (
    <motion.div
      role={error ? 'alert' : 'status'}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: EASE }}
      style={{
        padding: '10px 13px', borderRadius: 6, fontSize: 13, lineHeight: 1.5,
        background: error ? DANGER_SOFT : GOLD_SOFT,
        border: `1px solid ${error ? DANGER_BORDER : GOLD_BORDER}`,
        color: error ? DANGER : GOLD_INK,
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}
