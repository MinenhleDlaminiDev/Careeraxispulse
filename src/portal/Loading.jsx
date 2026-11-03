export default function Loading({ label = 'Loading…' }) {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B9C0D2', fontSize: 15 }}>
      {label}
    </div>
  );
}
