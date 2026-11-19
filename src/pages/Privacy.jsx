import { Link } from 'react-router-dom';
import { useSeo } from '../seo.js';

// AXIS-46: the privacy policy. Two jobs.
//
// 1. Google will not publish the OAuth app (AXIS-43) without a privacy policy
//    URL that actually loads, so this page is what moves Google out of Testing
//    mode, where only hand-listed addresses can sign in.
//
// 2. It has to describe the CV-sharing consent from AXIS-47 honestly. A tick
//    box pointing at a policy that doesn't mention the sharing would be worse
//    than no policy at all.
//
// Styling follows RefundPolicy.jsx so the two read as the same document family.

const CARD = { background: '#FFFFFF', border: '1px solid #E7E2D6', borderRadius: '4px', padding: '36px 34px' };
const H2 = { fontFamily: "'Source Serif 4',serif", fontSize: '24px', fontWeight: '600', margin: '0 0 12px' };
const P = { fontSize: '14.5px', color: '#56607A', lineHeight: '1.7', margin: '0 0 14px' };
const UL = { margin: '0', padding: '0 0 0 20px', fontSize: '14.5px', color: '#56607A', lineHeight: '1.9' };
const LINK = { color: '#8A6D1F', fontWeight: 600 };

export default function Privacy() {
  useSeo({
    title: 'Privacy Policy | CareerPulse Axis',
    description: 'How CareerPulse Axis collects, uses, shares and protects your personal information, including your CV, under POPIA.',
    path: '/privacy',
  });

  return (
    <>
      <section style={{ background: 'linear-gradient(180deg,#131F38 0%,#26396A 100%)', color: '#F4EFE4' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '64px 32px 56px' }}>
          <div style={{ letterSpacing: '.22em', textTransform: 'uppercase', fontSize: '12.5px', fontWeight: '600', color: '#C9A227', marginBottom: '16px', textAlign: 'center' }}>Policy</div>
          <h1 style={{ fontFamily: "'Source Serif 4',serif", fontWeight: '600', fontSize: 'clamp(30px,4.5vw,44px)', lineHeight: '1.1', margin: '0', textAlign: 'center' }}>Privacy Policy</h1>
          <p style={{ fontSize: '16px', lineHeight: '1.65', color: '#B9C0D2', maxWidth: '620px', margin: '18px auto 0', textAlign: 'center' }}>
            How we collect, use, share and protect your personal information — including your CV — under the Protection of Personal Information Act (POPIA).
          </p>
        </div>
      </section>

      <section style={{ maxWidth: '860px', margin: '0 auto', padding: '72px 32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

          <div style={CARD}>
            <h2 style={H2}>Who we are</h2>
            <p style={P}>
              CareerPulse Axis Ltd Pty (“CareerPulse Axis”, “we”, “us”) provides CV writing, CV revamps,
              interview readiness training and related career services in South Africa. We are the
              responsible party for the personal information described in this policy.
            </p>
            <p style={{ ...P, margin: 0 }}>
              Questions about this policy, or about your information, go to{' '}
              <a href="mailto:sinovuyo.mgogo@careerpulseaxis.co.za" style={LINK}>sinovuyo.mgogo@careerpulseaxis.co.za</a>.
            </p>
          </div>

          <div style={CARD}>
            <h2 style={H2}>What we collect</h2>
            <p style={P}>When you create a portal account and use our services, we collect:</p>
            <ul style={UL}>
              <li><strong>Who you are</strong> — your name, email address, phone or WhatsApp number and location.</li>
              <li><strong>Your career profile</strong> — target role, target industry, seniority, employment status, companies you are targeting, what is driving your change, your skills and your education history.</li>
              <li><strong>Your CV</strong> — the document you upload, and the revised version we produce for you.</li>
              <li><strong>Your LinkedIn profile link</strong>, if you give it.</li>
              <li><strong>Your profile photo</strong>, if you upload one. If you sign in with Google we also receive your Google display name and profile picture.</li>
              <li><strong>Service records</strong> — purchases, the access period for the Axis Interview Code, and notes we keep about work done for you.</li>
            </ul>
          </div>

          <div style={CARD}>
            <h2 style={H2}>Sharing your CV with employers and recruiters</h2>
            <p style={P}>
              This one matters, so we are stating it plainly. <strong>When you create an account you give us
              permission to share your CV and profile with employers and recruiters who are looking for
              candidates.</strong> You agree to this by ticking the box on the sign-up form, and you cannot
              create an account without it.
            </p>
            <p style={P}>What that means in practice:</p>
            <ul style={{ ...UL, marginBottom: '14px' }}>
              <li>We may send your CV — the original you upload or the revised version we write — to employers, recruitment agencies and hiring contacts who are looking for someone with your background.</li>
              <li>We may share the profile details that go with it: your name, contact details, location, target role, seniority, skills and education.</li>
              <li>We share it to put you in front of opportunities. We do not sell your information, and we do not share it for advertising.</li>
              <li>Once a CV is with an employer or recruiter, they hold their own copy and their own privacy policy applies to it. We cannot withdraw a copy someone else already has.</li>
            </ul>
            <p style={{ ...P, margin: 0 }}>
              <strong>If you want us to stop sharing your CV</strong>, email{' '}
              <a href="mailto:sinovuyo.mgogo@careerpulseaxis.co.za" style={LINK}>sinovuyo.mgogo@careerpulseaxis.co.za</a>{' '}
              and we will stop sending it out. Everything else in your account carries on as normal.
            </p>
          </div>

          <div style={CARD}>
            <h2 style={H2}>Who else handles your information</h2>
            <p style={P}>We use a small number of service providers to run the portal. They process your information on our instructions only:</p>
            <ul style={UL}>
              <li><strong>Supabase</strong> — stores your account, your profile and your CV files. CVs sit in private storage that only you and our administrators can open.</li>
              <li><strong>Paystack</strong> — takes payments. Payments happen on Paystack's own pages, so your card details never reach our site and we never see or store them.</li>
              <li><strong>Google</strong> — only if you choose to sign in with Google, in which case Google confirms your identity and gives us your name, email address and profile picture.</li>
              <li><strong>Netlify and our web host</strong> — serve the website itself.</li>
            </ul>
          </div>

          <div style={CARD}>
            <h2 style={H2}>How long we keep it</h2>
            <p style={{ ...P, margin: 0 }}>
              We keep your account, profile and CVs for as long as you have an account with us, and for a
              reasonable period afterwards so we can answer questions about work we did and meet our legal and
              tax obligations. Ask us to delete your account and we will remove your profile and your stored
              CVs, apart from anything we are required to keep by law.
            </p>
          </div>

          <div style={CARD}>
            <h2 style={H2}>Your rights under POPIA</h2>
            <p style={P}>You can ask us to:</p>
            <ul style={{ ...UL, marginBottom: '14px' }}>
              <li>tell you what information we hold about you;</li>
              <li>correct anything that is wrong or out of date — most of it you can edit yourself in your portal profile;</li>
              <li>delete your account and the information we hold;</li>
              <li>stop sharing your CV with employers and recruiters;</li>
              <li>explain anything in this policy you are unsure about.</li>
            </ul>
            <p style={P}>
              Email <a href="mailto:sinovuyo.mgogo@careerpulseaxis.co.za" style={LINK}>sinovuyo.mgogo@careerpulseaxis.co.za</a>{' '}
              and we will respond within a reasonable time.
            </p>
            <p style={{ ...P, margin: 0 }}>
              If you are not satisfied with how we have handled your information, you may complain to the
              Information Regulator of South Africa at{' '}
              <a href="https://inforegulator.org.za" target="_blank" rel="noopener noreferrer" style={LINK}>inforegulator.org.za</a>.
            </p>
          </div>

          <div style={CARD}>
            <h2 style={H2}>Keeping it safe</h2>
            <p style={{ ...P, margin: 0 }}>
              Your CVs and profile photos are held in private storage, not on public links. Access rules on our
              database mean one client cannot see another client's information, and only our administrators can
              see client records. No system is perfect, but we take reasonable steps to protect what you give us.
            </p>
          </div>

          <div style={{ background: 'linear-gradient(180deg,#131F38 0%,#26396A 100%)', color: '#F4EFE4', borderRadius: '4px', padding: '36px 34px' }}>
            <h2 style={{ ...H2, margin: '0 0 12px' }}>Changes to this policy</h2>
            <p style={{ fontSize: '14.5px', color: '#B9C0D2', lineHeight: '1.7', margin: '0 0 12px' }}>
              We may update this policy as our services change. The current version always lives on this page.
            </p>
            <p style={{ fontSize: '14.5px', color: '#B9C0D2', lineHeight: '1.7', margin: '0' }}>
              See also our <Link to="/terms" style={{ color: '#C9A227', fontWeight: 600 }}>Terms of Service</Link>{' '}
              and <Link to="/refund-policy" style={{ color: '#C9A227', fontWeight: 600 }}>Refund Policy</Link>.
            </p>
          </div>

        </div>
      </section>
    </>
  );
}
