import { motion } from 'framer-motion';
import { EASE, VIEWPORT, revealTransition, containerVariants, itemVariants } from '../motion.js';

// Scroll-reveal helpers for the marketing site (AXIS-25). They wrap an existing
// block and animate it up into view the first time it's scrolled to — nothing
// is ever left hidden, because framer plays the animation even under reduced
// motion (its default), and the element ends at its natural position.
//
// Backgrounds live on the full-bleed <section> wrappers; these wrap the inner
// content <div>s, so the section's colour band is never clipped by the reveal.

// A single block that fades + rises into view.
export default function Reveal({ children, style, className, delay = 0, y = 22 }) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ ...revealTransition, delay }}
    >
      {children}
    </motion.div>
  );
}

// A container whose direct <Item> children reveal one after another.
export function Stagger({ children, style, className }) {
  return (
    <motion.div
      className={className}
      style={style}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      variants={containerVariants}
    >
      {children}
    </motion.div>
  );
}

// A child of <Stagger>. `as` picks the element (e.g. "a" for a link card).
export function Item({ children, style, className, as = 'div', ...rest }) {
  const Comp = motion[as] || motion.div;
  return (
    <Comp className={className} style={style} variants={itemVariants} {...rest}>
      {children}
    </Comp>
  );
}

export { EASE };
