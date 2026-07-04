import { ICard } from "trucoshi";
import { CardDisplayMode } from "./cardSkinResolver";
import { CardSkinId } from "./skinRegistry";

export type IInspectedCard = {
  card: ICard;
  cardSkinId?: CardSkinId;
  displayMode?: CardDisplayMode;
  flip?: boolean;
};

export type CardInspectionInput = ICard | IInspectedCard | null;

export const normalizeCardInspection = (
  input: CardInspectionInput | ((current: IInspectedCard | null) => CardInspectionInput),
  current: IInspectedCard | null = null,
): IInspectedCard | null => {
  const value = typeof input === "function" ? input(current) : input;

  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return { card: value };
  }

  return value;
};

export const resolveInspectionCardSkinId = ({
  card,
  cardSkinId,
  cardSkinByCard,
}: {
  card: ICard;
  cardSkinId?: CardSkinId;
  cardSkinByCard?: Partial<Record<ICard, CardSkinId>>;
}) => cardSkinId || cardSkinByCard?.[card];

export const getInspectedCardKey = (inspectedCard: IInspectedCard | null) => {
  if (!inspectedCard) {
    return "none";
  }

  return [
    inspectedCard.card,
    inspectedCard.cardSkinId || "default",
    inspectedCard.displayMode || "auto",
    inspectedCard.flip ? "back" : "front",
  ].join(":");
};
