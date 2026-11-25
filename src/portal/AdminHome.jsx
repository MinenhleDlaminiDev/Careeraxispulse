import PortalArea from './PortalArea';
import AccessManagement from './AccessManagement';
import ClientDetail from './ClientDetail';
import ContentEditor from './ContentEditor';
import AdminCvs from './AdminCvs';
import Dashboard from './Dashboard';

const NAV = [
  { to: '/portal/admin/dashboard', label: 'Dashboard', icon: 'chart', desc: 'Clients, new signups, and who has bought the Interview Code or a CV revamp.' },
  { to: '/portal/admin/clients', label: 'Clients', icon: 'users', desc: 'Grant or revoke Interview Code access and see every client account.' },
  { to: '/portal/admin/content', label: 'Content', icon: 'edit', desc: 'Edit the four Interview Code pillars clients read.' },
  { to: '/portal/admin/cvs', label: 'CVs', icon: 'file', desc: 'Review uploaded CVs and deliver the finished versions.' },
];

const SECTIONS = [
  { path: 'dashboard', element: <Dashboard /> },
  { path: 'clients', element: <AccessManagement /> },
  { path: 'clients/:id', element: <ClientDetail /> },
  { path: 'content', element: <ContentEditor /> },
  { path: 'cvs', element: <AdminCvs /> },
];

// Admin area (AXIS-19, hub added AXIS-24): a hub overlay on the index plus the
// sidebar shell and sections, wired together by PortalArea.
export default function AdminHome() {
  return <PortalArea area="Admin" nav={NAV} base="/portal/admin" sections={SECTIONS} />;
}
