// Shared motion language (AXIS-25). One set of easings, durations and variants
// so every animation across the marketing site and the portal feels like the
// same system. Only `transform` and `opacity` are animated — never width,
// height or layout — so nothing shifts the page or triggers reflow.
//
// framer-motion's default reducedMotion is "never", so these play even when the
// OS/browser has animations off. That's intentional here (see the portal's
// MotionConfig and the AXIS-24/25 decision): the entrances are part of the feel.

export const EASE = [0.4, 0, 0.2, 1];

// Trigger a scroll reveal once, when the element's top has risen ~120px into
// the viewport. Margin-based (not `amount`) so it stays height-independent — a
// block taller than the viewport still reveals instead of staying hidden.
export const VIEWPORT = { once: true, margin: '0px 0px -120px 0px' };

// A single element fading + rising into place.
export const revealTransition = { duration: 0.55, ease: EASE };

// A container that releases its children one after another.
export const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};

// A child inside a stagger container.
export const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};
