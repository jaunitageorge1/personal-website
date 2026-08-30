/**
 * Shared Chromium launcher.
 *
 * Some environments (CI images, sandboxes) ship a Chromium build whose
 * revision does not match the one Playwright pins. CHROMIUM_PATH points at
 * that binary; without it, Playwright's own download is used as normal.
 */
import { chromium } from "playwright";
import { existsSync } from "node:fs";

const CANDIDATES = [process.env.CHROMIUM_PATH, "/opt/pw-browsers/chromium"].filter(Boolean);

export function launchChromium(options = {}) {
  const executablePath = CANDIDATES.find((p) => existsSync(p));
  return chromium.launch({ ...options, ...(executablePath ? { executablePath } : {}) });
}
