import { createServer } from "node:http";
import { readFile, realpath, stat } from "node:fs/promises";
import { basename, extname, relative, resolve, sep } from "node:path";
import { createAdmissionStatusReader, writeAdmissionResponse } from "./admission.mjs";

const configuredDistDirectory = resolve(process.cwd(), "dist");
const admissionReader = createAdmissionStatusReader();
const port = Number(process.env.PORT || "3000");
const host = process.env.HOST || "0.0.0.0";

if (!Number.isSafeInteger(port) || port < 1 || port > 65_535) {
  throw new Error("PORT must be an integer between 1 and 65535");
}

const distDirectory = await realpath(configuredDistDirectory).catch(() => null);
const indexPath = distDirectory
  ? await realpath(resolve(distDirectory, "index.html")).catch(() => null)
  : null;
if (
  !distDirectory ||
  !indexPath ||
  !indexPath.startsWith(`${distDirectory}${sep}`) ||
  !(await stat(indexPath).catch(() => null))?.isFile()
) {
  throw new Error("dist/index.html is missing; run the production build before serving");
}

const securityHeaders = {
  "Permissions-Policy": "camera=(), geolocation=(), microphone=()",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

const writeText = (response, statusCode, body) => {
  response.writeHead(statusCode, {
    "Cache-Control": "no-store",
    "Content-Length": Buffer.byteLength(body),
    "Content-Type": "text/plain; charset=utf-8",
    ...securityHeaders,
  });
  response.end(body);
};

const resolveStaticFile = async (pathname, acceptsHtml) => {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }

  if (decoded.includes("\0")) {
    return null;
  }

  const relativePath = decoded.replace(/^\/+/, "") || "index.html";
  if (relativePath.split("/").some((segment) => segment.startsWith("."))) {
    return null;
  }
  const candidate = resolve(distDirectory, relativePath);
  if (candidate !== distDirectory && !candidate.startsWith(`${distDirectory}${sep}`)) {
    return null;
  }

  try {
    const canonicalCandidate = await realpath(candidate);
    if (!canonicalCandidate.startsWith(`${distDirectory}${sep}`)) {
      return null;
    }

    if ((await stat(canonicalCandidate)).isFile()) {
      return canonicalCandidate;
    }

    // Existing directories are static namespaces, not client-side routes.
    return null;
  } catch {
    // SPA routes fall through to index.html.
  }

  if (!acceptsHtml || extname(relativePath)) {
    return null;
  }

  return indexPath;
};

const getCacheControl = (filePath) => {
  const filename = basename(filePath);
  if (filename === "index.html" || filename === "version.json") {
    return "no-store";
  }

  const relativePath = relative(distDirectory, filePath);
  if (relativePath.startsWith(`assets${sep}`) && /-[A-Za-z0-9_-]{8,}\./.test(filename)) {
    return "public, max-age=31536000, immutable";
  }

  return "public, max-age=3600";
};

const server = createServer(async (request, response) => {
  const method = request.method || "GET";
  let pathname;
  try {
    pathname = new URL(request.url || "/", "http://localhost").pathname;
  } catch {
    writeText(response, 400, "Bad request");
    return;
  }

  if (pathname === "/admission.json") {
    if (method !== "GET" && method !== "HEAD") {
      response.writeHead(405, {
        Allow: "GET, HEAD",
        "Cache-Control": "no-store",
        ...securityHeaders,
      });
      response.end();
      return;
    }

    const status = await admissionReader({
      serverUrl: process.env.TRUCOSHI_SERVER_URL,
      statusToken: process.env.TRUCOSHI_OPS_STATUS_TOKEN,
    });
    writeAdmissionResponse(response, status, method);
    return;
  }

  if (method !== "GET" && method !== "HEAD") {
    writeText(response, 405, "Method not allowed");
    return;
  }

  const acceptsHtml = (request.headers.accept || "").split(",").some((value) =>
    value.trim().toLowerCase().startsWith("text/html"),
  );
  const filePath = await resolveStaticFile(pathname, acceptsHtml);
  if (!filePath) {
    writeText(response, 404, "Not found");
    return;
  }

  try {
    const body = await readFile(filePath);
    response.writeHead(200, {
      "Cache-Control": getCacheControl(filePath),
      "Content-Length": body.byteLength,
      "Content-Type": contentTypes[extname(filePath)] || "application/octet-stream",
      ...securityHeaders,
    });
    response.end(method === "HEAD" ? undefined : body);
  } catch {
    writeText(response, 500, "Server error");
  }
});

server.listen(port, host, () => {
  console.log(`Trucoshi client listening on ${host}:${port}`);
});

let closing = false;
const shutdown = (signal) => {
  if (closing) {
    return;
  }
  closing = true;
  console.log(`${signal} received; closing Trucoshi client`);
  server.close((error) => {
    if (error) {
      console.error("Failed to close Trucoshi client cleanly");
      process.exitCode = 1;
    }
  });
};

process.once("SIGTERM", () => shutdown("SIGTERM"));
process.once("SIGINT", () => shutdown("SIGINT"));
