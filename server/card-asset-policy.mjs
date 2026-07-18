import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const CARD_ASSET_FILENAMES = Object.freeze([
  "1b.png",
  "1c.png",
  "1e.png",
  "1o.png",
  "2b.png",
  "2c.png",
  "2e.png",
  "2o.png",
  "3b.png",
  "3c.png",
  "3e.png",
  "3o.png",
  "4b.png",
  "4c.png",
  "4e.png",
  "4o.png",
  "5b.png",
  "5c.png",
  "5e.png",
  "5o.png",
  "6b.png",
  "6c.png",
  "6e.png",
  "6o.png",
  "7b.png",
  "7c.png",
  "7e.png",
  "7o.png",
  "cb.png",
  "cc.png",
  "ce.png",
  "co.png",
  "pb.png",
  "pc.png",
  "pe.png",
  "po.png",
  "rb.png",
  "rc.png",
  "re.png",
  "ro.png",
  "xx.png",
]);

export const CARD_ASSET_COLLECTIONS = Object.freeze([
  Object.freeze({
    id: "default",
    publicDirectory: "public/cards/default",
    builtDirectory: "cards/default",
    fileCount: 41,
    totalBytes: 3_052_386,
    width: 256,
    height: 384,
    manifestSha256:
      "9c39a7634966f4ac89d223d2b4944e1e2c2c1707ad0c14968e27cb5e66a8e71b",
  }),
  Object.freeze({
    id: "gnu",
    publicDirectory: "public/cards/gnu",
    builtDirectory: "cards/gnu",
    fileCount: 41,
    totalBytes: 1_616_396,
    width: 208,
    height: 319,
    manifestSha256:
      "4aaf7c6f9bdfceea7d269d89c0a3e91ec3fae873102d2e9897cb32d301f28920",
  }),
]);

export const expectedCardAssetPaths = (directoryKey) =>
  CARD_ASSET_COLLECTIONS.flatMap((collection) =>
    CARD_ASSET_FILENAMES.map(
      (filename) => `${collection[directoryKey]}/${filename}`,
    ),
  ).sort();

const readPngDimensions = (buffer, path) => {
  const pngSignature = "89504e470d0a1a0a";
  if (
    buffer.length < 24 ||
    buffer.subarray(0, 8).toString("hex") !== pngSignature ||
    buffer.subarray(12, 16).toString("ascii") !== "IHDR"
  ) {
    throw new Error(`${path} is not a reviewed PNG with an IHDR header`);
  }

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
};

export const inspectCardAssetCollection = async (rootDirectory, directory, expected) => {
  let totalBytes = 0;
  let manifest = "";

  for (const filename of CARD_ASSET_FILENAMES) {
    const path = join(rootDirectory, directory, filename);
    const buffer = await readFile(path);
    const dimensions = readPngDimensions(buffer, path);
    if (dimensions.width !== expected.width || dimensions.height !== expected.height) {
      throw new Error(
        `${path} has ${dimensions.width}x${dimensions.height}; expected ${expected.width}x${expected.height}`,
      );
    }
    totalBytes += buffer.length;
    manifest += `${createHash("sha256").update(buffer).digest("hex")}  ${filename}\n`;
  }

  return {
    fileCount: CARD_ASSET_FILENAMES.length,
    totalBytes,
    manifestSha256: createHash("sha256").update(manifest).digest("hex"),
  };
};
