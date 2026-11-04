import { MUTED, SURFACE, BORDER } from './theme';
import PageHeader from './PageHeader';

// Admin CVs area — placeholder until AXIS-11/12 (view client CVs + upload the
// finished CV back). Kept as its own route so the nav slot already exists.
export default function AdminCvs() {
  return (
    <div>
      <PageHeader eyebrow="CVs" title="Client CVs">
        Review the CVs clients upload and send back the finished version.
      </PageHeader>
      <div style={{ background: SURFACE, border: `1px dashed ${BORDER}`, borderRadius: 12, padding: '30px 24px', textAlign: 'center', color: MUTED, fontSize: 14.5 }}>
        Coming soon — this is where you’ll view uploaded CVs and deliver the finished ones (AXIS-11/12).
      </div>
    </div>
  );
}
