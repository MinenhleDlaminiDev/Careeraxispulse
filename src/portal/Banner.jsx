import { DANGER, DANGER_SOFT, DANGER_BORDER, GOLD_INK, GOLD_SOFT, GOLD_BORDER } from './theme';

// Shared success/error banner for the portal screens (AXIS-18/19). kind 'error'
// or 'ok'. Returns null when there's no text, so callers can render it
// unconditionally.
export default function Banner({ kind = 'ok', children, style }) {
  if (!children) return null;
  const error = kind === 'error';
  return (
    <div
      role={error ? 'alert' : 'status'}
      style={{
        padding: '10px 13px', borderRadius: 6, fontSize: 13, lineHeight: 1.5,
        background: error ? DANGER_SOFT : GOLD_SOFT,
        border: `1px solid ${error ? DANGER_BORDER : GOLD_BORDER}`,
        color: error ? DANGER : GOLD_INK,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
