// Paystack hosted checkout — same approach as the live site: purchase buttons
// link out to a Paystack Payment Page. No keys or backend needed here.
//
// Today the whole site uses one general page. When you create dedicated
// fixed-price pages in the Paystack dashboard (CV Revamp, eBook, etc.),
// just paste their URLs below — the buttons pick them up automatically.

export const PAYSTACK_URL = 'https://paystack.shop/pay/zzvuae8ftf';

// CV Revamp — one Paystack product page per experience tier.
export const CV_REVAMP = {
  entry: 'https://paystack.com/buy/entry-level-02-years-cv-revamp-iwskxa',       // 0–2 years, R150
  mid: 'https://paystack.com/buy/mid-level-cv-revamp-r220-sfqauq',              // 2–5 years, R220
  senior: 'https://paystack.com/buy/senior-level-cv-revamp-r300-ucajlr',        // 5–10 years, R300
  executive: 'https://paystack.com/buy/executive-level-10-years-r400-jxaapg',   // 10+ years, R400
};

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
  interview: INTERVIEW_URL,  // The Axis Interview Code (AXIS-39)
  ebook: PAYSTACK_URL,       // replace when you make an eBook page
};
