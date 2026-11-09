// Small presentation helpers shared across the portal screens.

// Initials for an avatar — first letters of the name, else the email.
export const initials = (name, email) => {
  const src = (name || '').trim();
  if (src) {
    const parts = src.split(/\s+/);
    return ((parts[0][0] || '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
  }
  return (email || '?').slice(0, 2).toUpperCase();
};

// Short, locale-friendly date: "9 Nov 2026".
export const fmtDate = (iso) => new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
