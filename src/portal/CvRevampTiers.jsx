import { useAuth } from './AuthContext';
import { CV_TIERS, CV_TIER_INCLUDES } from '../payments.js';
import { GOLD_INK, CREAM, MUTED, SERIF } from './theme';
import { Stagger, Item } from '../components/Reveal.jsx';

// AXIS-40: buy a CV revamp without leaving the portal.
//
// The four tiers live in payments.js (CV_TIERS) so the portal and the marketing
// Services page quote the same prices from one list. Each card opens its own
// Paystack product page in a new tab — checkout stays hosted by Paystack, so no
// card details ever touch this app.
//
// Payment confirmation is still manual: Paystack emails the order, the admin
// marks access and delivers the revised CV through the AXIS-12 flow, which lands
// in the "Your finished CV" section above. The explainer says so plainly, so a
// client who has just paid knows what to expect instead of waiting for an
// automatic status change that does not exist yet.
export default function CvRevampTiers() {
  const { profile } = useAuth();
  const seniority = profile?.seniority_level || '';
  // A suggestion, never a lock. An unset or unrecognised seniority_level simply
  // matches nothing and all four cards render plain — no crash, no default pick.
  const suggested = CV_TIERS.find((t) => t.seniority.includes(seniority))?.key || null;

  return (
    <section className="ax-card" style={{ padding: '22px 22px', marginTop: 16 }}>
      <div style={{ letterSpacing: '.12em', textTransform: 'uppercase', fontSize: 11, color: GOLD_INK, fontWeight: 700, marginBottom: 10 }}>
        Get your CV revamped
      </div>
      <p style={{ margin: '0 0 6px', fontSize: 14, color: MUTED, lineHeight: 1.65, maxWidth: 560 }}>
        Every tier includes a full rewrite — restructuring, sharper content and ATS-aligned
        formatting. The price reflects how much experience there is to work with.
      </p>
      {suggested && (
        <p style={{ margin: '0 0 16px', fontSize: 13.5, color: MUTED, lineHeight: 1.6 }}>
          Based on your profile ({seniority}), we’ve marked the tier that fits. You can choose any of them.
        </p>
      )}
      {!suggested && <div style={{ height: 10 }} />}

      <Stagger className="ax-tier-grid">
        {CV_TIERS.map((t) => (
          <Item key={t.key}>
            <div className={`ax-tier${t.key === suggested ? ' ax-tier-pick' : ''}`}>
              {t.key === suggested && <div className="ax-tier-tag">Suggested for you</div>}
              <div style={{ fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 700, color: t.key === suggested ? GOLD_INK : MUTED }}>
                {t.label}
              </div>
              <div style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: CREAM }}>{t.band}</div>
              <div style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 600, color: CREAM, lineHeight: 1.1 }}>{t.price}</div>
              <ul style={{ margin: '2px 0 0', padding: '0 0 0 17px', fontSize: 13.5, color: MUTED, lineHeight: 1.9 }}>
                {CV_TIER_INCLUDES.map((inc) => <li key={inc}>{inc}</li>)}
              </ul>
              <a
                href={t.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`ax-cta ax-tier-buy${t.key === suggested ? ' ax-tier-buy-pick' : ''}`}
              >
                Pay {t.price}
              </a>
            </div>
          </Item>
        ))}
      </Stagger>

      <div style={{ marginTop: 20, paddingTop: 18, borderTop: '1px solid var(--ax-border)' }}>
        <div style={{ fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 700, color: MUTED, marginBottom: 12 }}>
          What happens next
        </div>
        <ol style={{ margin: 0, padding: '0 0 0 19px', fontSize: 13.5, color: MUTED, lineHeight: 1.75 }}>
          <li><span style={{ color: CREAM, fontWeight: 600 }}>Upload your current CV</span> above, so we have something to work from.</li>
          <li><span style={{ color: CREAM, fontWeight: 600 }}>Pay for your tier</span> on the Paystack page that opens.</li>
          <li><span style={{ color: CREAM, fontWeight: 600 }}>We confirm by email</span> once the payment comes through.</li>
          <li><span style={{ color: CREAM, fontWeight: 600 }}>Your revised CV appears here</span> under “Your finished CV”, ready to download.</li>
        </ol>
        <p style={{ margin: '14px 0 0', fontSize: 12.5, color: MUTED, lineHeight: 1.6 }}>
          Turnaround is 3–4 working days, subject to current capacity and scope of work.
        </p>
      </div>
    </section>
  );
}
