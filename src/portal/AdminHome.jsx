import { Routes, Route, Navigate } from 'react-router-dom';
import PortalLayout from './PortalLayout';
import AccessManagement from './AccessManagement';
import ContentEditor from './ContentEditor';
import AdminCvs from './AdminCvs';

const NAV = [
  { to: '/portal/admin', end: true, label: 'Clients', icon: 'users' },
  { to: '/portal/admin/content', label: 'Content', icon: 'edit' },
  { to: '/portal/admin/cvs', label: 'CVs', icon: 'file' },
];

// Admin area (AXIS-19): the sidebar shell plus the admin sub-pages, each on its
// own route.
export default function AdminHome() {
  return (
    <PortalLayout area="Admin" nav={NAV}>
      <Routes>
        <Route index element={<AccessManagement />} />
        <Route path="content" element={<ContentEditor />} />
        <Route path="cvs" element={<AdminCvs />} />
        <Route path="*" element={<Navigate to="/portal/admin" replace />} />
      </Routes>
    </PortalLayout>
  );
}
