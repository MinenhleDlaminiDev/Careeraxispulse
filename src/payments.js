// Paystack hosted checkout — same approach as the live site: purchase buttons
// link out to a Paystack Payment Page. No keys or backend needed here.
//
// Today the whole site uses one general page. When you create dedicated
// fixed-price pages in the Paystack dashboard (CV Revamp, eBook, etc.),
// just paste their URLs below — the buttons pick them up automatically.

export const PAYSTACK_URL = 'https://paystack.shop/pay/zzvuae8ftf';

// CV Revamp — one Paystack product page per experience tier.
export const CV_REVAMP = {
  entry: 'https://paystack.com/buy/entry-level-02-years-cv-revamp-iwskxa',       // 0-2 years, R150
  mid: 'https://paystack.com/buy/mid-level-cv-revamp-r220-sfqauq',              // 2-5 years, R220
  senior: 'https://paystack.com/buy/senior-level-cv-revamp-r300-ucajlr',        // 5-10 years, R300
  executive: 'https://paystack.com/buy/executive-level-10-years-r400-jxaapg',   // 10+ years, R400
};

// AXIS-40 — the same four tiers as one list, so the portal and the marketing
// page can never quote different prices. `seniority` holds the profile
// seniority_level values that point at this tier; the portal uses it to suggest
// a tier rather than to lock one in. Bands and prices verified against the live
// Paystack pages on 2026-11-17.
export const CV_TIERS = [
  { key: 'entry', label: 'Entry level', band: '0-2 years', price: 'R150', url: CV_REVAMP.entry, seniority: ['Entry level'] },
  { key: 'mid', label: 'Mid-level', band: '2-5 years', price: 'R220', url: CV_REVAMP.mid, seniority: ['Mid level'] },
  { key: 'senior', label: 'Senior level', band: '5-10 years', price: 'R300', url: CV_REVAMP.senior, seniority: ['Senior'] },
  { key: 'executive', label: 'Executive', band: '10+ years', price: 'R400', url: CV_REVAMP.executive, seniority: ['Management', 'Executive'] },
];

// Every tier buys the same work; only the depth of the experience differs.
export const CV_TIER_INCLUDES = ['CV restructuring', 'Content refinement', 'ATS-aligned formatting'];

// AXIS-41 — the same four tiers at returning-client prices, on their own
// Paystack pages ("<Tier> CV Revamp – Returning Client"). Prices verified
// against the live pages on 2026-11-18: about 27-30% below first-time.
export const CV_REVAMP_RETURNING = {
  entry: 'https://paystack.com/buy/entry-level-cv-revamp--returning-client-dqllvx',          // 0-2 years, R110
  mid: 'https://paystack.com/buy/mid-level-cv-revamp--returning-client-akqpaz',              // 2-5 years, R160
  senior: 'https://paystack.com/buy/senior-level-cv-revamp--returning-client-xoytmf',        // 5-10 years, R210
  executive: 'https://paystack.com/buy/executive-level-cv-revamp--returning-client-jghxdk',  // 10+ years, R280
};

const RETURNING_PRICE = { entry: 'R110', mid: 'R160', senior: 'R210', executive: 'R280' };

// Derived from CV_TIERS rather than written out again, so the labels, bands and
// seniority mapping can never drift between the two price lists — only the
// price and the link differ. `wasPrice` keeps the first-time price for the
// "was R150" line, so the saving is visible without a second lookup.
export const CV_TIERS_RETURNING = CV_TIERS.map((t) => ({
  ...t,
  price: RETURNING_PRICE[t.key],
  url: CV_REVAMP_RETURNING[t.key],
  wasPrice: t.price,
}));

// One place that answers "which price list does this client see?".
export const cvTiers = (returning) => (returning ? CV_TIERS_RETURNING : CV_TIERS);

// The cheapest tier in each list, for the "from R…" line above the buy button.
export const CV_FROM_PRICE = { first: CV_TIERS[0].price, returning: CV_TIERS_RETURNING[0].price };

// The Axis Interview Code — live product page. Price verified against the
// Paystack page itself on 2026-11-17: ZAR 90. Keep INTERVIEW_PRICE in step with
// it; the marketing page and the portal both read this one constant, so they
// can never disagree.
export const INTERVIEW_URL = 'https://paystack.com/buy/the-axis-interview-code-mxcfox';
export const INTERVIEW_PRICE = 'R90';

export const PAYSTACK = {
  bookService: PAYSTACK_URL, // general "Book a Service"
  cvRevamp: PAYSTACK_URL,    // general "Book a CV Revamp" CTA (Home hero)
  cv: CV_REVAMP,             // per-tier CV Revamp product pages
  cvReturning: CV_REVAMP_RETURNING, // per-tier returning-client pages (AXIS-41)
  interview: INTERVIEW_URL,  // The Axis Interview Code (AXIS-39)
  ebook: PAYSTACK_URL,       // replace when you make an eBook page
};
