import { PAYSTACK } from '../payments.js';

export default function Home() {
  return (
    <>
      <section style={{ background: "linear-gradient(180deg,#0E1830 0%,#1E3054 100%)", position: "relative" }}>
        <img src="/assets/banner.jpeg" alt="CareerPulse Axis — Align. Elevate. Thrive. Founder Sinovuyo Mgogo" style={{ display: "block", width: "100%", height: "auto" }} />
        <div style={{ position: "absolute", left: "0", right: "0", bottom: "0", height: "120px", background: "linear-gradient(to bottom, rgba(14,24,48,0), #0E1830)", pointerEvents: "none" }}></div>
      </section>
      <section style={{ background: "linear-gradient(180deg,#0E1830 0%,#1E3054 100%)", color: "#F4EFE4", position: "relative", overflow: "hidden" }}>
        <div style={{ maxWidth: "1240px", margin: "0 auto", padding: "28px 32px 84px", position: "relative", textAlign: "center", animation: "fadeUp .7s ease both" }}>
          <h1 style={{ fontFamily: "'Source Serif 4',serif", fontWeight: "600", fontSize: "clamp(34px,5.5vw,56px)", lineHeight: "1.1", margin: "0 auto", maxWidth: "820px", textWrap: "pretty" }}><span style={{ display: "inline-block", animation: "wordUp .6s cubic-bezier(.2,.7,.2,1) 0s both" }}>Position</span> <span style={{ display: "inline-block", animation: "wordUp .6s cubic-bezier(.2,.7,.2,1) 0.08s both" }}>your</span> <span style={{ display: "inline-block", animation: "wordUp .6s cubic-bezier(.2,.7,.2,1) 0.16s both" }}>career</span> <span style={{ display: "inline-block", animation: "wordUp .6s cubic-bezier(.2,.7,.2,1) 0.24s both" }}>with</span> <span style={{ display: "inline-block", fontStyle: "italic", color: "#C9A227", animation: "wordUp .6s cubic-bezier(.2,.7,.2,1) 0.32s both" }}>clarity</span> <span style={{ display: "inline-block", animation: "wordUp .6s cubic-bezier(.2,.7,.2,1) 0.4s both" }}>and</span> <span style={{ display: "inline-block", fontStyle: "italic", color: "#C9A227", animation: "wordUp .6s cubic-bezier(.2,.7,.2,1) 0.48s both" }}>intent.</span></h1>
          <p style={{ fontSize: "18px", lineHeight: "1.65", color: "#B9C0D2", maxWidth: "580px", margin: "24px auto 38px" }}>Professional CV writing, interview readiness, and structured employability guidance — built to help you approach every opportunity with purpose.</p>
          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", justifyContent: "center" }}>
            <a href={PAYSTACK.cvRevamp} style={{ background: "#C9A227", color: "#131F38", padding: "16px 30px", borderRadius: "3px", fontWeight: "600", fontSize: "15.5px" }} data-h="hv-home-0">Book a CV Revamp — from R150</a>
            <a href="/xislab" style={{ border: "1px solid #3C4B6E", color: "#F4EFE4", padding: "16px 30px", borderRadius: "3px", fontWeight: "600", fontSize: "15.5px" }} data-h="hv-home-1">Join XisLab — R199/mo</a>
          </div>
          <svg viewBox="0 0 1200 90" style={{ width: "100%", marginTop: "56px", opacity: ".9" }} preserveAspectRatio="none">
            <polyline points="0,45 340,45 380,45 400,12 420,74 440,26 455,45 560,45 640,45 660,20 680,68 695,45 900,45 940,45 960,32 975,58 990,45 1200,45" fill="none" stroke="#C9A227" strokeWidth="2" strokeDasharray="1400" style={{ animation: "pulseDraw 3.2s ease-out both" }}></polyline>
          </svg>
        </div>
      </section>
      <section style={{ background: "#C9A227", overflow: "hidden", padding: "14px 0" }}>
        <div style={{ display: "flex", gap: "0", width: "max-content", animation: "marquee 28s linear infinite" }}>
          <div style={{ display: "flex", gap: "56px", paddingRight: "56px", fontSize: "13px", fontWeight: "700", letterSpacing: ".2em", textTransform: "uppercase", color: "#131F38", whiteSpace: "nowrap" }}>
            <span>ATS-aligned formatting</span><span>✦</span><span>3–4 day turnaround</span><span>✦</span><span>11% returning client discount</span><span>✦</span><span>Align. Elevate. Thrive.</span><span>✦</span><span>Graduate to executive</span><span>✦</span>
          </div>
          <div style={{ display: "flex", gap: "56px", paddingRight: "56px", fontSize: "13px", fontWeight: "700", letterSpacing: ".2em", textTransform: "uppercase", color: "#131F38", whiteSpace: "nowrap" }}>
            <span>ATS-aligned formatting</span><span>✦</span><span>3–4 day turnaround</span><span>✦</span><span>11% returning client discount</span><span>✦</span><span>Align. Elevate. Thrive.</span><span>✦</span><span>Graduate to executive</span><span>✦</span>
          </div>
        </div>
      </section>
      <section style={{ maxWidth: "1240px", margin: "0 auto", padding: "100px 32px 90px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "32px 64px", marginBottom: "64px", alignItems: "end" }}>
          <div>
            <div style={{ letterSpacing: ".2em", textTransform: "uppercase", fontSize: "12px", fontWeight: "600", color: "#9A7B12", marginBottom: "14px" }}>What we offer</div>
            <h2 style={{ fontFamily: "'Source Serif 4',serif", fontSize: "clamp(28px,4vw,42px)", fontWeight: "600", margin: "0", lineHeight: "1.15" }}>Three ways to strengthen your position</h2>
          </div>
          <p style={{ fontSize: "16px", color: "#56607A", lineHeight: "1.7", margin: "0", maxWidth: "520px", justifySelf: "end" }}>Every service follows a clear, intentional process — no templates, no guesswork. Priced for the South African market, from graduate to executive.</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <a href="/services" style={{ display: "flex", flexWrap: "wrap", gap: "24px 32px", alignItems: "center", padding: "36px 8px", borderTop: "1px solid #E0D9C7" }} data-h="hv-home-2">
            <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: "52px", fontWeight: "600", color: "#C9A227", flex: "0 0 90px" }}>01</div>
            <div style={{ flex: "1 1 220px" }}>
              <h3 style={{ fontFamily: "'Source Serif 4',serif", fontSize: "26px", fontWeight: "600", margin: "0 0 6px" }}>CV Revamp</h3>
              <div style={{ fontSize: "13px", letterSpacing: ".14em", textTransform: "uppercase", fontWeight: "600", color: "#6B7690" }}>Most booked · from R150</div>
            </div>
            <p style={{ fontSize: "15px", lineHeight: "1.65", color: "#56607A", margin: "0", flex: "2 1 300px" }}>Full restructuring, content refinement, and ATS-aligned formatting — priced by your experience level, from entry to executive.</p>
            <div style={{ fontSize: "22px", color: "#C9A227", marginLeft: "auto" }}>→</div>
          </a>
          <a href="/services#interviews" style={{ display: "flex", flexWrap: "wrap", gap: "24px 32px", alignItems: "center", padding: "36px 8px", borderTop: "1px solid #E0D9C7" }} data-h="hv-home-3">
            <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: "52px", fontWeight: "600", color: "#C9A227", flex: "0 0 90px" }}>02</div>
            <div style={{ flex: "1 1 220px" }}>
              <h3 style={{ fontFamily: "'Source Serif 4',serif", fontSize: "26px", fontWeight: "600", margin: "0 0 6px" }}>Interview Readiness</h3>
              <div style={{ fontSize: "13px", letterSpacing: ".14em", textTransform: "uppercase", fontWeight: "600", color: "#6B7690" }}>One-on-one · from R200</div>
            </div>
            <p style={{ fontSize: "15px", lineHeight: "1.65", color: "#56607A", margin: "0", flex: "2 1 300px" }}>Structured 45–60 minute sessions that prepare you for graduate and professional-level interviews.</p>
            <div style={{ fontSize: "22px", color: "#C9A227", marginLeft: "auto" }}>→</div>
          </a>
          <a href="/xislab" style={{ display: "flex", flexWrap: "wrap", gap: "24px 32px", alignItems: "center", padding: "36px 8px", borderTop: "1px solid #E0D9C7", borderBottom: "1px solid #E0D9C7" }} data-h="hv-home-4">
            <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: "52px", fontWeight: "600", color: "#C9A227", flex: "0 0 90px" }}>03</div>
            <div style={{ flex: "1 1 220px" }}>
              <h3 style={{ fontFamily: "'Source Serif 4',serif", fontSize: "26px", fontWeight: "600", margin: "0 0 6px" }}>XisLab Apex</h3>
              <div style={{ fontSize: "13px", letterSpacing: ".14em", textTransform: "uppercase", fontWeight: "600", color: "#6B7690" }}>Membership · R199/mo</div>
            </div>
            <p style={{ fontSize: "15px", lineHeight: "1.65", color: "#56607A", margin: "0", flex: "2 1 300px" }}>Weekly live sessions, hiring insights, and up to 5 role-specific CV alignment reviews every month.</p>
            <div style={{ fontSize: "22px", color: "#C9A227", marginLeft: "auto" }}>→</div>
          </a>
        </div>
      </section>
      <section style={{ background: "#FFFFFF", borderTop: "1px solid #E7E2D6", borderBottom: "1px solid #E7E2D6" }}>
        <div style={{ maxWidth: "1240px", margin: "0 auto", padding: "92px 32px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "56px" }}>
            <div>
              <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: "clamp(48px,7vw,76px)", fontWeight: "600", color: "#1B2A4A", lineHeight: "1" }}>3–4</div>
              <div style={{ height: "3px", width: "44px", background: "#C9A227", margin: "18px 0" }}></div>
              <h3 style={{ fontSize: "17px", fontWeight: "600", margin: "0 0 8px" }}>Working day turnaround</h3>
              <p style={{ fontSize: "14.5px", lineHeight: "1.65", color: "#56607A", margin: "0" }}>Subject to current capacity and scope of work — you'll always know before we start.</p>
            </div>
            <div>
              <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: "clamp(48px,7vw,76px)", fontWeight: "600", color: "#1B2A4A", lineHeight: "1" }}>ATS</div>
              <div style={{ height: "3px", width: "44px", background: "#C9A227", margin: "18px 0" }}></div>
              <h3 style={{ fontSize: "17px", fontWeight: "600", margin: "0 0 8px" }}>Aligned on every CV</h3>
              <p style={{ fontSize: "14.5px", lineHeight: "1.65", color: "#56607A", margin: "0" }}>Formatted to pass applicant tracking systems before a human ever reads it.</p>
            </div>
            <div>
              <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: "clamp(48px,7vw,76px)", fontWeight: "600", color: "#1B2A4A", lineHeight: "1" }}>11%</div>
              <div style={{ height: "3px", width: "44px", background: "#C9A227", margin: "18px 0" }}></div>
              <h3 style={{ fontSize: "17px", fontWeight: "600", margin: "0 0 8px" }}>Returning client discount</h3>
              <p style={{ fontSize: "14.5px", lineHeight: "1.65", color: "#56607A", margin: "0" }}>Career positioning is ongoing — loyal clients pay less every time they come back.</p>
            </div>
          </div>
        </div>
      </section>
      <section style={{ maxWidth: "1240px", margin: "0 auto", padding: "92px 32px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "64px", alignItems: "center" }}>
        <div style={{ width: "100%", maxWidth: "380px", aspectRatio: "4/5", position: "relative", justifySelf: "center" }}>
          <img src="/assets/Sino.jpg" alt="Sinovuyo Mgogo — Founder of CareerPulse Axis" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "4px", display: "block" }} />
        </div>
        <div>
          <div style={{ letterSpacing: ".2em", textTransform: "uppercase", fontSize: "12px", fontWeight: "600", color: "#9A7B12", marginBottom: "14px" }}>Meet the founder</div>
          <h2 style={{ fontFamily: "'Source Serif 4',serif", fontSize: "clamp(26px,3.8vw,38px)", fontWeight: "600", margin: "0 0 20px", textWrap: "pretty" }}>Guidance from someone who reads the market, not just the CV.</h2>
          <p style={{ fontSize: "16px", lineHeight: "1.7", color: "#56607A", margin: "0 0 16px" }}>Sinovuyo Mgogo founded CareerPulse Axis on a simple conviction: most applications fail before they're read — because they aren't aligned with what the role actually asks for.</p>
          <p style={{ fontSize: "16px", lineHeight: "1.7", color: "#56607A", margin: "0 0 28px" }}>Every service follows a structured, intentional process designed to strengthen your position — whether you're a graduate entering the market or an executive repositioning your career.</p>
          <a href="/about" style={{ color: "#C9A227", fontWeight: "600", fontSize: "15px" }}>Read the full story →</a>
        </div>
      </section>
      <section style={{ background: "linear-gradient(180deg,#131F38 0%,#26396A 100%)", color: "#F4EFE4" }}>
        <div style={{ maxWidth: "1240px", margin: "0 auto", padding: "92px 32px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: "56px", alignItems: "start" }}>
            <div>
              <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: "130px", fontWeight: "600", color: "#C9A227", lineHeight: ".6", marginBottom: "8px" }}>“</div>
              <blockquote style={{ margin: "0", fontFamily: "'Source Serif 4',serif", fontSize: "31px", lineHeight: "1.4", fontWeight: "400", color: "#F4EFE4", textWrap: "pretty" }}>My CV went from being ignored to landing me three interviews in two weeks. The structure and wording made all the difference.</blockquote>
              <div style={{ marginTop: "26px", fontSize: "14px", color: "#8A94AC" }}><span style={{ color: "#C9A227", letterSpacing: "2px" }}>★★★★★</span> &nbsp; CV Revamp client — Mid-level</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ borderLeft: "2px solid #C9A227", paddingLeft: "22px" }}>
                <blockquote style={{ margin: "0", fontSize: "15px", lineHeight: "1.65", color: "#D9DEEA" }}>"The interview readiness session gave me a clear framework. I walked in prepared for every question."</blockquote>
                <div style={{ marginTop: "10px", fontSize: "13px", color: "#8A94AC" }}>Interview Readiness — Graduate</div>
              </div>
              <div style={{ borderLeft: "2px solid #C9A227", paddingLeft: "22px" }}>
                <blockquote style={{ margin: "0", fontSize: "15px", lineHeight: "1.65", color: "#D9DEEA" }}>"XisLab's weekly sessions changed how I read job adverts. I now tailor every application — and it shows."</blockquote>
                <div style={{ marginTop: "10px", fontSize: "13px", color: "#8A94AC" }}>XisLab Apex member</div>
              </div>
              <div style={{ fontSize: "13.5px", color: "#8A94AC", paddingLeft: "24px" }}>All feedback from verified clients.</div>
            </div>
          </div>
        </div>
      </section>
      <section style={{ maxWidth: "1240px", margin: "0 auto", padding: "100px 32px", textAlign: "center" }}>
        <h2 style={{ fontFamily: "'Source Serif 4',serif", fontSize: "clamp(30px,4.5vw,46px)", fontWeight: "600", margin: "0 0 18px", textWrap: "pretty" }}>Ready to position your career?</h2>
        <p style={{ fontSize: "17px", color: "#56607A", maxWidth: "520px", margin: "0 auto 36px", lineHeight: "1.6" }}>Start with a CV revamp, book an interview session, or join XisLab Apex for ongoing support.</p>
        <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
          <a href={PAYSTACK.bookService} style={{ background: "#C9A227", color: "#131F38", padding: "16px 32px", borderRadius: "3px", fontWeight: "600", fontSize: "15.5px" }} data-h="hv-home-5">Book a Service</a>
          <a href="/contact" style={{ border: "1px solid #C9B98A", color: "#1B2A4A", padding: "16px 32px", borderRadius: "3px", fontWeight: "600", fontSize: "15.5px" }} data-h="hv-home-6">Contact Us</a>
        </div>
      </section>
    </>
  );
}
