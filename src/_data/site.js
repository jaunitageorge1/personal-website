/**
 * Content-Security-Policy.
 *
 * Declared once, here. GitHub Pages cannot set response headers, so the policy
 * ships as a <meta http-equiv> tag in every page — which means it has to be the
 * first thing in <head>, before any resource the browser might start fetching.
 *
 * A handful of directives are only honoured in a real header and are silently
 * ignored inside <meta>; those are filtered out of the meta version rather than
 * left in to look reassuring. They stay in netlify.toml, which does serve
 * headers, and the QA audit asserts the two copies still agree.
 *
 * There is no inline script or style anywhere on the site, so no 'unsafe-inline'
 * is needed. cdn.picflow.com serves the home page photograph; drop it from
 * img-src once that file is self-hosted.
 */
const CSP_DIRECTIVES = [
  "default-src 'self'",
  "img-src 'self' https://cdn.picflow.com data:",
  "style-src 'self'",
  "script-src 'self'",
  "font-src 'self'",
  "frame-src https://www.youtube-nocookie.com",
  "form-action 'self'",
  "base-uri 'none'",
  "object-src 'none'",
  "frame-ancestors 'none'",
];

/* Ignored by browsers when they appear in a <meta> tag rather than a header. */
const HEADER_ONLY = new Set(["frame-ancestors", "report-uri", "report-to", "sandbox"]);

/** Site-wide constants: identity, canonical URLs and outbound links. */
export default {
  name: "Jaunita Flessas",
  title: "Jaunita Flessas — Accessibility leader, trainer & maker",
  description:
    "Jaunita Flessas — internationally recognised digital accessibility leader, " +
    "attorney, trainer and photographer in Melbourne. Contract work in accessibility, " +
    "training, instructional design, writing, AI web development and photography.",
  // Override at build time on the host: URL=https://example.com npm run build
  url: process.env.URL || process.env.DEPLOY_PRIME_URL || "https://jaunitaflessas.com",
  locale: "en",

  csp: {
    full: CSP_DIRECTIVES.join("; "),
    meta: CSP_DIRECTIVES.filter((d) => !HEADER_ONLY.has(d.split(" ")[0])).join("; "),
  },

  links: {
    empower: "https://www.empoweraccessibility.com",
    empowerTalks: "https://empoweraccessibility.com/talks/",
    linkedin: "https://www.linkedin.com/in/jaunitaflessas",
    picflow: "https://jaunitageorge.picflow.com/ao5ce9kqh8",
    codecamp: "https://a11y-codecamp.netlify.app/",
    globa11y: "https://accessiblecommunity.org/globa11y/",
  },
  /* How the contact form sends.

     - "mailto" (default, and what the design handoff specifies): on submit the
       form opens the reader's own email app with everything pre-filled. No
       server, no third party, and nothing to configure. The address is
       assembled at runtime from a build-time encoding, so the literal string
       appears in no file the site serves — see the note on `mailto` below.
       Requires JavaScript; without it the form is not rendered at all and the
       contact section falls back to LinkedIn.
     - "netlify": Netlify Forms handles the POST and the honeypot check
       server-side. Works with JavaScript switched off.
     - "formspree": set `endpoint` to your form's URL. Also works without JS.
     - "none": no form; the contact section falls back to LinkedIn.

     No option renders an email address into the HTML. */
  form: {
    provider: "mailto",

    /* Split so the address is never one literal string, and base64-encoded at
       build time so it is not greppable in the served JavaScript either.

       Be clear-eyed about what this buys: it stops address-harvesting
       crawlers, which read markup and do not run scripts. It is not secrecy —
       anyone who opens the network tab or clicks Send can read the address.
       That is the accepted trade for a form that needs no backend. */
    mailto: { user: "jaunitaflessas", domain: "gmail.com" },
    subjectPrefix: "[Site]",

    /* Used by the netlify and formspree providers only. */
    endpoint: "https://formspree.io/f/REPLACE_ME",
    successUrl: "/thanks/",
  },
  nav: [
    { label: "Home", url: "/" },
    { label: "Services", url: "/services/" },
    { label: "Speaking & Writing", url: "/speaking/" },
    { label: "Blog", url: "/blog/" },
  ],
};
