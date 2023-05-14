import { useEffect, useState } from "react";
import { ICardTheme } from "../types";
import { CARDS, ICard } from "trucoshi";

type Options = {
  disabled?: boolean;
  theme: ICardTheme | null;
  cards?: ICard[];
};

export type CardSources = Record<ICard, string>;

export const getRandomCard = () =>
  ((Object.keys(CARDS).at(Math.random() * Object.keys(CARDS).length) as unknown) || "xx") as ICard;

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

export const useCards = ({ disabled, theme, cards: filterCards }: Options) => {
  const [ready, setReady] = useState(false);
  const [cards, setCards] = useState<CardSources>({} as CardSources);
  const [loadedTheme, setLoadedTheme] = useState<ICardTheme | null>(theme);

  useEffect(() => {
    if (disabled || (ready && loadedTheme === theme)) {
      return;
    }

    setReady(false);

    const all: Array<Promise<[ICard, string]>> = [];

    const importingCards = (filterCards || Object.keys(CARDS)).concat("xx");

    for (const key of importingCards) {
      if (key) {
        all.push(
          import(`../../assets/cards/${theme}/${key}.png`)
            .catch(() => "Was not able to find a dynamic import for card " + key)
            .then((png) => [key as ICard, png.default as string])
        );
      }
    }

    Promise.all(Object.values(all))
      .then((results) => {
        setCards((current) =>
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
  }, [disabled, filterCards, loadedTheme, ready, theme]);

  return [cards, ready] satisfies [CardSources, boolean];
};
