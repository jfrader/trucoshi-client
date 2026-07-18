import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const servePath = resolve(dirname(fileURLToPath(import.meta.url)), "serve.mjs");
const processes = new Set();
const temporaryDirectories = new Set();

const reservePort = async () => {
  const probe = createServer();
  probe.listen(0, "127.0.0.1");
  await once(probe, "listening");
  const address = probe.address();
  const port = typeof address === "object" && address ? address.port : 0;
  await new Promise((resolveClose, rejectClose) =>
    probe.close((error) => (error ? rejectClose(error) : resolveClose())),
  );
  return port;
};

const collectProcessOutput = (child) => {
  let output = "";
  child.stdout.on("data", (chunk) => {
    output += chunk.toString();
  });
  child.stderr.on("data", (chunk) => {
    output += chunk.toString();
  });
  return () => output;
};

const spawnHost = async ({ cwd, environment = {} }) => {
  const port = await reservePort();
  const child = spawn(process.execPath, [servePath], {
    cwd,
    env: {
      ...process.env,
      HOST: "127.0.0.1",
      PORT: String(port),
      ...environment,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  processes.add(child);
  const readOutput = collectProcessOutput(child);

  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (child.exitCode !== null) {
      throw new Error(`Static host exited before becoming ready:\n${readOutput()}`);
    }
    try {
      const response = await fetch(`http://127.0.0.1:${port}/`, {
        headers: { Accept: "text/html" },
      });
      if (response.ok) {
        return { child, origin: `http://127.0.0.1:${port}`, readOutput };
      }
    } catch {
      // The child has not bound the port yet.
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 20));
  }

  throw new Error(`Static host did not become ready:\n${readOutput()}`);
};

const stopProcess = async (child) => {
  if (child.exitCode !== null || child.signalCode !== null) {
    processes.delete(child);
    return;
  }
  child.kill("SIGTERM");
  await Promise.race([
    once(child, "exit"),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timed out stopping static host")), 3_000),
    ),
  ]);
  processes.delete(child);
};

const createFixture = async () => {
  const root = await mkdtemp(join(tmpdir(), "trucoshi-static-host-"));
  temporaryDirectories.add(root);
  await mkdir(join(root, "dist", "assets"), { recursive: true });
  await writeFile(join(root, "dist", "index.html"), "<!doctype html><title>Trucoshi</title>");
  await writeFile(join(root, "dist", "assets", "app-abcdef12.js"), "export default 1;");
  await writeFile(
    join(root, "dist", "assets", "card-abcdef12.png"),
    Buffer.from([0x89, 0x50, 0x4e, 0x47]),
  );
  await writeFile(join(root, "dist", "version.json"), '{"version":"test"}');
  await writeFile(join(root, "secret.txt"), "outside-dist-secret");
  await symlink("..", join(root, "dist", "escape"), "dir");
  return root;
};

afterAll(async () => {
  await Promise.allSettled([...processes].map(stopProcess));
  await Promise.allSettled(
    [...temporaryDirectories].map((directory) => rm(directory, { force: true, recursive: true })),
  );
});

describe("production static host startup", () => {
  it("rejects invalid ports before binding", async () => {
    const root = await createFixture();
    const child = spawn(process.execPath, [servePath], {
      cwd: root,
      env: { ...process.env, HOST: "127.0.0.1", PORT: "0" },
      stdio: ["ignore", "pipe", "pipe"],
    });
    const readOutput = collectProcessOutput(child);
    await once(child, "exit");

    expect(child.exitCode).not.toBe(0);
    expect(readOutput()).toContain("PORT must be an integer between 1 and 65535");
  });

  it("fails closed when the production index is missing", async () => {
    const root = await mkdtemp(join(tmpdir(), "trucoshi-static-host-empty-"));
    temporaryDirectories.add(root);
    const child = spawn(process.execPath, [servePath], {
      cwd: root,
      env: { ...process.env, HOST: "127.0.0.1", PORT: String(await reservePort()) },
      stdio: ["ignore", "pipe", "pipe"],
    });
    const readOutput = collectProcessOutput(child);
    await once(child, "exit");

    expect(child.exitCode).not.toBe(0);
    expect(readOutput()).toContain("dist/index.html is missing");
  });
});

describe("production static host responses", () => {
  let host;

  beforeAll(async () => {
    host = await spawnHost({ cwd: await createFixture() });
  });

  afterAll(async () => {
    await stopProcess(host.child);
  });

  it("serves static files with MIME, cache, and security headers", async () => {
    const image = await fetch(`${host.origin}/assets/card-abcdef12.png`);
    expect(image.status).toBe(200);
    expect(image.headers.get("content-type")).toBe("image/png");
    expect(image.headers.get("cache-control")).toBe("public, max-age=31536000, immutable");
    expect(image.headers.get("x-content-type-options")).toBe("nosniff");
    expect(image.headers.get("x-frame-options")).toBe("DENY");
    expect(Buffer.from(await image.arrayBuffer())).toEqual(Buffer.from([0x89, 0x50, 0x4e, 0x47]));

    const version = await fetch(`${host.origin}/version.json`);
    expect(version.headers.get("cache-control")).toBe("no-store");
  });

  it("uses the SPA fallback only for extensionless HTML navigation", async () => {
    const route = await fetch(`${host.origin}/match/example`, {
      headers: { Accept: "text/html,application/xhtml+xml" },
    });
    expect(route.status).toBe(200);
    expect(await route.text()).toContain("<title>Trucoshi</title>");

    for (const path of ["/missing.js", "/missing.json", "/assets/"]) {
      const missing = await fetch(`${host.origin}${path}`, { headers: { Accept: "text/html" } });
      expect(missing.status, path).toBe(404);
    }
  });

  it("rejects hidden, NUL, and traversal-shaped paths without leaking files", async () => {
    for (const path of ["/.env", "/%00", "/%2e%2e%2fsecret.txt", "/escape/secret.txt"]) {
      const response = await fetch(`${host.origin}${path}`, { headers: { Accept: "text/html" } });
      expect(response.status, path).toBe(404);
      expect(await response.text()).not.toContain("outside-dist-secret");
    }
  });

  it("supports HEAD and rejects unsupported methods", async () => {
    const head = await fetch(`${host.origin}/`, {
      headers: { Accept: "text/html" },
      method: "HEAD",
    });
    expect(head.status).toBe(200);
    expect(await head.text()).toBe("");

    const post = await fetch(`${host.origin}/`, { method: "POST" });
    expect(post.status).toBe(405);
    expect(post.headers.get("cache-control")).toBe("no-store");
    expect(post.headers.get("x-content-type-options")).toBe("nosniff");
  });
});

describe("production admission route", () => {
  let upstream;
  let upstreamOrigin;
  let receivedAuthorization;
  let host;

  beforeAll(async () => {
    upstream = createServer((request, response) => {
      receivedAuthorization = request.headers.authorization;
      const body = JSON.stringify({
        admission: "accepting",
        acceptingNewGames: true,
        betsEnabled: true,
        counts: { activeMatches: 9 },
        privateToken: "upstream-secret",
        version: "server-test",
      });
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(body);
    });
    upstream.listen(0, "127.0.0.1");
    await once(upstream, "listening");
    const address = upstream.address();
    upstreamOrigin = `http://127.0.0.1:${address.port}`;

    host = await spawnHost({
      cwd: await createFixture(),
      environment: {
        TRUCOSHI_OPS_STATUS_TOKEN: "read-only-canary-secret",
        TRUCOSHI_SERVER_URL: upstreamOrigin,
      },
    });
  });

  afterAll(async () => {
    await stopProcess(host.child);
    await new Promise((resolveClose, rejectClose) =>
      upstream.close((error) => (error ? rejectClose(error) : resolveClose())),
    );
  });

  it("returns only the sanitized public status and never reflects secrets", async () => {
    const response = await fetch(`${host.origin}/admission.json`);
    const rawBody = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(JSON.parse(rawBody)).toEqual({
      admission: "accepting",
      acceptingNewGames: true,
      available: true,
      version: "server-test",
    });
    expect(rawBody).not.toMatch(/secret|counts|betsEnabled|privateToken/i);
    expect(receivedAuthorization).toBe("Bearer read-only-canary-secret");
  });

  it("returns an empty HEAD response and a strict method allowlist", async () => {
    const head = await fetch(`${host.origin}/admission.json`, { method: "HEAD" });
    expect(head.status).toBe(200);
    expect(await head.text()).toBe("");

    const post = await fetch(`${host.origin}/admission.json`, { method: "POST" });
    expect(post.status).toBe(405);
    expect(post.headers.get("allow")).toBe("GET, HEAD");
  });
});
