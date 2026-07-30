// Generates branded pricing PNGs for Paystack pages. Run: npm run price-images
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const OUT = path.resolve('price-images');
fs.mkdirSync(OUT, { recursive: true });

const C = {
  navy: '#0E1830', navy2: '#131F38', navyA: '#26396A', gold: '#C9A227', goldD: '#9A7B12',
  cream: '#FAF7F0', white: '#FFFFFF', border: '#E7E2D6', ink: '#1B2A4A',
  gray: '#56607A', gray2: '#6B7690', light: '#B9C0D2', paper: '#F4EFE4',
};
const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "Segoe UI, 'Helvetica Neue', Arial, sans-serif";
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const logo = (x, y, s = 1) =>
  `<g transform="translate(${x},${y}) scale(${s})"><circle cx="17" cy="17" r="16" fill="${C.gold}"/><polyline points="6,17 12,17 14,10 17,24 19,13 21,17 28,17" fill="none" stroke="${C.navy}" stroke-width="1.8"/></g>`;

function band(w, h, label, title, subtitle) {
  return `
    <rect width="${w}" height="${h}" fill="url(#navy)"/>
    ${logo(48, h / 2 - 24, 1.4)}
    <text x="${w / 2}" y="${h * 0.30}" text-anchor="middle" fill="${C.gold}" font-family="${SANS}" font-size="20" font-weight="700" letter-spacing="5">${esc(label)}</text>
    <text x="${w / 2}" y="${h * 0.58}" text-anchor="middle" fill="${C.paper}" font-family="${SERIF}" font-size="50" font-weight="700">${esc(title)}</text>
    ${subtitle ? `<text x="${w / 2}" y="${h * 0.82}" text-anchor="middle" fill="${C.light}" font-family="${SANS}" font-size="19">${esc(subtitle)}</text>` : ''}`;
}

function tierCard(x, y, w, h, { tag, name, price, unit, bullets, featured }) {
  const bg = featured ? 'url(#navy)' : C.white;
  const nameCol = featured ? C.paper : C.ink;
  const tagCol = featured ? C.gold : C.gray2;
  const priceCol = featured ? C.gold : C.navy;
  const bulletCol = featured ? C.light : C.gray;
  let o = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${bg}" ${featured ? '' : `stroke="${C.border}" stroke-width="1.5"`}/>`;
  if (featured) {
    const bw = 176;
    o += `<rect x="${x + w / 2 - bw / 2}" y="${y - 17}" width="${bw}" height="34" rx="17" fill="${C.gold}"/>`;
    o += `<text x="${x + w / 2}" y="${y + 6}" text-anchor="middle" fill="${C.navy2}" font-family="${SANS}" font-size="14" font-weight="700" letter-spacing="2">MOST POPULAR</text>`;
  }
  const px = x + 36; let ty = y + 52;
  o += `<text x="${px}" y="${ty}" fill="${tagCol}" font-family="${SANS}" font-size="15" font-weight="700" letter-spacing="2.5">${esc(tag.toUpperCase())}</text>`;
  ty += 44; o += `<text x="${px}" y="${ty}" fill="${nameCol}" font-family="${SERIF}" font-size="27" font-weight="700">${esc(name)}</text>`;
  ty += 68; o += `<text x="${px}" y="${ty}" fill="${priceCol}" font-family="${SERIF}" font-size="46" font-weight="700">${esc(price)}<tspan font-family="${SANS}" font-size="18" font-weight="600" fill="${bulletCol}"> ${esc(unit || '')}</tspan></text>`;
  ty += 46;
  for (const b of bullets) {
    o += `<circle cx="${px + 4}" cy="${ty - 6}" r="3.5" fill="${C.gold}"/><text x="${px + 20}" y="${ty}" fill="${bulletCol}" font-family="${SANS}" font-size="18">${esc(b)}</text>`;
    ty += 35;
  }
  return o;
}

const defs = `<defs><linearGradient id="navy" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.navy2}"/><stop offset="1" stop-color="${C.navyA}"/></linearGradient></defs>`;
const wrap = (w, h, inner) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${defs}<rect width="${w}" height="${h}" fill="${C.cream}"/>${inner}</svg>`;

const CV_BULLETS = ['CV restructuring', 'Content refinement', 'ATS-aligned formatting'];

// ---- 1) CV Revamp (2x2 tiers) ----
{
  const w = 1200, bh = 200, cw = 537, ch = 300, gx = 30, gy = 44, mx = 48;
  const x2 = mx + cw + gx, y1 = bh + 60, y2 = y1 + ch + gy, h = y2 + ch + 78;
  const inner = band(w, bh, 'CV REVAMP', 'Choose your level', 'Restructuring · content refinement · ATS-aligned formatting')
    + tierCard(mx, y1, cw, ch, { tag: 'Entry level', name: '0–2 years', price: 'R150', bullets: CV_BULLETS })
    + tierCard(x2, y1, cw, ch, { tag: 'Mid-level', name: '2–5 years', price: 'R220', bullets: CV_BULLETS })
    + tierCard(mx, y2, cw, ch, { tag: 'Senior level', name: '5–10 years', price: 'R300', bullets: CV_BULLETS, featured: true })
    + tierCard(x2, y2, cw, ch, { tag: 'Executive', name: '10+ years', price: 'R400', bullets: CV_BULLETS })
    + `<text x="${w / 2}" y="${h - 34}" text-anchor="middle" fill="${C.gray}" font-family="${SANS}" font-size="18">Returning clients get 11% off · 3–4 working day turnaround</text>`;
  await sharp(Buffer.from(wrap(w, h, inner))).png().toFile(path.join(OUT, 'cv-revamp-pricing.png'));
}

// ---- 2) Interview Readiness (2 tiers) ----
{
  const w = 1200, bh = 200, cw = 537, ch = 330, gx = 30, mx = 48;
  const x2 = mx + cw + gx, y1 = bh + 64, h = y1 + ch + 70;
  const inner = band(w, bh, 'INTERVIEW READINESS', 'Walk in prepared', 'One-on-one prep for graduate & professional interviews')
    + tierCard(mx, y1, cw, ch, { tag: 'Graduate level', name: 'Basic Readiness', price: 'R200', bullets: ['Up to 45 minutes', 'Graduate & entry-level focus', 'Structured preparation'] })
    + tierCard(x2, y1, cw, ch, { tag: 'Professional', name: 'Standard Readiness', price: 'R270', bullets: ['Up to 60 minutes', 'Professional-level focus', 'Advanced preparation'], featured: true });
  await sharp(Buffer.from(wrap(w, h, inner))).png().toFile(path.join(OUT, 'interview-readiness-pricing.png'));
}

// ---- 3) Services overview (2x2) ----
{
  const w = 1200, bh = 200, cw = 537, ch = 210, gx = 30, gy = 40, mx = 48;
  const x2 = mx + cw + gx, y1 = bh + 60, y2 = y1 + ch + gy, h = y2 + ch + 70;
  const svc = (x, y, name, price, unit, desc) => {
    let o = `<rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="10" fill="${C.white}" stroke="${C.border}" stroke-width="1.5"/>`;
    o += `<text x="${x + 36}" y="${y + 58}" fill="${C.ink}" font-family="${SERIF}" font-size="28" font-weight="700">${esc(name)}</text>`;
    o += `<text x="${x + 36}" y="${y + 108}" fill="${C.navy}" font-family="${SERIF}" font-size="40" font-weight="700">${esc(price)}<tspan font-family="${SANS}" font-size="17" font-weight="600" fill="${C.gray}"> ${esc(unit)}</tspan></text>`;
    o += `<text x="${x + 36}" y="${y + 154}" fill="${C.gray}" font-family="${SANS}" font-size="18">${esc(desc)}</text>`;
    return o;
  };
  const inner = band(w, bh, 'SERVICES & PRICING', 'What we offer', 'Align. Elevate. Thrive.')
    + svc(mx, y1, 'CV Revamp', 'from R150', '', 'Restructure, refine & ATS-align your CV')
    + svc(x2, y1, 'Interview Readiness', 'from R200', '', 'Structured one-on-one interview prep')
    + svc(mx, y2, 'XisLab Apex', 'R199', '/ month', 'Weekly sessions + monthly CV reviews')
    + svc(x2, y2, 'eBook', 'R245', '', '8 Proven Axis Steps Before You Apply');
  await sharp(Buffer.from(wrap(w, h, inner))).png().toFile(path.join(OUT, 'services-overview.png'));
}

console.log('Wrote price-images/*.png');
