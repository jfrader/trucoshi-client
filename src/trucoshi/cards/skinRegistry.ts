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

export const CARD_SKINS_BY_CARD = CARD_SKINS.reduce<Record<ICard, ICardSkin[]>>(
  (acc, skin) => {
    acc[skin.card] = [...(acc[skin.card] || []), skin];
    return acc;
  },
  {} as Record<ICard, ICardSkin[]>,
);

export const CARD_SKINS_BY_ID = CARD_SKINS.reduce<Record<CardSkinId, ICardSkin>>(
  (acc, skin) => {
    acc[skin.id] = skin;
    return acc;
  },
  {},
);
