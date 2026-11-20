import { Link } from 'react-router-dom';
import { useSeo } from '../seo.js';

// AXIS-46: terms of service. Google's Branding page asks for a terms link
// alongside the privacy policy before it will publish the OAuth app.
//
// Deliberately consistent with the existing Refund Policy rather than
// contradicting it: refunds are stated here in summary and that page remains
// the detail. Two policies that disagree are worse than one.

const CARD = { background: '#FFFFFF', border: '1px solid #E7E2D6', borderRadius: '4px', padding: '36px 34px' };
const H2 = { fontFamily: "'Source Serif 4',serif", fontSize: '24px', fontWeight: '600', margin: '0 0 12px' };
const P = { fontSize: '14.5px', color: '#56607A', lineHeight: '1.7', margin: '0 0 14px' };
const UL = { margin: '0', padding: '0 0 0 20px', fontSize: '14.5px', color: '#56607A', lineHeight: '1.9' };
const LINK = { color: '#8A6D1F', fontWeight: 600 };

export default function Terms() {
  useSeo({
    title: 'Terms of Service | CareerPulse Axis',
    description: 'The terms that apply when you use CareerPulse Axis services, the client portal and the Axis Interview Code.',
    path: '/terms',
  });

  return (
    <>
      <section style={{ background: 'linear-gradient(180deg,#131F38 0%,#26396A 100%)', color: '#F4EFE4' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '64px 32px 56px' }}>
          <div style={{ letterSpacing: '.22em', textTransform: 'uppercase', fontSize: '12.5px', fontWeight: '600', color: '#C9A227', marginBottom: '16px', textAlign: 'center' }}>Policy</div>
          <h1 style={{ fontFamily: "'Source Serif 4',serif", fontWeight: '600', fontSize: 'clamp(30px,4.5vw,44px)', lineHeight: '1.1', margin: '0', textAlign: 'center' }}>Terms of Service</h1>
          <p style={{ fontSize: '16px', lineHeight: '1.65', color: '#B9C0D2', maxWidth: '620px', margin: '18px auto 0', textAlign: 'center' }}>
            These terms apply when you use our services, buy from us, or sign in to the CareerPulse Axis client portal.
          </p>
        </div>
      </section>

      <section style={{ maxWidth: '860px', margin: '0 auto', padding: '72px 32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

          <div style={CARD}>
            <h2 style={H2}>Agreeing to these terms</h2>
            <p style={{ ...P, margin: 0 }}>
              By creating an account, buying a service or using this website, you agree to these terms. If you
              do not agree with them, please do not use our services. These terms are governed by the law of
              the Republic of South Africa.
            </p>
          </div>

          <div style={CARD}>
            <h2 style={H2}>What we provide</h2>
            <p style={P}>CareerPulse Axis offers:</p>
            <ul style={UL}>
              <li><strong>CV writing and CV revamps</strong>, priced by how much experience there is to work with.</li>
              <li><strong>The Axis Interview Code</strong>: interview readiness material, available through the portal for a set access period once purchased.</li>
              <li><strong>eBooks and related career resources.</strong></li>
              <li><strong>A client portal</strong> where you manage your profile, upload your CV and collect the revised version.</li>
            </ul>
          </div>

          <div style={CARD}>
            <h2 style={H2}>Your account</h2>
            <ul style={UL}>
              <li>Give us accurate information and keep it up to date. We build your CV and interview preparation around what you tell us, so wrong details mean weaker work.</li>
              <li>Your login is yours. Keep your password to yourself and tell us if you think someone else has it.</li>
              <li>One account per person. Do not create an account for someone else without their knowledge.</li>
              <li>We may suspend or close an account that is used dishonestly, abusively, or to misrepresent someone's experience or qualifications.</li>
            </ul>
          </div>

          <div style={CARD}>
            <h2 style={H2}>Sharing your CV</h2>
            <p style={{ ...P, margin: 0 }}>
              Creating an account includes giving us permission to share your CV and profile with employers and
              recruiters looking for candidates. Our{' '}
              <Link to="/privacy" style={LINK}>Privacy Policy</Link> sets out exactly what is shared, who with,
              and how to ask us to stop.
            </p>
          </div>

          <div style={CARD}>
            <h2 style={H2}>Payment and access</h2>
            <ul style={UL}>
              <li>Prices are shown in South African Rand and are payable up front.</li>
              <li>Payments are handled by Paystack on their own secure pages. We never see or store your card details.</li>
              <li>Work begins once payment is confirmed.</li>
              <li>Axis Interview Code access runs for the period stated at purchase and ends when that period expires.</li>
            </ul>
          </div>

          <div style={CARD}>
            <h2 style={H2}>Turnaround and your part in it</h2>
            <p style={{ ...P, margin: 0 }}>
              CV revamp turnaround is usually 3-4 working days, depending on current capacity and how much work
              is involved. That clock starts once we have everything we need from you, which is your current CV and the
              details we ask for. Delays in getting those to us move the date out.
            </p>
          </div>

          <div style={CARD}>
            <h2 style={H2}>What we do not promise</h2>
            <p style={P}>
              We help you present your experience as well as it can be presented. We cannot control who hires you.
            </p>
            <p style={{ ...P, margin: 0 }}>
              CareerPulse Axis does not guarantee interviews, job offers, employment, career progression or any
              other specific outcome from using our services, products or subscriptions.
            </p>
          </div>

          <div style={CARD}>
            <h2 style={H2}>Refunds</h2>
            <p style={{ ...P, margin: 0 }}>
              Refunds are considered where we cannot deliver a service you have paid for, or where a payment has
              been duplicated. They are not given for a change of mind, for work already delivered, or because a
              job search did not produce the result you hoped for. The full detail is in our{' '}
              <Link to="/refund-policy" style={LINK}>Refund Policy</Link>, which applies in full.
            </p>
          </div>

          <div style={CARD}>
            <h2 style={H2}>Our material</h2>
            <p style={{ ...P, margin: 0 }}>
              The Axis Interview Code material, our eBooks, videos and website content belong to CareerPulse Axis.
              They are for your own personal use. Please do not copy, resell, republish or share your portal
              access with others. The CV we write for you is yours to use however you like.
            </p>
          </div>

          <div style={{ background: 'linear-gradient(180deg,#131F38 0%,#26396A 100%)', color: '#F4EFE4', borderRadius: '4px', padding: '36px 34px' }}>
            <h2 style={{ ...H2, margin: '0 0 12px' }}>Changes and contact</h2>
            <p style={{ fontSize: '14.5px', color: '#B9C0D2', lineHeight: '1.7', margin: '0 0 12px' }}>
              We may update these terms as our services change. The current version always lives on this page.
            </p>
            <p style={{ fontSize: '14.5px', color: '#B9C0D2', lineHeight: '1.7', margin: '0' }}>
              Questions? Email{' '}
              <a href="mailto:sinovuyo.mgogo@careerpulseaxis.co.za" style={{ color: '#C9A227', fontWeight: 600 }}>sinovuyo.mgogo@careerpulseaxis.co.za</a>.
            </p>
          </div>

        </div>
      </section>
    </>
  );
}
