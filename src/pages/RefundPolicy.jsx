import { useSeo } from '../seo.js';

export default function RefundPolicy() {
  useSeo({
    title: 'Refund Policy | CareerPulse Axis',
    description: 'Read the CareerPulse Axis refund policy for CV writing, interview readiness, and membership services.',
    path: '/refund-policy',
  });
  return (
    <>
      <section style={{ background: "linear-gradient(180deg,#131F38 0%,#26396A 100%)", color: "#F4EFE4" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "64px 32px 56px" }}>
          <div style={{ letterSpacing: ".22em", textTransform: "uppercase", fontSize: "12.5px", fontWeight: "600", color: "#C9A227", marginBottom: "16px", textAlign: "center" }}>Policy</div>
          <h1 style={{ fontFamily: "'Source Serif 4',serif", fontWeight: "600", fontSize: "clamp(30px,4.5vw,44px)", lineHeight: "1.1", margin: "0", textAlign: "center" }}>Refund Policy</h1>
          <p style={{ fontSize: "16px", lineHeight: "1.65", color: "#B9C0D2", maxWidth: "560px", margin: "18px 0 0", marginLeft: "auto", marginRight: "auto", textAlign: "center" }}>CareerPulse Axis is committed to delivering professional, structured and value-driven services.</p>
        </div>
      </section>
      <section style={{ maxWidth: "860px", margin: "0 auto", padding: "72px 32px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          <div style={{ background: "#FFFFFF", border: "1px solid #E7E2D6", borderRadius: "4px", padding: "36px 34px" }}>
            <h2 style={{ fontFamily: "'Source Serif 4',serif", fontSize: "24px", fontWeight: "600", margin: "0 0 8px" }}>When refunds may be considered</h2>
            <p style={{ fontSize: "14.5px", color: "#56607A", lineHeight: "1.65", margin: "0 0 16px" }}>Refund requests will only be considered where CareerPulse Axis is unable to fulfil its service obligations or where a material service delivery failure has occurred:</p>
            <ul style={{ margin: "0", padding: "0 0 0 20px", fontSize: "14.5px", color: "#56607A", lineHeight: "1.9" }}>
              <li>A payment has been made for a service that CareerPulse Axis is unable to provide</li>
              <li>A duplicate payment has been processed for the same service</li>
              <li>CareerPulse Axis is unable to commence or complete the agreed service due to internal operational limitations</li>
              <li>A material error in service delivery has occurred and cannot reasonably be rectified</li>
            </ul>
          </div>
          <div style={{ background: "#FFFFFF", border: "1px solid #E7E2D6", borderRadius: "4px", padding: "36px 34px" }}>
            <h2 style={{ fontFamily: "'Source Serif 4',serif", fontSize: "24px", fontWeight: "600", margin: "0 0 16px" }}>When refunds will not be granted</h2>
            <ul style={{ margin: "0", padding: "0 0 0 20px", fontSize: "14.5px", color: "#56607A", lineHeight: "1.9" }}>
              <li>The client changes their mind after payment has been made</li>
              <li>The client no longer requires the service after work has commenced</li>
              <li>The client is dissatisfied with interview, assessment, recruitment or employment outcomes</li>
              <li>The client does not receive interviews, assessments or employment offers</li>
              <li>The client disagrees with professional recommendations, advice or guidance provided</li>
              <li>The client fails to provide complete, accurate or relevant information required for service delivery</li>
              <li>The service has been delivered, substantially completed or finalised</li>
              <li>Digital products have been delivered, accessed, downloaded or made available to the client</li>
              <li>Subscription fees relating to completed billing periods</li>
              <li>Outcomes, opportunities or results fall outside the client's personal expectations</li>
            </ul>
          </div>
          <div style={{ background: "linear-gradient(180deg,#131F38 0%,#26396A 100%)", color: "#F4EFE4", borderRadius: "4px", padding: "36px 34px" }}>
            <h2 style={{ fontFamily: "'Source Serif 4',serif", fontSize: "24px", fontWeight: "600", margin: "0 0 12px" }}>Important notice</h2>
            <p style={{ fontSize: "14.5px", color: "#B9C0D2", lineHeight: "1.7", margin: "0 0 12px" }}>CareerPulse Axis does not guarantee interviews, employment opportunities, job offers, career progression or any specific outcome arising from the use of its services, products or subscriptions.</p>
            <p style={{ fontSize: "14.5px", color: "#B9C0D2", lineHeight: "1.7", margin: "0" }}>All refund requests are subject to review and assessment by CareerPulse Axis. Any decision regarding a refund shall be made at the sole discretion of CareerPulse Axis and shall be final.</p>
          </div>
        </div>
      </section>
    </>
  );
}
