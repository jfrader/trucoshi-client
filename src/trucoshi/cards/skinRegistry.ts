import {
  CARD_SKINS,
  CARDS,
  CardSkinId,
  CardSkinRarity,
  ICard,
  ICardSkin,
  IEquippedDeck,
  IInventoryCardGroup,
  IInventoryCardSkin,
} from "trucoshi";

export type {
  CardSkinId,
  CardSkinRarity,
  ICardSkin,
  IEquippedDeck,
  IInventoryCardGroup,
  IInventoryCardSkin,
};

export { CARD_SKINS };

export const INVENTORY_CARDS = Object.keys(CARDS) as ICard[];
