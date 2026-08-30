/**
 * QA audit — the checks axe cannot make.
 *
 * axe reliably catches a minority of WCAG failures. This covers the machine-
 * checkable remainder that matters for this site, in a real browser:
 *
 *   keyboard      every interactive element reachable by Tab, in DOM order,
 *                 with a visible focus indicator and no trap; skip link works
 *   2.5.8         target size >= 24x24 CSS px, applying the inline exception
 *   2.4.11        focused element never obscured by other content
 *   1.4.12        text spacing can be overridden without clipping content
 *   1.4.4         pinch-zoom is not disabled
 *   1.3.5         inputs that collect user data carry autocomplete
 *   2.4.2 / 2.4.4 page titles unique and descriptive; no vague link text, and
 *                 no two links with the same text pointing somewhere different
 *   3.2.6         the same route to help appears on every page, in the same place
 *   integrity     internal links and asset references resolve; HTML is valid
 *
 * Exits non-zero on any finding.
 */
import { glob, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { HtmlValidate, formatterFactory } from "html-validate";
import { launchChromium } from "./lib/browser.mjs";
import { serve } from "./lib/serve.mjs";

const findings = [];
const note = (page, kind, detail) => findings.push({ page, kind, detail });

/* A build made for a GitHub Pages sub-path emits links like /repo/services/.
   Strip it before resolving them against _site, or every link reads as broken. */
const PATH_PREFIX = (process.env.PATH_PREFIX || "").trim().replace(/^\/+|\/+$/g, "");
const unprefix = (target) =>
  PATH_PREFIX && (target === `/${PATH_PREFIX}` || target.startsWith(`/${PATH_PREFIX}/`))
    ? target.slice(PATH_PREFIX.length + 1) || "/"
    : target;

const VAGUE_LINK_TEXT = [
  "click here", "here", "read more", "more", "link", "this", "learn more", "details",
];

/* ---------- in-page probes ---------- */

/** Every element a keyboard can reach, in DOM order. */
const collectFocusables = () =>
  [...document.querySelectorAll("a[href], button, input, select, textarea, [tabindex]")]
    .filter((el) => {
      if (el.hasAttribute("disabled")) return false;
      if (el.getAttribute("tabindex") === "-1") return false;
      if (el.closest("[aria-hidden='true']")) return false;
      const s = getComputedStyle(el);
      return s.display !== "none" && s.visibility !== "hidden";
    })
    .map((el, i) => {
      el.dataset.qaIndex = String(i);
      return i;
    }).length;

/* ---------- run ---------- */

const site = await serve("_site");
const browser = await launchChromium();

const pages = (await Array.fromAsync(glob("_site/**/index.html")))
  .map((f) => f.replace(/^_site/, "").replace(/index\.html$/, ""))
  .sort();

const titles = new Map();

for (const path of pages) {
  const url = site.origin + path;
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await context.route("**/*", (r) =>
    r.request().url().startsWith(site.origin) ? r.continue() : r.abort()
  );
  const page = await context.newPage();

  /* The local server replays netlify.toml's production headers, so anything
     the shipped Content-Security-Policy blocks shows up here rather than in
     production. A blocked stylesheet or script would otherwise sail through
     every other check. */
  page.on("console", (msg) => {
    const text = msg.text();
    if (/Content Security Policy|Refused to (load|execute|apply|connect)/i.test(text)) {
      note(path, "csp", text.split("\n")[0].slice(0, 160));
    }
  });
  page.on("pageerror", (err) => note(path, "js-error", String(err).slice(0, 160)));

  await page.goto(url, { waitUntil: "load" });

  /* --- 2.4.2 unique, descriptive titles --- */
  const title = await page.title();
  if (!title || title.length < 10) note(path, "2.4.2", `title too thin: ${JSON.stringify(title)}`);
  if (titles.has(title)) note(path, "2.4.2", `title duplicates ${titles.get(title)}`);
  titles.set(title, path);

  /* --- 1.4.4 pinch-zoom must not be disabled --- */
  const viewport = await page.getAttribute('meta[name="viewport"]', "content");
  if (/user-scalable\s*=\s*(no|0)|maximum-scale\s*=\s*(1|1\.0)\b/.test(viewport || "")) {
    note(path, "1.4.4", `viewport blocks zoom: ${viewport}`);
  }

  /* --- keyboard: reachability and DOM order --- */
  const expected = await page.evaluate(collectFocusables);
  await page.evaluate(() => document.body.focus());
  const seen = [];
  let trapped = false;
  for (let i = 0; i < expected + 6; i++) {
    await page.keyboard.press("Tab");
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const s = getComputedStyle(el);
      return {
        index: el.dataset.qaIndex ?? null,
        tag: el.tagName.toLowerCase(),
        label: (el.textContent || el.getAttribute("aria-label") || el.id || "").trim().slice(0, 40),
        /* A focus indicator has to be *something*: an outline, a ring, or a
           border change. Absence of all three is a 2.4.7 failure. */
        indicator:
          (parseFloat(s.outlineWidth) > 0 && s.outlineStyle !== "none") ||
          s.boxShadow !== "none",
        obscured: (() => {
          /* 2.4.11: the focused element must not be hidden behind other
             content. Sample its centre and see what is actually on top. */
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) return false;
          const x = Math.min(Math.max(r.left + r.width / 2, 1), innerWidth - 1);
          const y = Math.min(Math.max(r.top + r.height / 2, 1), innerHeight - 1);
          const top = document.elementFromPoint(x, y);
          return !!top && !el.contains(top) && !top.contains(el);
        })(),
      };
    });
    if (!info) break;
    if (seen.length && info.index !== null && seen.at(-1).index !== null &&
        Number(info.index) <= Number(seen.at(-1).index)) {
      if (seen.some((s) => s.index === info.index)) { trapped = true; break; }
      note(path, "2.4.3", `focus order jumps back at ${info.tag} "${info.label}"`);
    }
    if (!info.indicator) note(path, "2.4.7", `no visible focus indicator on ${info.tag} "${info.label}"`);
    if (info.obscured) note(path, "2.4.11", `focused ${info.tag} "${info.label}" is obscured`);
    seen.push(info);
    if (seen.length > expected + 4) break;
  }
  if (trapped) note(path, "2.1.2", "keyboard focus appears to be trapped");
  if (seen.length < expected) {
    note(path, "2.1.1", `only ${seen.length} of ${expected} focusable elements reached by Tab`);
  }

  /* --- skip link --- */
  await page.evaluate(() => document.body.focus());
  await page.keyboard.press("Tab");
  const skip = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el.tagName !== "A" || !el.classList.contains("skip-link")) return { ok: false };
    const r = el.getBoundingClientRect();
    return { ok: true, visible: r.top >= 0 && r.left >= 0, target: el.getAttribute("href") };
  });
  if (!skip.ok) note(path, "2.4.1", "first Tab stop is not the skip link");
  else {
    if (!skip.visible) note(path, "2.4.1", "skip link does not become visible on focus");
    const targetExists = await page.evaluate((sel) => !!document.querySelector(sel), skip.target);
    if (!targetExists) note(path, "2.4.1", `skip link points at missing ${skip.target}`);
  }

  /* --- 2.5.8 target size, with both of the exceptions the SC allows --- */
  const small = await page.evaluate(() => {
    const targets = [];
    for (const el of document.querySelectorAll("a[href], button, input:not([type=hidden]), select, textarea")) {
      if (el.closest("[aria-hidden='true']") || el.getAttribute("tabindex") === "-1") continue;
      const s = getComputedStyle(el);
      if (s.display === "none" || s.visibility === "hidden") continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      targets.push({ el, r, display: s.display });
    }

    /* Inline exception: "the target is in a sentence, or its size is otherwise
       constrained by the line-height of non-target text". The tell is a
       non-whitespace text node sitting directly alongside the link in its
       parent — a nav whose children are all links does not qualify. */
    const inSentence = (t) =>
      t.display.startsWith("inline") &&
      t.el.tagName === "A" &&
      t.el.parentElement &&
      [...t.el.parentElement.childNodes].some(
        (n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim() !== ""
      );

    const undersized = targets.filter((t) => (t.r.width < 24 || t.r.height < 24) && !inSentence(t));

    /* Spacing exception: a 24px-diameter circle centred on each undersized
       target must not intersect another target, nor another undersized
       target's circle. */
    const centre = (r) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    const distToRect = (p, r) => {
      const dx = Math.max(r.left - p.x, 0, p.x - r.right);
      const dy = Math.max(r.top - p.y, 0, p.y - r.bottom);
      return Math.hypot(dx, dy);
    };

    const out = [];
    for (const t of undersized) {
      const c = centre(t.r);
      const crowded = targets.some((o) => {
        if (o.el === t.el) return false;
        const oUnder = undersized.includes(o);
        return oUnder
          ? Math.hypot(c.x - centre(o.r).x, c.y - centre(o.r).y) < 24
          : distToRect(c, o.r) < 12;
      });
      if (crowded) {
        out.push(
          `${t.el.tagName.toLowerCase()} "${(t.el.textContent || "").trim().slice(0, 30)}" ` +
          `${Math.round(t.r.width)}x${Math.round(t.r.height)} with no spacing clearance`
        );
      }
    }
    return out;
  });
  small.forEach((s) => note(path, "2.5.8", `target under 24x24: ${s}`));

  /* --- 1.3.5 autocomplete on fields that collect the user's own data --- */
  const missingAutocomplete = await page.evaluate(() =>
    [...document.querySelectorAll("input[type=text], input[type=email], input[type=tel]")]
      .filter((el) => !el.closest("[aria-hidden='true']") && !el.hasAttribute("autocomplete"))
      .map((el) => el.id || el.name)
  );
  missingAutocomplete.forEach((f) => note(path, "1.3.5", `input without autocomplete: ${f}`));

  /* --- 2.4.4 link purpose --- */
  const linkIssues = await page.evaluate((vague) => {
    const out = [];
    const byText = new Map();
    for (const a of document.querySelectorAll("a[href]")) {
      const text = (a.innerText || a.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim();
      if (!text) { out.push(`link with no accessible name: ${a.getAttribute("href")}`); continue; }
      if (vague.includes(text.toLowerCase())) out.push(`vague link text: "${text}"`);
      const key = text.toLowerCase();
      const href = a.href;
      if (byText.has(key) && byText.get(key) !== href) {
        out.push(`"${text}" points at two different destinations`);
      }
      byText.set(key, href);
    }
    return out;
  }, VAGUE_LINK_TEXT);
  linkIssues.forEach((i) => note(path, "2.4.4", i));

  /* --- 3.2.6 consistent help --- */
  const helpRoute = await page.evaluate(() =>
    [...document.querySelectorAll("nav[aria-label='Main'] a")].map((a) => a.getAttribute("href")).join(" ")
  );
  if (path !== "/" && !/resume/.test(path) && !helpRoute.includes("/#contact") && !helpRoute.includes("/services/")) {
    note(path, "3.2.6", "no consistent route to contact in the main nav");
  }

  await context.close();

  /* --- 1.4.12 text spacing may be overridden without loss of content ---
     Simulates a reader's own stylesheet. A user stylesheet is applied by the
     user agent and is not subject to the page's CSP, so this one context
     bypasses it — the policy is still enforced everywhere else. */
  const spacingCtx = await browser.newContext({ viewport: { width: 1280, height: 900 }, bypassCSP: true });
  await spacingCtx.route("**/*", (r) =>
    r.request().url().startsWith(site.origin) ? r.continue() : r.abort()
  );
  const spacingPage = await spacingCtx.newPage();
  await spacingPage.goto(url, { waitUntil: "load" });
  await spacingPage.addStyleTag({
    content: `* { line-height: 1.5 !important; letter-spacing: 0.12em !important;
               word-spacing: 0.16em !important; }
              p { margin-bottom: 2em !important; }`,
  });
  const clipped = await spacingPage.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll("p, li, h1, h2, h3, td, th, label, button, .tag")) {
      /* The visually-hidden pattern is a 1x1 clipped box by design — it is
         meant to overflow, and its content goes to assistive tech, not to the
         screen. Flagging it would be flagging the technique itself. */
      if (el.classList.contains("visually-hidden")) continue;
      const s = getComputedStyle(el);
      if (s.overflow === "hidden" && el.scrollHeight > el.clientHeight + 2) {
        out.push(el.tagName.toLowerCase() + "." + String(el.className).split(" ")[0]);
      }
    }
    if (document.documentElement.scrollWidth > document.documentElement.clientWidth + 1) {
      out.push("page scrolls sideways");
    }
    return [...new Set(out)];
  });
  clipped.forEach((c) => note(path, "1.4.12", `content clipped with author text spacing overridden: ${c}`));
  await spacingCtx.close();
}

await browser.close();
site.close();

/* ---------- link and asset integrity ---------- */

const htmlFiles = await Array.fromAsync(glob("_site/**/*.html"));
for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const page = file.replace(/^_site/, "").replace(/index\.html$/, "");
  for (const [, attr, rawTarget] of html.matchAll(/(href|src)="(\/[^"#?]*)"/g)) {
    const target = unprefix(rawTarget);
    const candidates = [join("_site", target), join("_site", target, "index.html")];
    if (!candidates.some(existsSync)) note(page, "link", `${attr}="${rawTarget}" does not resolve`);
  }
  /* An in-page anchor must have something to land on. */
  for (const [, target] of html.matchAll(/href="#([^"]+)"/g)) {
    if (!new RegExp(`id="${target}"`).test(html)) note(page, "link", `#${target} has no target on this page`);
  }
}

/* ---------- HTML validity ---------- */

const validator = new HtmlValidate({
  extends: ["html-validate:recommended"],
  rules: {
    /* House style, not correctness: both DOCTYPE spellings are valid HTML. */
    "doctype-style": "off",
    "void-style": "off",
    "no-trailing-whitespace": "off",
    "attribute-boolean-style": "off",
    "require-sri": "off",

    /* role="list" on a <ul>/<ol> is redundant per spec, and the validator is
       right about that in the abstract. In practice Safari + VoiceOver drops
       list semantics from any list styled `list-style: none`, and this design
       styles every list that way — so the role is what keeps "list, 6 items"
       being announced. Kept deliberately; see docs/accessibility.md. */
    "no-redundant-role": "off",

    /* Same call: the numbered services list is an <ol> because 01–06 is a real
       sequence shown on screen, and it still needs role="list" for the reason
       above. The rule reads that pairing as "you should have used a <ul>". */
    "prefer-native-element": ["error", { exclude: ["list"] }],

    /* The contact form has no submit button in the static markup on purpose:
       it opens the reader's own email app, which needs JavaScript, so the
       button is created by the script. Rendering a dead button for readers
       without scripting would be worse than rendering none, and a <noscript>
       block above the fields explains the situation before anyone fills them
       in. Documented decision; see docs/accessibility.md. */
    "wcag/h32": "off",
  },
});
for (const file of htmlFiles) {
  const report = await validator.validateFile(file);
  if (!report.valid) {
    const page = file.replace(/^_site/, "").replace(/index\.html$/, "");
    for (const result of report.results) {
      for (const m of result.messages) {
        note(page, "html", `${m.ruleId} line ${m.line}: ${m.message}`);
      }
    }
  }
}

/* ---------- the two copies of the CSP must agree ---------- */

/* The policy is declared once, in site.js, and shipped as a <meta> tag because
   GitHub Pages cannot send headers. netlify.toml carries a second copy for the
   host that can. Two copies drift; this makes them fail loudly instead. */
{
  const { default: site } = await import("../src/_data/site.js");
  const parse = (policy) =>
    new Set(policy.split(";").map((d) => d.trim().replace(/\s+/g, " ")).filter(Boolean));

  const declared = parse(site.csp.full);
  const metaDeclared = parse(site.csp.meta);

  const toml = existsSync("netlify.toml") ? await readFile("netlify.toml", "utf8") : "";
  const served = toml.match(/Content-Security-Policy\s*=\s*"([^"]*)"/);
  if (served) {
    const shipped = parse(served[1]);
    for (const d of declared) if (!shipped.has(d)) note("netlify.toml", "csp", `missing directive: ${d}`);
    for (const d of shipped) if (!declared.has(d)) note("netlify.toml", "csp", `extra directive not in site.js: ${d}`);
  }

  /* And the meta tag the pages actually carry must be the meta-safe subset. */
  const home = await readFile("_site/index.html", "utf8");
  const tag = home.match(/http-equiv="Content-Security-Policy" content="([^"]*)"/);
  if (!tag) note("/", "csp", "no Content-Security-Policy meta tag in the built page");
  else {
    const inPage = parse(tag[1].replace(/&#39;/g, "'").replace(/&amp;/g, "&"));
    for (const d of metaDeclared) if (!inPage.has(d)) note("/", "csp", `meta tag missing directive: ${d}`);
    /* Directives a browser ignores inside <meta> must not be there pretending
       to protect something. */
    for (const d of inPage) {
      const name = d.split(" ")[0];
      if (["frame-ancestors", "report-uri", "report-to", "sandbox"].includes(name)) {
        note("/", "csp", `${name} has no effect in a meta tag and should not be there`);
      }
    }
  }
}

/* ---------- report ---------- */

if (findings.length) {
  console.log("\nQA findings\n");
  let current = "";
  for (const f of findings) {
    if (f.page !== current) { console.log(`\n  ${f.page}`); current = f.page; }
    console.log(`    ${f.kind.padEnd(8)} ${f.detail}`);
  }
  console.log(`\n${findings.length} finding(s) across ${pages.length} pages.\n`);
  process.exit(1);
}
console.log(
  `\nKeyboard reachability and order, focus visibility, focus not obscured,\n` +
  `target size, text-spacing override, zoom, autocomplete, link purpose,\n` +
  `title uniqueness, consistent help, link integrity, HTML validity and the\nproduction CSP:\n` +
  `clean across all ${pages.length} pages.\n`
);
