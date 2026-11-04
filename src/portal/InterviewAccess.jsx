import { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../supabase';
import Loading from './Loading';
import Reveal from './Reveal';

const GOLD = '#C9A227';
const CREAM = '#F4EFE4';
const MUTED = '#B9C0D2';
const serif = "'Source Serif 4', serif";

// The gated four-pillar content, shown as the "Axis Journey" — a vertical
// timeline. Clients with live access see the content (read from interview_content,
// RLS-protected); everyone else sees a waiting screen.
export default function InterviewAccess() {
  const { hasInterviewAccess, profile } = useAuth();
  const [state, setState] = useState({ loading: true, content: null, error: false });

  useEffect(() => {
    if (!hasInterviewAccess) return; // the render early-returns the waiting screen
    let active = true;
    setState({ loading: true, content: null, error: false });
    (async () => {
      if (!supabase) { if (active) setState({ loading: false, content: null, error: true }); return; }
      // RLS returns zero rows unless access is live — maybeSingle handles that
      // without throwing.
      const { data, error } = await supabase.from('interview_content').select('content').limit(1).maybeSingle();
      if (!active) return;
      if (error || !data?.content) setState({ loading: false, content: null, error: true });
      else setState({ loading: false, content: data.content, error: false });
    })();
    return () => { active = false; };
  }, [hasInterviewAccess]);

  if (!hasInterviewAccess) return <WaitingScreen expiry={profile?.interview_access_expires_at} />;
  if (state.loading) return <Loading label="Loading your Interview Code…" />;
  if (state.error || !state.content) return <Unavailable />;

  return <Journey c={state.content} />;
}

// ---- Waiting (no live access) -------------------------------------------------

function WaitingScreen({ expiry }) {
  const expired = expiry && new Date(expiry) <= new Date();
  return (
    <div style={{ maxWidth: 560, margin: '10px auto', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 10, padding: '30px 28px', textAlign: 'center' }}>
      <div style={{ fontSize: 30, marginBottom: 10 }} aria-hidden="true">🔒</div>
      <div style={{ letterSpacing: '.18em', textTransform: 'uppercase', fontSize: 11, color: GOLD, marginBottom: 10 }}>
        Interview Code Access
      </div>
      <h2 style={{ fontFamily: serif, fontWeight: 700, fontSize: 22, margin: '0 0 10px', color: CREAM }}>
        {expired ? 'Your access has ended' : 'Access not active yet'}
      </h2>
      <p style={{ color: MUTED, fontSize: 14.5, lineHeight: 1.6, margin: 0 }}>
        {expired
          ? 'Your 30-day access has expired. Renew to return to the four winning pillars of interview readiness.'
          : 'Once your payment is confirmed, we grant 30 days of access to the four winning pillars of interview readiness.'}
      </p>
    </div>
  );
}

function Unavailable() {
  return (
    <div style={{ maxWidth: 560, margin: '10px auto', textAlign: 'center', color: MUTED, fontSize: 14.5, lineHeight: 1.6, padding: '24px 20px' }}>
      We couldn’t load your Interview Code right now. Please refresh, or try again shortly.
    </div>
  );
}

// ---- The Axis Journey ---------------------------------------------------------

function Journey({ c }) {
  const pillars = Array.isArray(c.pillars) ? c.pillars : [];
  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      {/* Header */}
      <Reveal>
        <header style={{ textAlign: 'center', marginBottom: 34 }}>
          {c.tagline && (
            <div style={{ letterSpacing: '.2em', textTransform: 'uppercase', fontSize: 11.5, color: GOLD, fontWeight: 600, marginBottom: 14 }}>
              {c.tagline}
            </div>
          )}
          <h1 style={{ fontFamily: serif, fontWeight: 700, fontSize: 'clamp(28px,5vw,40px)', lineHeight: 1.08, margin: '0 0 10px', color: CREAM }}>
            {c.title || 'The Axis Interview Code'}
          </h1>
          {c.subtitle && <div style={{ fontSize: 15.5, color: MUTED }}>{c.subtitle}</div>}
          {c.intro && <p style={{ fontSize: 15, color: MUTED, lineHeight: 1.65, maxWidth: 580, margin: '18px auto 0' }}>{c.intro}</p>}
        </header>
      </Reveal>

      {/* Philosophy + before-you-begin */}
      {(c.philosophy || c.before_you_begin) && (
        <Reveal>
          <div style={{ display: 'grid', gap: 14, marginBottom: 40 }}>
            {c.philosophy && (
              <div style={{ background: 'rgba(201,162,39,.08)', border: '1px solid rgba(201,162,39,.25)', borderRadius: 10, padding: '18px 20px' }}>
                <div style={{ letterSpacing: '.16em', textTransform: 'uppercase', fontSize: 10.5, color: GOLD, marginBottom: 7 }}>Our Philosophy</div>
                <p style={{ margin: 0, fontSize: 14.5, color: CREAM, lineHeight: 1.6 }}>{c.philosophy}</p>
              </div>
            )}
            {c.before_you_begin && (
              <div style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.6, display: 'flex', gap: 9, alignItems: 'baseline' }}>
                <span style={{ color: GOLD, fontWeight: 700 }} aria-hidden="true">›</span>
                <span><strong style={{ color: CREAM, fontWeight: 600 }}>Before you begin.</strong> {c.before_you_begin}</span>
              </div>
            )}
          </div>
        </Reveal>
      )}

      {/* The timeline */}
      <div style={{ position: 'relative' }}>
        {pillars.map((p, i) => (
          <Reveal key={p.number || i} delay={i === 0 ? 0 : 60}>
            <Pillar p={p} isLast={i === pillars.length - 1} />
          </Reveal>
        ))}
      </div>

      {/* The Axis Standard — closer */}
      {c.standard && (
        <Reveal>
          <div style={{ marginTop: 20, background: 'linear-gradient(180deg, rgba(201,162,39,.14), rgba(201,162,39,.05))', border: '1px solid rgba(201,162,39,.35)', borderRadius: 12, padding: '30px 28px', textAlign: 'center' }}>
            <div style={{ letterSpacing: '.2em', textTransform: 'uppercase', fontSize: 11, color: GOLD, fontWeight: 600, marginBottom: 12 }}>The Axis Standard</div>
            <p style={{ fontFamily: serif, fontSize: 'clamp(16px,2.4vw,19px)', lineHeight: 1.55, color: CREAM, margin: 0 }}>{c.standard}</p>
          </div>
        </Reveal>
      )}
    </div>
  );
}

function Pillar({ p, isLast }) {
  const focus = Array.isArray(p.focus) ? p.focus : [];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr', columnGap: 18, paddingBottom: isLast ? 8 : 34 }}>
      {/* Rail: connecting line + numbered node */}
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
        {!isLast && (
          <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: 26, bottom: -34, width: 2, background: 'rgba(201,162,39,.3)' }} />
        )}
        <div style={{ position: 'relative', zIndex: 1, width: 46, height: 46, borderRadius: '50%', border: `2px solid ${GOLD}`, background: '#131F38', color: GOLD, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: serif, fontWeight: 700, fontSize: 16 }}>
          {p.number || ''}
        </div>
      </div>

      {/* Content */}
      <div style={{ paddingTop: 2 }}>
        <h2 style={{ fontFamily: serif, fontWeight: 700, fontSize: 21, margin: '0 0 4px', color: CREAM }}>{p.title}</h2>
        {p.subtitle && <div style={{ fontSize: 14, color: GOLD, marginBottom: 10 }}>{p.subtitle}</div>}
        {p.intro && <p style={{ fontSize: 14.5, color: MUTED, lineHeight: 1.65, margin: '0 0 14px' }}>{p.intro}</p>}

        {focus.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ letterSpacing: '.16em', textTransform: 'uppercase', fontSize: 10.5, color: GOLD, marginBottom: 8 }}>Your Focus</div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 7 }}>
              {focus.map((f, i) => (
                <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'baseline', fontSize: 14, color: CREAM, lineHeight: 1.5 }}>
                  <span style={{ color: GOLD, fontWeight: 700, flexShrink: 0 }} aria-hidden="true">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {p.principle && (
          <blockquote style={{ margin: 0, borderLeft: `3px solid ${GOLD}`, background: 'rgba(255,255,255,.04)', borderRadius: '0 6px 6px 0', padding: '12px 16px' }}>
            <div style={{ letterSpacing: '.16em', textTransform: 'uppercase', fontSize: 10, color: GOLD, marginBottom: 5 }}>The Axis Principle</div>
            <p style={{ margin: 0, fontFamily: serif, fontStyle: 'italic', fontSize: 15.5, color: CREAM, lineHeight: 1.5 }}>{p.principle}</p>
          </blockquote>
        )}
      </div>
    </div>
  );
}
