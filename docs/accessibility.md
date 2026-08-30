# Accessibility

The site's brand claim is **WCAG 2.2 AA**. Its audience hires on accessibility,
so conformance here is a functional requirement, not a badge. This document
records what was built, what is verified automatically, where the design system
was deliberately overruled, and what a human still has to check.

## What is verified on every build

`npm run check` builds the site and then runs four audits. All exit non-zero on
failure, so they gate a deploy.

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

### `npm run check:qa`

The machine-checkable criteria axe does not cover, driven in a real browser:

| Check | Criterion |
| --- | --- |
| Every interactive element reachable by Tab, in DOM order, no trap | 2.1.1, 2.1.2, 2.4.3 |
| A visible focus indicator on every focusable element | 2.4.7 |
| The focused element is never covered by other content | 2.4.11 |
| Targets at least 24×24 CSS px | 2.5.8 |
| Text spacing can be overridden without content being clipped | 1.4.12 |
| Pinch-zoom is not disabled | 1.4.4 |
| Inputs collecting the user's own data carry `autocomplete` | 1.3.5 |
| Page titles unique and descriptive | 2.4.2 |
| No vague link text; no two links with the same text going elsewhere | 2.4.4 |
| The same route to contact on every page | 3.2.6 |
| The skip link is the first Tab stop, becomes visible, and has a target | 2.4.1 |
| Internal links and asset references resolve; HTML is valid | 4.1.1 |

Two of the 2.5.8 exceptions are implemented rather than assumed, because
without them the check produces noise instead of findings. The **inline**
exception is detected by looking for a non-whitespace text node beside the link
in its parent — so a link in a sentence is exempt and a nav whose children are
all links is not. The **spacing** exception is measured properly: a 24px
circle centred on each undersized target must not intersect another target or
another undersized target's circle.

Three `html-validate` rules are switched off, each for a stated reason, in
`scripts/qa-audit.mjs`. `no-redundant-role` and `prefer-native-element` would
strip the `role="list"` this design needs (see below); `wcag/h32` wants a submit
button in the static markup, which the contact form deliberately does not have
(also below).

### `npm run check:form`

Twenty behavioural assertions on the contact form in a real browser — the one
interactive thing on the site, and the one piece that depends on JavaScript.
See "The contact form" below.

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

Everything else was left exactly as the handoff specifies. Every muted value in
the design was measured against the real gradient grounds before being accepted;
`.card-meta` was the only one that fell short, so it was the only one changed.
Several others were bumped during the first pass and then reverted, because
"it passes" is not a reason to alter a design whose values are final.

### `role="list"` on lists whose markers are removed

`role="list"` on a `<ul>` or `<ol>` is redundant per spec, and `html-validate`
says so. It is kept anyway: Safari with VoiceOver drops list semantics from any
list styled `list-style: none`, and this design styles every list that way. The
role is what keeps "list, 6 items" being announced. The rules that flag it are
switched off in the QA audit with that reason recorded.

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

## The contact form

The form does what the design handoff's prototype does: on submit it opens the
reader's own email app with the message pre-filled, addressed to Jaunita, with
the subject `[Site] <topic> — <name>` and the sender's name and address signed
into the body. There is no backend and nothing is posted to the site.

**The address is in no file the site serves.** It is base64-encoded at build
time into `/assets/js/contact.js` and assembled at runtime. The same treatment
is applied to the résumés' contact line, which is filled in by the same script
rather than written into the markup — so the site serves no HTML, CSS, JS or XML
containing the address or the phone numbers as literal text. `check:form`
asserts this over every built file, so a future edit cannot quietly reintroduce
it.

Be clear-eyed about what that buys: it stops address-harvesting crawlers, which
read markup and do not run scripts. It is not secrecy. Anyone who opens the
console can read the address. That is the accepted trade for a form with no
backend. The generated PDFs carry the details in full, because headless Chromium
runs the script — and `resumes:pdf` fails loudly if it ever does not, rather
than shipping a résumé nobody can reply to.

**No dead controls.** The Send button does not exist in the static HTML. It is
created by the script, so a reader without JavaScript is never shown a button
that cannot work. In its place a `<noscript>` block sits *above* the fields —
not below them — saying plainly that the form will not send and offering
LinkedIn instead, before anyone invests effort filling it in. The note
explaining what Send does is `hidden` until the script reveals it, since without
a Send button it would be describing something that is not there.

This is why `html-validate`'s `wcag/h32` rule is switched off. The rule wants a
submit button in the markup; rendering a dead one would be worse than rendering
none.

**Handing off is invisible, so it is announced.** Setting `location.href` to a
`mailto:` changes nothing on screen, and on a device with no mail app configured
nothing happens at all. Without feedback a screen-reader user could not tell
"sent" from "silently broken". A `role="status"` region — present but empty at
load, because a live region must exist before content is put into it — is filled
in on submit with what just happened and a real fallback link carrying the same
message. Its text is not the address, so the address only reaches the DOM after
someone has deliberately pressed Send.

**Validation** is the browser's own: `required` on name, email and message, and
`type="email"` on the address. The submit handler is only reached once the form
is valid, so an incomplete submit is blocked by the user agent and focus moves
to the first bad field. `autocomplete="name"` and `autocomplete="email"` let a
browser fill the fields from the reader's own profile (1.3.5).

**The honeypot** is a `company` field parked off-screen, `tabindex="-1"` and
inside `aria-hidden="true"`, so no human and no screen reader ever meets it.
Anything in it aborts the send silently, leaving no status trace.

Switching `form.provider` in `src/_data/site.js` to `netlify` or `formspree`
swaps in a real backend that works with scripting switched off; the script then
does nothing. Neither option renders the address either.

## Open item: the embedded talk video

The Speaking page embeds the WebAIM 2025 "Win with Metrics" talk from YouTube.
Embedding a video makes its captions this page's responsibility under SC 1.2.2
(Captions, Prerecorded), and that cannot be checked from the build — it depends
on the upload. The embed now carries `cc_load_policy=1`, which turns captions on
by default *if the video has them*.

**Someone needs to confirm the upload is captioned**, and that the captions are
human-made or human-corrected — YouTube's auto-generated captions do not satisfy
1.2.2. If it is not captioned, either caption it or replace the embed with a
link to the talk, which carries no such obligation. This is the one WCAG 2.2 AA
criterion the site cannot self-certify.

SC 1.2.5 (Audio Description) is AA too, but a recorded conference talk whose
visual content is slides already described in the speech generally satisfies it
through 1.2.3's audio-description-or-transcript alternative. Worth a look while
checking the captions.

## Multiple ways to reach a page (2.4.5)

Two, as the SC requires. The main navigation appears on all four content pages
in the same order, and every page links back to the home page, which links to
every other page on the site including all four résumés — techniques G125 and
G185 in combination. The résumé documents deliberately carry only a back link
rather than the full navigation, because the design treats them as standalone
printable documents; they remain reachable from the home page's "Hire me"
section and from the sitemap.

## What automation does not cover

axe catches roughly a third to a half of what matters, and the QA audit adds the
mechanically checkable rest. Before shipping, a human still needs to:

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
- **Confirm the embedded talk is captioned** — see the open item above.
- **Send yourself a message through the contact form** from a phone and from a
  desktop, and confirm the mail app opens with the subject and body intact.

Record the result of that pass here when it is done.
