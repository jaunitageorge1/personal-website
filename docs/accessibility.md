# Accessibility

The site's brand claim is **WCAG 2.2 AA**. Its audience hires on accessibility,
so conformance here is a functional requirement, not a badge. This document
records what was built, what is verified automatically, where the design system
was deliberately overruled, and what a human still has to check.

## What is verified on every build

`npm run check` builds the site and then runs four audits. All exit non-zero on
failure, and they really do gate the deploy: `.github/workflows/deploy.yml`
runs them before uploading to GitHub Pages, against the same prefixed build
that ships, so a change that breaks this page's claims cannot reach the live
URL. `.github/workflows/check.yml` runs the same suite on every pull request.

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
and measures the WCAG contrast ratio for 44 combinations — body copy, muted
text, accent text, pills, the résumé's ink on white, focus rings and control
boundaries. Text is held to **AAA (1.4.6, 7:1)**, not the AA the site claims;
non-text keeps AA's 3:1. See "Text contrast" below.

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

Two `html-validate` rules are relaxed, each for a stated reason, in
`scripts/qa-audit.mjs`: `no-redundant-role` and `prefer-native-element` would
strip the `role="list"` this design needs (see below).

### `scripts/verify-live.mjs` (CI only)

Runs after every deploy, against the live URL, from the GitHub runner. Repeats
the axe and reflow checks with third-party resources loading for real instead of
blocked — the embedded video and the Picflow photograph — and confirms every
page, link, asset and PDF is actually served under the deployed path. The
build-time audits cannot see any of that.

### `npm run check:contact`

The contact route, with JavaScript switched off — see "Contact" below.

## Text contrast: AAA, not AA

The handoff dims secondary copy by painting the text colour at reduced opacity —
seven different percentages, from 55% (the footer, 4.8:1) to 82%. All of them
met AA's 4.5:1, and the owner asked for more. Every text colour on the site now
clears **7:1**, the AAA floor of 1.4.6, and the contrast audit enforces that
floor rather than AA's.

Three tiers in `tokens.css` replace the ad-hoc percentages:

| tier | opacity | on the page | on a card | on the indigo band |
| --- | --- | --- | --- | --- |
| `--text-strong` | 90% | 10.4:1 | 10.4:1 | 7.7:1 |
| `--text-soft` | 82% | 8.9:1 | 8.9:1 | — |
| `--text-muted` | 74% | 7.5:1 | 7.5:1 | — |

The band is lighter than the page, so only the strong tier clears 7:1 there;
the stat labels and the training-topic lists on it use strong alone.

The accent needed the same treatment. `--color-accent` is the brand blurple and
measures 4.7:1 on the page — fine for AA text and more than enough for a focus
ring or a border, which is what it still draws. As *text* (kickers, button
labels, the numbered services, the current-page nav link, outline pills) the
site uses `--color-accent-text`, one stop up the ramp, at 7.4:1. Links were
already `--color-accent-300` at 10.1:1.

The résumés got the same pass on white: headings and links moved from
`--color-accent-700` (6.8:1) to `-800` (10.3:1), and the contact line from
8.5:1 to 12:1. The PDFs are rendered from the same stylesheet, so they follow.

What did not change: the focus ring (4.7:1 on the page, 3.4:1 on the band)
stays the base accent, because 1.4.11 asks 3:1 of a boundary and the truer hue
is worth keeping there.

## Deliberate departures from the design system

Two values in `_ds/styles.css` do not meet the standard the site claims. Both
were changed, and both changes are small enough to preserve the look.

**`.card-meta` — 50% of the text colour → the muted tier.**
At 50% over `--color-surface` it measures **4.25:1**, below the 4.5:1 that 1.4.3
requires of normal text; the muted tier measures 7.5:1. Used by the blog cards'
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

The PDFs are generated from the résumé pages at build time rather than
committed, so they cannot drift out of step with the HTML — and the generator
fails the build if the contact details did not render, rather than shipping a
résumé nobody can reply to.

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
every ground it appears over. The one place the page cannot reach is the
embedded video — see below. The résumé's Print button is added by script only
after scripting is confirmed available, so no reader is offered a dead control;
the PDF download beside it is a plain link and always works.

**Motion.** There is none — no animation, no transition, no scroll effect. A
`prefers-reduced-motion` block is kept as a tripwire in case any is ever added.

**Language.** `<html lang="en">` throughout, with `lang="fr"` and `lang="es"` on
the individual talk and award titles that are not in English, so a screen reader
switches pronunciation instead of reading them as English.

**Forced colors.** A `forced-colors` block keeps the focus ring, card edges and
button borders visible once Windows High Contrast replaces the palette.

## Contact

There is no contact form. The route in is the email address, as text with a
`mailto:` link on the home page and on every résumé — visible, copyable into
webmail, and needing no scripting. A form was tried first, handing off to the
visitor's mail app; on a desktop with no mail app configured that visibly does
nothing, which is worse than an address. `check:contact` runs with JavaScript
switched off and asserts the link is present, correct, visible and copyable,
that every résumé's contact line is plain markup with working `mailto:` and
`tel:` links, and that nothing of the old form or its script survives in the
build.

## The embedded video and keyboard focus

Tabbing to the YouTube embed moves focus **into** the embedded document, not
onto the `<iframe>` element. Measured in Chromium: after Tab, `activeElement`
is the iframe, but `iframe:focus` is false and no ancestor matches
`:focus-within` — so the embedding page has no selector that can draw a ring
for that state. The same iframe *does* match `:focus` when focused
programmatically, which is the trap: a `:focus-within` ring on the wrapper
looks like a fix and passes a naive check while doing nothing for the keyboard
user. That rule is kept, but only as defensive styling for the programmatic
case, and its comment says so.

Indicating focus inside the player is the player's job, and YouTube's controls
carry their own focus styling. The QA audit therefore treats "focus moved into
a nested browsing context" as out of this page's hands rather than reporting a
failure it cannot fix. The exemption is deliberately narrow — it applies only
when the focused element is an iframe that does not itself match `:focus`;
removing the site's focus ring still produces 72 findings, so the check has not
been blinded.

**The manual check this replaces:** tab into the video and confirm the player
shows a visible focus indicator on its controls.

## The embedded talk video and its captions (1.2.2)

The Speaking page embeds the WebAIM 2025 "Win with Metrics" talk in the YouTube
player (the `youtube-nocookie.com` privacy-enhanced embed, which is the same
player without the tracking cookies). Embedding a video makes its captions this
page's responsibility under SC 1.2.2 (Captions, Prerecorded), and that cannot
be checked from the build — it depends on the upload.

**Confirmed captioned.** The owner confirmed in September 2026 that the upload
carries captions on YouTube. The embed passes `cc_load_policy=1`, so they are
on by default rather than waiting to be found in the player's menu. The
"Watch on YouTube" link beside the embed reaches the same captioned video for
anyone who prefers the full player.

If the video is ever swapped, the new upload needs the same confirmation, and
the captions must be human-made or human-corrected — YouTube's auto-generated
captions do not satisfy 1.2.2. A video that cannot be captioned should be
linked rather than embedded, which carries no such obligation.

SC 1.2.5 (Audio Description) is AA too, but a recorded conference talk whose
visual content is slides already described in the speech satisfies it through
1.2.3's audio-description-or-transcript alternative.

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
  band's number/label pairs read as pairs, and that the contact section's
  email link is announced as a link to that address.
- **Open a generated PDF in a screen reader** and confirm the tag tree is
  navigable.
- **Test at 400% zoom in a real browser**, not just an emulated viewport.
- **Re-check the photograph's alt text** if the image is ever swapped.
- **Tab into the embedded video** and confirm the player's controls show a
  visible focus indicator, and that its captions come on by default.
- **Follow the contact section's email link** from a phone and from a desktop,
  and confirm the mail app opens addressed to the right address.

Record the result of that pass here when it is done.
