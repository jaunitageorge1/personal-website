/**
 * Contact route — behavioural test, with JavaScript switched OFF.
 *
 * There is no contact form. The route in is the address itself, as text with
 * a mailto link on the home page and on every résumé. This pins down that it
 * is present, correct, visible and copyable, and that none of it depends on a
 * script — which is the whole point of dropping the form and the runtime
 * assembly that came with it.
 */
import { readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { launchChromium } from "./lib/browser.mjs";
import { serve } from "./lib/serve.mjs";
import site from "../src/_data/site.js";
import resumes from "../src/_data/resumes.js";

const EMAIL = site.contact.email;
const pass = [], fail = [];
const check = (ok, label, extra = "") => (ok ? pass : fail).push(label + (extra ? ` — ${extra}` : ""));

const host = await serve("_site");
const browser = await launchChromium();
const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 900 } });
await ctx.route("**/*", (r) => (r.request().url().startsWith(host.origin) ? r.continue() : r.abort()));
const page = await ctx.newPage();

/* ---- home ---- */
await page.goto(host.origin + "/", { waitUntil: "load" });
check((await page.locator("form").count()) === 0, "no form anywhere on the home page");
const alt = page.locator("#contact .contact-alt a");
check((await alt.count()) === 1, "one email link in the contact section");
check((await alt.getAttribute("href")) === `mailto:${EMAIL}`, "it is a mailto to the right address", await alt.getAttribute("href"));
check((await alt.textContent())?.trim() === EMAIL, "its text is the address itself, so it can be copied");
check(await alt.isVisible(), "it is visible with scripting off");
const btn = page.locator("#contact .btn-primary");
check((await btn.getAttribute("href")) === `mailto:${EMAIL}`, "the primary button is the same mailto");
check((await page.locator("#contact a[href*='linkedin.com']").count()) === 1, "LinkedIn remains as the second route");
check((await page.locator("script[src*='contact']").count()) === 0, "no contact script is loaded");

/* ---- every résumé ---- */
for (const cv of resumes.items) {
  await page.goto(`${host.origin}/resume/${cv.slug}/`, { waitUntil: "load" });
  const mail = page.locator(".doc-contact a[href^='mailto:']");
  check((await mail.count()) === 1 && (await mail.getAttribute("href")) === `mailto:${resumes.contact.email}`,
    `${cv.slug}: mailto link in the contact line, without scripting`);
  const tels = await page.locator(".doc-contact a[href^='tel:']").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
  const expected = resumes.contact.phones.map((p) => "tel:" + p.replace(/\s/g, ""));
  check(JSON.stringify(tels) === JSON.stringify(expected), `${cv.slug}: tel links match the phone numbers`, tels.join(", "));
}

await browser.close();
host.close();

/* ---- nothing of the old machinery survives in the build ---- */
check(!existsSync("_site/assets/js/contact.js"), "contact.js is not built");
check(!existsSync("_site/thanks"), "the form's thank-you page is not built");
const walk = async (d) => (await readdir(d, { withFileTypes: true })).reduce(async (acc, e) => {
  const list = await acc; const p = `${d}/${e.name}`;
  return e.isDirectory() ? list.concat(await walk(p)) : list.concat(p);
}, Promise.resolve([]));
const stale = [];
for (const f of (await walk("_site")).filter((f) => f.endsWith(".html"))) {
  const t = await readFile(f, "utf8");
  if (/contact-form|contact\.js|direct-contact|netlify-honeypot/.test(t)) stale.push(f.replace(/^_site/, ""));
}
check(stale.length === 0, "no page references the removed form or script", stale.join(", ") || "clean");

console.log("\nContact route (JavaScript off)\n");
for (const t of pass) console.log("  PASS  " + t);
for (const t of fail) console.log("  FAIL  " + t);
console.log(`\n${pass.length} passed, ${fail.length} failed\n`);
process.exit(fail.length ? 1 : 0);
