import { describe, expect, it } from "vitest";
import {
  resolveCardImage,
  resolveDefaultCardImage,
  resolveSkinImage,
} from "./cardSkinResolver";

describe("cardSkinResolver", () => {
  it("resolves default card images", () => {
    expect(resolveDefaultCardImage("1e")).toBeTruthy();
    expect(resolveDefaultCardImage("rb")).toBeTruthy();
  });

  it("resolves argentino skin images", () => {
    expect(resolveSkinImage("argentino/1e_argentino_004")).toBeTruthy();
    expect(resolveSkinImage("argentino/rb_argentino_003")).toBeTruthy();
  });

  it("falls back to default when a skin is missing", () => {
    expect(
      resolveCardImage({
        card: "1e",
        cardSkinId: "argentino/missing",
        displayMode: "skins",
      }),
    ).toBe(resolveDefaultCardImage("1e"));
  });

  it("does not resolve cover.png as a playable skin", () => {
    expect(resolveSkinImage("argentino/cover")).toBeUndefined();
  });
});
