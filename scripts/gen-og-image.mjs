// Generates the 1200x630 social share image. Run: npm run og-image
import path from 'node:path';
import sharp from 'sharp';

const OUT = path.resolve('public/assets/og-image.jpg');
const W = 1200, H = 630, CX = W / 2;
const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "Segoe UI, 'Helvetica Neue', Arial, sans-serif";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0" stop-color="#0E1830"/><stop offset="0.55" stop-color="#131F38"/><stop offset="1" stop-color="#1C2C50"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.85" cy="0.12" r="0.6">
      <stop offset="0" stop-color="#C9A227" stop-opacity="0.22"/><stop offset="1" stop-color="#C9A227" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <polyline points="0,470 320,470 360,470 392,414 424,528 456,438 472,470 660,470 760,470 792,436 824,512 848,470 1200,470"
            fill="none" stroke="#C9A227" stroke-width="3" opacity="0.12"/>
  <g transform="translate(${CX - 34},96) scale(2)">
    <circle cx="17" cy="17" r="16" fill="#C9A227"/>
    <polyline points="6,17 12,17 14,10 17,24 19,13 21,17 28,17" fill="none" stroke="#0E1830" stroke-width="1.8"/>
  </g>
  <text x="${CX}" y="238" text-anchor="middle" fill="#F4EFE4" font-family="${SERIF}" font-size="58" font-weight="700">CareerPulse <tspan fill="#C9A227">Axis</tspan></text>
  <text x="${CX}" y="300" text-anchor="middle" fill="#C9A227" font-family="${SANS}" font-size="22" font-weight="700" letter-spacing="6">ALIGN. ELEVATE. THRIVE.</text>
  <text x="${CX}" y="392" text-anchor="middle" fill="#E7ECF5" font-family="${SERIF}" font-size="40" font-weight="700">Professional CV writing &amp; interview readiness</text>
  <text x="${CX}" y="446" text-anchor="middle" fill="#B9C0D2" font-family="${SANS}" font-size="24">Structured, ATS-aligned career guidance — graduate to executive</text>
</svg>`;

await sharp(Buffer.from(svg)).jpeg({ quality: 88 }).toFile(OUT);
console.log('Wrote public/assets/og-image.jpg');
