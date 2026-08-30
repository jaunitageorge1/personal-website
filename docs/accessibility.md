# Accessibility

The site's brand claim is **WCAG 2.2 AA**. Its audience hires on accessibility,
so conformance here is a functional requirement, not a badge. This document
records what was built, what is verified automatically, where the design system
was deliberately overruled, and what a human still has to check.

## What is verified on every build

`npm run check` builds the site and then runs two audits. Both exit non-zero on
failure, so they can gate a deploy.

### `npm run check:a11y`

Runs **axe-core** over all nine pages against `wcag2a`, `wcag2aa`, `wcag21a`,
`wcag21aa`, `wcag22aa` and `best-practice`, then adds four checks axe cannot
make by itself:

| Check | Criterion | How |
| --- | --- | --- |
| Reflow at 320 CSS px | 1.4.10 | Page must not scroll horizontally at a 320px viewport |
| Reflow at 400% zoom | 1.4.10 | 1280px viewport at `zoom: 400%` — the other way the SC is measured |
| Text resized to 200% | 1.4.4 | Root font size forced to 32px; layout must still hold |
| Landmark shape | 1.3.1 | Exactly one `<main>` and one `<h1>`, `<footer>` outside `<main>`, no skipped heading levels |

Third-party requests are blocked during the audit, so it is deterministic and
runs offline.

### `npm run check:contrast`

Reads the real token values out of `tokens.css`, composites every
`color-mix(… N%, transparent)` foreground over the ground it actually sits on,
and measures the WCAG contrast ratio for 49 combinations — body copy, muted
text, accent text, pills, the résumé's ink on white, focus rings and control
boundaries.

Where a ground is a gradient, the ratio is measured against the gradient's
**lightest point**, not the flat colour underneath it, because that is the worst
case for light text on a dark page. The home and inner pages are measured
against the accent bloom (`#26233a`), the indigo bands against their glow
(`#313676`).

## Deliberate departures from the design system

Two values in `_ds/styles.css` do not meet the standard the site claims. Both
were changed, and both changes are small enough to preserve the look.

**`.card-meta` — 50% → 62% of the text colour.**
At 50% over `--color-surface` it measures **4.25:1**, below the 4.5:1 that 1.4.3
requires of normal text. At 62% it measures 5.76:1. Used by the blog cards'
read-time line.

**Control boundaries — `--color-divider` → `--color-border-control`.**
`--color-divider` measures **1.58:1** against both the page ground and the card
fill. That is correct for a decorative hairline and wrong for the edge of a
control: 1.4.11 requires 3:1 of any boundary that is what identifies a
component. Text inputs and secondary buttons now use `--color-border-control`
(`--color-neutral-600`), the lightest step on the neutral ramp that clears the
bar, at **3.52:1**. Rules, table row strips and section dividers keep
`--color-divider`, where 1.4.11 does not apply.

A third departure is structural: the Blog prototype places its `<footer>` inside
`<main>`. The handoff's own requirement — footer outside main — was followed
instead, on every page.

## Built in, not bolted on

**Structure.** One `<h1>` per page and a strict `h1 → h2 → h3` outline, with
visually-hidden headings where the design shows only a kicker. Every `<section>`
is named by `aria-labelledby` pointing at a real heading. `<main>` spans all page
content including the full-bleed bands; the footer sits outside it. Lists whose
markers are removed carry `role="list"`, which Safari otherwise strips.

**Sizing.** All type is in `rem` against an unmodified root, so it tracks the
reader's own browser font-size preference — not just page zoom. The containers
are in `rem` too (measure, gutters, section rhythm, grid track minimums), so the
whole layout scales with that preference rather than text growing inside fixed
boxes. Breakpoints are in `em`. Fluid display sizes carry a `rem` term inside
the `clamp()` middle, so they respond to font-size preference as well as
viewport; a bare `vw` value would ignore it. Hairlines stay at 1–2px.

**Reflow.** No fixed heights on anything holding text, so line-height, word- and
letter-spacing can all be overridden without clipping (1.4.12). Long words and
URLs wrap rather than forcing the page sideways. The one piece of content wider
than a narrow viewport — the selected-talks table — scrolls inside its own
region, which is keyboard focusable, named for screen readers, and shows a focus
ring. That is the documented exception to 1.4.10; the page itself never scrolls
sideways.

**Real text.** Nothing is baked into an image — the statistics, the résumés and
the numbered service rows are all live text, selectable, searchable and
translatable. The generated PDFs carry `/StructTreeRoot`, `/Marked true` and
`/Lang (en)`, so a screen reader navigates them by heading and list the same way
it navigates the HTML.

**Images.** Alt text describes the subject, not the file. The draft blog cards
have no photograph yet, so they show a decorative panel that is
`aria-hidden="true"` rather than being given invented alt text. Every `<img>`
carries intrinsic `width`/`height`, so nothing shifts as the page settles.

**Colour is never the only cue.** The current nav item is marked by
`aria-current="page"` and shown with an underline as well as the accent colour.

**Keyboard.** A skip link on every page, focus never removed (only restyled),
and a visible `:focus-visible` ring at 2px with 2px offset that clears 3:1 on
every ground it appears over. The résumé's Print button is added by script only
after scripting is confirmed available, so no reader is offered a dead control;
the PDF download beside it is a plain link and always works.

**Motion.** There is none — no animation, no transition, no scroll effect. A
`prefers-reduced-motion` block is kept as a tripwire in case any is ever added.

**Language.** `<html lang="en">` throughout, with `lang="fr"` and `lang="es"` on
the individual talk and award titles that are not in English, so a screen reader
switches pronunciation instead of reading them as English.

**Forced colors.** A `forced-colors` block keeps the focus ring, card edges and
button borders visible once Windows High Contrast replaces the palette.

**No email in the markup.** The contact form is the only route in; no address is
rendered anywhere on the site. The résumés are the deliberate exception — a
résumé without contact details does not do its job — and that is a one-line
switch (`showDirectContact` in `src/_data/resumes.js`).

## What automation does not cover

axe catches roughly a third to a half of what matters. Before shipping, a human
still needs to:

- **Tab through every page.** Confirm the focus order matches the visual order,
  that the skip link works, that the talks table can be scrolled from the
  keyboard, and that nothing traps focus.
- **Run a screen reader** — NVDA or JAWS on Windows, VoiceOver on macOS/iOS.
  Check the heading outline reads as a sensible table of contents, that the stat
  band's number/label pairs read as pairs, and that the form's labels, required
  states and error messages are announced.
- **Submit the contact form with an error**, and confirm the browser's own
  validation message is announced and reachable.
- **Open a generated PDF in a screen reader** and confirm the tag tree is
  navigable.
- **Test at 400% zoom in a real browser**, not just an emulated viewport.
- **Re-check the photograph's alt text** if the image is ever swapped.

Record the result of that pass here when it is done.
