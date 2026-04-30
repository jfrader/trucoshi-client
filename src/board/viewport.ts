import { useEffect, useMemo, useState } from "react";
import { BoardPlayerCount, BoardViewport, BoardViewportProfile } from "./types";

const VIEWPORT_FALLBACK = {
  width: 390,
  height: 844,
};

const getViewportSnapshot = () => {
  if (typeof window === "undefined") {
    return VIEWPORT_FALLBACK;
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
};

export const normalizeBoardPlayerCount = (totalSeats: number): BoardPlayerCount => {
  if (totalSeats >= 6) {
    return 6;
  }

  if (totalSeats >= 4) {
    return 4;
  }

  return 2;
};

export const resolveBoardViewportProfile = ({
  width,
  height,
}: {
  width: number;
  height: number;
}): BoardViewportProfile => {
  const aspectRatio = width / Math.max(height, 1);
  const shortHeight = height <= 520;
  const compactPhoneHeight = height <= 700 && width <= 430;

  if (width >= 1200) {
    return "desktop";
  }

  if (width >= 900) {
    return aspectRatio >= 1.25 ? "desktop" : "tabletWide";
  }

  if (width >= 600) {
    if (shortHeight && aspectRatio >= 1.45) {
      return "phoneWide";
    }

    return aspectRatio >= 1.25 ? "tabletWide" : "tablet";
  }

  if (shortHeight || compactPhoneHeight || aspectRatio >= 1.3) {
    return "phoneWide";
  }

  return "phoneTall";
};

export const useBoardViewport = () => {
  const [snapshot, setSnapshot] = useState(getViewportSnapshot);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let frame = 0;
    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setSnapshot(getViewportSnapshot());
      });
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

  return useMemo<BoardViewport>(() => {
    const height = Math.max(snapshot.height, 1);

    return {
      width: snapshot.width,
      height,
      aspectRatio: snapshot.width / height,
    };
  }, [snapshot.height, snapshot.width]);
};
