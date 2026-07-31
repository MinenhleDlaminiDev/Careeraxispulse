import { useEffect } from 'react';

export const SITE_URL = 'https://careerpulseaxis.co.za';
const DEFAULT_IMAGE = SITE_URL + '/assets/og-image.jpg';

function meta(attr, key, value) {
  if (!value) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

function canonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

// Updates document title + SEO/social meta tags on route change. Google renders
// JS, so it reads these; for guaranteed indexing consider prerendering (see notes).
export function useSeo({ title, description, path = '/', image = DEFAULT_IMAGE }) {
  useEffect(() => {
    const url = SITE_URL + path;
    if (title) document.title = title;
    meta('name', 'description', description);
    canonical(url);
    meta('property', 'og:title', title);
    meta('property', 'og:description', description);
    meta('property', 'og:url', url);
    meta('property', 'og:image', image);
    meta('property', 'og:type', 'website');
    meta('property', 'og:site_name', 'CareerPulse Axis');
    meta('name', 'twitter:card', 'summary_large_image');
    meta('name', 'twitter:title', title);
    meta('name', 'twitter:description', description);
    meta('name', 'twitter:image', image);
  }, [title, description, path, image]);
}
