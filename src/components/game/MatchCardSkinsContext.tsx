import { createContext, ReactNode, useContext } from "react";
import { ICard, IPublicMatch, IPublicPlayer } from "trucoshi";
import { CardDisplayMode } from "../../trucoshi/cards/cardSkinResolver";
import {
  getDeckCardImageSources,
  getDefaultCardImageSources,
  isCardImageSourceReady,
  useCardImagePreload,
} from "../../trucoshi/cards/cardImageLoader";
import { CardSkinId, IEquippedDeck } from "../../trucoshi/cards/skinRegistry";
import { resolveSkinImage } from "../../trucoshi/cards/cardSkinResolver";
import type { useRounds } from "../../trucoshi/hooks/useRounds";

type MatchCardSkinsContextValue = {
  getFallbackCardSkinId: (
    playerIsMe: boolean | undefined,
    card: ICard,
    intendedCardSkinId?: CardSkinId,
  ) => CardSkinId | undefined;
};

const MatchCardSkinsContext = createContext<MatchCardSkinsContextValue>({
  getFallbackCardSkinId: () => undefined,
});

export const resolveMatchFallbackCardSkinId = ({
  card,
  displayMode,
  intendedCardSkinId,
  localDeck,
  playerIsMe,
}: {
  card: ICard;
  displayMode: CardDisplayMode;
  intendedCardSkinId?: CardSkinId;
  localDeck: IEquippedDeck;
  playerIsMe?: boolean;
}) => {
  if (displayMode !== "skins" || playerIsMe) {
    return undefined;
  }

  const intendedSource = intendedCardSkinId ? resolveSkinImage(intendedCardSkinId) : undefined;
  if (!intendedSource || isCardImageSourceReady(intendedSource)) {
    return undefined;
  }

  const fallbackCardSkinId = localDeck[card];
  if (!fallbackCardSkinId || fallbackCardSkinId === intendedCardSkinId) {
    return undefined;
  }

  const fallbackSource = resolveSkinImage(fallbackCardSkinId);
  return isCardImageSourceReady(fallbackSource) ? fallbackCardSkinId : undefined;
};

const getMatchCardImageSources = ({
  displayMode,
  match,
  rounds,
}: {
  displayMode: CardDisplayMode;
  match: IPublicMatch;
  rounds: ReturnType<typeof useRounds>[0];
}) => {
  if (displayMode === "emoji") {
    return [];
  }

  const playerDeckSources = match.players.flatMap((player) =>
    getDeckCardImageSources(player.deckSkinByCard),
  );
  const playedCardSources = rounds.flatMap((round) =>
    round.map((played) => (played.cardSkinId ? resolveSkinImage(played.cardSkinId) : undefined)),
  );

  return [
    ...getDefaultCardImageSources(),
    ...(displayMode === "skins" ? [...playerDeckSources, ...playedCardSources] : []),
  ];
};

export const MatchCardSkinsProvider = ({
  children,
  displayMode,
  match,
  me,
  rounds,
}: {
  children: ReactNode;
  displayMode: CardDisplayMode;
  match: IPublicMatch;
  me: IPublicPlayer | null;
  rounds: ReturnType<typeof useRounds>[0];
}) => {
  useCardImagePreload(
    getMatchCardImageSources({ displayMode, match, rounds }),
    displayMode === "emoji",
  );

  const localDeck = me?.deckSkinByCard || {};

  return (
    <MatchCardSkinsContext.Provider
      value={{
        getFallbackCardSkinId: (playerIsMe, card, intendedCardSkinId) =>
          resolveMatchFallbackCardSkinId({
            card,
            displayMode,
            intendedCardSkinId,
            localDeck,
            playerIsMe,
          }),
      }}
    >
      {children}
    </MatchCardSkinsContext.Provider>
  );
};

export const useMatchCardSkins = () => useContext(MatchCardSkinsContext);
