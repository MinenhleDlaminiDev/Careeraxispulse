import { createContext, useContext, useEffect, useState, useCallback } from 'react';

// Portal light/dark theme (AXIS-19). Dark is the default. The choice is saved
// per browser in localStorage and applied as data-theme on the .ax-portal root.
const ThemeContext = createContext(null);
const STORAGE_KEY = 'ax-theme';

function readStored() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'light' || v === 'dark') return v;
  } catch { /* private mode / blocked storage — fall through to default */ }
  return 'dark';
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(readStored);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, theme); } catch { /* ignore */ }
  }, [theme]);

  const toggle = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), []);

  return <ThemeContext.Provider value={{ theme, setTheme, toggle }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
