import { PAYSTACK } from '../payments.js';
import { useSeo } from '../seo.js';

// Price is a placeholder until the Paystack link is finalised. Change PRICE here
// and the button labels pick it up. PAYSTACK.interview holds the checkout link.
const PRICE = 'R50';

function Feature({ icon, label }) {
  return (
    <div className="ic-feat" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "14px", padding: "14px 18px" }}>
      <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "#F3EBD3", display: "flex", alignItems: "center", justifyContent: "center", color: "#1B2A4A" }}>{icon}</div>
      <div style={{ fontSize: "14.5px", color: "#1B2A4A", lineHeight: "1.4", fontWeight: "500", maxWidth: "150px" }}>{label}</div>
    </div>
  );
}

export default function InterviewCode() {
  useSeo({
    title: 'The Axis Interview Code | Interview Readiness | CareerPulse Axis',
    description: 'The Axis Interview Code: our four winning pillars of interview readiness. One-time payment for 30-day access. Master the position, not just the questions.',
    path: '/interview-code',
  });
  return (
    <>
      {/* ===== Hero (navy — matches the rest of the site) ===== */}
      <section style={{ background: "linear-gradient(180deg,#131F38 0%,#26396A 100%)", color: "#F4EFE4" }}>
        <div style={{ maxWidth: "1240px", margin: "0 auto", padding: "72px 32px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: "56px", alignItems: "center" }}>
          <div style={{ animation: "fadeUp .7s ease both" }}>
            <div style={{ letterSpacing: ".22em", textTransform: "uppercase", fontSize: "12.5px", fontWeight: "600", color: "#C9A227", marginBottom: "18px" }}>Interview readiness</div>
            <h1 style={{ fontFamily: "'Source Serif 4',serif", fontWeight: "600", fontSize: "clamp(40px,6vw,68px)", lineHeight: "1.04", margin: "0", textWrap: "pretty" }}>
              <span style={{ color: "#F4EFE4" }}>The Axis</span><br />
              <span style={{ color: "#C9A227" }}>Interview Code.</span>
            </h1>
            <p style={{ fontFamily: "'Source Serif 4',serif", fontSize: "clamp(20px,2.6vw,26px)", color: "#F4EFE4", fontWeight: "500", margin: "18px 0 4px", lineHeight: "1.3" }}>Our Four Winning Pillars of Interview Readiness.</p>
            <p style={{ fontSize: "17px", color: "#B9C0D2", margin: "0 0 32px" }}>Beyond the Questions.</p>

            {/* Price card */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: "22px", background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.16)", borderRadius: "4px", padding: "20px 28px", marginBottom: "28px" }}>
              <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: "44px", fontWeight: "600", color: "#F4EFE4", lineHeight: "1" }}>{PRICE}</div>
              <div style={{ width: "1px", alignSelf: "stretch", background: "rgba(201,162,39,.55)" }}></div>
              <div>
                <div style={{ fontSize: "17px", fontWeight: "600", color: "#F4EFE4" }}>30-day access</div>
                <div style={{ fontSize: "13.5px", color: "#9FB0C9", marginTop: "4px" }}>One-time payment. No automatic renewal.</div>
              </div>
            </div>

            <div>
              <a href={PAYSTACK.interview} style={{ display: "inline-block", background: "#C9A227", color: "#131F38", padding: "16px 40px", borderRadius: "3px", fontWeight: "600", fontSize: "16px" }} data-h="hv-interview-0">Get Access for {PRICE} →</a>
            </div>
          </div>

          {/* Right visual */}
          <div style={{ aspectRatio: "4/3", borderRadius: "4px", overflow: "hidden", boxShadow: "0 16px 40px rgba(0,0,0,.35)" }}>
            <img src="/assets/interview-code-hero.jpg" alt="A professional preparing for an interview at her desk" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }} />
          </div>
        </div>
      </section>

      {/* ===== Feature strip ===== */}
      <section style={{ background: "#FFFFFF", borderBottom: "1px solid #E7E2D6" }}>
        <div className="ic-features" style={{ maxWidth: "1240px", margin: "0 auto", padding: "40px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: "8px", justifyItems: "center" }}>
          <Feature label="Proven preparation approach" icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1B2A4A" strokeWidth="1.6"><circle cx="12" cy="12" r="3.2"></circle><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.2 5.2l2.1 2.1M16.7 16.7l2.1 2.1M18.8 5.2l-2.1 2.1M7.3 16.7l-2.1 2.1"></path></svg>
          } />
          <Feature label="Online access for 30 days" icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1B2A4A" strokeWidth="1.6"><rect x="5" y="11" width="14" height="9" rx="2"></rect><path d="M8 11V8a4 4 0 0 1 8 0v3"></path></svg>
          } />
          <Feature label="Access from your phone or computer" icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1B2A4A" strokeWidth="1.6"><rect x="3" y="5" width="18" height="11" rx="1.5"></rect><path d="M2 20h20"></path></svg>
          } />
          <Feature label="Based on real interview expectations" icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1B2A4A" strokeWidth="1.6"><circle cx="12" cy="8" r="3.6"></circle><path d="M5.5 20a6.5 6.5 0 0 1 13 0"></path></svg>
          } />
          <Feature label="Return anytime during your 30 days" icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1B2A4A" strokeWidth="1.6"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3.5 2"></path></svg>
          } />
        </div>
      </section>

      {/* ===== Prepare with Purpose band ===== */}
      <section style={{ background: "linear-gradient(180deg,#131F38 0%,#1B2A4A 100%)", color: "#F4EFE4" }}>
        <div style={{ maxWidth: "1240px", margin: "0 auto", padding: "56px 32px", display: "flex", flexWrap: "wrap", gap: "28px 48px", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ borderLeft: "3px solid #C9A227", paddingLeft: "24px", maxWidth: "640px" }}>
            <h2 style={{ fontFamily: "'Source Serif 4',serif", fontSize: "clamp(26px,3.6vw,38px)", fontWeight: "600", margin: "0 0 10px" }}>Prepare with Purpose.</h2>
            <p style={{ fontSize: "16px", color: "#B9C0D2", margin: "0", lineHeight: "1.6" }}>Get access to The Axis Interview Code and build your interview readiness the right way.</p>
          </div>
          <a href={PAYSTACK.interview} style={{ display: "inline-block", background: "#C9A227", color: "#131F38", padding: "16px 36px", borderRadius: "3px", fontWeight: "600", fontSize: "16px", whiteSpace: "nowrap" }} data-h="hv-interview-1">Get Access for {PRICE} →</a>
        </div>
      </section>
    </>
  );
}
