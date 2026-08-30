/**
 * The four role-targeted résumés.
 *
 * Each renders as a standalone printable page at /resume/<slug>/ and is
 * pre-rendered to a tagged PDF by `npm run resumes:pdf`.
 *
 * `jobs[].heading` and `sections[].items[]` hold small fragments of trusted
 * HTML (a <strong>, an <em>, a lang-tagged span) and are rendered unescaped.
 */
const contact = {
  /* The site itself exposes no email address anywhere — the contact form is
     the only route in. A résumé is the one exception: it is a document sent to
     recruiters, and one without contact details does not do its job. Set this
     to false to drop the address and phone numbers from the public HTML
     résumés and their PDFs, leaving the site's contact form as the only route. */
  showDirectContact: true,
  location: "Melbourne, AU (US citizen, full AU working rights)",
  email: "jaunitaflessas@gmail.com",
  phones: ["+61 457 037 690", "+1 253 271 2167"],
  site: { href: "https://www.empoweraccessibility.com", label: "empoweraccessibility.com" },
  linkedin: { href: "https://www.linkedin.com/in/jaunitaflessas", label: "linkedin.com/in/jaunitaflessas" },
};

export default {
  contact,
  items: [
    {
      slug: "accessibility-leadership",
      label: "Accessibility leadership",
      navLabel: "Accessibility Leadership",
      role: "Digital Accessibility Leader · CPWA · WAS · ADS · APX · PMP",
      summary:
        "Internationally recognised accessibility leader who built and ran the enterprise program serving 14M members at Navy Federal Credit Union. W3C AGWG, ARIA &amp; APA working-group member; WCAG 2.2 and 3.0 contributor; Advisory Committee representative 2022–2025. Attorney by training. 29 conference talks worldwide.",
      jobs: [
        {
          heading: "<strong>Founder &amp; Principal Consultant</strong> · Empower Accessibility · 2025–present",
          bullets: [
            "Strategic consulting, audits and training for Fortune 500, government and SMB clients across the US, EU, Canada and Australia.",
            "Wrote the end-to-end accessibility procurement process for one of the world’s largest retailers (under NDA).",
          ],
        },
        {
          heading: "<strong>Director, Innovation &amp; Accessibility Engineering</strong> · Wider Accessibility · 2025–present",
          bullets: [
            "Embedding inclusive practice across product strategy, development and release cycles; WCAG, Section 508 and EN 301 549 compliance workshops for developers and product teams.",
          ],
        },
        {
          heading: "<strong>Head of Technical Accessibility</strong> · Navy Federal Credit Union · 2020–2025",
          bullets: [
            "Founded and led the enterprise accessibility program: 12-person team, 55-volunteer champions network, multimillion-dollar budgets and vendor relationships.",
            "Shipped CI/CD accessibility automation (APIs, linting, crawlers, functional QA) to catch regressions before release; led kiosk/ATM accessibility with hardware vendors.",
            "Ran usability testing with assistive-technology users; communications and awareness campaigns reached 17,000 employees a year.",
          ],
        },
        {
          heading: "<strong>Director, globa11y (pilot)</strong> · Accessible Community · 2025–present",
          bullets: [
            "Leading a 20+ volunteer social enterprise training and employing disabled technologists across the Global South.",
          ],
        },
      ],
      sections: [
        {
          heading: "Standards",
          items: [
            "W3C: AGWG, ARIA &amp; APA member; WCAG 2.2/3.0 contributor; subgroup lead",
            "Internet Society: Outreach Officer; trained the Government of Benin",
            "IAAP: author, ADS Body of Knowledge &amp; self-paced courses",
            "OZeWAI leadership committee",
            "Founder: A11y-DMV &amp; A11y A11ies Melbourne",
          ],
        },
        {
          heading: "Certifications",
          items: [
            "IAAP CPWA (WAS + CPACC)", "IAAP ADS · APX", "DHS Trusted Tester v5",
            "PMP · SAFe Agilist", "Maryland Bar, active",
          ],
        },
        {
          heading: "Education",
          items: [
            "JD — UDC David A. Clarke School of Law",
            "BA — University of Washington",
            "Technology Leadership — eCornell",
          ],
        },
        {
          heading: "Selected talks",
          items: [
            "CSUN ×6 · WebAIM · EuroSTAR",
            "M-Enabling · Agile Testing Days",
            "A11y Osaka · Perth (keynote)",
          ],
        },
      ],
    },

    {
      slug: "instructional-design",
      label: "Learning & development",
      navLabel: "Instructional Design",
      role: "Instructional Designer &amp; L&amp;D Leader · IAAP Course Author · PMP",
      summary:
        "L&amp;D leader who designs enterprise training programs end to end: six role-based learning pathways organising 60+ courses, 2,000+ employees trained live (sessions up to 900 people), and communications campaigns reaching 17,000 a year. Author of the IAAP’s ADS Body of Knowledge and many of its self-paced courses. Five communications awards.",
      jobs: [
        {
          heading: "<strong>Training Author</strong> · IAAP · 2023–present",
          bullets: [
            "Wrote the Accessible Document Specialist (ADS) Body of Knowledge and self-paced courses including Accessible Design, Accessible Development, Accessibility Tester and Digital Accessibility.",
          ],
        },
        {
          heading: "<strong>Head of Technical Accessibility</strong> · Navy Federal Credit Union · 2020–2025",
          bullets: [
            "Designed six role-based learning pathways organising 60+ courses and webinars for designers, developers, content creators and leadership.",
            "Personally facilitated regular live training — 2,000+ employees, up to 900 per session — alongside awareness events reaching 17,000 a year.",
            "Built the 55-volunteer champions program that embedded learning across departments.",
          ],
        },
        {
          heading: "<strong>Project Manager / Trainer</strong> · IRIS Software · 2025–present",
          bullets: [
            "Deliver software training to clients and end users; onboard clients through SIS implementations.",
          ],
        },
        {
          heading: "<strong>Senior Instructional Systems Designer</strong> · ERPi · 2019–2020",
          bullets: [
            "Developed VHA training supporting the MISSION Act; led Section 508/WCAG QA for federal course content.",
          ],
        },
        {
          heading: "<strong>Content Writer → Senior Content Writer</strong> · NAVEX Global · 2015–2018",
          bullets: [
            "Created compliance eLearning on discrimination, accommodations, harassment and wage law; five awards across five Fortune 500 codes of conduct (General Motors, Ulta Beauty).",
          ],
        },
      ],
      sections: [
        {
          heading: "Toolkit",
          items: [
            "LMS platforms &amp; CMS products", "Adobe Creative Cloud &amp; XD",
            "Balsamiq · Visio",
            "HTML/CSS/ARIA — accessible courseware by default",
            "AI-assisted content workflows",
          ],
        },
        {
          heading: "Teaching topics",
          items: [
            "Accessible development, design &amp; documents",
            "Accessibility metrics &amp; procurement",
            "AI as an accessibility co-pilot",
            "Compliance &amp; ethics training",
          ],
        },
        {
          heading: "Certifications",
          items: ["PMP · SAFe Agilist", "IAAP CPWA · ADS · APX", "DHS Trusted Tester v5"],
        },
        {
          heading: "Education",
          items: [
            "JD — UDC David A. Clarke School of Law",
            "BA — University of Washington",
            "Fluent French (B2 certified) · conversational Spanish",
          ],
        },
      ],
    },

    {
      slug: "program-management",
      label: "Program management",
      navLabel: "Program Management",
      role: "Program &amp; Project Manager · PMP · SAFe Agilist",
      summary:
        "PMP- and SAFe-certified program leader with 13+ years across enterprise technology, government and nonprofits: multimillion-dollar budgets, a 12-person team plus 55-volunteer network, a $3.2M grant win, and AI-driven automation that cut manual programme overhead. Attorney by training; calm with regulators, vendors and executives alike.",
      jobs: [
        {
          heading: "<strong>Project Manager / Trainer</strong> · IRIS Software · 2025–present",
          bullets: [
            "Designed AI-driven automation of project-management processes, cutting manual administrative effort and improving turnaround across workflows.",
            "Manage SIS software implementations end to end: scheduling, stakeholder communication, deployment readiness and client onboarding.",
          ],
        },
        {
          heading: "<strong>Head of Technical Accessibility</strong> · Navy Federal Credit Union · 2020–2025",
          bullets: [
            "Ran an enterprise program serving 14M members: managed and mentored 12 employees and contractors, directed a 55-volunteer cross-departmental champions program.",
            "Owned multimillion-dollar budgets and strategic vendor relationships; stood up vendor monitoring and automated QA pipelines to keep delivery on standard.",
          ],
        },
        {
          heading: "<strong>Education Manager</strong> · Australian Teachers of Media (ATOM) · 2025",
          bullets: [
            "Built an automation framework for product tagging across the e-commerce site; coordinated trainers, scheduling and delivery logistics.",
          ],
        },
        {
          heading: "<strong>Regional Coordinator</strong> · National Community Reinvestment Coalition · 2013–2014",
          bullets: [
            "Co-led the team that won a $3.2M intermediary grant, coordinating data from 57 member organisations.",
          ],
        },
        {
          heading: "<strong>Coordinator</strong> · National Housing Endowment · 2014–2015",
          bullets: [
            "Ran scholarship and grant programs; moved applications online and standardised scoring.",
          ],
        },
      ],
      sections: [
        {
          heading: "Certifications",
          items: [
            "Project Management Professional (PMP)", "SAFe Agilist (SA)",
            "Technology Leadership — eCornell", "Maryland Bar, active",
            "IAAP CPWA · ADS · APX",
          ],
        },
        {
          heading: "Toolkit",
          items: [
            "JIRA · Azure DevOps", "Confluence · Visio", "MS PowerBI reporting",
            "AI workflow automation", "Budget &amp; vendor management",
          ],
        },
        {
          heading: "Education",
          items: ["JD — UDC David A. Clarke School of Law", "BA — University of Washington"],
        },
        {
          heading: "Highlights",
          items: [
            "13 awards across accessibility, communications &amp; social justice",
            "29 conference talks worldwide",
            "Fluent French (B2) · conversational Spanish",
          ],
        },
      ],
    },

    {
      slug: "policy-and-governance",
      label: "Policy & governance",
      navLabel: "Policy and Governance",
      role: "Technology Policy &amp; Governance · Attorney · W3C Standards Contributor",
      summary:
        "Attorney-technologist working at the intersection of emerging technology, human rights and global digital standards. W3C Advisory Committee representative 2022–2025 and WCAG 2.2/3.0 contributor; wrote compliance frameworks and codes of conduct adopted by Fortune 500 companies; advised governments across four continents on digital-inclusion policy.",
      jobs: [
        {
          heading: "<strong>Working-Group Member &amp; Advisory Committee Representative</strong> · W3C · 2021–present",
          bullets: [
            "Contribute to WCAG 2.2 and 3.0 across the Accessibility Guidelines, ARIA and Accessible Platform Architectures working groups; lead subgroups establishing new standards.",
            "Advisory Committee representative 2022–2025 (AC meeting, Nice 2025; TPAC, Seville 2023).",
          ],
        },
        {
          heading: "<strong>Founder &amp; Principal Consultant</strong> · Empower Accessibility · 2025–present",
          bullets: [
            "Compliance strategy for enterprises and governments across the US, EU, Canada and Australia (ADA, Section 508, EN 301 549, WCAG).",
            "Wrote the accessibility procurement policy for one of the world’s largest retailers (under NDA); delivered digital-inclusion training to the Government of Benin for the Internet Society.",
          ],
        },
        {
          heading: "<strong>Head of Technical Accessibility</strong> · Navy Federal Credit Union · 2020–2025",
          bullets: [
            "Owned accessibility governance for a 14M-member enterprise: standards alignment, vendor-monitoring policy, and audit programs across web, mobile and self-service hardware.",
          ],
        },
        {
          heading: "<strong>Senior Content Writer (Ethics &amp; Compliance)</strong> · NAVEX Global · 2015–2018",
          bullets: [
            "Wrote five Fortune 500 codes of conduct (incl. General Motors, Ulta Beauty) and employment-law compliance training; five industry awards.",
          ],
        },
        {
          heading: "<strong>Web Content Strategist · MCC</strong> (2018–19) · <strong>Policy &amp; Advocacy Fellow · NCRC</strong> (2013–14)",
          bullets: [
            "Led Section 508 compliance for MCC’s digital assets; co-authored fair-housing policy analysis (Policy Watch, 2013) and co-led a $3.2M federal intermediary grant win.",
          ],
        },
      ],
      sections: [
        {
          heading: "Credentials",
          items: [
            "Juris Doctor; Maryland Bar, active &amp; in good standing",
            "Law Institute of Victoria, member",
            "Institute of Managers &amp; Leaders, FMIL",
            "IAAP CPWA · ADS · APX",
            "DHS Trusted Tester v5 · PMP · SA",
          ],
        },
        {
          heading: "Governance roles",
          items: [
            "Internet Society — Outreach Officer, Accessibility SIG",
            "OZeWAI — leadership committee",
            "IAAP — author, ADS Body of Knowledge",
            "Gold Quill Blue Ribbon Panelist (IABC)",
            "<span lang=\"es\">Premios del Instituto de Accesibilidad</span>, award panelist",
          ],
        },
        {
          heading: "Publications",
          items: [
            "The True Cost of Inaccessibility (TestParty, 2025) — cited in <em>Digital Outcasts</em>, 2nd ed.",
            "HUD’s Proposed AFFH Rule (Policy Watch, 2013)",
          ],
        },
        {
          heading: "Education",
          items: [
            "JD — UDC David A. Clarke School of Law",
            "BA — University of Washington",
            "Fluent French (B2) · conversational Spanish",
          ],
        },
      ],
    },
  ],
};
