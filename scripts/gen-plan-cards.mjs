// Generates one premium PNG card per plan for Paystack. Run: npm run plan-cards
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const OUT = path.resolve('price-images/plans');
fs.mkdirSync(OUT, { recursive: true });

const C = {
  navy: '#0E1830', navy2: '#131F38', navyA: '#1C2C50', panel: '#15233F', panelHi: '#1B2C4E',
  gold: '#C9A227', goldL: '#E7C65A', cream: '#FAF7F0', paper: '#F4EFE4',
  light: '#B9C0D2', mut: '#8A94AC', line: '#33406A',
};
const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "Segoe UI, 'Helvetica Neue', Arial, sans-serif";
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const W = 1080, H = 1150, CX = W / 2;

const check = (x, y) =>
  `<g><circle cx="${x}" cy="${y}" r="15" fill="rgba(201,162,39,.16)"/><path d="M${x - 6.5} ${y} l4.5 4.6 l8.5 -9.2" fill="none" stroke="${C.gold}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></g>`;

const lock = (x, y) =>
  `<g><rect x="${x}" y="${y}" width="19" height="15" rx="3" fill="${C.mut}"/><path d="M${x + 3.5} ${y} v-4.5 a6 6 0 0 1 12 0 v4.5" fill="none" stroke="${C.mut}" stroke-width="2.2"/></g>`;

function card({ file, eyebrow, title, sub, price, unit, features, featured, footnote }) {
  const stroke = featured ? C.gold : C.line;
  const pad = 96, px = pad, pw = W - pad * 2;            // panel x / width
  const py = 214, ph = 770;                              // panel y / height
  let s = '';

  // brand lockup
  s += `<g transform="translate(${CX - 27},46) scale(1.6)"><circle cx="17" cy="17" r="16" fill="${C.gold}"/><polyline points="6,17 12,17 14,10 17,24 19,13 21,17 28,17" fill="none" stroke="${C.navy}" stroke-width="1.8"/></g>`;
  s += `<text x="${CX}" y="158" text-anchor="middle" fill="${C.paper}" font-family="${SERIF}" font-size="34" font-weight="700">CareerPulse <tspan fill="${C.gold}">Axis</tspan></text>`;

  // panel (soft shadow + body)
  s += `<rect x="${px}" y="${py + 8}" width="${pw}" height="${ph}" rx="30" fill="rgba(0,0,0,.35)" filter="url(#soft)"/>`;
  s += `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="30" fill="url(#panel)" stroke="${stroke}" stroke-width="${featured ? 2.5 : 1.5}"/>`;
  if (featured) {
    const bw = 210, bx = CX - bw / 2;
    s += `<rect x="${bx}" y="${py - 21}" width="${bw}" height="42" rx="21" fill="${C.gold}"/>`;
    s += `<text x="${CX}" y="${py + 6}" text-anchor="middle" fill="${C.navy2}" font-family="${SANS}" font-size="16" font-weight="700" letter-spacing="2.5">MOST POPULAR</text>`;
  }

  let y = py + 86;
  s += `<text x="${CX}" y="${y}" text-anchor="middle" fill="${C.gold}" font-family="${SANS}" font-size="18" font-weight="700" letter-spacing="4">${esc(eyebrow.toUpperCase())}</text>`;
  y += 62; s += `<text x="${CX}" y="${y}" text-anchor="middle" fill="${C.paper}" font-family="${SERIF}" font-size="52" font-weight="700">${esc(title)}</text>`;
  y += 40; s += `<text x="${CX}" y="${y}" text-anchor="middle" fill="${C.light}" font-family="${SANS}" font-size="21">${esc(sub)}</text>`;

  // price
  y += 118;
  s += `<text x="${CX}" y="${y}" text-anchor="middle" font-family="${SERIF}" font-weight="700"><tspan fill="${C.gold}" font-size="104">${esc(price)}</tspan><tspan fill="${C.light}" font-family="${SANS}" font-size="24" font-weight="600"> ${esc(unit || '')}</tspan></text>`;

  // divider
  y += 46; s += `<line x1="${CX - 60}" y1="${y}" x2="${CX + 60}" y2="${y}" stroke="${C.gold}" stroke-width="2"/>`;

  // features
  y += 66;
  const fx = px + 84;
  for (const f of features) {
    s += check(fx, y - 6);
    s += `<text x="${fx + 30}" y="${y}" fill="${C.paper}" font-family="${SANS}" font-size="23">${esc(f)}</text>`;
    y += 58;
  }

  // footnote + secure line
  s += `<text x="${CX}" y="${py + ph - 96}" text-anchor="middle" fill="${C.mut}" font-family="${SANS}" font-size="17">${esc(footnote)}</text>`;
  const lg = 'Secure checkout with Paystack';
  s += `<g transform="translate(${CX - 108},${py + ph - 52})">${lock(0, 0)}<text x="30" y="13" fill="${C.light}" font-family="${SANS}" font-size="18" font-weight="600">${lg}</text></g>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stop-color="${C.navy}"/><stop offset="0.55" stop-color="${C.navy2}"/><stop offset="1" stop-color="${C.navyA}"/></linearGradient>
      <linearGradient id="panel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.panelHi}"/><stop offset="1" stop-color="${C.panel}"/></linearGradient>
      <radialGradient id="glow" cx="0.85" cy="0.1" r="0.6"><stop offset="0" stop-color="${C.gold}" stop-opacity="0.20"/><stop offset="1" stop-color="${C.gold}" stop-opacity="0"/></radialGradient>
      <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="18"/></filter>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <rect width="${W}" height="${H}" fill="url(#glow)"/>
    <polyline points="0,1070 300,1070 340,1070 372,1024 404,1130 436,1040 452,1070 620,1070 720,1070 752,1036 784,1112 808,1070 1080,1070" fill="none" stroke="${C.gold}" stroke-width="2.5" opacity="0.10"/>
    ${s}
  </svg>`;
  return sharp(Buffer.from(svg)).png().toFile(path.join(OUT, file));
}

const CVF = ['CV restructuring', 'Content refinement', 'ATS-aligned formatting'];
const cvFoot = '3–4 working day turnaround · Returning clients 11% off';

const plans = [
  { file: 'cv-entry-r150.png', eyebrow: 'CV Revamp', title: 'Entry Level', sub: '0–2 years experience', price: 'R150', features: CVF, footnote: cvFoot },
  { file: 'cv-mid-r220.png', eyebrow: 'CV Revamp', title: 'Mid-Level', sub: '2–5 years experience', price: 'R220', features: CVF, footnote: cvFoot },
  { file: 'cv-senior-r300.png', eyebrow: 'CV Revamp', title: 'Senior Level', sub: '5–10 years experience', price: 'R300', features: CVF, footnote: cvFoot, featured: true },
  { file: 'cv-executive-r400.png', eyebrow: 'CV Revamp', title: 'Executive', sub: '10+ years experience', price: 'R400', features: CVF, footnote: cvFoot },
  { file: 'interview-basic-r200.png', eyebrow: 'Interview Readiness', title: 'Basic', sub: 'Graduate level', price: 'R200', features: ['Up to 45 minutes', 'Graduate & entry-level focus', 'Structured preparation'], footnote: 'One-on-one · booked to your schedule' },
  { file: 'interview-standard-r270.png', eyebrow: 'Interview Readiness', title: 'Standard', sub: 'Professional level', price: 'R270', features: ['Up to 60 minutes', 'Professional-level focus', 'Advanced preparation'], footnote: 'One-on-one · booked to your schedule', featured: true },
  { file: 'xislab-apex-r199.png', eyebrow: 'Membership', title: 'XisLab Apex', sub: 'Ongoing employability support', price: 'R199', unit: '/ month', features: ['Weekly live sessions', 'Up to 5 CV reviews a month', 'Hiring insights & guidance'], footnote: 'Recurring monthly · cancel anytime', featured: true },
  { file: 'ebook-r245.png', eyebrow: 'Digital Guide', title: 'The eBook', sub: '8 Proven Axis Steps', price: 'R245', features: ['Instant PDF download', 'Step-by-step framework', 'Before-you-apply checklist'], footnote: 'Instant download after payment' },
];

await Promise.all(plans.map(card));
console.log(`Wrote ${plans.length} plan cards to price-images/plans/`);
