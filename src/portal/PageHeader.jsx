import { GOLD, CREAM, MUTED, SERIF } from './theme';

// Shared page header for the portal screens: a gold eyebrow, the title, and an
// optional subtitle passed as children. Keeps the type scale in one place.
export default function PageHeader({ eyebrow, title, children }) {
  return (
    <header style={{ marginBottom: 22 }}>
      <div style={{ letterSpacing: '.18em', textTransform: 'uppercase', fontSize: 11, color: GOLD, marginBottom: 8 }}>{eyebrow}</div>
      <h1 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 28, margin: '0 0 6px', color: CREAM }}>{title}</h1>
      {children && <p style={{ color: MUTED, fontSize: 15, margin: 0, lineHeight: 1.6, maxWidth: 580 }}>{children}</p>}
    </header>
  );
}
