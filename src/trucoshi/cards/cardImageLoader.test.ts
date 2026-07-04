import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  getReadyCardImageSource,
  isCardImageSourceComplete,
  isCardImageSourceReady,
  preloadCardImageSources,
  resetCardImageCacheForTest,
} from "./cardImageLoader";
import { resolveDefaultCardImage, resolveSkinImage } from "./cardSkinResolver";

type PendingImage = {
  src: string;
  onload: (() => void) | null;
  onerror: (() => void) | null;
  complete: boolean;
  decode: () => Promise<void>;
  resolveDecode: () => void;
};

const images: PendingImage[] = [];
const flushImageQueue = () => new Promise((resolve) => setTimeout(resolve, 0));

const installImageMock = () => {
  vi.stubGlobal(
    "Image",
    class {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      complete = false;
      private decodePromise: Promise<void>;
      resolveDecode: () => void = () => undefined;
      private srcValue = "";

      constructor() {
        this.decodePromise = new Promise((resolve) => {
          this.resolveDecode = resolve;
        });
        images.push(this as unknown as PendingImage);
      }

      get src() {
        return this.srcValue;
      }

      set src(value: string) {
        this.srcValue = value;
      }

      decode = () => this.decodePromise;
    },
  );
};

describe("cardImageLoader", () => {
  beforeEach(() => {
    images.length = 0;
    resetCardImageCacheForTest();
    installImageMock();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("marks a source ready only after load and decode complete", async () => {
    const source = resolveDefaultCardImage("1e") as string;
    const preload = preloadCardImageSources([source]);

    expect(images).toHaveLength(1);
    images[0].complete = true;
    images[0].onload?.();
    await Promise.resolve();

    expect(isCardImageSourceReady(source)).toBe(false);

    images[0].resolveDecode();
    await preload;

    expect(isCardImageSourceReady(source)).toBe(true);
    expect(isCardImageSourceComplete(source)).toBe(true);
  });

  it("dedupes inflight source preloads", async () => {
    const source = resolveDefaultCardImage("rb") as string;
    const first = preloadCardImageSources([source]);
    const second = preloadCardImageSources([source]);

    expect(images).toHaveLength(1);

    images[0].complete = true;
    images[0].onload?.();
    images[0].resolveDecode();

    await Promise.all([first, second]);

    expect(isCardImageSourceReady(source)).toBe(true);
  });

  it("limits concurrent image preloads", async () => {
    const sources = [
      "1e",
      "1c",
      "1b",
      "1o",
      "2e",
      "2c",
      "2b",
      "2o",
    ].map(
      (card) =>
        resolveDefaultCardImage(card as Parameters<typeof resolveDefaultCardImage>[0]) as string,
    );

    const preload = preloadCardImageSources(sources);

    expect(images).toHaveLength(6);

    images[0].complete = true;
    images[0].onload?.();
    images[0].resolveDecode();
    await flushImageQueue();

    expect(images).toHaveLength(7);

    for (const image of images) {
      image.complete = true;
      image.onload?.();
      image.resolveDecode();
    }

    await flushImageQueue();

    expect(images).toHaveLength(8);

    for (const image of images) {
      image.complete = true;
      image.onload?.();
      image.resolveDecode();
    }

    await preload;
  });

  it("falls back to decoded default when a skin source fails", async () => {
    const skinSource = resolveSkinImage("argentino/1e_argentino_001") as string;
    const defaultSource = resolveDefaultCardImage("1e") as string;

    const preload = preloadCardImageSources([skinSource, defaultSource]);

    expect(images).toHaveLength(2);
    images.find((image) => image.src === skinSource)?.onerror?.();

    const defaultImage = images.find((image) => image.src === defaultSource);
    defaultImage!.complete = true;
    defaultImage!.onload?.();
    defaultImage!.resolveDecode();

    await preload;

    expect(isCardImageSourceComplete(skinSource)).toBe(true);
    expect(isCardImageSourceReady(skinSource)).toBe(false);
    expect(
      getReadyCardImageSource({
        card: "1e",
        cardSkinId: "argentino/1e_argentino_001",
        displayMode: "skins",
      }),
    ).toBe(defaultSource);
  });
});
