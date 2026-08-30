/** Services page: six practice areas plus the training catalogue. */
export default {
  intro:
    "Six practices, one throughline: making things people can actually use. " +
    "Every engagement is contract or project-based, remote-friendly, and priced " +
    "with room for mission-driven organisations.",

  practices: [
    {
      num: "01",
      title: "Accessibility consulting & audits",
      copy: "Strategy and hands-on delivery from someone who helps write the standards: W3C Accessibility Guidelines, ARIA and APA working-group member, WCAG 2.2 and 3.0 contributor, and former head of technical accessibility for a 14-million-member enterprise. Audits, remediation roadmaps, program builds, champions networks and kiosk/ATM accessibility. Recent work includes writing the end-to-end accessibility procurement process for one of the world’s largest retailers (name under NDA). Larger enterprise engagements run through my consultancy, Empower Accessibility — everything here is me, contracted directly.",
      items: [
        "WCAG 2.2 / 3.0", "Section 508", "EN 301 549", "Audits & VPATs",
        "Program strategy", "Accessible procurement", "Vendor monitoring",
        "Usability testing with AT users", "CI/CD automation",
      ],
      links: [],
    },
    {
      num: "02",
      title: "Training",
      copy: "Live, virtual or self-paced, delivered around the world. I have personally trained 2,000+ employees, with live sessions of up to 900 people at a time, and led communications campaigns reaching 17,000 employees a year. Full topic list below — accessibility end to end, plus practical AI.",
      items: ["Keynotes", "Workshops", "Webinars", "Self-paced courses", "Train-the-trainer"],
      links: [],
    },
    {
      num: "03",
      title: "Instructional design",
      copy: "Enterprise training programs end to end, not one-off decks: six role-based learning pathways organising 60+ courses and webinars for designers, developers, content creators and leadership; many of the IAAP’s self-paced courses written by me, including Accessible Design, Accessible Development, Accessibility Tester and Digital Accessibility; federal training supporting the MISSION Act; and the ADS Body of Knowledge. LMS-ready, accessible by default.",
      items: [
        "Enterprise program design", "Role-based pathways", "eLearning development",
        "LMS integration", "Accessible courseware", "IAAP course author",
      ],
      links: [
        { href: "https://iaap.edunext.io/courses/course-v1:IAAP+CS201+2025/about", label: "IAAP: Accessible Design" },
        { href: "https://iaap.edunext.io/courses/course-v1:IAAP+CS202+2025/about", label: "IAAP: Accessible Development" },
        { href: "https://iaap.edunext.io/courses/course-v1:IAAP+CS203+2025/about", label: "IAAP: Accessibility Tester" },
        { href: "https://iaap.edunext.io/courses/course-v1:IAAP+CS207+2025/about", label: "IAAP: Digital Accessibility" },
      ],
    },
    {
      num: "04",
      title: "Copywriting, copyediting & proofreading",
      copy: "Five communications awards across five Fortune 500 codes of conduct — including General Motors and Ulta Beauty. Clear, compliant, human writing: policy, training content, web copy and plain-language rewrites, all proofed to publication standard.",
      items: [
        "Codes of conduct", "Policy & compliance writing", "Web & UX copy",
        "Plain language", "Copyediting", "Proofreading",
      ],
      links: [],
    },
    {
      num: "05",
      title: "AI web development",
      copy: "AI-assisted, accessible-first builds and remediation: I pair modern AI coding tools with hands-on HTML, CSS and ARIA expertise, with automated accessibility checks wired into your pipeline so regressions never ship. Creator of A11y Codecamp, a browser-based learning app for accessible coding practice.",
      items: [
        "AI-assisted development", "HTML / CSS / ARIA", "Accessible components",
        "Remediation", "Linting & CI checks", "Bootstrap", "C#",
      ],
      links: [{ href: "https://a11y-codecamp.netlify.app/", label: "Try A11y Codecamp" }],
    },
    {
      num: "06",
      title: "Photography",
      copy: "Events, portraits, and landscape work from the trail. Galleries are delivered through Picflow: clients proof, select and download in one place, with alt text included on request — because image descriptions are part of the deliverable.",
      items: ["Events", "Portraits", "Landscape & travel", "Picflow delivery", "Alt text included"],
      links: [{ href: "https://jaunitageorge.picflow.com/ao5ce9kqh8", label: "View galleries on Picflow" }],
    },
  ],

  training: {
    accessibility: [
      "Accessible web & mobile development (WCAG 2.2, ARIA)",
      "Accessible design & content authoring",
      "Accessible documents (ADS body-of-knowledge author)",
      "Accessibility metrics: tracking & showing program value",
      "Vendor monitoring & accessible procurement",
      "Building role-based accessibility training programs",
      "Accessibility testing, QA & usability testing with AT users",
      "Negotiating accessibility: turning pushback into progress",
    ],
    ai: [
      "AI as your accessibility co-pilot (hands-on workshop)",
      "Inclusive testing with AI, A to Z",
      "AI-driven automation for program & project workflows",
      "AI, accessibility and emerging standards",
    ],
    note: "Every topic is available as a keynote, half-day workshop or self-paced course, tailored to your teams.",
  },
};
