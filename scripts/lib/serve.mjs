/** Minimal static server for the built site — enough to audit _site/ locally. */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml",
  ".jpg": "image/jpeg", ".png": "image/png", ".woff2": "font/woff2",
  ".xml": "application/xml", ".txt": "text/plain; charset=utf-8",
  ".pdf": "application/pdf",
};

export function serve(rootDir, port = 0) {
  const server = createServer(async (req, res) => {
    let path = join(rootDir, decodeURIComponent(req.url.split("?")[0]));
    if (existsSync(path) && statSync(path).isDirectory()) path = join(path, "index.html");
    if (!existsSync(path)) {
      res.writeHead(404, { "content-type": "text/plain" });
      return res.end("not found");
    }
    res.writeHead(200, { "content-type": TYPES[extname(path)] || "application/octet-stream" });
    res.end(await readFile(path));
  });
  return new Promise((resolve) => {
    server.listen(port, "127.0.0.1", () =>
      resolve({ origin: `http://127.0.0.1:${server.address().port}`, close: () => server.close() })
    );
  });
}
