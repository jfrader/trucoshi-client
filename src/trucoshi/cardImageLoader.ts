import { useEffect, useSyncExternalStore } from "react";

export type CardImageFetchPriority = "high" | "low" | "auto";

const readySources = new Set<string>();
const failedSources = new Set<string>();
const inflightSources = new Map<string, Promise<void>>();
const retainedImages = new Map<string, HTMLImageElement>();
const listeners = new Set<() => void>();
const queuedImageLoads: Array<{
  priority: CardImageFetchPriority;
  start: () => void;
}> = [];

const MAX_CONCURRENT_IMAGE_PRELOADS = 3;
const CARD_IMAGE_PRIORITY_ORDER: Record<CardImageFetchPriority, number> = {
  high: 0,
  auto: 1,
  low: 2,
};

let activeImageLoads = 0;

const notify = () => {
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const subscribeToNothing = () => () => undefined;

const uniqueSources = (sources: Array<string | null | undefined>) =>
  Array.from(new Set(sources.filter(Boolean) as string[]));

const getSourceStatusSignature = (sources: string[]) =>
  sources
    .map((source) => {
      if (readySources.has(source)) {
        return "r";
      }

      if (failedSources.has(source)) {
        return "f";
      }

      return "p";
    })
    .join("");

const completeSource = (source: string, failed = false, image?: HTMLImageElement) => {
  if (failed) {
    failedSources.add(source);
    retainedImages.delete(source);
  } else {
    readySources.add(source);
    failedSources.delete(source);
    if (image) {
      retainedImages.set(source, image);
    }
  }

  inflightSources.delete(source);
  notify();
};

const pumpQueuedImageLoads = () => {
  while (activeImageLoads < MAX_CONCURRENT_IMAGE_PRELOADS && queuedImageLoads.length) {
    const task = queuedImageLoads.shift();
    task?.start();
  }
};

const queueImageLoad = (load: () => Promise<void>, priority: CardImageFetchPriority) =>
  new Promise<void>((resolve) => {
    queuedImageLoads.push({
      priority,
      start: () => {
        activeImageLoads += 1;
        load()
          .catch(() => undefined)
          .finally(() => {
            activeImageLoads = Math.max(0, activeImageLoads - 1);
            pumpQueuedImageLoads();
            resolve();
          });
      },
    });
    queuedImageLoads.sort(
      (left, right) =>
        CARD_IMAGE_PRIORITY_ORDER[left.priority] - CARD_IMAGE_PRIORITY_ORDER[right.priority],
    );
    pumpQueuedImageLoads();
  });

const decodeImageSource = (source: string, priority: CardImageFetchPriority): Promise<void> =>
  new Promise<void>((resolve) => {
    const image = new Image();
    image.fetchPriority = priority;
    let settled = false;

    const fail = () => {
      if (settled) {
        return;
      }

      settled = true;
      completeSource(source, true);
      resolve();
    };

    const finish = () => {
      if (settled) {
        return;
      }

      if (typeof image.decode !== "function") {
        settled = true;
        completeSource(source, false, image);
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
          completeSource(source, false, image);
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

const loadImageSource = (source: string, priority: CardImageFetchPriority) => {
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

  const task = queueImageLoad(() => decodeImageSource(source, priority), priority);
  inflightSources.set(source, task);
  return task;
};

export const preloadCardImageSources = (
  sources: Array<string | null | undefined>,
  priority: CardImageFetchPriority = "auto",
) =>
  Promise.all(uniqueSources(sources).map((source) => loadImageSource(source, priority))).then(
    () => undefined,
  );

export const isCardImageSourceReady = (source?: string | null) =>
  Boolean(source && readySources.has(source));

export const isCardImageSourceComplete = (source?: string | null) =>
  Boolean(source && (readySources.has(source) || failedSources.has(source)));

export const getReadyCardImageSource = (source?: string | null) =>
  isCardImageSourceReady(source) ? source || undefined : undefined;

export const useCardImagePreload = (
  sources: Array<string | null | undefined>,
  disabled = false,
  priority: CardImageFetchPriority = "auto",
) => {
  const sourceList = uniqueSources(disabled ? [] : sources);
  const sourceKey = sourceList.join("|");
  const readyBeforeSubscription = sourceList.every(isCardImageSourceComplete);

  useSyncExternalStore(
    disabled || readyBeforeSubscription ? subscribeToNothing : subscribe,
    () => getSourceStatusSignature(sourceList),
    () => getSourceStatusSignature(sourceList),
  );

  useEffect(() => {
    if (sourceList.length) {
      void preloadCardImageSources(sourceList, priority);
    }
    // sourceKey represents the de-duplicated source list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priority, sourceKey]);

  const ready = sourceList.every(isCardImageSourceComplete);
  return { ready, loading: !ready };
};

export const resetCardImageCacheForTest = () => {
  readySources.clear();
  failedSources.clear();
  inflightSources.clear();
  retainedImages.clear();
  queuedImageLoads.length = 0;
  activeImageLoads = 0;
  notify();
};

export const markCardImageSourceReadyForTest = (source?: string | null) => {
  if (!source) {
    return;
  }

  readySources.add(source);
  failedSources.delete(source);
  notify();
};
