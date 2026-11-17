// Accent text colour that stays readable in both themes. In dark mode it is the colour
// itself; in light mode --tone-mix (set in globals.css) darkens it.
export const tone = hex => `color-mix(in srgb, ${hex} var(--tone-mix, 100%), #000)`;
