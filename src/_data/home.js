/** Home page content. */
export default {
  /* Flip to false when contract capacity is full — the hero tag disappears. */
  available: true,

  stats: [
    { value: "17,000", label: "Employees reached yearly by my comms campaigns" },
    { value: "2,000+", label: "Employees trained by my enterprise training program" },
    { value: "29", label: "Talks around the world since 2022" },
    { value: "14M", label: "Members served by the enterprise program I led" },
  ],

  credentials: [
    "JD · Maryland Bar", "CPWA", "WAS", "ADS", "APX", "PMP",
    "SAFe Agilist", "DHS Trusted Tester",
  ],

  values: [
    {
      title: "Disability rights",
      body: "From WCAG working groups to usability testing with real assistive-technology users — access as a human right, not a checkbox.",
    },
    {
      title: "Human rights",
      body: "A lawyer by training, I’ve spent my career at the intersection of technology, policy and the people both are supposed to serve.",
    },
    {
      title: "Anti-poverty",
      body: "From a $3.2M community-reinvestment grant to globa11y, building employment pathways for disabled technologists in the Global South.",
    },
    {
      title: "Education",
      body: "Literacy tutoring, scholarship programs, free community bootcamps — because knowledge shouldn’t be gated by circumstance.",
    },
  ],

  services: [
    {
      num: "01",
      title: "Accessibility",
      copy: "Audits, WCAG 2.2 / Section 508 / EN 301 549 compliance, remediation strategy, vendor monitoring and program builds — by a W3C working-group member who helps write the standards.",
    },
    {
      num: "02",
      title: "Training",
      copy: "Live workshops and self-paced courses on accessible development, design, documents, procurement, metrics — and using AI as your accessibility co-pilot.",
    },
    {
      num: "03",
      title: "Instructional design",
      copy: "Enterprise training programs end to end: six role-based learning pathways organising 60+ courses, many of the IAAP’s self-paced courses (as author), and communications campaigns reaching 17,000 employees a year.",
    },
    {
      num: "04",
      title: "Copywriting & editing",
      copy: "Award-winning copywriting, copyediting and proofreading — five communications awards across codes of conduct for Fortune 500 clients.",
    },
    {
      num: "05",
      title: "AI web development",
      copy: "AI-assisted, accessible-first builds: semantic HTML, CSS and ARIA done right, plus CI/CD accessibility automation, linting and testing pipelines.",
    },
    {
      num: "06",
      title: "Photography",
      copy: "Events, portraits and travel work, delivered through Picflow galleries for easy proofing and download.",
    },
  ],

  projects: [
    {
      role: "Creator & developer",
      name: "A11y Codecamp",
      copy: "A browser-based learning application for practicing accessible coding — built and deployed solo, hands-on proof that training and engineering belong together.",
      href: "https://a11y-codecamp.netlify.app/",
      linkLabel: "Try it in the browser",
    },
    {
      role: "Director (pilot)",
      name: "globa11y",
      copy: "A social enterprise training and employing disabled technologists across the Global South — curricula, employment pathways and a 20+ volunteer team.",
      href: "https://accessiblecommunity.org/globa11y/",
      linkLabel: "Visit globa11y",
    },
    {
      role: "Working-group member",
      name: "W3C standards",
      copy: "AGWG, ARIA and APA working groups; WCAG 2.2 and 3.0 contributor; Advisory Committee representative 2022–2025; subgroup lead.",
    },
    {
      role: "Leadership committee",
      name: "OZeWAI",
      copy: "Serving on the leadership of Australia’s web accessibility initiative and moderating its Ask the Professionals panel series.",
    },
    {
      role: "Founder",
      name: "A11y A11ies & A11y-DMV",
      copy: "Two accessibility communities on two continents — the DC metro region’s largest a11y meetup, and its Melbourne sibling.",
    },
    {
      role: "Confidential engagement",
      name: "Accessible procurement at Fortune-1 scale",
      copy: "Wrote the end-to-end accessibility procurement process for one of the world’s largest retailers (name under NDA).",
    },
  ],

  /* Images. `width`/`height` are the intrinsic pixel dimensions: they reserve
     the right box before the file loads, so nothing jumps as the page settles. */
  portrait: {
    src: "/assets/images/headshot.jpg",
    /* Alt text describes the person, not the file. */
    alt: "Jaunita Flessas, smiling, in a white collared shirt, against blurred night lights.",
    width: 1024,
    height: 1024,
  },
  photograph: {
    /* Jaunita's own work, served from her Picflow CDN. To self-host it, drop
       the file in src/assets/images/ and point `src` at it — see README. */
    src: "https://cdn.picflow.com/assets/images/resized/1067x1600/765a9ca6-cb4e-4f19-b187-711fe04b37f8.jpg",
    alt: "From the Maison Maure series: portrait of a woman in an embroidered red jacket, hand raised to her neck, against a dark ground.",
    width: 1067,
    height: 1600,
  },

  quote: {
    text: "Jaunita’s heart beats with the vibrant pulse of accessibility. Just about every waking moment she is advocating, volunteering, educating, implementing.",
    attribution: "LinkedIn recommendation",
  },

  roles: [
    "Head / Director of Accessibility",
    "Accessibility Program Manager",
    "Accessibility Engineer",
    "Accessibility Consultant / Auditor",
    "Digital Accessibility Trainer",
    "Instructional Designer",
    "Learning & Development Manager",
    "Program Manager",
    "Project Manager (PMP)",
    "Standards & Policy Advisor",
    "Compliance Manager",
    "Senior Content Writer / Editor",
    "Customer Education Lead",
  ],

  contactTopics: [
    "Contract work",
    "Full-time role",
    "Speaking or training",
    "Photography",
    "Subscribe to the blog",
    "Accessibility feedback",
    "Something else",
  ],
};
