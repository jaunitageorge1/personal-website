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
  links: {
    empower: "https://www.empoweraccessibility.com",
    empowerTalks: "https://empoweraccessibility.com/talks/",
    linkedin: "https://www.linkedin.com/in/jaunitaflessas",
    picflow: "https://jaunitageorge.picflow.com/ao5ce9kqh8",
    codecamp: "https://a11y-codecamp.netlify.app/",
    globa11y: "https://accessiblecommunity.org/globa11y/",
  },
  /* Where the contact form posts.
     - "netlify": Netlify Forms handles the POST server-side, including the
       honeypot check. Nothing else to configure; the form works with
       JavaScript switched off.
     - "formspree": set `endpoint` to your form's URL. Also works without JS.
     - "none": the form is not rendered at all, and the contact section falls
       back to the LinkedIn link.
     No option renders an email address into the HTML. */
  form: {
    provider: "netlify",
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
