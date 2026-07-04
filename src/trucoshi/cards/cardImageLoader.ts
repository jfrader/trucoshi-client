import { useEffect, useSyncExternalStore } from "react";
import { BURNT_CARD, CARDS, ICard } from "trucoshi";
import { CardDisplayMode, resolveDefaultCardImage, resolveSkinImage } from "./cardSkinResolver";
import { CARD_SKINS, CardSkinId, IEquippedDeck } from "./skinRegistry";

export type CardImageRequest = {
  card: ICard;
  cardSkinId?: CardSkinId;
  cardSkinByCard?: Partial<Record<ICard, CardSkinId>>;
  displayMode?: CardDisplayMode;
  fallbackCardSkinId?: CardSkinId;
};

const readySources = new Set<string>();
const failedSources = new Set<string>();
const inflightSources = new Map<string, Promise<void>>();
const listeners = new Set<() => void>();
const queuedImageLoads: Array<() => void> = [];

let cacheVersion = 0;
let activeImageLoads = 0;

const MAX_CONCURRENT_IMAGE_PRELOADS = 6;

const notify = () => {
  cacheVersion += 1;
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = () => cacheVersion;

const uniqueSources = (sources: Array<string | undefined>) =>
  Array.from(new Set(sources.filter(Boolean) as string[]));

const completeSource = (source: string, failed = false) => {
  if (failed) {
    failedSources.add(source);
  } else {
    readySources.add(source);
    failedSources.delete(source);
  }
  inflightSources.delete(source);
  notify();
};

const pumpQueuedImageLoads = () => {
  while (activeImageLoads < MAX_CONCURRENT_IMAGE_PRELOADS && queuedImageLoads.length) {
    const start = queuedImageLoads.shift();
    start?.();
  }
};

const queueImageLoad = (load: () => Promise<void>) =>
  new Promise<void>((resolve) => {
    queuedImageLoads.push(() => {
      activeImageLoads += 1;
      load()
        .catch(() => undefined)
        .finally(() => {
          activeImageLoads = Math.max(0, activeImageLoads - 1);
          pumpQueuedImageLoads();
          resolve();
        });
    });

    pumpQueuedImageLoads();
  });

const decodeImageSource = (source: string): Promise<void> =>
  new Promise<void>((resolve) => {
    const image = new Image();
    let settled = false;

    const fail = () => {
      if (settled) {
        return;
      }
      settled = true;
      console.warn(`Failed to preload card image: ${source}`);
      completeSource(source, true);
      resolve();
    };

    const finish = () => {
      if (settled) {
        return;
      }

      if (typeof image.decode !== "function") {
        settled = true;
        completeSource(source);
        resolve();
        return;
      }

      image
        .decode()
        .then(() => {
          if (settled) {
            return;
          }
          settled = true;
          completeSource(source);
        })
        .catch(fail)
        .finally(resolve);
    };

    image.onload = finish;
    image.onerror = fail;
    image.src = source;

    if (image.complete) {
      finish();
    }
  });

const loadImageSource = (source: string): Promise<void> => {
  if (readySources.has(source) || failedSources.has(source)) {
    return Promise.resolve();
  }

  const inflight = inflightSources.get(source);
  if (inflight) {
    return inflight;
  }

  if (typeof Image === "undefined") {
    completeSource(source);
    return Promise.resolve();
  }

  const task = queueImageLoad(() => decodeImageSource(source));

  inflightSources.set(source, task);
  return task;
};

export const preloadCardImageSources = (sources: Array<string | undefined>) =>
  Promise.all(uniqueSources(sources).map(loadImageSource)).then(() => undefined);

export const isCardImageSourceReady = (source?: string) =>
  Boolean(source && readySources.has(source));

export const isCardImageSourceComplete = (source?: string) =>
  Boolean(source && (readySources.has(source) || failedSources.has(source)));

export const useCardImageCacheVersion = () =>
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

export const useCardImagePreload = (
  sources: Array<string | undefined>,
  disabled = false,
) => {
  useCardImageCacheVersion();

  const sourceList = uniqueSources(disabled ? [] : sources);
  const sourceKey = sourceList.join("|");

  useEffect(() => {
    if (!sourceList.length) {
      return;
    }

    preloadCardImageSources(sourceList);
    // sourceKey is the stable dependency for sourceList.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceKey]);

  const ready = sourceList.every(isCardImageSourceComplete);

  return {
    ready,
    loading: !ready,
  };
};

export const getDefaultCardImageSources = () =>
  [...(Object.keys(CARDS) as ICard[]), BURNT_CARD].map(resolveDefaultCardImage);

export const getCardImageSource = ({
  card,
  cardSkinId,
  cardSkinByCard,
  displayMode = "skins",
}: CardImageRequest) => {
  if (displayMode === "emoji") {
    return undefined;
  }

  const defaultSource = resolveDefaultCardImage(card);

  if (displayMode === "default") {
    return defaultSource;
  }

  const requestedSkinId = cardSkinId || cardSkinByCard?.[card];
  return (requestedSkinId && resolveSkinImage(requestedSkinId)) || defaultSource;
};

export const getCardImageRequestSources = (request: CardImageRequest) => {
  if ((request.displayMode || "skins") === "emoji") {
    return [];
  }

  return uniqueSources([
    getCardImageSource(request),
    request.fallbackCardSkinId ? resolveSkinImage(request.fallbackCardSkinId) : undefined,
    resolveDefaultCardImage(request.card),
  ]);
};

export const getReadyCardImageSource = (request: CardImageRequest) => {
  if ((request.displayMode || "skins") === "emoji") {
    return undefined;
  }

  const primarySource = getCardImageSource(request);
  if (isCardImageSourceReady(primarySource)) {
    return primarySource;
  }

  const fallbackSource = request.fallbackCardSkinId
    ? resolveSkinImage(request.fallbackCardSkinId)
    : undefined;
  if (isCardImageSourceReady(fallbackSource)) {
    return fallbackSource;
  }

  const defaultSource = resolveDefaultCardImage(request.card);
  if (isCardImageSourceReady(defaultSource)) {
    return defaultSource;
  }

  return undefined;
};

export const getDeckCardImageSources = (deck: IEquippedDeck = {}) =>
  Object.values(deck).map((cardSkinId) =>
    cardSkinId ? resolveSkinImage(cardSkinId) : undefined,
  );

export const getInventoryCardImageSources = () => [
  ...getDefaultCardImageSources(),
  ...CARD_SKINS.filter((skin) => skin.enabled).map((skin) => resolveSkinImage(skin.id)),
];

export const resetCardImageCacheForTest = () => {
  readySources.clear();
  failedSources.clear();
  inflightSources.clear();
  queuedImageLoads.length = 0;
  activeImageLoads = 0;
  notify();
};

export const markCardImageSourceReadyForTest = (source?: string) => {
  if (!source) {
    return;
  }

  readySources.add(source);
  failedSources.delete(source);
  notify();
};
