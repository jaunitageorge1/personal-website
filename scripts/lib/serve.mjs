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

/** The deployment sub-path, if the build was made for one (GitHub Pages). */
function normalisePrefix(raw = process.env.PATH_PREFIX || "") {
  const stripped = String(raw).trim().replace(/^\/+|\/+$/g, "");
  return stripped ? `/${stripped}` : "";
}

export function serve(
  rootDir,
  port = 0,
  { headers = productionHeaders(), pathPrefix = normalisePrefix() } = {}
) {
  const server = createServer(async (req, res) => {
    let requested = decodeURIComponent(req.url.split("?")[0]);
    /* A build made for a sub-path emits links like /repo/services/. Serving it
       at the root would 404 every one of them, so the prefix is stripped here
       — which lets the audits run against exactly the build that deploys. */
    if (pathPrefix && (requested === pathPrefix || requested.startsWith(pathPrefix + "/"))) {
      requested = requested.slice(pathPrefix.length) || "/";
    }
    let path = join(rootDir, requested);
    if (existsSync(path) && statSync(path).isDirectory()) path = join(path, "index.html");
    if (!existsSync(path)) {
      res.writeHead(404, { "content-type": "text/plain" });
      return res.end("not found");
    }
    res.writeHead(200, { ...headers, "content-type": TYPES[extname(path)] || "application/octet-stream" });
    res.end(await readFile(path));
  });
  return new Promise((resolve, reject) => {
    /* Without this a busy port (a killed run's server still winding down)
       leaves the promise pending forever, and everything waiting on it hangs
       with no output at all. Fail loudly instead. */
    server.once("error", (err) => reject(new Error(`could not listen on 127.0.0.1:${port}: ${err.message}`)));
    server.listen(port, "127.0.0.1", () =>
      resolve({ origin: `http://127.0.0.1:${server.address().port}`, close: () => server.close() })
    );
  });
}
