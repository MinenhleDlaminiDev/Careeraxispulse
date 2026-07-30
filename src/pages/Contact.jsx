import { PAYSTACK } from '../payments.js';

export default function Contact() {
  return (
    <>
      <section style={{ background: "linear-gradient(180deg,#131F38 0%,#26396A 100%)", color: "#F4EFE4" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "72px 32px 64px" }}>
          <div style={{ letterSpacing: ".22em", textTransform: "uppercase", fontSize: "12.5px", fontWeight: "600", color: "#C9A227", marginBottom: "16px", textAlign: "center" }}>Contact &amp; booking</div>
          <h1 style={{ fontFamily: "'Source Serif 4',serif", fontWeight: "600", fontSize: "clamp(32px,5vw,50px)", lineHeight: "1.1", margin: "0", textAlign: "center", maxWidth: "680px", marginLeft: "auto", marginRight: "auto", textWrap: "pretty" }}>Booking a service takes <em style={{ fontStyle: "italic", color: "#C9A227" }}>three steps</em>.</h1>
          <p style={{ fontSize: "17px", lineHeight: "1.65", color: "#B9C0D2", maxWidth: "540px", margin: "22px 0 0", marginLeft: "auto", marginRight: "auto", textAlign: "center" }}>Reach out, make your payment, and send your documents. We'll take it from there.</p>
        </div>
      </section>
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "88px 32px 72px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "24px" }}>
          <div style={{ background: "#FFFFFF", border: "1px solid #E7E2D6", borderRadius: "4px", padding: "34px 30px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: "clamp(28px,4vw,40px)", fontWeight: "600", color: "#C9A227" }}>01</div>
            <h3 style={{ fontFamily: "'Source Serif 4',serif", fontSize: "21px", fontWeight: "600", margin: "0" }}>Reach out</h3>
            <p style={{ fontSize: "14.5px", lineHeight: "1.65", color: "#56607A", margin: "0", flex: "1" }}>Message us on WhatsApp or email with the service you'd like and your experience level. We'll confirm the price and turnaround.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <a href="https://wa.me/27710203982" style={{ background: "#C9A227", color: "#131F38", textAlign: "center", padding: "12px", borderRadius: "3px", fontWeight: "600", fontSize: "14.5px" }} data-h="hv-contact-0">WhatsApp 071 020 3982</a>
              <a href="mailto:sinovuyo.mgogo@careerpulseaxis.co.za" style={{ border: "1px solid #C9B98A", textAlign: "center", padding: "12px", borderRadius: "3px", fontWeight: "600", fontSize: "14.5px" }} data-h="hv-contact-1">Email Sinovuyo</a>
            </div>
          </div>
          <div style={{ background: "#FFFFFF", border: "1px solid #E7E2D6", borderRadius: "4px", padding: "34px 30px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: "clamp(28px,4vw,40px)", fontWeight: "600", color: "#C9A227" }}>02</div>
            <h3 style={{ fontFamily: "'Source Serif 4',serif", fontSize: "21px", fontWeight: "600", margin: "0" }}>Make payment</h3>
            <p style={{ fontSize: "14.5px", lineHeight: "1.65", color: "#56607A", margin: "0" }}>Pay via EFT using the details below. Use your <strong>full name and surname</strong> as the payment reference.</p>
            <div style={{ background: "#FAF7F0", border: "1px solid #E7E2D6", borderRadius: "4px", padding: "18px 20px", display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px", flex: "1" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}><span style={{ color: "#8A94AC" }}>Account name</span><span style={{ fontWeight: "600" }}>CareerPulse Axis</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}><span style={{ color: "#8A94AC" }}>Bank</span><span style={{ fontWeight: "600" }}>First National Bank (FNB)</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}><span style={{ color: "#8A94AC" }}>Account number</span><span style={{ fontWeight: "600", fontFamily: "monospace", fontSize: "15px" }}>63197182694</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}><span style={{ color: "#8A94AC" }}>Reference</span><span style={{ fontWeight: "600" }}>Your full name</span></div>
            </div>
            <div style={{ fontSize: "13px", color: "#8A94AC" }}>XisLab Apex subscriptions are paid securely via <a href={PAYSTACK.bookService} style={{ color: "#C9A227", fontWeight: "600" }}>Paystack</a>.</div>
          </div>
          <div style={{ background: "#FFFFFF", border: "1px solid #E7E2D6", borderRadius: "4px", padding: "34px 30px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: "clamp(28px,4vw,40px)", fontWeight: "600", color: "#C9A227" }}>03</div>
            <h3 style={{ fontFamily: "'Source Serif 4',serif", fontSize: "21px", fontWeight: "600", margin: "0" }}>Send your documents</h3>
            <p style={{ fontSize: "14.5px", lineHeight: "1.65", color: "#56607A", margin: "0" }}>Share proof of payment along with:</p>
            <ul style={{ margin: "0", padding: "0 0 0 18px", fontSize: "14.5px", color: "#56607A", lineHeight: "2", flex: "1" }}>
              <li>Your updated CV</li>
              <li>Job description or interview invitation</li>
              <li>Interview date (for readiness sessions)</li>
              <li>Experience, responsibilities &amp; certifications</li>
            </ul>
            <div style={{ fontSize: "13px", color: "#8A94AC" }}>Turnaround: 3–4 working days, subject to capacity and scope.</div>
          </div>
        </div>
      </section>
      <section style={{ background: "#FFFFFF", borderTop: "1px solid #E7E2D6" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto", padding: "72px 32px", textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Source Serif 4',serif", fontSize: "30px", fontWeight: "600", margin: "0 0 14px" }}>Prefer to talk it through first?</h2>
          <p style={{ fontSize: "15.5px", color: "#56607A", lineHeight: "1.7", margin: "0 0 28px" }}>Not sure which service or level fits you? Send a WhatsApp message — Sinovuyo will recommend the right option for your experience and goals, no obligation.</p>
          <a href="https://wa.me/27710203982" style={{ background: "#C9A227", color: "#131F38", padding: "15px 30px", borderRadius: "3px", fontWeight: "600", fontSize: "15.5px", display: "inline-block" }} data-h="hv-contact-2">Start a WhatsApp chat</a>
        </div>
      </section>
    </>
  );
}
