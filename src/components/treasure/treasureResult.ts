import { CARDS_HUMAN_READABLE, ITreasureOpenResult } from "trucoshi";

export const rarityLabel: Record<string, string> = {
  COMMON: "Comun",
  RARE: "Rara",
  EPIC: "Epica",
  LEGENDARY: "Legendaria",
  PROMO: "Promo",
};

export const getResultTitle = (result: ITreasureOpenResult) =>
  result.granted ? "Nueva skin" : result.duplicate ? "Repetida" : "Sin premio";

export const getResultDescription = (result: ITreasureOpenResult) =>
  result.cardSkin
    ? `${CARDS_HUMAN_READABLE[result.cardSkin.card]} - ${
        rarityLabel[result.cardSkin.rarity] || result.cardSkin.rarity
      }`
    : result.rarity
      ? rarityLabel[result.rarity] || result.rarity
      : "No hubo una skin disponible";

export const getResultRarity = (result: ITreasureOpenResult) =>
  result.cardSkin?.rarity || result.rarity || null;

export const getResultCardLabel = (result: ITreasureOpenResult) =>
  result.cardSkin ? CARDS_HUMAN_READABLE[result.cardSkin.card] || result.cardSkin.card : null;

export const getResultDismissKey = (result: ITreasureOpenResult) =>
  `${result.chestId}:${result.cardSkin?.id || "empty"}:${
    result.granted ? "granted" : "not-granted"
  }:${result.duplicate ? "duplicate" : "unique"}`;

export const getRewardSound = (result: ITreasureOpenResult) => {
  if (!result.cardSkin) {
    return "back";
  }

  return result.duplicate ? "ceba_toma_mate" : "winner";
};
