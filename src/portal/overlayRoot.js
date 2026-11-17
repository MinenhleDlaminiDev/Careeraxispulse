// Where full-screen overlays (the presentation, modals) get rendered.
//
// WHY THIS EXISTS (AXIS-35): a `position:fixed` element is positioned against
// the viewport ONLY if no ancestor has a transform/filter/perspective. The
// portal's route-transition wrapper in PortalLayout is a framer motion.div that
// animates `y`, so while it holds any transform — including a left-over
// `translateY(18px)` when the animation is interrupted — it becomes the
// containing block for fixed descendants. That silently turned the "Present
// full screen" overlay into a 343x50 clipped box instead of a full-screen one,
// and every Modal was exposed to the same failure.
//
// We portal into `.ax-portal` rather than `document.body` on purpose: the theme
// tokens (--ax-*) and the light/dark `data-theme` attribute live on `.ax-portal`,
// so rendering into body would strip every colour. `.ax-portal` sits above the
// transformed wrapper, so it fixes the positioning while keeping the theme.
export function overlayRoot() {
  if (typeof document === 'undefined') return null;
  return document.querySelector('.ax-portal') || document.body;
}
