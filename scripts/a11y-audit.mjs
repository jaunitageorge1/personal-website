/**
 * Accessibility audit.
 *
 * Runs axe-core over every built page against the full WCAG 2.0/2.1/2.2 A and
 * AA rule sets, then adds three checks axe cannot make on its own:
 *
 *  - reflow (1.4.10): no horizontal scrolling of the page at 320 CSS px, and
 *    none at 1280px zoomed to 400% — the two ways the criterion is measured;
 *  - resize text (1.4.4): the layout still holds with the root font size at
 *    200%, which is what a reader raising their browser font setting does;
 *  - landmark shape: exactly one <main> and one <h1>, and the footer outside
 *    <main>, which is the structure the design handoff calls for.
 *
 * Automated checks catch perhaps half of what matters; a keyboard and
 * screen-reader pass is still required before shipping. See docs/accessibility.md.
 */
import AxeBuilder from "@axe-core/playwright";
import { launchChromium } from "./lib/browser.mjs";
import { serve } from "./lib/serve.mjs";

const PAGES = [
  "/", "/services/", "/speaking/", "/blog/", "/thanks/",
  "/resume/accessibility-leadership/",
  "/resume/instructional-design/",
  "/resume/program-management/",
  "/resume/policy-and-governance/",
];

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];

/* Wide content is allowed to scroll inside its own region (a data table is an
   explicit exception to 1.4.10); the *page* is not. */
const pageScrollsSideways = () =>
  document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;

const run = async () => {
  const site = await serve("_site");
  const browser = await launchChromium();
  const problems = [];
  const note = (page, kind, detail) => problems.push({ page, kind, detail });

  /* axe needs an explicit context, and blocking third-party requests keeps the
     audit deterministic and runnable offline — the YouTube embed and the
     Picflow-hosted photograph are checked as markup, not fetched. */
  const open = async (viewport) => {
    const context = await browser.newContext({ viewport });
    await context.route("**/*", (route) =>
      route.request().url().startsWith(site.origin) ? route.continue() : route.abort()
    );
    return { context, page: await context.newPage() };
  };

  for (const path of PAGES) {
    const url = site.origin + path;

    /* --- axe, at a desktop width --- */
    const { context: deskCtx, page } = await open({ width: 1280, height: 900 });
    await page.goto(url, { waitUntil: "load" });
    const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    for (const v of violations) {
      note(path, `axe/${v.impact || "n-a"}`, `${v.id} — ${v.help} (${v.nodes.length} node${v.nodes.length === 1 ? "" : "s"})`);
      for (const n of v.nodes.slice(0, 3)) note(path, "  └ at", n.target.join(" "));
    }

    /* --- structure --- */
    const structure = await page.evaluate(() => ({
      mains: document.querySelectorAll("main").length,
      h1s: document.querySelectorAll("h1").length,
      footerInsideMain: !!document.querySelector("main footer"),
      headings: [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) => +h.tagName[1]),
    }));
    if (structure.mains !== 1) note(path, "structure", `expected 1 <main>, found ${structure.mains}`);
    if (structure.h1s !== 1) note(path, "structure", `expected 1 <h1>, found ${structure.h1s}`);
    if (structure.footerInsideMain) note(path, "structure", "<footer> is inside <main>");
    structure.headings.reduce((prev, level, i) => {
      if (i && level > prev + 1) note(path, "structure", `heading jumps h${prev} → h${level}`);
      return level;
    }, 0);
    await deskCtx.close();

    /* --- reflow at 320 CSS px --- */
    const { context: narrowCtx, page: narrow } = await open({ width: 320, height: 800 });
    await narrow.goto(url, { waitUntil: "load" });
    if (await narrow.evaluate(pageScrollsSideways)) {
      const culprits = await narrow.evaluate(() =>
        [...document.querySelectorAll("body *")]
          .filter((el) => el.getBoundingClientRect().right > document.documentElement.clientWidth + 1)
          .slice(0, 5)
          .map((el) => el.tagName.toLowerCase() + (el.className ? "." + String(el.className).split(" ")[0] : ""))
      );
      note(path, "reflow@320", `page scrolls sideways; widest: ${culprits.join(", ") || "unknown"}`);
    }
    await narrowCtx.close();

    /* --- reflow at 400% zoom (1280 / 4 = 320 CSS px of layout) --- */
    const { context: zoomCtx, page: zoomed } = await open({ width: 1280, height: 1024 });
    await zoomed.goto(url, { waitUntil: "load" });
    await zoomed.evaluate(() => (document.body.style.zoom = "400%"));
    if (await zoomed.evaluate(pageScrollsSideways)) note(path, "reflow@400%", "page scrolls sideways at 400% zoom");
    await zoomCtx.close();

    /* --- text resized to 200% --- */
    const { context: bigCtx, page: big } = await open({ width: 1280, height: 900 });
    await big.goto(url, { waitUntil: "load" });
    await big.evaluate(() => (document.documentElement.style.fontSize = "32px"));
    if (await big.evaluate(pageScrollsSideways)) note(path, "resize-text@200%", "page scrolls sideways with 32px root font");
    await bigCtx.close();
  }

  await browser.close();
  site.close();

  const hard = problems.filter((p) => !p.kind.startsWith("  "));
  if (problems.length) {
    console.log("\nAccessibility findings\n");
    let current = "";
    for (const p of problems) {
      if (p.page !== current) { console.log(`\n  ${p.page}`); current = p.page; }
      console.log(`    ${p.kind.padEnd(18)} ${p.detail}`);
    }
    console.log(`\n${hard.length} issue(s) across ${PAGES.length} pages.\n`);
    process.exit(1);
  }
  console.log(`\naxe (WCAG 2.0/2.1/2.2 A + AA + best-practice), reflow at 320px and 400% zoom,`);
  console.log(`text at 200%, and landmark structure: clean across all ${PAGES.length} pages.\n`);
};

run().catch((e) => { console.error(e); process.exit(1); });
