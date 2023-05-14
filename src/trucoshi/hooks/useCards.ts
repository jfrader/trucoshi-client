import { useEffect, useState } from "react";
import { ICardTheme } from "../types";
import { CARDS, ICard } from "trucoshi";

type Options = {
  theme: ICardTheme | null;
};

export type CardSources = Record<ICard, string>;

export const getRandomCard = () =>
  ((Object.keys(CARDS).at(Math.random() * Object.keys(CARDS).length) as unknown) || "xx") as ICard;

export const useCards = ({ theme }: Options) => {
  const [ready, setReady] = useState(false);
  const [cards, setCards] = useState<CardSources>({} as CardSources);
  const [loadedTheme, setLoadedTheme] = useState<ICardTheme | null>(theme);

  useEffect(() => {
    if (ready && loadedTheme === theme) {
      return;
    }

    setReady(false);

    const all: Array<Promise<[ICard, string]>> = [
      import(`../../assets/cards/${theme}/xx.png`)
        .catch(() => "Was not able to find a dynamic import for card xx")
        .then((png) => ["xx" as ICard, png.default as string]),
    ];

    for (const key in CARDS) {
      if (key) {
        all.push(
          import(`../../assets/cards/${theme}/${key}.png`)
            .catch(() => "Was not able to find a dynamic import for card " + key)
            .then((png) => [key as ICard, png.default as string])
        );
      }
    }

    Promise.all(Object.values(all)).then((results) => {
      setCards((current) =>
        results.reduce((prev, [card, png]) => {
          return { ...prev, [card]: png };
        }, current)
      );
      setLoadedTheme(theme);
      setReady(true);
    });
  }, [loadedTheme, ready, theme]);

  return [cards, ready] satisfies [CardSources, boolean];
};
