# jaunitaflessas.com

Personal portfolio and services site for **Jaunita Flessas** — digital
accessibility leader, attorney, trainer and photographer — built to win contract
work and full-time roles.

Four content pages (Home, Services, Speaking & Writing, Blog) plus four
role-targeted résumés, each served as accessible HTML and as a pre-rendered
tagged PDF.

The site's brand claim is **WCAG 2.2 AA**, and its audience hires on
accessibility. Conformance is treated as a functional requirement — see
[`docs/accessibility.md`](docs/accessibility.md) for what is verified, what is
checked by hand, and where the design system was deliberately overruled.

## Stack

[Eleventy](https://www.11ty.dev) with Nunjucks templates. Plain CSS, no build
step for styles, no framework, and **two small scripts**: one opens the reader's
email app from the contact form and fills in the résumés' contact line, the
other adds a Print button beside the résumé PDF links. Everything else is
static, semantic HTML that works with scripting switched off.

```
src/
  _data/            all copy lives here — edit content without touching markup
    site.js         identity, outbound links, contact-form backend
    home.js         hero, stats, values, services, projects, roles, images
    services.js     six practices + the training catalogue
    speaking.js     upcoming, talks, standards, publications
    blog.js         topics, personal section, draft posts
    resumes.js      the four résumés
  _includes/
    layouts/        base (head), page (site shell), resume (document shell)
    partials/       nav, footer
  contact-script.njk  generates /assets/js/contact.js with the address encoded
  assets/
    css/            tokens.css (design tokens) · site.css · resume.css
    fonts/          Inter, self-hosted — SIL OFL 1.1, licence included
    images/         headshot
    resumes/        generated tagged PDFs (committed)
  *.njk             the pages
scripts/
  check-contrast.mjs    measures 52 colour pairs against WCAG thresholds
  a11y-audit.mjs        axe-core + reflow, zoom, text-resize and landmark checks
  qa-audit.mjs          keyboard, target size, text spacing, links, HTML validity
  contact-form-test.mjs contact form behaviour, with and without JavaScript
  build-resume-pdfs.mjs pre-renders each résumé to a tagged PDF
docs/accessibility.md
```

## Commands

```bash
npm install

npm run dev            # local server with live reload
npm run build          # build to _site/
npm run check          # build, then all four audits below
npm run check:contrast # 52 colour pairs measured against WCAG thresholds
npm run check:a11y     # axe-core, reflow at 320px and 400% zoom, text at 200%
npm run check:qa       # keyboard, target size, text spacing, links, HTML validity
npm run check:form     # contact form behaviour, with and without JavaScript
npm run resumes:pdf    # regenerate the four tagged PDFs (needs Chromium)
```

`npm run check` must pass before deploying. Both audits exit non-zero on
failure.

## Editing content

Everything readable on the site is in `src/_data/`. A few things worth knowing:

**Contract availability.** `home.js` → `available: false` removes the "Available
for contract work" tag from the hero.

**Résumés.** Edit `src/_data/resumes.js`, then run `npm run build && npm run
resumes:pdf` — the committed PDFs are not regenerated automatically, so they
would otherwise drift from the HTML.

**Blog posts.** The six posts in `blog.js` are drafts with placeholder titles, as
the design specifies. Adding `image: { src, alt }` to a post gives its card a
real photograph; without one the card shows a decorative panel and no image is
announced to screen readers. Write real alt text — the panel is deliberately not
a fallback for a missing description.

**Contact form.** On submit it opens the sender's own email app with the message
pre-filled — subject `[Site] <topic> — <name>`, their name and address signed
into the body. No backend, nothing posted to the site.

Your address is in **no file the site serves**: it is base64-encoded at build
time into `/assets/js/contact.js` and assembled at runtime, and the résumés'
contact line is filled in by the same script. `npm run check:form` asserts that
over every built file, so a later edit cannot quietly put it back. That stops
address-harvesting crawlers, which read markup and do not run scripts — it is
not secrecy, and anyone who opens the console can read it.

Change your address, or the subject prefix, in `site.js` → `form.mailto`.

Other backends, via `site.js` → `form.provider`:

- `"mailto"` (default) — the above.
- `"netlify"` — Netlify Forms handles the POST and the honeypot server-side.
- `"formspree"` — set `form.endpoint` to your form URL.
- `"none"` — no form; the contact section falls back to LinkedIn.

The last three work with JavaScript switched off; `mailto` cannot, since opening
a mail app requires it. In that case the Send button is not rendered at all and
a note above the fields says so, rather than offering a button that does
nothing.

## Deploying

Configured for Netlify (`netlify.toml`): `npm run build`, publish `_site`. The
build needs only Node 22 — the résumé PDFs are committed, so no browser is
downloaded at deploy time.

`netlify.toml` also sets a strict `Content-Security-Policy`. There is no inline
script or style anywhere, so the policy needs no `unsafe-inline`. If you add an
external resource, add it to the policy.

Set the canonical URL for the sitemap and `<link rel="canonical">` via `site.js`
→ `url`, or the `URL` environment variable. Netlify sets `URL` itself.

Any static host works, but you would then need to replace the Netlify-specific
pieces: the form backend and the headers block.

## Known follow-ups

These are flagged in the design handoff and are the owner's calls, not bugs:

- **The headshot** (`src/assets/images/headshot.jpg`) is the Agile Testing Days
  speaker photo carried over from the prototype. The handoff asks for it to be
  replaced with an owned original. Alt text is in `home.js` → `portrait.alt` and
  should be rewritten alongside it.
- **The home-page photograph** is still served from Jaunita's Picflow CDN rather
  than self-hosted, because that host was unreachable from the build
  environment. To localise it: download the file to `src/assets/images/`, point
  `home.js` → `photograph.src` at it, and drop `cdn.picflow.com` from `img-src`
  in `netlify.toml`.
- **The embedded talk video** on the Speaking page needs its captions confirmed.
  Embedding it makes them this site's responsibility under WCAG 1.2.2, and that
  cannot be checked from the build. This is the one criterion the site cannot
  self-certify — see `docs/accessibility.md`.
- **Résumé contact details** are shown on the HTML résumés and printed in full
  on the PDFs, assembled at runtime like the form's. Set
  `showDirectContact: false` in `src/_data/resumes.js` to drop them entirely.
- **Blog subscriptions** currently route to the contact form, as specified,
  until a newsletter service is chosen.

## Credits

Design system: **Nocturne**, from the design handoff — tokens ported verbatim
into `src/assets/css/tokens.css`, which remains the single source of truth for
colour, type, spacing, radius and elevation.

Typeface: [Inter](https://rsms.me/inter/) by Rasmus Andersson, SIL Open Font
License 1.1 (`src/assets/fonts/Inter-LICENSE.txt`).
