export default function Loading({ label = 'Loading…' }) {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ax-muted)', fontSize: 15 }}>
      {label}
    </div>
  );
}
