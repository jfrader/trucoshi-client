import { access, readdir, readFile } from "node:fs/promises";
import { extname, join, relative, resolve, sep } from "node:path";
import { describe, expect, it } from "vitest";
import {
  CARD_ASSET_COLLECTIONS,
  expectedCardAssetPaths,
  inspectCardAssetCollection,
} from "./card-asset-policy.mjs";

const root = process.cwd();
const reviewedInlineFavicon =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='12' fill='%230f5132'/%3E%3Ctext x='32' y='46' text-anchor='middle' font-size='42' fill='white'%3ET%3C/text%3E%3C/svg%3E";
const mediaExtensions = new Set([
  ".avif",
  ".gif",
  ".ico",
  ".jpeg",
  ".jpg",
  ".mp3",
  ".mp4",
  ".ogg",
  ".otf",
  ".pdf",
  ".png",
  ".svg",
  ".ttf",
  ".wav",
  ".webm",
  ".webp",
  ".woff",
  ".woff2",
  ".zip",
]);

const collectMedia = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true }).catch(() => []);
  const paths = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      paths.push(...(await collectMedia(path)));
    } else if (mediaExtensions.has(extname(entry.name).toLowerCase())) {
      paths.push(relative(root, path).split(sep).join("/"));
    }
  }

  return paths;
};

const exists = async (path) =>
  access(path)
    .then(() => true)
    .catch(() => false);

describe("public asset boundary", () => {
  it("ships only the two fixed web decks", async () => {
    const actualPaths = [
      ...(await collectMedia(resolve(root, "src"))),
      ...(await collectMedia(resolve(root, "public"))),
    ].sort();

    expect(actualPaths).toEqual(expectedCardAssetPaths("publicDirectory"));

    for (const collection of CARD_ASSET_COLLECTIONS) {
      expect(
        await inspectCardAssetCollection(
          root,
          collection.publicDirectory,
          collection,
        ),
      ).toEqual({
        fileCount: collection.fileCount,
        totalBytes: collection.totalBytes,
        manifestSha256: collection.manifestSha256,
      });
    }
  });

  it("uses a fixed local selector without custom-deck or inventory plumbing", async () => {
    const gameCard = await readFile(resolve(root, "src/components/card/GameCard.tsx"), "utf8");
    const context = await readFile(resolve(root, "src/trucoshi/trucoshi.context.tsx"), "utf8");
    const topbar = await readFile(resolve(root, "src/components/layout/Topbar.tsx"), "utf8");
    const cardBackdrop = await readFile(resolve(root, "src/shared/CardBackdrop.tsx"), "utf8");
    const themes = await readFile(resolve(root, "src/trucoshi/cardThemes.ts"), "utf8");
    const selector = await readFile(
      resolve(root, "src/components/card/CardThemeSelector.tsx"),
      "utf8",
    );

    expect(await exists(resolve(root, "src/assets/cards/gnu"))).toBe(false);
    expect(await exists(resolve(root, "src/trucoshi/hooks/useCards.ts"))).toBe(false);
    expect(gameCard).toContain('component="img"');
    expect(gameCard).toContain("getCardImageUrl");
    expect(gameCard).not.toContain("import.meta.glob");
    expect(context).toContain('"cardtheme"');
    expect(context).toContain("normalizeCardTheme");
    expect(topbar).toContain("CardThemeSelector");
    expect(cardBackdrop).not.toContain("CardThemeToggle");
    expect(themes).toContain('["default", "gnu", "emoji"]');
    expect(themes).not.toMatch(/criollo|custom|inventory/i);
    expect(selector).not.toMatch(/criollo|custom|inventory|upload/i);
  });

  it("keeps the GPL code license and the artwork attribution chain", async () => {
    const packageJson = JSON.parse(await readFile(resolve(root, "package.json"), "utf8"));
    const assetNotices = await readFile(resolve(root, "ASSET_NOTICES.md"), "utf8");
    const thirdPartyNotices = await readFile(
      resolve(root, "THIRD_PARTY_NOTICES.md"),
      "utf8",
    );
    const viteConfig = await readFile(resolve(root, "vite.config.ts"), "utf8");

    expect(packageJson.license).toBe("GPL-3.0-or-later");
    expect(packageJson.dependencies.trucoshi).toBe("15.0.4");
    expect(packageJson.dependencies["lightning-accounts"]).toBe("7.0.1");
    expect(packageJson.dependencies).not.toHaveProperty("@jfrader/trucoshi-private");
    expect(viteConfig).toContain('["ASSET_NOTICES.md", "ASSET_NOTICES.md"]');
    expect(viteConfig).toContain('["THIRD_PARTY_NOTICES.md", "THIRD_PARTY_NOTICES.md"]');
    expect(viteConfig).toContain("sourcemap: false");

    for (const attribution of [
      "jfrader@pm.me",
      "Germarquezm",
      "Fuzzy",
      "Aurelio A. Heckert",
      "Milenioscuro",
      "Ssire",
      "Mercury13",
      "SanchoPanzaXXI",
      "Archimatth",
      "Free Art License 1.3",
      "CC BY-SA 4.0",
    ]) {
      expect(assetNotices).toContain(attribution);
    }
    expect(assetNotices).toContain("not a claim that the whole deck is");
    expect(thirdPartyNotices).toContain("Copyright (c) 2022 Antonio Lázaro");
    expect(thirdPartyNotices).toContain("node-forge@1.4.0");
    expect(thirdPartyNotices).toContain("trucoshi@15.0.4");
    expect(thirdPartyNotices).toContain("Copyright (c) 2009 Kazuhiko Arase");
    expect(thirdPartyNotices).toContain("Copyright (c) 2019 RollupJS Plugin Contributors");
  });

  it("installs no emoji vendor sprite package", async () => {
    const packageJson = JSON.parse(await readFile(resolve(root, "package.json"), "utf8"));
    const chatField = await readFile(resolve(root, "src/components/chat/ChatField.tsx"), "utf8");
    const chatRoom = await readFile(resolve(root, "src/components/chat/ChatRoom.tsx"), "utf8");

    expect(packageJson.dependencies).not.toHaveProperty("emoji-picker-react");
    expect(packageJson.dependencies).not.toHaveProperty("emoji-datasource");
    expect(packageJson.dependencies).not.toHaveProperty("emoji-js");
    expect(await exists(resolve(root, "src/components/chat/ChatFieldWithEmojis.tsx"))).toBe(false);
    expect(chatField).not.toContain("emoji-picker-react");
    expect(chatRoom).not.toContain("ChatFieldWithEmojis");
    expect(chatRoom).not.toContain("emoji-js");
    expect(chatRoom).not.toContain("dangerouslySetInnerHTML");
  });

  it("keeps release HTML self-contained when optional build metadata is absent", async () => {
    const indexHtml = await readFile(resolve(root, "index.html"), "utf8");

    expect(indexHtml).not.toMatch(/%VITE_[A-Z0-9_]+%/);
    expect(indexHtml).toContain('rel="icon"');
    expect(indexHtml.split(reviewedInlineFavicon)).toHaveLength(2);
    expect(indexHtml).toContain(`href="${reviewedInlineFavicon}"`);
    expect(indexHtml.replace(reviewedInlineFavicon, "")).not.toMatch(
      /data:(?:image|audio|video|font)\//,
    );
    expect(indexHtml).toContain("<title>Trucoshi</title>");
  });
});
