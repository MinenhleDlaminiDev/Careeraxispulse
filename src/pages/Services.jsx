export default function Services() {
  return (
    <>
      <section style={{ background: "linear-gradient(180deg,#131F38 0%,#26396A 100%)", color: "#F4EFE4" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "72px 32px 64px" }}>
          <div style={{ letterSpacing: ".22em", textTransform: "uppercase", fontSize: "12.5px", fontWeight: "600", color: "#C9A227", marginBottom: "16px", textAlign: "center" }}>Services &amp; pricing</div>
          <h1 style={{ fontFamily: "'Source Serif 4',serif", fontWeight: "600", fontSize: "clamp(32px,5vw,50px)", lineHeight: "1.1", margin: "0", textAlign: "center", maxWidth: "700px", marginLeft: "auto", marginRight: "auto", textWrap: "pretty" }}>Professional services, priced by <em style={{ fontStyle: "italic", color: "#C9A227" }}>where you are</em> in your career.</h1>
          <p style={{ fontSize: "17px", lineHeight: "1.65", color: "#B9C0D2", maxWidth: "560px", margin: "22px 0 0", marginLeft: "auto", marginRight: "auto", textAlign: "center" }}>CV revamps and interview readiness sessions with a 3–4 working day turnaround, subject to current capacity and scope of work.</p>
        </div>
      </section>
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "88px 32px 72px" }} id="cv">
        <div style={{ marginBottom: "44px", textAlign: "center" }}>
          <div style={{ letterSpacing: ".2em", textTransform: "uppercase", fontSize: "12px", fontWeight: "600", color: "#9A7B12", marginBottom: "12px" }}>CV Revamp</div>
          <h2 style={{ fontFamily: "'Source Serif 4',serif", fontSize: "clamp(26px,3.6vw,36px)", fontWeight: "600", margin: "0 0 12px" }}>Choose your level</h2>
          <p style={{ fontSize: "16px", color: "#56607A", margin: "0", maxWidth: "600px", lineHeight: "1.6", marginLeft: "auto", marginRight: "auto" }}>Every tier includes full CV restructuring, content refinement, and ATS-aligned formatting. Pricing reflects the depth and complexity of your experience.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: "20px", alignItems: "stretch" }}>
          <div style={{ background: "#FFFFFF", border: "1px solid #E7E2D6", borderRadius: "4px", padding: "32px 26px", display: "flex", flexDirection: "column", gap: "12px", animation: "cardUp .6s ease both", transition: "transform .25s ease, box-shadow .25s ease, border-color .25s ease" }} data-h="hv-services-0">
            <div style={{ fontSize: "12px", letterSpacing: ".14em", textTransform: "uppercase", fontWeight: "600", color: "#6B7690" }}>Entry level</div>
            <h3 style={{ fontFamily: "'Source Serif 4',serif", fontSize: "21px", fontWeight: "600", margin: "0" }}>0–2 years</h3>
            <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: "34px", fontWeight: "600" }}>R150</div>
            <ul style={{ margin: "0", padding: "0 0 0 18px", fontSize: "14.5px", color: "#56607A", lineHeight: "2", flex: "1" }}>
              <li>CV restructuring</li><li>Content refinement</li><li>ATS-aligned formatting</li>
            </ul>
            <a href="/contact" style={{ border: "1px solid #C9B98A", textAlign: "center", padding: "12px", borderRadius: "3px", fontWeight: "600", fontSize: "14.5px" }} data-h="hv-services-1">Enquire now</a>
          </div>
          <div style={{ background: "#FFFFFF", border: "1px solid #E7E2D6", borderRadius: "4px", padding: "32px 26px", display: "flex", flexDirection: "column", gap: "12px", animation: "cardUp .6s ease both", transition: "transform .25s ease, box-shadow .25s ease, border-color .25s ease" }} data-h="hv-services-2">
            <div style={{ fontSize: "12px", letterSpacing: ".14em", textTransform: "uppercase", fontWeight: "600", color: "#6B7690" }}>Mid-level</div>
            <h3 style={{ fontFamily: "'Source Serif 4',serif", fontSize: "21px", fontWeight: "600", margin: "0" }}>2–5 years</h3>
            <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: "34px", fontWeight: "600" }}>R220</div>
            <ul style={{ margin: "0", padding: "0 0 0 18px", fontSize: "14.5px", color: "#56607A", lineHeight: "2", flex: "1" }}>
              <li>CV restructuring</li><li>Content refinement</li><li>ATS-aligned formatting</li>
            </ul>
            <a href="/contact" style={{ border: "1px solid #C9B98A", textAlign: "center", padding: "12px", borderRadius: "3px", fontWeight: "600", fontSize: "14.5px" }} data-h="hv-services-3">Enquire now</a>
          </div>
          <div style={{ background: "linear-gradient(180deg,#131F38 0%,#26396A 100%)", color: "#F4EFE4", borderRadius: "4px", padding: "32px 26px", display: "flex", flexDirection: "column", gap: "12px", position: "relative", boxShadow: "0 8px 20px rgba(19,31,56,.16)", animation: "cardUp .6s ease .12s both", transition: "transform .25s ease, box-shadow .25s ease" }} data-h="hv-services-4">
            <div style={{ position: "absolute", top: "-13px", left: "50%", transform: "translateX(-50%)", background: "#C9A227", color: "#131F38", fontSize: "11.5px", fontWeight: "700", letterSpacing: ".12em", textTransform: "uppercase", padding: "5px 14px", borderRadius: "99px" }}>Most popular</div>
            <div style={{ fontSize: "12px", letterSpacing: ".14em", textTransform: "uppercase", fontWeight: "600", color: "#C9A227" }}>Senior level</div>
            <h3 style={{ fontFamily: "'Source Serif 4',serif", fontSize: "21px", fontWeight: "600", margin: "0" }}>5–10 years</h3>
            <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: "34px", fontWeight: "600" }}>R300</div>
            <ul style={{ margin: "0", padding: "0 0 0 18px", fontSize: "14.5px", color: "#B9C0D2", lineHeight: "2", flex: "1" }}>
              <li>CV restructuring</li><li>Content refinement</li><li>ATS-aligned formatting</li>
            </ul>
            <a href="/contact" style={{ background: "#C9A227", color: "#131F38", textAlign: "center", padding: "12px", borderRadius: "3px", fontWeight: "600", fontSize: "14.5px" }} data-h="hv-services-5">Enquire now</a>
          </div>
          <div style={{ background: "#FFFFFF", border: "1px solid #E7E2D6", borderRadius: "4px", padding: "32px 26px", display: "flex", flexDirection: "column", gap: "12px", animation: "cardUp .6s ease both", transition: "transform .25s ease, box-shadow .25s ease, border-color .25s ease" }} data-h="hv-services-6">
            <div style={{ fontSize: "12px", letterSpacing: ".14em", textTransform: "uppercase", fontWeight: "600", color: "#6B7690" }}>Executive</div>
            <h3 style={{ fontFamily: "'Source Serif 4',serif", fontSize: "21px", fontWeight: "600", margin: "0" }}>10+ years</h3>
            <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: "34px", fontWeight: "600" }}>R400</div>
            <ul style={{ margin: "0", padding: "0 0 0 18px", fontSize: "14.5px", color: "#56607A", lineHeight: "2", flex: "1" }}>
              <li>CV restructuring</li><li>Content refinement</li><li>ATS-aligned formatting</li>
            </ul>
            <a href="/contact" style={{ border: "1px solid #C9B98A", textAlign: "center", padding: "12px", borderRadius: "3px", fontWeight: "600", fontSize: "14.5px" }} data-h="hv-services-7">Enquire now</a>
          </div>
        </div>
        <div style={{ marginTop: "22px", fontSize: "13.5px", color: "#8A94AC" }}>Returning clients receive an 11% discount. Turnaround 3–4 working days, subject to current capacity and scope of work.</div>
      </section>
      <section style={{ background: "#FFFFFF", borderTop: "1px solid #E7E2D6", borderBottom: "1px solid #E7E2D6" }} id="interviews">
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "88px 32px" }}>
          <div style={{ marginBottom: "44px", textAlign: "center" }}>
            <div style={{ letterSpacing: ".2em", textTransform: "uppercase", fontSize: "12px", fontWeight: "600", color: "#9A7B12", marginBottom: "12px" }}>Interview readiness</div>
            <h2 style={{ fontFamily: "'Source Serif 4',serif", fontSize: "clamp(26px,3.6vw,36px)", fontWeight: "600", margin: "0 0 12px" }}>Walk in prepared</h2>
            <p style={{ fontSize: "16px", color: "#56607A", margin: "0", maxWidth: "600px", lineHeight: "1.6", marginLeft: "auto", marginRight: "auto" }}>Structured one-on-one preparation for graduate and professional-level interviews.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "20px", maxWidth: "800px", margin: "0 auto" }}>
            <div style={{ background: "#FAF7F0", border: "1px solid #E7E2D6", borderRadius: "4px", padding: "32px 28px", display: "flex", flexDirection: "column", gap: "12px", animation: "cardUp .6s ease both", transition: "transform .25s ease, box-shadow .25s ease, border-color .25s ease" }} data-h="hv-services-8">
              <div style={{ fontSize: "12px", letterSpacing: ".14em", textTransform: "uppercase", fontWeight: "600", color: "#6B7690" }}>Graduate level</div>
              <h3 style={{ fontFamily: "'Source Serif 4',serif", fontSize: "21px", fontWeight: "600", margin: "0" }}>Basic Interview Readiness</h3>
              <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: "34px", fontWeight: "600" }}>R200</div>
              <ul style={{ margin: "0", padding: "0 0 0 18px", fontSize: "14.5px", color: "#56607A", lineHeight: "2", flex: "1" }}>
                <li>Up to 45 minutes</li><li>Graduate &amp; entry-level focus</li><li>Structured preparation</li>
              </ul>
              <a href="/contact" style={{ border: "1px solid #C9B98A", textAlign: "center", padding: "12px", borderRadius: "3px", fontWeight: "600", fontSize: "14.5px" }} data-h="hv-services-9">Enquire now</a>
            </div>
            <div style={{ background: "#FAF7F0", border: "1px solid #E7E2D6", borderRadius: "4px", padding: "32px 28px", display: "flex", flexDirection: "column", gap: "12px", animation: "cardUp .6s ease both", transition: "transform .25s ease, box-shadow .25s ease, border-color .25s ease" }} data-h="hv-services-10">
              <div style={{ fontSize: "12px", letterSpacing: ".14em", textTransform: "uppercase", fontWeight: "600", color: "#6B7690" }}>Professional</div>
              <h3 style={{ fontFamily: "'Source Serif 4',serif", fontSize: "21px", fontWeight: "600", margin: "0" }}>Standard Interview Readiness</h3>
              <div style={{ fontFamily: "'Source Serif 4',serif", fontSize: "34px", fontWeight: "600" }}>R270</div>
              <ul style={{ margin: "0", padding: "0 0 0 18px", fontSize: "14.5px", color: "#56607A", lineHeight: "2", flex: "1" }}>
                <li>Up to 60 minutes</li><li>Professional-level focus</li><li>Advanced preparation</li>
              </ul>
              <a href="/contact" style={{ border: "1px solid #C9B98A", textAlign: "center", padding: "12px", borderRadius: "3px", fontWeight: "600", fontSize: "14.5px" }} data-h="hv-services-11">Enquire now</a>
            </div>
          </div>
        </div>
      </section>
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "88px 32px" }}>
        <div style={{ marginBottom: "44px", textAlign: "center" }}>
          <div style={{ letterSpacing: ".2em", textTransform: "uppercase", fontSize: "12px", fontWeight: "600", color: "#9A7B12", marginBottom: "12px" }}>Before we start</div>
          <h2 style={{ fontFamily: "'Source Serif 4',serif", fontSize: "clamp(26px,3.6vw,36px)", fontWeight: "600", margin: "0" }}>What to send us</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "24px" }}>
          <div style={{ background: "#FFFFFF", border: "1px solid #E7E2D6", borderRadius: "4px", padding: "30px 28px" }}>
            <h3 style={{ fontSize: "17px", fontWeight: "600", margin: "0 0 14px" }}>New clients</h3>
            <ul style={{ margin: "0", padding: "0 0 0 18px", fontSize: "14.5px", color: "#56607A", lineHeight: "2" }}>
              <li>Updated CV</li>
              <li>Job description or interview invitation</li>
              <li>Interview date</li>
              <li>Reference: full name and surname</li>
            </ul>
          </div>
          <div style={{ background: "#FFFFFF", border: "1px solid #E7E2D6", borderRadius: "4px", padding: "30px 28px" }}>
            <h3 style={{ fontSize: "17px", fontWeight: "600", margin: "0 0 6px" }}>Existing clients</h3>
            <div style={{ display: "inline-block", background: "#F3EBD3", color: "#8A6D14", fontSize: "12px", fontWeight: "600", padding: "4px 10px", borderRadius: "99px", marginBottom: "10px" }}>11% discount applied</div>
            <ul style={{ margin: "0", padding: "0 0 0 18px", fontSize: "14.5px", color: "#56607A", lineHeight: "2" }}>
              <li>Job description or interview invitation</li>
              <li>Interview date</li>
            </ul>
          </div>
          <div style={{ background: "#FFFFFF", border: "1px solid #E7E2D6", borderRadius: "4px", padding: "30px 28px" }}>
            <h3 style={{ fontSize: "17px", fontWeight: "600", margin: "0 0 14px" }}>Good to know</h3>
            <ul style={{ margin: "0", padding: "0 0 0 18px", fontSize: "14.5px", color: "#56607A", lineHeight: "2" }}>
              <li>Services are advisory — no placement guarantees</li>
              <li>Submit all relevant information before work begins</li>
              <li>New information after drafting may carry an additional fee</li>
            </ul>
          </div>
        </div>
      </section>
      <section style={{ background: "linear-gradient(180deg,#131F38 0%,#26396A 100%)", color: "#F4EFE4" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "72px 32px", textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Source Serif 4',serif", fontSize: "clamp(26px,3.6vw,36px)", fontWeight: "600", margin: "0 0 14px" }}>Not sure which level fits you?</h2>
          <p style={{ fontSize: "16px", color: "#B9C0D2", margin: "0 0 30px" }}>Send us a message — we'll recommend the right service for your experience and goals.</p>
          <a href="/contact" style={{ background: "#C9A227", color: "#131F38", padding: "15px 30px", borderRadius: "3px", fontWeight: "600", fontSize: "15.5px", display: "inline-block" }} data-h="hv-services-12">Get in touch</a>
        </div>
      </section>
    </>
  );
}
