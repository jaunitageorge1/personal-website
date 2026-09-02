/**
 * Contrast audit.
 *
 * The palette is defined once, in tokens.css, and most muted text is written
 * as `color-mix(in srgb, <token> N%, transparent)` — which is just alpha
 * compositing over whatever sits behind it. This script reads the real token
 * values out of tokens.css, composites each foreground over the ground it
 * actually sits on, and measures the WCAG 2.x contrast ratio.
 *
 * Where a ground is a gradient, the ratio is measured against the gradient's
 * *lightest* point, because that is the worst case for light text on a dark
 * page — not against the flat colour underneath it.
 *
 * Exits non-zero if anything falls short, so it can gate a deploy.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/* ---------- token parsing ---------- */

const tokensCss = readFileSync(join(root, "src/assets/css/tokens.css"), "utf8");
const tokens = Object.fromEntries(
  [...tokensCss.matchAll(/(--[\w-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)].map((m) => [m[1], m[2]])
);
/* Some tokens alias another token rather than stating a hex. Resolve those so
   tokens.css stays the single source of truth and no value is duplicated. */
for (const [, name, target] of tokensCss.matchAll(/(--[\w-]+):\s*var\((--[\w-]+)\)\s*;/g)) {
  if (tokens[target]) tokens[name] = tokens[target];
}

const hex = (value) => {
  const raw = value.startsWith("--") ? tokens[value] : value;
  if (!raw) throw new Error(`unknown colour: ${value}`);
  const n = parseInt(raw.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

/** `color-mix(in srgb, C p%, transparent)` painted over `ground`. */
const mix = (color, pct, ground) => {
  const c = hex(color);
  const g = hex(ground);
  const a = pct / 100;
  return rgbToHex(c.map((v, i) => Math.round(v * a + g[i] * (1 - a))));
};

const rgbToHex = ([r, g, b]) =>
  "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0")).join("");

/* ---------- WCAG relative luminance and contrast ---------- */

const channel = (v) => {
  const s = v / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const luminance = (color) => {
  const [r, g, b] = hex(color).map(channel);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

/* ---------- the grounds ---------- */

/* The page ground is bg plus an accent-900 bloom at 75% (top right) and a
   black bloom at 30% (bottom left). The bloom is the lightest point, so it is
   the worst case for the light text sitting on it. */
const PAGE = mix("--color-accent-900", 75, "--color-bg");
/* The indigo band is --color-section plus a --color-section-glow bloom at 70%. */
const BAND = mix("--color-section-glow", 70, "--color-section");
const SURFACE = tokens["--color-surface"];
const WHITE = "#ffffff";

/* ---------- what to check ---------- */

/* Text is held to AAA (1.4.6), not just the AA the site claims: the floor
   for normal text is 7:1 and for large text 4.5:1. Non-text keeps AA's 3:1
   (1.4.11) — the base accent that draws focus rings and borders is the brand
   hue and measures 4.7:1 on the page, which is plenty for a boundary. */
const AAA_TEXT = 7.0;     // 1.4.6, normal text
const AAA_LARGE = 4.5;    // 1.4.6, >=24px, or >=18.66px bold
const AA_NONTEXT = 3.0;   // 1.4.11, UI component boundaries and focus rings

const text = (name, fg, bg, min = AAA_TEXT) => ({ name, fg, bg, min });

/* The three text tiers from tokens.css, as the percentages behind them. */
const STRONG = 90, SOFT = 82, MUTED = 74;

const checks = [
  /* --- body copy on the page ground --- */
  text("body text", "--color-text", PAGE),
  text(".lede / .hero-intro", "--color-text", PAGE),
  text("strong tier: .prose, .svc-copy, .contact-alt, .resume-links, .beyond-cols", mix("--color-text", STRONG, PAGE), PAGE),
  text("soft tier: .hero-note", mix("--color-text", SOFT, PAGE), PAGE),
  text("muted tier: .quote-attribution, .table-note, .pub-meta, .upcoming-where", mix("--color-text", MUTED, PAGE), PAGE),
  text("muted tier: .site-footer, .text-muted, .resume-toolbar label", mix("--color-text", MUTED, PAGE), PAGE),
  text(".table th (muted)", mix("--color-text", MUTED, PAGE), PAGE),
  text(".table td", "--color-text", PAGE),
  text(".cell-event (muted)", mix("--color-text", MUTED, PAGE), PAGE),

  /* --- accent used as text --- */
  text(".kicker (accent-text)", "--color-accent-text", PAGE),
  text("link (accent-300)", "--color-accent-300", PAGE),
  text("link hover (accent-200)", "--color-accent-200", PAGE),
  text(".btn-primary label (accent-text)", "--color-accent-text", PAGE),
  text(".btn-ghost label (accent-text)", "--color-accent-text", PAGE),
  text(".svc-num (accent-text)", "--color-accent-text", PAGE),
  text(".nav current page (accent-text)", "--color-accent-text", PAGE),

  /* --- the indigo band --- */
  text("band .kicker (accent-200)", "--color-accent-200", BAND),
  text("band heading", "--color-text", BAND),
  text("band link (accent-300)", "--color-accent-300", BAND),
  text(".stat-value", "--color-text", BAND, AAA_LARGE),
  text(".stat-label (strong, on band)", mix("--color-text", STRONG, BAND), BAND),
  text(".topic-list (strong, on band)", mix("--color-text", STRONG, BAND), BAND),
  text(".topic-note (strong, on band)", mix("--color-text", STRONG, BAND), BAND),

  /* --- cards --- */
  text(".card-title", "--color-text", SURFACE),
  text(".card-body (strong)", mix("--color-text", STRONG, SURFACE), SURFACE),
  text(".card-meta (muted)", mix("--color-text", MUTED, SURFACE), SURFACE),
  text(".card-kicker (accent-text)", "--color-accent-text", SURFACE),
  text("card link (accent-300)", "--color-accent-300", SURFACE),

  /* --- pills --- */
  text(".tag-accent", "--color-accent-100", "--color-accent-800"),
  text(".tag-neutral", "--color-neutral-100", "--color-neutral-800"),
  text(".tag-outline label (accent-text)", "--color-accent-text", PAGE),

  /* --- skip link --- */
  text(".skip-link", "--color-text", "--color-section"),

  /* --- résumé documents, on white --- */
  text("résumé body #23242e", "#23242e", WHITE),
  text("résumé prose / contact #33354a", "#33354a", WHITE),
  text("résumé name #16171f", "#16171f", WHITE, AAA_LARGE),
  text("résumé heading/link accent-800", "--color-accent-800", WHITE),
  text("résumé link hover accent-900", "--color-accent-900", WHITE),

  /* --- non-text: focus rings and control boundaries (1.4.11) --- */
  text("focus ring on page", "--color-accent", PAGE, AA_NONTEXT),
  text("focus ring on surface", "--color-accent", SURFACE, AA_NONTEXT),
  text("focus ring on band", "--color-accent", BAND, AA_NONTEXT),
  text("focus ring on white (résumé)", "--color-accent", WHITE, AA_NONTEXT),
  text(".btn-primary border on page (accent-text)", "--color-accent-text", PAGE, AA_NONTEXT),
  text(".tag-outline border on page (accent-text)", "--color-accent-text", PAGE, AA_NONTEXT),
  text(".btn-secondary border on page", "--color-border-control", PAGE, AA_NONTEXT),
];

/* ---------- report ---------- */

let failed = 0;
const rows = checks.map((c) => {
  const r = ratio(c.fg, c.bg);
  const ok = r >= c.min - 0.005;
  if (!ok) failed++;
  return { ...c, r, ok };
});

const width = Math.max(...rows.map((r) => r.name.length));
console.log(`\nContrast audit — page ground ${PAGE}, band ${BAND}, surface ${SURFACE}\n`);
for (const r of rows) {
  console.log(
    `${r.ok ? "PASS" : "FAIL"}  ${r.name.padEnd(width)}  ${r.r.toFixed(2).padStart(6)}:1  (needs ${r.min})`
  );
}
console.log(
  `\n${rows.length - failed}/${rows.length} pass. ` +
    (failed ? `${failed} FAILING.\n` : "All text meets WCAG 2.2 AAA (7:1); all non-text meets AA (3:1).\n")
);
process.exit(failed ? 1 : 0);
