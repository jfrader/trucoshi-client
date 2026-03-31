import { useEffect, useMemo, useState } from "react";
import { CardThemes, ICardTheme } from "../types";
import { BURNT_CARD, CARDS, ICard } from "trucoshi";

type Options = {
  disabled?: boolean;
  theme: ICardTheme;
  cards?: ICard[];
};

export type CardSources = Record<ICard, string>;

type ThemeCardCache = {
  sources: Partial<CardSources>;
  warmedImages: Map<ICard, HTMLImageElement>;
  inflight: Promise<void> | null;
};

const RAW_CARD_ASSET_URLS = import.meta.glob("../../assets/cards/*/*.png", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const THEME_SOURCE_MANIFEST = new Map<ICardTheme, Partial<CardSources>>();
const THEME_RUNTIME_CACHE = new Map<ICardTheme, ThemeCardCache>();

const getRequestedCards = (cards?: ICard[]) =>
  Array.from(new Set([...(cards || (Object.keys(CARDS) as ICard[])), BURNT_CARD])) as ICard[];

const getThemeSourceManifest = (theme: ICardTheme): Partial<CardSources> => {
  const cached = THEME_SOURCE_MANIFEST.get(theme);
  if (cached) {
    return cached;
  }

  const manifest: Partial<CardSources> = {};
  const matcher = `/cards/${theme}/`;

  for (const [assetPath, src] of Object.entries(RAW_CARD_ASSET_URLS)) {
    const idx = assetPath.indexOf(matcher);
    if (idx === -1) {
      continue;
    }

    const fileName = assetPath.slice(idx + matcher.length);
    if (fileName.includes("/")) {
      continue;
    }

    const card = fileName.replace(/\.png$/i, "") as ICard;
    manifest[card] = src;
  }

  THEME_SOURCE_MANIFEST.set(theme, manifest);
  return manifest;
};

const getThemeCache = (theme: ICardTheme): ThemeCardCache => {
  const cached = THEME_RUNTIME_CACHE.get(theme);
  if (cached) {
    return cached;
  }

  const created: ThemeCardCache = {
    sources: { ...getThemeSourceManifest(theme) },
    warmedImages: new Map<ICard, HTMLImageElement>(),
    inflight: null,
  };

  THEME_RUNTIME_CACHE.set(theme, created);
  return created;
};

const warmImage = async (card: ICard, src: string): Promise<HTMLImageElement> =>
  new Promise((resolve) => {
    const image = new Image();
    image.src = src;

    const finalize = () => {
      if (typeof image.decode === "function") {
        image
          .decode()
          .catch(() => undefined)
          .finally(() => resolve(image));
        return;
      }

      resolve(image);
    };

    if (image.complete) {
      finalize();
      return;
    }

    image.onload = finalize;
    image.onerror = () => {
      console.error("failed to load card " + card);
      resolve(image);
    };
  });

const ensureThemeCardsReady = async (theme: ICardTheme, requestedCards: ICard[]) => {
  const cache = getThemeCache(theme);

  if (cache.inflight) {
    await cache.inflight;
  }

  const cardsToWarm = requestedCards.filter((card) => {
    const src = cache.sources[card];
    return Boolean(src) && !cache.warmedImages.has(card);
  });

  if (!cardsToWarm.length) {
    return cache;
  }

  const task = (async () => {
    const warmed = await Promise.all(
      cardsToWarm.map(async (card) => [card, await warmImage(card, cache.sources[card] as string)] as const)
    );

    for (const [card, image] of warmed) {
      cache.warmedImages.set(card, image);
    }
  })();

  cache.inflight = task.finally(() => {
    if (cache.inflight === task) {
      cache.inflight = null;
    }
  });

  await cache.inflight;
  return cache;
};

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
  const cardsKey = useMemo(() => (cards?.length ? cards.join("|") : "__all__"), [cards]);
  const requestedCards = useMemo(() => getRequestedCards(cards), [cards, cardsKey]);

  useEffect(() => {
    let cancelled = false;

    if (!theme) {
      setLoading(false);
      setReady(true);
      return;
    }

    if (disabled) {
      setReady(false);
      setLoading(false);
      return;
    }

    if (ready && loadedTheme === theme) {
      setLoading(false);
      return;
    }

    setLoading(true);

    ensureThemeCardsReady(theme, requestedCards)
      .then((cache) => {
        if (cancelled) {
          return;
        }

        setSources((current) => {
          let changed = false;
          const next = { ...current };

          for (const [card, src] of Object.entries(cache.sources) as [ICard, string][]) {
            if (!src || next[card] === src) {
              continue;
            }
            next[card] = src;
            changed = true;
          }

          return changed ? next : current;
        });

        setLoadedTheme(theme);
        setReady(true);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }
        setLoading(false);
        setReady(false);
      });

    return () => {
      cancelled = true;
    };
  }, [disabled, loadedTheme, ready, requestedCards, theme]);

  return [sources, ready, loading] satisfies [CardSources, boolean, boolean];
};
