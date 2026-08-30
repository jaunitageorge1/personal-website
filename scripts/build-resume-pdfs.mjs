/**
 * Pre-render each résumé to a tagged PDF.
 *
 * "Tagged" is the point: a tagged PDF carries the document's structure —
 * headings, lists, links, reading order — so a screen reader can navigate it
 * the same way it navigates the HTML. An untagged PDF is a wall of glyphs.
 * Chromium emits tags when `tagged: true` is passed, and `outline: true` adds
 * the bookmark tree built from the headings.
 *
 * Output lands in src/assets/resumes/ and is committed, so deploying the site
 * needs no browser. Re-run this after editing src/_data/resumes.js.
 *
 *   npm run build && npm run resumes:pdf
 */
import { mkdir, readdir, stat } from "node:fs/promises";
import { launchChromium } from "./lib/browser.mjs";
import { serve } from "./lib/serve.mjs";
import resumes from "../src/_data/resumes.js";

const OUT = "src/assets/resumes";

const run = async () => {
  await mkdir(OUT, { recursive: true });
  const site = await serve("_site");
  const browser = await launchChromium();
  const context = await browser.newContext();
  /* Print styles are what matter here, so nothing external is fetched. */
  await context.route("**/*", (route) =>
    route.request().url().startsWith(site.origin) ? route.continue() : route.abort()
  );

  for (const cv of resumes.items) {
    const page = await context.newPage();
    await page.goto(`${site.origin}/resume/${cv.slug}/`, { waitUntil: "load" });
    /* Fonts must be in before layout is measured, or the pagination shifts. */
    await page.evaluate(() => document.fonts.ready);

    /* The contact details are injected by /assets/js/contact.js rather than
       written into the markup, so that no served file carries the address as
       literal text. That makes the PDF depend on the script having run — fail
       loudly rather than shipping a résumé nobody can reply to. */
    if (resumes.contact.showDirectContact) {
      const filled = await page.evaluate(
        () => document.getElementById("direct-contact")?.querySelector("a[href^='mailto:']") !== undefined &&
              document.getElementById("direct-contact")?.textContent.trim().length > 0
      );
      if (!filled) {
        throw new Error(
          `${cv.slug}: contact details were not injected — /assets/js/contact.js did not run. ` +
          `The PDF would have shipped without an email address.`
        );
      }
    }
    await page.emulateMedia({ media: "print" });
    const path = `${OUT}/jaunita-flessas-${cv.slug}.pdf`;
    await page.pdf({
      path,
      format: "Letter",
      printBackground: true,
      tagged: true,
      outline: true,
      margin: { top: "0.55in", bottom: "0.55in", left: "0.55in", right: "0.55in" },
    });
    await page.close();
    const { size } = await stat(path);
    console.log(`  ${path}  ${(size / 1024).toFixed(0)} KB`);
  }

  await browser.close();
  site.close();
  console.log(`\n${(await readdir(OUT)).length} tagged PDFs written to ${OUT}/\n`);
};

run().catch((e) => { console.error(e); process.exit(1); });
