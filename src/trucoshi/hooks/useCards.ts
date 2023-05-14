import { useEffect, useState } from "react";
import { ICardTheme } from "../types";
import { CARDS, ICard } from "trucoshi";

type Options = {
  theme: ICardTheme | null;
};

export const useCards = ({ theme }: Options) => {
  const [ready, setReady] = useState(false);
  const [cards, setCards] = useState<Record<ICard, string>>({} as any);

  useEffect(() => {
    const all: Record<ICard, Promise<[ICard, any]>> = {} as any;

    all["xx" as ICard] = import(`../../assets/cards/${theme}/xx.png`).then((png) => [
      "xx" as ICard,
      png.default as string,
    ]);

    for (const key in CARDS) {
      if (key) {
        all[key as ICard] = import(`../../assets/cards/${theme}/${key}.png`)
          .catch(() => "Was not able to find a dynamic import for cards")
          .then((png) => [key as ICard, png.default as string]);
      }
    }

    Promise.all(Object.values(all)).then((results) => {
      setCards((current) =>
        results.reduce((prev, [card, png]) => {
          return { ...prev, [card]: png };
        }, current)
      );
    });
  }, [theme]);

  useEffect(() => {
    // greater than 'cause we're including 'xx' card
    if (Object.keys(cards).length > Object.keys(CARDS).length) {
      setReady(true);
    }
  }, [cards]);

  return [cards, ready] satisfies [Record<ICard, string>, boolean];
};
