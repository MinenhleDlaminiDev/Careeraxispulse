// Portal brand tokens. These resolve to the CSS variables defined on .ax-portal
// in index.css, so the same `color: GOLD` switches with the light/dark theme
// (AXIS-19). Names kept from the original (GOLD/CREAM/MUTED/SERIF) so existing
// imports keep working; CREAM now means "primary text", which is cream on dark
// and navy ink on light.
export const GOLD = 'var(--ax-gold)';        // brand gold: fills, borders, accents
export const GOLD_INK = 'var(--ax-gold-ink)'; // gold used as text (readable per theme)
export const ON_GOLD = 'var(--ax-on-gold)';  // text on a gold button
export const NAVY = 'var(--ax-navy)';        // brand navy, constant in both themes
export const CREAM = 'var(--ax-text)';       // primary text
export const TEXT = 'var(--ax-text)';
export const MUTED = 'var(--ax-muted)';
export const SURFACE = 'var(--ax-surface)';
export const SURFACE2 = 'var(--ax-surface-2)';
export const BORDER = 'var(--ax-border)';
export const DANGER = 'var(--ax-danger)';
export const DANGER_SOFT = 'var(--ax-danger-soft)';
export const DANGER_BORDER = 'var(--ax-danger-border)';
export const GOLD_SOFT = 'var(--ax-gold-soft)';
export const GOLD_BORDER = 'var(--ax-gold-border)';
export const SERIF = "'Source Serif 4', serif";
