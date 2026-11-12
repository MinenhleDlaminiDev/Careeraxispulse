import BrandLoader from './BrandLoader';

// Thin wrapper kept so every existing `<Loading label=… />` caller keeps working;
// the visual is the shared BrandLoader (AXIS-33).
export default function Loading({ label = 'Loading…' }) {
  return <BrandLoader label={label} />;
}
