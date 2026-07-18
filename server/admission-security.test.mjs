import { readdir, readFile } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { parseEnv } from "node:util";
import { describe, expect, it } from "vitest";

const textExtensions = new Set([".css", ".html", ".json", ".ts", ".tsx", ".webmanifest"]);

const collectTextFiles = async (path) => {
  const entries = await readdir(path, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const child = join(path, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectTextFiles(child)));
    } else if (textExtensions.has(extname(entry.name))) {
      files.push(child);
    }
  }

  return files;
};

describe("client admission secret boundary", () => {
  it("ships a bearer-safe local development status token", async () => {
    const environment = parseEnv(await readFile(".env.example", "utf8"));
    const automaticDevelopmentEnvironment = parseEnv(
      await readFile(".env.development", "utf8"),
    );

    expect(automaticDevelopmentEnvironment).toEqual(environment);

    expect(environment.TRUCOSHI_SERVER_URL).toBe("http://localhost:2992");
    expect(environment.TRUCOSHI_OPS_STATUS_TOKEN).toBe("trucoshi-dev-ops-status-token");
    expect(environment.TRUCOSHI_OPS_STATUS_TOKEN).not.toMatch(/\s/);
    expect(environment.VITE_APP_ENVIRONMENT).toBe("development");
    expect(environment.VITE_APP_HOST).toBe("http://localhost:2992");
    expect(environment.VITE_LIGHTNING_ACCOUNTS_URL).toBe("http://localhost:2999/v1");
    expect(environment.VITE_ENABLE_BETS_AND_DEPOSITS).toBe("1");
  });

  it("keeps ops credentials, paths, counts, and bet status out of client output inputs", async () => {
    const root = process.cwd();
    const files = [
      ...(await collectTextFiles(resolve(root, "src"))),
      ...(await collectTextFiles(resolve(root, "public"))),
      resolve(root, "index.html"),
    ];
    const clientText = (await Promise.all(files.map((file) => readFile(file, "utf8")))).join("\n");

    expect(clientText).not.toContain("TRUCOSHI_OPS_STATUS_TOKEN");
    expect(clientText).not.toContain("/ops/status");
    expect(clientText).not.toContain("Bearer ");
    expect(clientText).not.toContain('"counts"');
    expect(clientText).not.toContain("betsEnabled");
  });
});
