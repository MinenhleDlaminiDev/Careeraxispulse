import { useState } from 'react';
import { fieldStyle } from './AuthCard';
import { MUTED, TEXT } from './theme';

const Eye = (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOff = (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

// Password field with a show/hide eye toggle. Accepts the same props as a plain
// <input> (value, onChange, required, minLength, autoComplete…) and reuses the
// shared fieldStyle, leaving room on the right for the eye button.
export default function PasswordInput({ style, ...props }) {
  const [show, setShow] = useState(false);
  const [hover, setHover] = useState(false);

  return (
    <div style={{ position: 'relative', marginTop: 7 }}>
      <input
        {...props}
        type={show ? 'text' : 'password'}
        style={{ ...fieldStyle, marginTop: 0, paddingRight: 44, ...style }}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        aria-label={show ? 'Hide password' : 'Show password'}
        title={show ? 'Hide password' : 'Show password'}
        style={{
          position: 'absolute', top: 0, right: 6, height: '100%', width: 34,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'none', border: 'none', padding: 0, cursor: 'pointer',
          color: hover ? TEXT : MUTED,
        }}
      >
        {show ? EyeOff : Eye}
      </button>
    </div>
  );
}
