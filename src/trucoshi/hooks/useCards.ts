import { useEffect, useState } from "react";
import { ICardTheme } from "../types";
import { BURNT_CARD, CARDS, ICard } from "trucoshi";

type Options = {
  disabled?: boolean;
  theme: ICardTheme | null;
  cards?: ICard[];
};

export type CardSources = Record<ICard, string>;

export const getRandomCard = () => {
  const cardsArray = Object.keys(CARDS);
  const index = Math.floor(Math.random() * cardsArray.length);
  return (cardsArray[index] || BURNT_CARD) as ICard;
};

export const getRandomCards = (len: number = 3) => {
  const cards = [getRandomCard()];
  do {
    const card = getRandomCard();
    if (cards.includes(card)) {
      continue;
    }
    cards.push(card);
  } while (cards.length < len);

  return cards;
};

export const useCards = ({ disabled, theme, cards }: Options) => {
  const [ready, setReady] = useState(false);
  const [sources, setSources] = useState<CardSources>({} as CardSources);
  const [loadedTheme, setLoadedTheme] = useState<ICardTheme | null>(theme);

  useEffect(() => {
    if (!theme) {
      return setReady(true);
    }

    if (disabled) {
      return setReady(false);
    }

    if (ready && loadedTheme === theme) {
      return;
    }

    setReady(false);

    const all: Array<Promise<[ICard, string]>> = [];

    const importingCards = (cards || Object.keys(CARDS)).concat(BURNT_CARD);

    for (const card of importingCards) {
      if (card) {
        all.push(
          import(`../../assets/cards/${theme}/${card}.png`)
            .catch(() => "Was not able to find a dynamic import for card " + card)
            .then((png) => [card as ICard, png.default as string])
        );
      }
    }

    Promise.all(Object.values(all))
      .then((results) => {
        setSources((current) =>
          results.reduce((prev, [card, png]) => {
            return { ...prev, [card]: png };
          }, current)
        );

        const imagePromises: Promise<void>[] = [];

        for (const [card, png] of results) {
          imagePromises.push(
            new Promise((resolve) => {
              const image = new Image();
              image.src = png;
              image.onload = function () {
                resolve();
              };
              image.onerror = function () {
                console.error("failed to load " + theme + " card " + card);
                resolve();
              };
            })
          );
        }

        return Promise.all(imagePromises);
      })
      .then(() => {
        setLoadedTheme(theme);
        setReady(true);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled, loadedTheme, ready, theme]);

  return [sources, ready] satisfies [CardSources, boolean];
};
