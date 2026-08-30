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
step for styles, no framework, and **no client-side JavaScript** other than one
optional 14-line file that adds a Print button to the résumés. Output is static,
semantic HTML.

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
  assets/
    css/            tokens.css (design tokens) · site.css · resume.css
    fonts/          Inter, self-hosted — SIL OFL 1.1, licence included
    images/         headshot
    resumes/        generated tagged PDFs (committed)
  *.njk             the pages
scripts/
  check-contrast.mjs    measures 49 colour pairs against WCAG thresholds
  a11y-audit.mjs        axe-core + reflow, zoom, text-resize and landmark checks
  build-resume-pdfs.mjs pre-renders each résumé to a tagged PDF
docs/accessibility.md
```

## Commands

```bash
npm install

npm run dev            # local server with live reload
npm run build          # build to _site/
npm run check          # build, then contrast audit + accessibility audit
npm run check:a11y     # axe-core, reflow at 320px and 400% zoom, text at 200%
npm run check:contrast # colour contrast across the whole palette
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

**Contact form.** No email address is rendered anywhere in the site's HTML. The
backend is set in `site.js` → `form.provider`:

- `"netlify"` (default) — Netlify Forms handles the POST and the honeypot check
  server-side. Nothing to configure.
- `"formspree"` — set `form.endpoint` to your form URL.
- `"none"` — the form is not rendered; the contact section falls back to
  LinkedIn.

All three work with JavaScript switched off. **If you deploy somewhere other
than Netlify, change this** — otherwise the form will POST into nothing.

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
- **Résumé contact details.** The site exposes no email address; the résumés do,
  because a résumé without contact details does not do its job. Set
  `showDirectContact: false` in `src/_data/resumes.js` to drop the address and
  phone numbers from the public HTML résumés and their PDFs.
- **Blog subscriptions** currently route to the contact form, as specified,
  until a newsletter service is chosen.

## Credits

Design system: **Nocturne**, from the design handoff — tokens ported verbatim
into `src/assets/css/tokens.css`, which remains the single source of truth for
colour, type, spacing, radius and elevation.

Typeface: [Inter](https://rsms.me/inter/) by Rasmus Andersson, SIL Open Font
License 1.1 (`src/assets/fonts/Inter-LICENSE.txt`).
