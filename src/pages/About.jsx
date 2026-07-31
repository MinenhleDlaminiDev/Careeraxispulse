import { useSeo } from '../seo.js';

export default function About() {
  useSeo({
    title: 'About & Founder Sinovuyo Mgogo | CareerPulse Axis',
    description: 'CareerPulse Axis helps you approach every opportunity with purpose — professional CV writing, interview readiness, and career guidance.',
    path: '/about',
  });
  return (
    <>
      <section style={{ background: "linear-gradient(180deg,#131F38 0%,#26396A 100%)", color: "#F4EFE4" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "72px 32px 64px" }}>
          <div style={{ letterSpacing: ".22em", textTransform: "uppercase", fontSize: "12.5px", fontWeight: "600", color: "#C9A227", marginBottom: "16px", textAlign: "center" }}>About CareerPulse Axis</div>
          <h1 style={{ fontFamily: "'Source Serif 4',serif", fontWeight: "600", fontSize: "clamp(32px,5vw,50px)", lineHeight: "1.1", margin: "0", textAlign: "center", maxWidth: "720px", marginLeft: "auto", marginRight: "auto", textWrap: "pretty" }}>Career-aligned. Structured. <em style={{ fontStyle: "italic", color: "#C9A227" }}>Intentional.</em></h1>
          <p style={{ fontSize: "17px", lineHeight: "1.65", color: "#B9C0D2", maxWidth: "560px", margin: "22px 0 0", marginLeft: "auto", marginRight: "auto", textAlign: "center" }}>We help you approach every opportunity with purpose — not by promising outcomes, but by equipping you with clarity, structure, and confidence.</p>
        </div>
      </section>
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "88px 32px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "64px", alignItems: "start" }}>
        <div style={{ width: "100%", maxWidth: "380px", aspectRatio: "4/5", position: "relative", justifySelf: "center" }}>
          <img src="/assets/Sino-Founder.jpg" alt="Sinovuyo Mgogo — Founder of CareerPulse Axis" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "left center", borderRadius: "4px", display: "block" }} />
        </div>
        <div>
          <div style={{ letterSpacing: ".2em", textTransform: "uppercase", fontSize: "12px", fontWeight: "600", color: "#9A7B12", marginBottom: "14px" }}>The founder</div>
          <h2 style={{ fontFamily: "'Source Serif 4',serif", fontSize: "clamp(26px,3.6vw,36px)", fontWeight: "600", margin: "0 0 20px" }}>Sinovuyo Mgogo</h2>
          <p style={{ fontSize: "16px", lineHeight: "1.7", color: "#56607A", margin: "0 0 16px" }}>CareerPulse Axis was founded on a simple observation: most applications fail before they're ever read — not because candidates lack ability, but because their CVs and applications aren't aligned with what the role actually asks for.</p>
          <p style={{ fontSize: "16px", lineHeight: "1.7", color: "#56607A", margin: "0 0 16px" }}>Sinovuyo built CareerPulse Axis to close that gap: professional CV writing, structured interview preparation, and ongoing employability guidance — all following a clear, intentional process designed for consistent results.</p>
          <p style={{ fontSize: "16px", lineHeight: "1.7", color: "#56607A", margin: "0 0 28px" }}>Whether you're a graduate entering the market or an executive repositioning your career, every engagement is tailored to your level, industry, and goals.</p>
          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
            <a href="/contact" style={{ background: "#C9A227", color: "#131F38", padding: "13px 26px", borderRadius: "3px", fontWeight: "600", fontSize: "15px" }} data-h="hv-about-0">Work with us</a>
            <a href="https://wa.me/27710203982" style={{ border: "1px solid #C9B98A", padding: "13px 26px", borderRadius: "3px", fontWeight: "600", fontSize: "15px" }} data-h="hv-about-1">WhatsApp Sinovuyo</a>
          </div>
        </div>
      </section>
      <section style={{ background: "#FFFFFF", borderTop: "1px solid #E7E2D6", borderBottom: "1px solid #E7E2D6" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "88px 32px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "24px" }}>
            <div style={{ background: "#FAF7F0", border: "1px solid #E7E2D6", borderRadius: "4px", padding: "34px 32px" }}>
              <h3 style={{ fontFamily: "'Source Serif 4',serif", fontSize: "22px", fontWeight: "600", margin: "0 0 12px" }}>Our approach</h3>
              <p style={{ fontSize: "15px", lineHeight: "1.7", color: "#56607A", margin: "0" }}>Professional CV writing, interview readiness, and structured employability guidance built to help you approach every opportunity with purpose. Every service follows a clear, intentional process designed to strengthen your position in the job market.</p>
            </div>
            <div style={{ background: "#FAF7F0", border: "1px solid #E7E2D6", borderRadius: "4px", padding: "34px 32px" }}>
              <h3 style={{ fontFamily: "'Source Serif 4',serif", fontSize: "22px", fontWeight: "600", margin: "0 0 12px" }}>What sets us apart</h3>
              <p style={{ fontSize: "15px", lineHeight: "1.7", color: "#56607A", margin: "0" }}>Our services are advisory: we equip you with the tools and guidance to navigate the job market effectively. We don't guarantee interviews or placement — we empower you to present your best self with clarity and confidence.</p>
            </div>
            <div style={{ background: "#FAF7F0", border: "1px solid #E7E2D6", borderRadius: "4px", padding: "34px 32px" }}>
              <h3 style={{ fontFamily: "'Source Serif 4',serif", fontSize: "22px", fontWeight: "600", margin: "0 0 12px" }}>Our commitment to your privacy</h3>
              <p style={{ fontSize: "15px", lineHeight: "1.7", color: "#56607A", margin: "0" }}>All information collected is used strictly for delivering services, processing payments, and communicating with you. Your data is treated as confidential and will never be shared with third parties without your consent.</p>
            </div>
            <div style={{ background: "#FAF7F0", border: "1px solid #E7E2D6", borderRadius: "4px", padding: "34px 32px" }}>
              <h3 style={{ fontFamily: "'Source Serif 4',serif", fontSize: "22px", fontWeight: "600", margin: "0 0 12px" }}>What we need from you</h3>
              <p style={{ fontSize: "15px", lineHeight: "1.7", color: "#56607A", margin: "0" }}>Please submit all relevant information — experience, responsibilities, and certifications — before work begins. Significant new information submitted after the first draft may carry an additional fee.</p>
            </div>
          </div>
        </div>
      </section>
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "88px 32px", textAlign: "center" }}>
        <h2 style={{ fontFamily: "'Source Serif 4',serif", fontSize: "clamp(26px,3.8vw,38px)", fontWeight: "600", margin: "0 0 16px" }}>Let's position your career.</h2>
        <p style={{ fontSize: "16px", color: "#56607A", margin: "0 0 32px" }}>Questions about which service fits? We'll point you in the right direction.</p>
        <a href="/contact" style={{ background: "#C9A227", color: "#131F38", padding: "15px 30px", borderRadius: "3px", fontWeight: "600", fontSize: "15.5px", display: "inline-block" }} data-h="hv-about-2">Get in touch</a>
      </section>
    </>
  );
}
