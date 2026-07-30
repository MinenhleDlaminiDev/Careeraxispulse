import { useEffect, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Intercept clicks on plain in-page <a href="/..."> links (the ported page
  // bodies use them) and route client-side. Header/Footer use <Link>, which
  // sets defaultPrevented, so those are skipped here.
  const onClick = useCallback((e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a');
    if (!a) return;
    const target = a.getAttribute('target');
    if (target && target !== '_self') return;
    const href = a.getAttribute('href');
    if (!href || !href.startsWith('/')) return; // external / mailto / tel / https handled by browser
    e.preventDefault();
    navigate(href);
  }, [navigate]);

  // Scroll behaviour on navigation: to the hash target if present, else top.
  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      if (el) { el.scrollIntoView({ behavior: 'smooth' }); return; }
    }
    window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);

  // Deter casual image saving: block right-click and drag on <img>.
  const blockImage = useCallback((e) => {
    if (e.target && e.target.tagName === 'IMG') e.preventDefault();
  }, []);

  return (
    <div onClickCapture={onClick} onContextMenu={blockImage} onDragStart={blockImage}>
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}
