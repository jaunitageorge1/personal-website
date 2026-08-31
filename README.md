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
  *.njk             the pages
scripts/
  check-contrast.mjs    measures 52 colour pairs against WCAG thresholds
  a11y-audit.mjs        axe-core + reflow, zoom, text-resize and landmark checks
  qa-audit.mjs          keyboard, target size, text spacing, links, HTML validity
  contact-form-test.mjs contact form behaviour, with and without JavaScript
  build-resume-pdfs.mjs renders each résumé page to a tagged PDF, into _site/
docs/accessibility.md
```

## Commands

```bash
npm install

npm run dev            # local server with live reload
npm run build          # build to _site/, including the résumé PDFs
npm run check          # build, then all four audits below
npm run check:contrast # 52 colour pairs measured against WCAG thresholds
npm run check:a11y     # axe-core, reflow at 320px and 400% zoom, text at 200%
npm run check:qa       # keyboard, target size, text spacing, links, HTML validity
npm run check:form     # contact form behaviour, with and without JavaScript
npm run resumes:pdf    # re-render just the PDFs (part of `build`; needs Chromium)
```

`npm run check` must pass before deploying. Both audits exit non-zero on
failure.

## Editing content

Everything readable on the site is in `src/_data/`. A few things worth knowing:

**Contract availability.** `home.js` → `available: false` removes the "Available
for contract work" tag from the hero.

**Résumés.** Edit `src/_data/resumes.js` and rebuild. The tagged PDFs are
generated from the résumé pages by `npm run build`, not committed, so they
cannot fall out of step with the HTML. (`npm run dev` does not render them, so
the Download PDF link 404s in the dev server; run a build to see it work.)

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

The site deploys to **GitHub Pages** from `.github/workflows/deploy.yml`, on
every push to `main` (or on demand via *Actions → Deploy to GitHub Pages → Run
workflow*).

One-time setup, which has to be done in the repository settings — it cannot be
done from the workflow: **Settings → Pages → Build and deployment → Source:
GitHub Actions**. Until that is set, the deploy job fails at the last step.

The workflow builds, runs the whole audit suite, and only uploads if everything
passes — so a change that breaks the site's WCAG 2.2 AA claim cannot reach the
live URL. `.github/workflows/check.yml` runs the same audits on every pull
request, plus a check that the committed résumé PDFs still match the résumé
pages.

### The path prefix

A GitHub Pages project site is served under `/<repo>/`, not at the domain root,
so every root-relative URL needs that prefix. `PATH_PREFIX` supplies it, and the
workflow reads it from `actions/configure-pages`, which resolves to an empty
path once a custom domain is attached — the same build works at a sub-path, at a
domain root, and locally, with no edit.

For this to hold, **every internal link and asset reference goes through
Eleventy's `url` filter**. A hard-coded `/assets/…` will 404 in production while
working perfectly on your machine. The QA audit checks that internal links
resolve, and CI audits the prefixed build rather than a root-path one, so this
is caught rather than discovered live.

Fonts are referenced from the stylesheet relatively (`../fonts/…`), since CSS is
copied through rather than templated.

### Security headers

GitHub Pages cannot set response headers, so the Content-Security-Policy ships
as a `<meta http-equiv>` tag, first thing in `<head>`. It is declared once, in
`site.js` → `csp`. There is no inline script or style anywhere, so no
`unsafe-inline` is needed.

A few directives — `frame-ancestors` among them — are only honoured in a real
header and are filtered out of the meta version rather than left in to look
reassuring. **That means no clickjacking protection on GitHub Pages.** If that
matters, put the site behind a host that can send headers.

### Deploying to Netlify instead

`netlify.toml` is still committed and current: `npm run build`, publish `_site`,
and it serves the full policy including the header-only directives. One caveat —
the build renders the résumé PDFs through headless Chromium, so the build
command needs `npx playwright install --with-deps chromium && npm run build`. Netlify sets
`URL` itself and needs no path prefix. The audits replay its headers locally
(`scripts/lib/serve.mjs`), and the QA audit asserts its policy still matches
`site.js`, so the two cannot drift apart.

Any other static host works too; you would need to supply `URL` and, if serving
from a sub-path, `PATH_PREFIX`.

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
- **`robots.txt` has no effect on a GitHub Pages project site**, because
  crawlers only read it from a domain root and this one is served under
  `/<repo>/`. It starts working when a custom domain is attached. Nothing
  depends on it — the one page that should stay unindexed carries its own
  `noindex` tag.
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
