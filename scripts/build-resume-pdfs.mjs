/**
 * Pre-render each résumé to a tagged PDF.
 *
 * "Tagged" is the point: a tagged PDF carries the document's structure —
 * headings, lists, links, reading order — so a screen reader can navigate it
 * the same way it navigates the HTML. An untagged PDF is a wall of glyphs.
 * Chromium emits tags when `tagged: true` is passed, and `outline: true` adds
 * the bookmark tree built from the headings.
 *
 * These are build output, not source. They used to be committed, which meant
 * they could silently fall out of step with the résumé pages — and they cannot
 * be diffed to detect that, because a browser-generated PDF is not reproducible
 * across machines: a different Chromium build or a different set of installed
 * fonts changes the bytes and the file size. `npm run build` runs this, so the
 * PDFs are always generated from the pages they accompany and staleness is not
 * a state the project can be in.
 *
 * Timestamps are still normalised, so repeated builds in one environment are
 * byte-identical and a redeploy does not churn every PDF.
 */
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { launchChromium } from "./lib/browser.mjs";
import { serve } from "./lib/serve.mjs";
import resumes from "../src/_data/resumes.js";

const OUT = "_site/assets/resumes";

/**
 * Chromium stamps /CreationDate and /ModDate with the moment of the run, which
 * is the only thing that differs between two builds on the same machine.
 * Normalising them keeps repeated builds byte-identical, so a redeploy does not
 * churn every PDF for no reason.
 *
 * Both fields are fixed-width, so overwriting them in place keeps every xref
 * offset valid. SOURCE_DATE_EPOCH is honoured if set (the reproducible-builds
 * convention); otherwise a fixed date is used and the output is byte-identical
 * across runs.
 */
const pdfDate = (epochSeconds) => {
  const d = new Date(epochSeconds * 1000);
  const p = (n, w = 2) => String(n).padStart(w, "0");
  return `D:${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}` +
         `${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}+00'00'`;
};

const FIXED_DATE = pdfDate(Number(process.env.SOURCE_DATE_EPOCH) || 1735689600); // 2025-01-01T00:00:00Z

async function normaliseTimestamps(path) {
  const buf = await readFile(path, "latin1");
  const out = buf.replace(
    /\/(CreationDate|ModDate) \(D:\d{14}[+-]\d{2}'\d{2}'\)/g,
    (_, field) => `/${field} (${FIXED_DATE})`
  );
  if (out.length !== buf.length) {
    throw new Error(`${path}: timestamp rewrite changed the file length, which would corrupt the xref table`);
  }
  await writeFile(path, out, "latin1");
}

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

    /* A résumé nobody can reply to must not ship: the contact line is plain
       markup now, but the assertion stays. */
    const hasEmail = await page.evaluate(
      () => !!document.querySelector(".doc-contact a[href^='mailto:']")
    );
    if (!hasEmail) throw new Error(`${cv.slug}: no mailto link in the contact line`);
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
    await normaliseTimestamps(path);
    const { size } = await stat(path);
    console.log(`  ${path}  ${(size / 1024).toFixed(0)} KB`);
  }

  await browser.close();
  site.close();
  console.log(`\n${(await readdir(OUT)).length} tagged PDFs written to ${OUT}/\n`);
};

run().catch((e) => { console.error(e); process.exit(1); });
