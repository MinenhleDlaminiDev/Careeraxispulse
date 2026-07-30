// Paystack hosted checkout — same approach as the live site: purchase buttons
// link out to a Paystack Payment Page. No keys or backend needed here.
//
// Today the whole site uses one general page. When you create dedicated
// fixed-price pages in the Paystack dashboard (CV Revamp, eBook, etc.),
// just paste their URLs below — the buttons pick them up automatically.

export const PAYSTACK_URL = 'https://paystack.shop/pay/zzvuae8ftf';

export const PAYSTACK = {
  bookService: PAYSTACK_URL, // general "Book a Service"
  cvRevamp: PAYSTACK_URL,    // replace when you make a CV Revamp page
  interview: PAYSTACK_URL,   // replace when you make an Interview page
  ebook: PAYSTACK_URL,       // replace when you make an eBook page
  xislab: PAYSTACK_URL,      // XisLab Apex subscription
};
