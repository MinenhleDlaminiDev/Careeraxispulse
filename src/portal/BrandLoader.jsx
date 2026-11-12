// One branded loader (AXIS-33): the logo inside a spinning gold ring. Used for
// in-app waits (the portal Loading, keeping its label) and, with `fullscreen`,
// as the lazy-load Suspense fallback before the portal mounts. The ring uses
// literal brand colours (gold is constant in both themes) so it looks right both
// inside the themed portal and on the pre-portal fallback. Standalone — no
// imports — so it's cheap to include in the main bundle.
export default function BrandLoader({ label, fullscreen }) {
  return (
    <div className={'ax-loader' + (fullscreen ? ' ax-loader-full' : '')} role="status" aria-live="polite">
      <div className="ax-loader-ring"><img src="/assets/logo.jpeg" alt="" /></div>
      {label
        ? <div className="ax-loader-label">{label}</div>
        : <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>Loading</span>}
    </div>
  );
}
