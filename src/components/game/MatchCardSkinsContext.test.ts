import { beforeEach, describe, expect, it } from "vitest";
import {
  markCardImageSourceReadyForTest,
  resetCardImageCacheForTest,
} from "../../trucoshi/cards/cardImageLoader";
import { resolveSkinImage } from "../../trucoshi/cards/cardSkinResolver";
import { resolveMatchFallbackCardSkinId } from "./MatchCardSkinsContext";

describe("resolveMatchFallbackCardSkinId", () => {
  beforeEach(() => {
    resetCardImageCacheForTest();
  });

  it("uses the local deck skin while an opponent played-card skin is loading", () => {
    markCardImageSourceReadyForTest(resolveSkinImage("argentino/1e_argentino_002"));

    expect(
      resolveMatchFallbackCardSkinId({
        card: "1e",
        displayMode: "skins",
        intendedCardSkinId: "argentino/1e_argentino_001",
        localDeck: { "1e": "argentino/1e_argentino_002" },
        playerIsMe: false,
      }),
    ).toBe("argentino/1e_argentino_002");
  });

  it("stops using the local fallback once the opponent skin is ready", () => {
    markCardImageSourceReadyForTest(resolveSkinImage("argentino/1e_argentino_001"));
    markCardImageSourceReadyForTest(resolveSkinImage("argentino/1e_argentino_002"));

    expect(
      resolveMatchFallbackCardSkinId({
        card: "1e",
        displayMode: "skins",
        intendedCardSkinId: "argentino/1e_argentino_001",
        localDeck: { "1e": "argentino/1e_argentino_002" },
        playerIsMe: false,
      }),
    ).toBeUndefined();
  });
});
