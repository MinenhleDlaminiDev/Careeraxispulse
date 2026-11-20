import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { overlayRoot } from './overlayRoot';
import { PAYSTACK, INTERVIEW_PRICE } from '../payments.js';
import { useAuth } from './AuthContext';
import { supabase } from '../supabase';
import ThemeToggle from './ThemeToggle';
import VideoPlayer from './VideoPlayer';
import Loading from './Loading';
import { EASE } from '../motion.js';
import { GOLD, CREAM, MUTED, SERIF as serif, NAVY, SURFACE, GOLD_SOFT, GOLD_BORDER, ON_GOLD, BORDER } from './theme';

// The gated four-pillar content, shown as the "Axis Interview Code" — a guided
// presentation (AXIS-26): a cover, one pillar per slide, then a completion
// screen. Clients with live access see the content (read from interview_content,
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

  return <Presentation c={state.content} />;
}

// ---- Waiting (no live access) -------------------------------------------------

// A client with no live access lands here. Before AXIS-39 this screen explained
// the 30 days but gave them no way to actually buy — the one place someone has
// already decided they want it. The CTA goes to the real Paystack page, and the
// copy is explicit that access is switched on by us after payment clears, so
// the manual confirmation step isn't a surprise.
function WaitingScreen({ expiry }) {
  const expired = expiry && new Date(expiry) <= new Date();
  return (
    <div className="ax-card" style={{ maxWidth: 560, margin: '10px auto', padding: '30px 28px', textAlign: 'center' }}>
      <div style={{ fontSize: 30, marginBottom: 10 }} aria-hidden="true">🔒</div>
      <div style={{ letterSpacing: '.18em', textTransform: 'uppercase', fontSize: 11, color: GOLD, marginBottom: 10 }}>
        Interview Code Access
      </div>
      <h2 style={{ fontFamily: serif, fontWeight: 700, fontSize: 22, margin: '0 0 10px', color: CREAM }}>
        {expired ? 'Your access has ended' : 'Access not active yet'}
      </h2>
      <p style={{ color: MUTED, fontSize: 14.5, lineHeight: 1.6, margin: '0 0 22px' }}>
        {expired
          ? 'Your 30-day access has expired. Renew to return to the four winning pillars of interview readiness.'
          : 'Get 30 days of access to the four winning pillars of interview readiness. Master the position, not just the questions.'}
      </p>

      <a href={PAYSTACK.interview} target="_blank" rel="noopener noreferrer" className="ax-cta"
        style={{ background: GOLD, color: ON_GOLD, borderRadius: 8, padding: '13px 26px', fontSize: 15, fontWeight: 700, display: 'inline-flex' }}>
        {expired ? `Renew for ${INTERVIEW_PRICE}` : `Get access for ${INTERVIEW_PRICE}`} →
      </a>

      <p style={{ color: MUTED, fontSize: 12.5, lineHeight: 1.6, margin: '16px 0 0' }}>
        One-time payment, no automatic renewal. We activate your 30 days as soon as your
        payment is confirmed. You’ll see it here when it’s live.
      </p>
    </div>
  );
}

function Unavailable() {
  return (
    <div className="ax-card" style={{ maxWidth: 560, margin: '10px auto', textAlign: 'center', color: MUTED, fontSize: 14.5, lineHeight: 1.6, padding: '28px 24px' }}>
      We couldn’t load your Interview Code right now. Please refresh, or try again shortly.
    </div>
  );
}

// ---- The presentation ---------------------------------------------------------

const STORE_KEY = 'ax-ic-progress-v1';

// Remembered progress survives in the browser only (per-viewer convenience), so
// every read/write is guarded — a private window or blocked storage must never
// break the deck.
function readProgress() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { last: 0, viewed: [] };
    const p = JSON.parse(raw);
    return { last: Number(p.last) || 0, viewed: Array.isArray(p.viewed) ? p.viewed : [] };
  } catch { return { last: 0, viewed: [] }; }
}
function writeProgress(last, viewedSet) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify({ last, viewed: [...viewedSet] })); } catch { /* ignore */ }
}

const slideVariants = {
  enter: (dir) => ({ opacity: 0, x: dir >= 0 ? 46 : -46 }),
  center: { opacity: 1, x: 0 },
  exit: (dir) => ({ opacity: 0, x: dir >= 0 ? -46 : 46 }),
};

// `preview` (AXIS-31) renders the exact same deck for the admin content editor,
// but starts on the cover and never touches the saved client progress; `onClose`
// backs out of the preview overlay.
export function Presentation({ c, preview = false, onClose }) {
  const pillars = Array.isArray(c.pillars) ? c.pillars : [];
  // Slide 0 = cover, 1..N = pillars, N+1 = completion.
  const total = pillars.length;
  const doneIndex = total + 1;
  const count = total + 2;

  const init = useRef(preview ? { last: 0, viewed: [] } : readProgress());
  const [index, setIndex] = useState(() => {
    const last = Math.min(Math.max(init.current.last, 0), count - 1);
    return last === doneIndex ? 0 : last; // a finished deck re-opens on the cover
  });
  const [dir, setDir] = useState(0);
  const [viewed, setViewed] = useState(() => new Set(init.current.viewed));
  const [full, setFull] = useState(false);
  const fullRef = useRef(null);

  // Every slide starts at the top (AXIS-35). Changing slide doesn't change the
  // route, so nothing else resets the scroll — without this you land halfway
  // down the next pillar after reading a long one. Full-screen scrolls its own
  // container, inline scrolls the window.
  useEffect(() => {
    if (full || preview) fullRef.current?.scrollTo({ top: 0, behavior: 'auto' });
    else window.scrollTo({ top: 0, behavior: 'auto' });
  }, [index, full, preview]);

  // Record the slide we're on, and remember it as viewed.
  useEffect(() => {
    setViewed((prev) => {
      if (prev.has(index)) { if (!preview) writeProgress(index, prev); return prev; }
      const next = new Set(prev); next.add(index); if (!preview) writeProgress(index, next); return next;
    });
  }, [index, preview]);

  const next = useCallback(() => { if (index < count - 1) { setDir(1); setIndex(index + 1); } }, [index, count]);
  const prev = useCallback(() => { if (index > 0) { setDir(-1); setIndex(index - 1); } }, [index]);
  const jump = useCallback((to) => { if (to !== index) { setDir(to > index ? 1 : -1); setIndex(to); } }, [index]);

  // Keyboard: arrows move, Esc leaves full-screen.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'Escape') { if (preview) onClose?.(); else if (full) setFull(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev, full, preview, onClose]);

  // Lock body scroll while presenting full-screen.
  useEffect(() => {
    if (!full && !preview) return;
    const prevOv = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prevOv; };
  }, [full, preview]);

  // Swipe (touch) across the stage.
  const touchX = useRef(null);
  const onTouchStart = (e) => { touchX.current = e.changedTouches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (dx <= -45) next();
    else if (dx >= 45) prev();
  };

  const pct = count > 1 ? (index / (count - 1)) * 100 : 0;
  const stepLabel = index === 0 ? 'Overview' : index === doneIndex ? 'Complete' : `Pillar ${index} of ${total}`;

  const slide = index === 0
    ? <CoverSlide c={c} onBegin={next} />
    : index === doneIndex
      ? <DoneSlide c={c} onReplay={() => jump(0)} onBack={prev} />
      : <PillarSlide p={pillars[index - 1]} index={index} total={total} />;

  const body = (
    <div className="ax-present">
      <div className="ax-present-top">
        <div className="ax-present-bar"><div className="ax-present-bar-fill" style={{ width: `${pct}%` }} /></div>
        <div className="ax-present-step">{stepLabel}</div>
        {(full || preview) && <ThemeToggle />}
        {preview ? (
          <button type="button" className="ax-present-mode" onClick={() => onClose?.()} aria-label="Close preview">
            ✕ Close preview
          </button>
        ) : (
          <button type="button" className="ax-present-mode" onClick={() => setFull((v) => !v)}
            aria-label={full ? 'Exit full screen' : 'Present full screen'}>
            {full ? <>✕ Exit</> : <>⤢ Present</>}
          </button>
        )}
      </div>

      <div className="ax-present-dots" role="group" aria-label="Go to slide">
        {Array.from({ length: count }).map((_, i) => (
          <button key={i} type="button"
            className={'ax-present-dot' + (i === index ? ' active' : viewed.has(i) ? ' viewed' : '')}
            onClick={() => jump(i)} aria-current={i === index ? 'step' : undefined}
            aria-label={i === 0 ? 'Overview' : i === doneIndex ? 'Completion' : `Pillar ${i}`} />
        ))}
      </div>

      <div className="ax-present-body">
      <div className="ax-present-stage" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <AnimatePresence initial={false} custom={dir} mode="wait">
          <motion.div key={index} custom={dir} variants={slideVariants}
            initial="enter" animate="center" exit="exit"
            transition={{ duration: 0.4, ease: EASE }} style={{ width: '100%' }}>
            {slide}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* The persistent Back/Next bar is only for the pillar slides; the cover
          and completion slides carry their own prominent CTAs, so showing the
          bar there too would just duplicate them. */}
      {index > 0 && index < doneIndex && (
        <div className="ax-present-nav">
          <button type="button" className="ax-present-btn ghost" onClick={prev}>← Back</button>
          <button type="button" className="ax-present-btn" onClick={next}>{index === total ? 'Finish →' : 'Next →'}</button>
        </div>
      )}
      </div>
    </div>
  );

  // Portalled out of the route-transition wrapper: its transform would otherwise
  // capture this fixed overlay and shrink it to a clipped box (see overlayRoot).
  if (!(full || preview)) return body;
  const overlay = <div className="ax-present-full" ref={fullRef}>{body}</div>;
  const root = overlayRoot();
  return root ? createPortal(overlay, root) : overlay;
}

// ---- Slides -------------------------------------------------------------------

function CoverSlide({ c, onBegin }) {
  // A flex column with one generous gap gives an even, un-cramped rhythm; the
  // tagline/title/subtitle are grouped so they stay tight to each other.
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 32 }}>
      <div>
        {c.tagline && (
          <div style={{ letterSpacing: '.2em', textTransform: 'uppercase', fontSize: 11.5, color: GOLD, fontWeight: 600, marginBottom: 16 }}>{c.tagline}</div>
        )}
        <h1 style={{ fontFamily: serif, fontWeight: 700, fontSize: 'clamp(28px,5vw,42px)', lineHeight: 1.1, margin: '0 0 12px', color: CREAM }}>
          {c.title || 'The Axis Interview Code'}
        </h1>
        {c.subtitle && <div style={{ fontSize: 15.5, color: MUTED }}>{c.subtitle}</div>}
      </div>

      {c.intro && <p style={{ fontSize: 15, color: MUTED, lineHeight: 1.7, maxWidth: 560, margin: 0 }}>{c.intro}</p>}

      {/* The intro video (AXIS-37). Constrained and left-aligned inside the
          centred cover so the 16:9 frame doesn't dominate a wide screen. */}
      {c.intro_video && (
        <div style={{ width: '100%', maxWidth: 560, margin: 0, textAlign: 'left' }}>
          <VideoPlayer path={c.intro_video} label="Introduction" />
        </div>
      )}

      {c.philosophy && (
        <div style={{ background: GOLD_SOFT, border: `1px solid ${GOLD_BORDER}`, borderRadius: 12, padding: '20px 22px', boxShadow: 'var(--ax-card-shadow)', textAlign: 'left', maxWidth: 560, margin: 0 }}>
          <div style={{ letterSpacing: '.16em', textTransform: 'uppercase', fontSize: 10.5, color: GOLD, marginBottom: 8 }}>Our Philosophy</div>
          <p style={{ margin: 0, fontSize: 14.5, color: CREAM, lineHeight: 1.65 }}>{c.philosophy}</p>
        </div>
      )}
      {c.before_you_begin && (
        <div style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.6, display: 'flex', gap: 9, alignItems: 'baseline', maxWidth: 560, margin: 0, textAlign: 'left' }}>
          <span style={{ color: GOLD, fontWeight: 700 }} aria-hidden="true">›</span>
          <span><strong style={{ color: CREAM, fontWeight: 600 }}>Before you begin.</strong> {c.before_you_begin}</span>
        </div>
      )}

      <div style={{ marginTop: 8 }}>
        <button type="button" className="ax-present-btn ax-present-cta" onClick={onBegin} style={{ fontSize: 15 }}>
          Begin the journey →
        </button>
      </div>
    </div>
  );
}

const focusContainer = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.18 } } };
const focusItem = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } } };

// A labelled note inside Practical Application. `tone` keeps the slide from
// becoming a wall of gold boxes: only the action is gold-filled, the example
// and prompt sit on the plain surface, and the caution gets a gold edge bar so
// it reads as a warning without a third gold fill next to the principle.
function PracticalNote({ label, children, tone = 'plain', italic = false }) {
  const gold = tone === 'gold';
  const caution = tone === 'caution';
  return (
    <div style={{
      background: gold ? GOLD_SOFT : SURFACE,
      border: `1px solid ${gold ? GOLD_BORDER : BORDER}`,
      ...(caution ? { borderLeft: `3px solid ${GOLD}`, borderRadius: '0 9px 9px 0' } : { borderRadius: 9 }),
      padding: '12px 14px',
    }}>
      <div style={{ letterSpacing: '.14em', textTransform: 'uppercase', fontSize: 10, color: GOLD, fontWeight: 700, marginBottom: 6 }}>{label}</div>
      <p style={{
        margin: 0, fontSize: 14, lineHeight: 1.65,
        color: gold || caution ? CREAM : MUTED,
        fontFamily: italic ? serif : 'inherit',
        fontStyle: italic ? 'italic' : 'normal',
      }}>{children}</p>
    </div>
  );
}

// AXIS-38: the "Practical Application" section the official doc adds to every
// pillar — how to actually do the pillar, a worked example, and the action to
// take. Pillar 04 also carries a sample AI prompt and a caution about trusting
// AI-generated questions. Every field is optional so a pillar the admin has not
// filled in yet simply renders nothing rather than an empty heading.
function PracticalApplication({ practical, delay }) {
  if (!practical) return null;
  const { lead, example, prompt, action, caution } = practical;
  if (!lead && !example && !prompt && !action && !caution) return null;
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE, delay }}
      style={{ marginBottom: 18 }}
    >
      <div style={{ letterSpacing: '.16em', textTransform: 'uppercase', fontSize: 10.5, color: GOLD, marginBottom: 10 }}>Practical Application</div>
      {lead && <p style={{ fontSize: 14.5, color: CREAM, lineHeight: 1.7, margin: '0 0 12px' }}>{lead}</p>}
      <div style={{ display: 'grid', gap: 10 }}>
        {example && <PracticalNote label="Example">{example}</PracticalNote>}
        {prompt && <PracticalNote label="Example AI prompt" italic>“{prompt}”</PracticalNote>}
        {action && <PracticalNote label="Your action" tone="gold">{action}</PracticalNote>}
        {caution && <PracticalNote label="Important" tone="caution">{caution}</PracticalNote>}
      </div>
    </motion.section>
  );
}

function PillarSlide({ p, index, total }) {
  const focus = Array.isArray(p.focus) ? p.focus : [];
  return (
    <div>
      {/* Pillar heading: big number node + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
        <div style={{ flexShrink: 0, width: 56, height: 56, borderRadius: '50%', border: `2px solid ${GOLD}`, background: NAVY, color: GOLD, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: serif, fontWeight: 700, fontSize: 20 }}>
          {p.number || index}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: GOLD, fontWeight: 600 }}>Pillar {index} of {total}</div>
          <h2 style={{ fontFamily: serif, fontWeight: 700, fontSize: 'clamp(22px,3.6vw,28px)', margin: '2px 0 0', color: CREAM, lineHeight: 1.1 }}>{p.title}</h2>
        </div>
      </div>

      {p.subtitle && <div style={{ fontSize: 14.5, color: GOLD, marginBottom: 10 }}>{p.subtitle}</div>}
      {p.intro && <p style={{ fontSize: 15, color: MUTED, lineHeight: 1.7, margin: '0 0 18px' }}>{p.intro}</p>}

      {/* The video sits above Your Focus (AXIS-37): it introduces the pillar,
          and the focus points and practical steps read as the detail behind it.
          Keyed on the path so switching slides remounts rather than reusing one
          element with a new src, which leaves some browsers on the old frame. */}
      <VideoPlayer key={p.video || 'none'} path={p.video} label={p.title} />

      {focus.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ letterSpacing: '.16em', textTransform: 'uppercase', fontSize: 10.5, color: GOLD, marginBottom: 10 }}>Your Focus</div>
          <motion.ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 9 }}
            variants={focusContainer} initial="hidden" animate="show">
            {focus.map((f, i) => (
              <motion.li key={i} variants={focusItem}
                style={{ display: 'flex', gap: 11, alignItems: 'baseline', fontSize: 14.5, color: CREAM, lineHeight: 1.55, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 9, padding: '11px 14px' }}>
                <span style={{ color: GOLD, fontWeight: 700, flexShrink: 0 }} aria-hidden="true">✓</span>
                <span>{f}</span>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      )}

      <PracticalApplication practical={p.practical} delay={0.18 + focus.length * 0.08} />

      {p.principle && (
        <motion.blockquote initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.26 + focus.length * 0.08 }}
          style={{ margin: 0, borderLeft: `3px solid ${GOLD}`, background: GOLD_SOFT, border: `1px solid ${GOLD_BORDER}`, borderLeftWidth: 3, borderRadius: '0 10px 10px 0', padding: '16px 18px' }}>
          <div style={{ letterSpacing: '.16em', textTransform: 'uppercase', fontSize: 10, color: GOLD, marginBottom: 6 }}>The Axis Principle</div>
          <p style={{ margin: 0, fontFamily: serif, fontStyle: 'italic', fontSize: 'clamp(15px,2.3vw,17px)', color: CREAM, lineHeight: 1.5 }}>{p.principle}</p>
        </motion.blockquote>
      )}
    </div>
  );
}

function DoneSlide({ c, onReplay, onBack }) {
  return (
    <div style={{ textAlign: 'center', paddingTop: 10 }}>
      <motion.div initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 16, delay: 0.1 }}
        style={{ width: 74, height: 74, borderRadius: '50%', margin: '0 auto 20px', background: GOLD, color: ON_GOLD, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.2 4.3L19 7" /></svg>
      </motion.div>
      <div style={{ letterSpacing: '.2em', textTransform: 'uppercase', fontSize: 11, color: GOLD, fontWeight: 600, marginBottom: 12 }}>Journey complete</div>
      <h1 style={{ fontFamily: serif, fontWeight: 700, fontSize: 'clamp(24px,4.4vw,34px)', lineHeight: 1.12, margin: '0 0 12px', color: CREAM }}>
        You’ve completed the Axis Interview Code.
      </h1>
      <p style={{ fontSize: 15, color: MUTED, lineHeight: 1.65, maxWidth: 520, margin: '0 auto' }}>
        You’ve worked through all four winning pillars. Return any time during your access to revisit a pillar before an interview.
      </p>

      {c.standard && (
        <div style={{ marginTop: 26, background: GOLD_SOFT, border: `1px solid ${GOLD_BORDER}`, borderRadius: 12, padding: '26px 24px', boxShadow: 'var(--ax-card-shadow)', maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
          <div style={{ letterSpacing: '.2em', textTransform: 'uppercase', fontSize: 11, color: GOLD, fontWeight: 600, marginBottom: 12 }}>The Axis Standard</div>
          <p style={{ fontFamily: serif, fontSize: 'clamp(16px,2.4vw,19px)', lineHeight: 1.55, color: CREAM, margin: 0 }}>{c.standard}</p>
        </div>
      )}

      <div style={{ marginTop: 26, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button type="button" className="ax-present-btn ghost" onClick={onBack}>← Last pillar</button>
        <button type="button" className="ax-present-btn" onClick={onReplay}>↺ Start over</button>
      </div>
    </div>
  );
}
