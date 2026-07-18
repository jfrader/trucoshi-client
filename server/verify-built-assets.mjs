import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative, resolve, sep } from "node:path";
import {
  CARD_ASSET_COLLECTIONS,
  expectedCardAssetPaths,
  inspectCardAssetCollection,
} from "./card-asset-policy.mjs";

const root = process.cwd();
const dist = resolve(root, "dist");
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
const textExtensions = new Set([".css", ".html", ".js", ".json", ".md", ".txt"]);
const forbiddenText = [
  "@jfrader/trucoshi-private",
  "@jfrader/trucoshi-client-private",
  "trucoshi-client-private",
];
const reviewedInlineMedia = [
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='12' fill='%230f5132'/%3E%3Ctext x='32' y='46' text-anchor='middle' font-size='42' fill='white'%3ET%3C/text%3E%3C/svg%3E",
  "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA",
  "data:image/gif;base64,",
];

const files = [];
const visit = async (directory) => {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      await visit(path);
    } else {
      files.push(path);
    }
  }
};

await visit(dist);

const media = files
  .filter((path) => mediaExtensions.has(extname(path).toLowerCase()))
  .map((path) => relative(root, path).split(sep).join("/"))
  .sort();
const expectedMedia = expectedCardAssetPaths("builtDirectory").map(
  (path) => `dist/${path}`,
);

if (JSON.stringify(media) !== JSON.stringify(expectedMedia)) {
  throw new Error(
    `Production media differs from the fixed allowlist:\n${JSON.stringify({ expectedMedia, media }, null, 2)}`,
  );
}

const sourceMaps = files.filter((path) => extname(path).toLowerCase() === ".map");
if (sourceMaps.length) {
  throw new Error(
    `Unexpected production source maps:\n${sourceMaps.map((path) => relative(root, path)).join("\n")}`,
  );
}

for (const path of files.filter((candidate) =>
  textExtensions.has(extname(candidate).toLowerCase()),
)) {
  const body = await readFile(path, "utf8");
  const relativePath = relative(root, path).split(sep).join("/");
  const matched = forbiddenText.find((value) => body.includes(value));
  if (matched) {
    throw new Error(`${relativePath} contains forbidden public marker ${matched}`);
  }
  if (body.includes("sourceMappingURL=")) {
    throw new Error(`${relativePath} contains a source-map reference`);
  }

  if ([".css", ".html", ".js"].includes(extname(path).toLowerCase())) {
    let unreviewedBody = body;
    for (const value of reviewedInlineMedia) {
      unreviewedBody = unreviewedBody.replaceAll(value, "");
    }
    if (/data:(?:image|audio|video|font)\//i.test(unreviewedBody)) {
      throw new Error(`${relativePath} contains unreviewed inline media`);
    }
  }
}

for (const collection of CARD_ASSET_COLLECTIONS) {
  const actual = await inspectCardAssetCollection(
    dist,
    collection.builtDirectory,
    collection,
  );
  if (
    actual.fileCount !== collection.fileCount ||
    actual.totalBytes !== collection.totalBytes ||
    actual.manifestSha256 !== collection.manifestSha256
  ) {
    throw new Error(
      `Built ${collection.id} collection differs from the reviewed web deck:\n${JSON.stringify(actual, null, 2)}`,
    );
  }
}

for (const filename of ["LICENSE", "ASSET_NOTICES.md", "THIRD_PARTY_NOTICES.md"]) {
  const source = await readFile(resolve(root, filename), "utf8");
  const built = await readFile(resolve(dist, filename), "utf8");
  if (source !== built) {
    throw new Error(`dist/${filename} differs from the source notice`);
  }
}

const assetNotices = await readFile(resolve(root, "ASSET_NOTICES.md"), "utf8");
for (const required of [
  "CC-BY-SA-4.0",
  "Germarquezm",
  "Fuzzy",
  "Aurelio A. Heckert",
  "Free Art License 1.3",
  "Milenioscuro",
  "Ssire",
  "Mercury13",
  "SanchoPanzaXXI",
  "Archimatth",
]) {
  if (!assetNotices.includes(required)) {
    throw new Error(`ASSET_NOTICES.md omits required attribution: ${required}`);
  }
}

const thirdPartyNotices = await readFile(
  resolve(root, "THIRD_PARTY_NOTICES.md"),
  "utf8",
);
for (const required of [
  "Copyright (c) 2022 Antonio Lázaro",
  "lightning-accounts@7.0.1",
  "Copyright (c) 2009 Kazuhiko Arase",
  "Copyright (c) 2019 RollupJS Plugin Contributors",
  "node-forge@1.4.0",
  "trucoshi@15.0.4",
  "BSD-3-Clause",
  "Permission is hereby granted, free of charge",
  "GPL-3.0-or-later",
]) {
  if (!thirdPartyNotices.includes(required)) {
    throw new Error(`THIRD_PARTY_NOTICES.md omits required notice: ${required}`);
  }
}

console.log(
  `Verified ${media.length} fixed card images and ${files.length} production files`,
);
