/**
 * Contact form — behavioural test.
 *
 * The form is the one interactive thing on the site and the one piece that
 * depends on JavaScript, so its behaviour is pinned down here rather than left
 * to a manual click-through. Covers, in a real browser:
 *
 *   - the Send button is created by script and absent without it, so no reader
 *     is ever shown a control that cannot work;
 *   - native validation blocks an incomplete submit and moves focus to the bad
 *     field, and the handler never runs;
 *   - a valid submit produces the mailto the design specifies, with the
 *     `[Site] <topic> — <name>` subject and a signed body;
 *   - the honeypot silently drops a bot submission and leaves no trace;
 *   - the status region is present-but-empty at load and announced after send,
 *     without printing the address;
 *   - with scripting off, the <noscript> explanation and LinkedIn link stand in;
 *   - no file the site serves contains the email address as literal text.
 */
import { launchChromium } from "./lib/browser.mjs";
import { serve } from "./lib/serve.mjs";

const site = await serve("_site");
const b = await launchChromium();
const pass = [], fail = [];
const check = (ok, label, extra = "") => (ok ? pass : fail).push(label + (extra ? ` — ${extra}` : ""));

/* ---- with JavaScript ---- */
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
await ctx.route("**/*", r => r.request().url().startsWith(site.origin) ? r.continue() : r.abort());
const p = await ctx.newPage();

await p.goto(site.origin + "/", { waitUntil: "load" });

check(await p.locator("#contact-form button[type=submit]").count() === 1, "Send button is injected when scripting is on");
check(await p.locator("#contact-status").count() === 1, "live region present at load");
check((await p.locator("#contact-status").textContent()).trim() === "", "live region empty at load");
check(await p.locator("#contact-status").isVisible() === false, "live region takes no space while empty");

/* Native validation must block an empty submit — our handler never runs. */
await p.click("#contact-form button[type=submit]");
check((await p.locator("#contact-status").textContent()).trim() === "", "empty submit blocked by native validation");
const invalidFocus = await p.evaluate(() => document.activeElement?.id);
check(invalidFocus === "cf-name", "invalid submit moves focus to the first bad field", `focus=${invalidFocus}`);

await p.fill("#cf-name", "Dana Okonkwo");
await p.fill("#cf-email", "dana@example.org");
await p.selectOption("#cf-topic", "Speaking or training");
await p.fill("#cf-msg", "Would you keynote our conference in March?");
await p.click("#contact-form button[type=submit]");

const mailto = await p.locator("#contact-status a[href^=mailto]").getAttribute("href").catch(() => null);
check(!!mailto, "submit produces a mailto with the message");
if (mailto) {
  const url = new URL(mailto);
  check(url.protocol === "mailto:", "scheme is mailto:", url.protocol);
  check(url.pathname === "jaunitaflessas@gmail.com", "address assembled correctly", url.pathname);
  const sp = new URLSearchParams(url.search);
  check(sp.get("subject") === "[Site] Speaking or training — Dana Okonkwo", "subject line", JSON.stringify(sp.get("subject")));
  check(sp.get("body").includes("Would you keynote our conference in March?"), "body carries the message");
  check(sp.get("body").includes("— Dana Okonkwo <dana@example.org>"), "body carries the signature", JSON.stringify(sp.get("body").slice(-60)));
}
const status = (await p.locator("#contact-status").textContent()).trim();
check(status.length > 0, "status announced after send", JSON.stringify(status.slice(0, 40) + "…"));
check(!status.includes("@"), "status text does not print the address", JSON.stringify(status));

/* Honeypot: a bot filling every field must be dropped silently. */
await p.goto(site.origin + "/", { waitUntil: "load" });
await p.fill("#cf-name", "Bot");
await p.fill("#cf-email", "bot@example.com");
await p.fill("#cf-msg", "spam");
await p.evaluate(() => { document.getElementById("cf-company").value = "Acme Spam Co"; });
await p.click("#contact-form button[type=submit]");
check(await p.locator("#contact-status a[href^=mailto]").count() === 0, "honeypot suppresses the send");
check((await p.locator("#contact-status").textContent()).trim() === "", "honeypot leaves no status trace");
await ctx.close();

/* ---- with JavaScript switched off ---- */
const noJs = await b.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 900 } });
await noJs.route("**/*", r => r.request().url().startsWith(site.origin) ? r.continue() : r.abort());
const p2 = await noJs.newPage();
await p2.goto(site.origin + "/", { waitUntil: "load" });
check(await p2.locator("#contact-form button[type=submit]").count() === 0, "no dead Send button without scripting");
check(await p2.locator("#contact-form noscript").count() === 1, "noscript explanation is present");
check(await p2.locator("#contact-form .contact-actions a").count() === 1, "LinkedIn fallback works without scripting");
await noJs.close();

/* ---- the address must not be greppable in anything served ---- */
const { readdir, readFile } = await import("node:fs/promises");
const walk = async (d) => (await readdir(d, { withFileTypes: true })).reduce(async (acc, e) => {
  const list = await acc; const path = d + "/" + e.name;
  return e.isDirectory() ? list.concat(await walk(path)) : list.concat(path);
}, Promise.resolve([]));
const files = (await walk("_site")).filter(f => /\.(html|js|css|xml|txt|svg)$/.test(f));
const leaks = [];
for (const f of files) {
  const t = await readFile(f, "utf8");
  if (t.includes("jaunitaflessas@gmail.com")) leaks.push(f.replace(/^_site/, ""));
}
check(leaks.length === 0, "address appears in no served text file", leaks.join(", ") || "clean");

await b.close(); site.close();
console.log("\nContact form\n");
for (const t of pass) console.log("  PASS  " + t);
for (const t of fail) console.log("  FAIL  " + t);
console.log(`\n${pass.length} passed, ${fail.length} failed\n`);
process.exit(fail.length ? 1 : 0);
