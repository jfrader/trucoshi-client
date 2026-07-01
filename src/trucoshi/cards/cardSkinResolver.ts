import { ICard } from "trucoshi";
import { CardSkinId } from "./skinRegistry";

export type CardDisplayMode = "skins" | "default" | "emoji";

const defaultCardImages = import.meta.glob("../../assets/cards/skins/default/*.png", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const skinImages = import.meta.glob("../../assets/cards/skins/*/*.png", {
  eager: true,
  import: "default",
}) as Record<string, string>;

export function resolveDefaultCardImage(card: ICard): string | undefined {
  return defaultCardImages[`../../assets/cards/skins/default/${card}.png`];
}

export function resolveSkinImage(cardSkinId: CardSkinId): string | undefined {
  const [release, skinName] = cardSkinId.split("/");

  if (!release || !skinName) {
    return undefined;
  }

  return skinImages[`../../assets/cards/skins/${release}/${skinName}.png`];
}

export function resolveCardImage(input: {
  card: ICard;
  cardSkinId?: CardSkinId;
  cardSkinByCard?: Partial<Record<ICard, CardSkinId>>;
  displayMode: CardDisplayMode;
}): string | undefined {
  if (input.displayMode === "emoji") {
    return undefined;
  }

  if (input.displayMode === "default") {
    return resolveDefaultCardImage(input.card);
  }

  const cardSkinId = input.cardSkinId || input.cardSkinByCard?.[input.card];

  if (cardSkinId) {
    return resolveSkinImage(cardSkinId) || resolveDefaultCardImage(input.card);
  }

  return resolveDefaultCardImage(input.card);
}
