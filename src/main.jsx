import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ChunkErrorBoundary from './portal/ChunkErrorBoundary.jsx';
import BrandLoader from './portal/BrandLoader.jsx';
// Portal (client + admin) is lazy-loaded so marketing visitors never download
// the Supabase/auth code. Lives outside the marketing Layout — no site chrome.
const Portal = React.lazy(() => import('./portal/Portal.jsx'));
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Services from './pages/Services.jsx';
import Ebook from './pages/Ebook.jsx';
import InterviewCode from './pages/InterviewCode.jsx';
// XisLab discontinued (AXIS-15) — replaced by The Axis Interview Code. /xislab redirects below.
import Testimonials from './pages/Testimonials.jsx';
import Contact from './pages/Contact.jsx';
import RefundPolicy from './pages/RefundPolicy.jsx';
import './index.css';
import './hover.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route
          path="/portal/*"
          element={
            <ChunkErrorBoundary>
              <Suspense fallback={<BrandLoader fullscreen />}>
                <Portal />
              </Suspense>
            </ChunkErrorBoundary>
          }
        />
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/xislab" element={<Navigate to="/interview-code" replace />} />
          <Route path="/ebook" element={<Ebook />} />
          <Route path="/interview-code" element={<InterviewCode />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
