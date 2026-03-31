import { useEffect, useState } from "react";
import { CardThemes, ICardTheme } from "../types";
import { BURNT_CARD, CARDS, ICard } from "trucoshi";

type Options = {
  disabled?: boolean;
  theme: ICardTheme;
  cards?: ICard[];
};

export type CardSources = Record<ICard, string>;

const themeSourceCache = new Map<ICardTheme, Partial<CardSources>>();
const themeImageWarmCache = new Map<ICardTheme, Map<ICard, HTMLImageElement>>();

const getRequestedCards = (cards?: ICard[]) =>
  Array.from(new Set([...(cards || (Object.keys(CARDS) as ICard[])), BURNT_CARD])) as ICard[];

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

export const useCards = ({ disabled, theme: themeProp = "default", cards }: Options) => {
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sources, setSources] = useState<CardSources>({} as CardSources);

  const theme = CardThemes.includes(themeProp) ? themeProp : "default";

  const [loadedTheme, setLoadedTheme] = useState<ICardTheme | null>(theme);

  useEffect(() => {
    if (!theme) {
      setLoading(false);
      return setReady(true);
    }

    if (disabled) {
      return setReady(false);
    }

    if (ready && loadedTheme === theme) {
      return setLoading(false);
    }

    setLoading(true);
    if (!loadedTheme) {
      setReady(false);
    }

    const requestedCards = getRequestedCards(cards);
    const cachedForTheme = themeSourceCache.get(theme) || {};
    const imageWarmCache = themeImageWarmCache.get(theme) || new Map<ICard, HTMLImageElement>();
    const missingCards = requestedCards.filter((card) => !cachedForTheme[card]);

    const importPromises: Array<Promise<[ICard, string]>> = missingCards.map((card) =>
      import(`../../assets/cards/${theme}/${card}.png`)
        .catch(() => "Was not able to find a dynamic import for card " + card)
        .then((png) => [card, png.default as string])
    );

    Promise.all(importPromises)
      .then((results) => {
        const mergedForTheme: Partial<CardSources> = { ...cachedForTheme };
        for (const [card, png] of results) {
          mergedForTheme[card] = png;
        }

        themeSourceCache.set(theme, mergedForTheme);
        themeImageWarmCache.set(theme, imageWarmCache);

        setSources((current) => ({ ...current, ...(mergedForTheme as CardSources) }));

        const imagePromises: Promise<void>[] = [];

        for (const card of requestedCards) {
          const png = mergedForTheme[card];
          if (!png || imageWarmCache.has(card)) {
            continue;
          }

          imagePromises.push(
            new Promise((resolve) => {
              const image = new Image();
              image.src = png;

              const done = () => {
                imageWarmCache.set(card, image);
                resolve();
              };

              if (image.complete) {
                done();
                return;
              }

              image.onload = done;
              image.onerror = () => {
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
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled, loadedTheme, ready, theme]);

  return [sources, ready, loading] satisfies [CardSources, boolean, boolean];
};
