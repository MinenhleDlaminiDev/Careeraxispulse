import { Routes, Route, Navigate } from 'react-router-dom';
import PortalLayout from './PortalLayout';
import ClientOverview from './ClientOverview';
import InterviewAccess from './InterviewAccess';
import CvUpload from './CvUpload';

const NAV = [
  { to: '/portal/client', end: true, label: 'Overview', icon: 'home' },
  { to: '/portal/client/interview', label: 'Interview Code', icon: 'book' },
  { to: '/portal/client/cv', label: 'My CV', icon: 'file' },
];

// Client area (AXIS-19): the sidebar shell plus the client sub-pages, each on
// its own route instead of one long scroll.
export default function ClientHome() {
  return (
    <PortalLayout area="Client" nav={NAV}>
      <Routes>
        <Route index element={<ClientOverview />} />
        <Route path="interview" element={<InterviewAccess />} />
        <Route path="cv" element={<CvUpload />} />
        <Route path="*" element={<Navigate to="/portal/client" replace />} />
      </Routes>
    </PortalLayout>
  );
}
