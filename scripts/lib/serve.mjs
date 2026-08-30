/**
 * Minimal static server for the built site.
 *
 * It replays the response headers netlify.toml sets for `/*` — the
 * Content-Security-Policy above all — so the audits exercise the site under
 * the policy it actually ships with. Without this, a CSP that blocks the
 * site's own stylesheet or script would pass every check locally and only
 * break in production.
 */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync, statSync, readFileSync } from "node:fs";
import { join, extname } from "node:path";

const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml",
  ".jpg": "image/jpeg", ".png": "image/png", ".woff2": "font/woff2",
  ".xml": "application/xml", ".txt": "text/plain; charset=utf-8",
  ".pdf": "application/pdf",
};

/** The `[[headers]] for = "/*"` block out of netlify.toml, if there is one. */
function productionHeaders(file = "netlify.toml") {
  if (!existsSync(file)) return {};
  const toml = readFileSync(file, "utf8");
  const block = toml.match(/\[\[headers\]\]\s*\n\s*for\s*=\s*"\/\*"\s*\n\s*\[headers\.values\]\n([\s\S]*?)(?=\n\[|$)/);
  if (!block) return {};
  return Object.fromEntries(
    [...block[1].matchAll(/^\s*([\w-]+)\s*=\s*"([^"]*)"/gm)].map((m) => [m[1], m[2]])
  );
}

export function serve(rootDir, port = 0, { headers = productionHeaders() } = {}) {
  const server = createServer(async (req, res) => {
    let path = join(rootDir, decodeURIComponent(req.url.split("?")[0]));
    if (existsSync(path) && statSync(path).isDirectory()) path = join(path, "index.html");
    if (!existsSync(path)) {
      res.writeHead(404, { "content-type": "text/plain" });
      return res.end("not found");
    }
    res.writeHead(200, { ...headers, "content-type": TYPES[extname(path)] || "application/octet-stream" });
    res.end(await readFile(path));
  });
  return new Promise((resolve) => {
    server.listen(port, "127.0.0.1", () =>
      resolve({ origin: `http://127.0.0.1:${server.address().port}`, close: () => server.close() })
    );
  });
}
