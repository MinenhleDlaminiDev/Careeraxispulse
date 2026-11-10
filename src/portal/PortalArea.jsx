import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LayoutGroup, AnimatePresence } from 'framer-motion';
import PortalLayout from './PortalLayout';
import PortalHub from './PortalHub';

// AXIS-24: one portal area (admin or client) = a persistent sidebar shell plus a
// hub overlay shown only on the index route. Keeping the shell mounted makes the
// hub→section transition light, so the hub cards morph smoothly into the sidebar
// nav (shared layoutId, inside one LayoutGroup). `sections` is [{ path, element }].
export default function PortalArea({ area, nav, base, sections }) {
  const { pathname } = useLocation();
  const atHub = pathname === base || pathname === base + '/';
  return (
    <LayoutGroup>
      <PortalLayout area={area} nav={nav} home={base} atHub={atHub}>
        <Routes>
          <Route index element={null} />
          {sections.map((s) => <Route key={s.path} path={s.path} element={s.element} />)}
          <Route path="*" element={<Navigate to={base} replace />} />
        </Routes>
      </PortalLayout>
      <AnimatePresence>
        {atHub && <PortalHub key="hub" area={area} nav={nav} />}
      </AnimatePresence>
    </LayoutGroup>
  );
}
