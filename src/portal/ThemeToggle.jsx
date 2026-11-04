import { useTheme } from './ThemeContext';

// Branded pill toggle for light/dark. The knob carries a moon (dark) or sun
// (light) and slides across; the whole portal cross-fades via the CSS theme
// transition. Both the slide and the fade go instant under reduced motion.
export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const light = theme === 'light';
  return (
    <button
      type="button"
      className="ax-toggle"
      data-on={theme}
      onClick={toggle}
      role="switch"
      aria-checked={light}
      aria-label={light ? 'Switch to dark mode' : 'Switch to light mode'}
      title={light ? 'Dark mode' : 'Light mode'}
    >
      <span className="ax-toggle-knob" aria-hidden="true">
        {light ? (
          // sun
          <svg viewBox="0 0 24 24" fill="none" stroke="#131F38" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="12" cy="12" r="4.2" />
            <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
          </svg>
        ) : (
          // moon
          <svg viewBox="0 0 24 24" fill="#131F38">
            <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.6 6.6 0 0 0 9.8 9.8z" />
          </svg>
        )}
      </span>
    </button>
  );
}
