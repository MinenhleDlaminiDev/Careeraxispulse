import PortalArea from './PortalArea';
import ClientOverview from './ClientOverview';
import InterviewAccess from './InterviewAccess';
import CvUpload from './CvUpload';
import ProfilePage from './ProfilePage';

const NAV = [
  { to: '/portal/client/overview', label: 'Overview', icon: 'home', desc: 'Your access status and quick links at a glance.' },
  { to: '/portal/client/interview', label: 'Interview Code', icon: 'book', desc: 'The four winning pillars of interview readiness.' },
  { to: '/portal/client/cv', label: 'My CV', icon: 'file', desc: 'Upload your CV and collect the finished version.' },
];

// 'profile' is a route but deliberately NOT in NAV: it is reached from the
// profile card on Overview, so the sidebar and the hub stay the three things a
// client actually comes here to do (AXIS-36).
const SECTIONS = [
  { path: 'overview', element: <ClientOverview /> },
  { path: 'interview', element: <InterviewAccess /> },
  { path: 'cv', element: <CvUpload /> },
  { path: 'profile', element: <ProfilePage /> },
];

// Client area (AXIS-19, hub added AXIS-24): a hub overlay on the index plus the
// sidebar shell and sections, wired together by PortalArea.
export default function ClientHome() {
  return <PortalArea area="Client" nav={NAV} base="/portal/client" sections={SECTIONS} />;
}
