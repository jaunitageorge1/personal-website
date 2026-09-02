/**
 * Verify a deployed copy of the site, at its real URL.
 *
 *   node scripts/verify-live.mjs https://example.github.io/personalwebsite/
 *
 * The build-time audits prove the *build* is right. This proves the *deploy*
 * is: that the host serves every page the sitemap lists, that every
 * same-origin link and asset resolves under the real path prefix, that the
 * PDFs come back as PDFs, that the CSP meta tag survived, and that axe and
 * reflow still pass with the real third-party resources loaded rather than
 * blocked. It is the class of failure that only shows up live — a hard-coded
 * "/assets/…" that 404s under "/<repo>/", a host that rewrites headers, a
 * file the upload dropped.
 *
 * Runs in the deploy workflow after deploy-pages, from the GitHub runner, with
 * EXPECTED_BUILD set to the deployed commit so it verifies that deploy and not
 * the previous one still cached at the edge. Exits non-zero on any finding. A failure here cannot undo the deploy, but
 * it turns the run red so the problem is seen rather than found by a visitor.
 */
import AxeBuilder from "@axe-core/playwright";
import { launchChromium } from "./lib/browser.mjs";

const arg = process.argv[2];
if (!arg) {
  console.error("usage: node scripts/verify-live.mjs <site url>");
  process.exit(2);
}
/* Normalise to a trailing slash so URL resolution keeps the sub-path. */
const base = new URL(arg.endsWith("/") ? arg : arg + "/");

const findings = [];
const note = (where, kind, detail) => findings.push({ where, kind, detail });

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];

/* ---------- fetch helpers ---------- */

/** GET with one retry; a transient error becomes a status-0 response, never a throw. */
async function get(url, init = {}) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fetch(url, { redirect: "follow", headers: { "user-agent": "verify-live" }, ...init });
    } catch (err) {
      if (attempt >= 2) return { ok: false, status: 0, headers: new Headers(), text: async () => "", error: err.message };
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

/**
 * Wait until the host serves THIS deploy, not just any deploy.
 *
 * Two things make a plain "home page returns 200" check wrong. On a redeploy
 * the previous version is already 200, so the wait passes instantly and the
 * script then verifies the old site. And a brand-new Pages site can take up to
 * ten minutes to appear at the edge, past a two-minute budget.
 *
 * So the build writes its commit SHA to /build.txt and the workflow passes the
 * same SHA in as EXPECTED_BUILD; this polls until they match. Each attempt
 * carries a cache-busting query, because the CDN keys on the full URL and
 * would otherwise keep returning the cached 404 or the stale body. Without
 * EXPECTED_BUILD (a local run) it settles for the marker being reachable.
 */
async function waitForBuild(base, expected, { attempts = 60, delayMs = 10_000 } = {}) {
  const markerUrl = new URL("build.txt", base);
  for (let i = 1; i <= attempts; i++) {
    markerUrl.searchParams.set("verify", String(i));
    const res = await get(markerUrl.href, { cache: "no-store" });
    const body = res.ok ? (await res.text()).trim() : "";
    if (res.ok && (!expected || body === expected)) return body;
    const seen = res.ok ? `serving build ${body || "(empty)"}` : `HTTP ${res.status}${res.error ? " " + res.error : ""}`;
    console.log(`  waiting for build ${expected || "(any)"} — ${seen} (attempt ${i}/${attempts})`);
    await new Promise((r) => setTimeout(r, delayMs));
  }
  return null;
}

/* ---------- 1. the site is up, and the sitemap lists its pages ---------- */

console.log(`\nVerifying ${base.href}\n`);

const expectedBuild = process.env.EXPECTED_BUILD || "";
const served = await waitForBuild(base, expectedBuild);
if (served === null) {
  console.error(
    `\nFAIL  ${base.href} never served build ${expectedBuild || "(any)"} — ` +
    `either the deploy did not reach the edge, or /build.txt is not being published.\n`
  );
  process.exit(1);
}
console.log(`  serving build ${served}\n`);

const sitemapUrl = new URL("sitemap.xml", base).href;
const sitemapRes = await get(sitemapUrl);
if (!sitemapRes.ok) note(sitemapUrl, "sitemap", `HTTP ${sitemapRes.status}`);
const sitemap = sitemapRes.ok ? await sitemapRes.text() : "";
const pages = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

if (pages.length === 0) note(sitemapUrl, "sitemap", "lists no pages");

/* Every URL the sitemap advertises must live on this origin and under this
   path — a sitemap pointing at a different host means the canonical base
   was wrong at build time. */
for (const p of pages) {
  if (!p.startsWith(base.href)) note(sitemapUrl, "sitemap", `lists ${p}, which is not under ${base.href}`);
}

const robotsRes = await get(new URL("robots.txt", base).href);
if (!robotsRes.ok) note("robots.txt", "http", `HTTP ${robotsRes.status}`);

/* ---------- 2. each page: served, policy intact, accessible, reflows ---------- */

const browser = await launchChromium();
const seenAssets = new Map(); // url → status, so a shared stylesheet is fetched once

for (const pageUrl of pages) {
  const res = await get(pageUrl);
  if (!res.ok) {
    note(pageUrl, "http", `HTTP ${res.status}`);
    continue;
  }
  const type = res.headers.get("content-type") || "";
  if (!type.includes("text/html")) note(pageUrl, "http", `content-type ${type}`);
  const html = await res.text();

  if (!/http-equiv="Content-Security-Policy"/.test(html)) {
    note(pageUrl, "csp", "no Content-Security-Policy meta tag in the served page");
  }

  /* Every same-origin href/src on the page must resolve. This is the check
     that catches a path-prefix mistake: a "/assets/…" link works locally at
     the root and 404s under "/<repo>/". */
  for (const [, ref] of html.matchAll(/(?:href|src)="([^"#?]+)"/g)) {
    let target;
    try { target = new URL(ref, pageUrl); } catch { continue; }
    if (target.origin !== base.origin) continue;
    if (seenAssets.has(target.href)) continue;
    const r = await get(target.href);
    seenAssets.set(target.href, r.status);
    if (!r.ok) note(pageUrl, "link", `${ref} → HTTP ${r.status}`);
    else if (target.pathname.endsWith(".pdf")) {
      const ct = r.headers.get("content-type") || "";
      const len = Number(r.headers.get("content-length") || 0);
      if (!ct.includes("pdf")) note(pageUrl, "pdf", `${ref} served as ${ct}`);
      if (len && len < 20_000) note(pageUrl, "pdf", `${ref} is only ${len} bytes`);
    } else if (!target.pathname.startsWith(base.pathname)) {
      /* Resolved fine, but it escaped the sub-path — on a project site that
         means it is being served by a *different* site on the same host. */
      note(pageUrl, "prefix", `${ref} resolves outside ${base.pathname}`);
    }
  }

  /* axe and reflow, in a real browser, with third parties loading for real. */
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  /* Only messages raised by the site's own documents count. Once the YouTube
     embed loads for real, its frame emits its own report-only CSP notices and
     the odd exception, none of which is this site's to fix. */
  const errors = [];
  page.on("console", (m) => {
    const from = m.location()?.url || "";
    if (from && !from.startsWith(base.origin)) return;
    if (/Content Security Policy|Refused to/i.test(m.text())) errors.push(m.text().slice(0, 160));
  });
  try {
    /* domcontentloaded plus fonts is all axe and the reflow check need; waiting
       for "load" would make the run hostage to the video embed's own network. */
    await page.goto(pageUrl, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await page.evaluate(() => document.fonts.ready);
  } catch (err) {
    note(pageUrl, "browser", `did not load: ${err.message.split("\n")[0]}`);
    await context.close();
    continue;
  }
  errors.forEach((e) => note(pageUrl, "console", e));

  /* axe would otherwise descend into the cross-origin YouTube player and
     report Google's markup as this page's violations — the build-time audit
     never saw that, because it blocks the embed. The frame's *title* is still
     checked: it is an attribute on this document's own element. */
  const { violations } = await new AxeBuilder({ page }).withTags(TAGS).exclude("iframe").analyze();
  for (const v of violations) {
    note(pageUrl, `axe/${v.impact || "n-a"}`, `${v.id} — ${v.help} (${v.nodes.length})`);
  }

  await page.setViewportSize({ width: 320, height: 800 });
  const sideways = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
  );
  if (sideways) note(pageUrl, "reflow", "page scrolls sideways at 320px");

  await context.close();
  console.log(`  ok  ${pageUrl.replace(base.href, "/")}`);
}

await browser.close();

/* ---------- report ---------- */

if (findings.length) {
  console.log("\nLive-site findings\n");
  let current = "";
  for (const f of findings) {
    if (f.where !== current) { console.log(`\n  ${f.where}`); current = f.where; }
    console.log(`    ${f.kind.padEnd(12)} ${f.detail}`);
  }
  console.log(`\n${findings.length} finding(s) across ${pages.length} pages at ${base.href}\n`);
  process.exit(1);
}
console.log(
  `\n${pages.length} pages served, every same-origin link and asset resolves under ` +
  `${base.pathname}, PDFs are PDFs, CSP intact, axe and reflow clean — live at ${base.href}\n`
);
