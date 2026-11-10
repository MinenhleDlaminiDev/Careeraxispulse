import PortalArea from './PortalArea';
import AccessManagement from './AccessManagement';
import ContentEditor from './ContentEditor';
import AdminCvs from './AdminCvs';

const NAV = [
  { to: '/portal/admin/clients', label: 'Clients', icon: 'users', desc: 'Grant or revoke Interview Code access and see every client account.' },
  { to: '/portal/admin/content', label: 'Content', icon: 'edit', desc: 'Edit the four Interview Code pillars clients read.' },
  { to: '/portal/admin/cvs', label: 'CVs', icon: 'file', desc: 'Review uploaded CVs and deliver the finished versions.' },
];

const SECTIONS = [
  { path: 'clients', element: <AccessManagement /> },
  { path: 'content', element: <ContentEditor /> },
  { path: 'cvs', element: <AdminCvs /> },
];

// Admin area (AXIS-19, hub added AXIS-24): a hub overlay on the index plus the
// sidebar shell and sections, wired together by PortalArea.
export default function AdminHome() {
  return <PortalArea area="Admin" nav={NAV} base="/portal/admin" sections={SECTIONS} />;
}
