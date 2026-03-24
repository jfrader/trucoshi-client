import { useEffect, useMemo, useState } from "react";

export type BoardSurface = "match" | "lobby";

export type BoardViewportProfile =
  | "phoneTall"
  | "phoneWide"
  | "tablet"
  | "tabletWide"
  | "desktop";

export type BoardPlayerCount = 2 | 4 | 6;

export type BoardViewport = {
  width: number;
  height: number;
  aspectRatio: number;
};

export type BoardSeatGeometryConfig = {
  radiusXMultiplier: number;
  radiusYMultiplier: number;
  sideWeightedYMultiplier: boolean;
  outwardOffsetX: number;
  outwardOffsetY: number;
  sideInset: number;
  sideVerticalOffset: number;
  angleOffsetDeg: number;
  sideAngleOffsetDeg: number;
  topGroupShiftYPx: number;
  bottomGroupShiftYPx: number;
};

export type BoardSeatGeometry = {
  index: number;
  totalSeats: number;
  angleDeg: number;
  angleRad: number;
  cos: number;
  sin: number;
  sideStrength: number;
  leftPercent: number;
  topPercent: number;
  groupShiftY: number;
  seatShiftX: number;
  seatShiftY: number;
};

export type SeatHandTransform = {
  x: number;
  y: number;
  rotate: number;
  origin: string;
};

export type BoardSurfaceFrameConfig = {
  rootPadding: string;
  shellMaxWidth: string;
  topStripGap: string;
  topStripMarginBottom: string;
  bottomStripMarginTop: string;
  boardWidth: string;
  boardMaxWidth: string;
  boardHeight: string;
  boardMaxHeight: string;
  boardAspectRatio: string;
  boardBorderRadius: string;
  boardInnerBorderRadius: string;
  boardBorderWidth: string;
  boardOutlineWidth: string;
  centerSize: string;
  seatWidth: string;
  seatMaxWidth: string;
};

export type BoardCenterStackConfig = {
  centerShiftXPercent: number;
  centerShiftYPercent: number;
  playerSpreadXPercent: number;
  playerSpreadYPercent: number;
  spreadBoost: number;
  maxJitterPx: number;
  maxRotationOffsetDeg: number;
  facePlayerRotation: boolean;
};

export type MatchDockSizingConfig = {
  handCardWidth: string;
  playedCardWidth: string;
  announcementBlockHeight: string;
  handBlockHeight: string;
  commandBlockHeight: string;
  dockGap: string;
  dockBottomOffset: string;
  bottomDockReserveHeight: string;
  handRowMinHeight: string;
  handRowTranslateY: string;
  commandCompact: boolean;
};

export type MatchSeatPresentationRules = {
  meTranslateY: number;
  lowerSideTranslateY: number;
  topSeatAvatarNudgeY: number;
  hideTopSeatAvatarNudgeOnProfiles: BoardViewportProfile[];
  hiddenHandCardWidth: string;
  hiddenHandScale: number;
};

export type MatchLayoutConfig = {
  dock: MatchDockSizingConfig;
  seatPresentation: MatchSeatPresentationRules;
};

export type LobbySeatCardConfig = {
  minWidth: string;
  padding: string;
  borderRadius: string;
  headerHeight: string;
  cardsHeight: string;
  actionsHeight: string;
  hiddenCardWidth: string;
  hiddenCardOverlap: number;
};

export type LobbyLayoutConfig = {
  seatCard: LobbySeatCardConfig;
};

export type BoardLayoutModel = {
  surface: BoardSurface;
  profile: BoardViewportProfile;
  playerCount: BoardPlayerCount;
  viewport: BoardViewport;
  frame: BoardSurfaceFrameConfig;
  seatConfig: BoardSeatGeometryConfig;
  seatGeometries: BoardSeatGeometry[];
  centerStack: BoardCenterStackConfig;
  match: MatchLayoutConfig | null;
  lobby: LobbyLayoutConfig | null;
};

export type MatchSeatPresentation = {
  translateY: number;
  avatarNudgeY: number;
  hiddenHandCardWidth: string;
  hiddenHandScale: number;
};

const VIEWPORT_FALLBACK = {
  width: 390,
  height: 844,
};

const DEFAULT_SEAT_CONFIG: BoardSeatGeometryConfig = {
  radiusXMultiplier: 1,
  radiusYMultiplier: 1,
  sideWeightedYMultiplier: false,
  outwardOffsetX: 0,
  outwardOffsetY: 0,
  sideInset: 0,
  sideVerticalOffset: 0,
  angleOffsetDeg: 0,
  sideAngleOffsetDeg: 0,
  topGroupShiftYPx: 0,
  bottomGroupShiftYPx: 0,
};

const FRAME_BY_PROFILE: Record<BoardViewportProfile, BoardSurfaceFrameConfig> = {
  phoneTall: {
    rootPadding: "0.5rem 0.05rem 0.75rem",
    shellMaxWidth: "56rem",
    topStripGap: "0.7rem",
    topStripMarginBottom: "0.36rem",
    bottomStripMarginTop: "0.34rem",
    boardWidth: "120%",
    boardMaxWidth: "46rem",
    boardHeight: "auto",
    boardMaxHeight: "46.5rem",
    boardAspectRatio: "1 / 1",
    boardBorderRadius: "50%",
    boardInnerBorderRadius: "50%",
    boardBorderWidth: "0.68rem",
    boardOutlineWidth: "0.22rem",
    centerSize: "57%",
    seatWidth: "35%",
    seatMaxWidth: "11.8rem",
  },
  phoneWide: {
    rootPadding: "0.55rem 0.25rem 0.95rem",
    shellMaxWidth: "56rem",
    topStripGap: "0.82rem",
    topStripMarginBottom: "0.52rem",
    bottomStripMarginTop: "0.5rem",
    boardWidth: "min(calc(100% - 1.5rem), 56rem)",
    boardMaxWidth: "calc(100% - 1.5rem)",
    boardHeight: "min(88%, 40rem)",
    boardMaxHeight: "40rem",
    boardAspectRatio: "auto",
    boardBorderRadius: "50% / 48%",
    boardInnerBorderRadius: "50% / 48%",
    boardBorderWidth: "0.72rem",
    boardOutlineWidth: "0.22rem",
    centerSize: "52%",
    seatWidth: "33%",
    seatMaxWidth: "11.2rem",
  },
  tablet: {
    rootPadding: "0.86rem 0.35rem 1.12rem",
    shellMaxWidth: "56rem",
    topStripGap: "0.92rem",
    topStripMarginBottom: "0.7rem",
    bottomStripMarginTop: "0.82rem",
    boardWidth: "108%",
    boardMaxWidth: "46rem",
    boardHeight: "auto",
    boardMaxHeight: "34rem",
    boardAspectRatio: "1 / 1",
    boardBorderRadius: "50%",
    boardInnerBorderRadius: "50%",
    boardBorderWidth: "0.9rem",
    boardOutlineWidth: "0.24rem",
    centerSize: "55%",
    seatWidth: "35%",
    seatMaxWidth: "11.8rem",
  },
  tabletWide: {
    rootPadding: "1rem 0.45rem 1.2rem",
    shellMaxWidth: "56rem",
    topStripGap: "0.94rem",
    topStripMarginBottom: "0.72rem",
    bottomStripMarginTop: "0.9rem",
    boardWidth: "min(calc(100% - 1.8rem), 54rem)",
    boardMaxWidth: "calc(100% - 1.8rem)",
    boardHeight: "min(88%, 41rem)",
    boardMaxHeight: "41rem",
    boardAspectRatio: "auto",
    boardBorderRadius: "50% / 48%",
    boardInnerBorderRadius: "50% / 48%",
    boardBorderWidth: "0.86rem",
    boardOutlineWidth: "0.23rem",
    centerSize: "53%",
    seatWidth: "34%",
    seatMaxWidth: "11.5rem",
  },
  desktop: {
    rootPadding: "1.1rem 0.6rem 1.35rem",
    shellMaxWidth: "56rem",
    topStripGap: "1rem",
    topStripMarginBottom: "0.72rem",
    bottomStripMarginTop: "0.92rem",
    boardWidth: "min(calc(100% - 2.6rem), 50rem)",
    boardMaxWidth: "calc(100% - 2.6rem)",
    boardHeight: "min(88%, 42rem)",
    boardMaxHeight: "42rem",
    boardAspectRatio: "auto",
    boardBorderRadius: "50% / 48%",
    boardInnerBorderRadius: "50% / 48%",
    boardBorderWidth: "0.9rem",
    boardOutlineWidth: "0.24rem",
    centerSize: "50%",
    seatWidth: "33%",
    seatMaxWidth: "11.8rem",
  },
};

const MATCH_SEAT_BASE_BY_PROFILE: Record<BoardViewportProfile, BoardSeatGeometryConfig> = {
  desktop: {
    radiusXMultiplier: 1.1,
    radiusYMultiplier: 1.12,
    sideWeightedYMultiplier: false,
    outwardOffsetX: 4,
    outwardOffsetY: 10,
    sideInset: 4.5,
    sideVerticalOffset: 2.8,
    angleOffsetDeg: 0,
    sideAngleOffsetDeg: 0,
    topGroupShiftYPx: 0,
    bottomGroupShiftYPx: 0,
  },
  tabletWide: {
    radiusXMultiplier: 1.09,
    radiusYMultiplier: 1.08,
    sideWeightedYMultiplier: false,
    outwardOffsetX: 5,
    outwardOffsetY: 11,
    sideInset: 4.9,
    sideVerticalOffset: 3,
    angleOffsetDeg: 0,
    sideAngleOffsetDeg: 0,
    topGroupShiftYPx: 0,
    bottomGroupShiftYPx: 0,
  },
  tablet: {
    radiusXMultiplier: 1.07,
    radiusYMultiplier: 1.08,
    sideWeightedYMultiplier: false,
    outwardOffsetX: 6,
    outwardOffsetY: 12,
    sideInset: 5.1,
    sideVerticalOffset: 3.2,
    angleOffsetDeg: 0,
    sideAngleOffsetDeg: 0,
    topGroupShiftYPx: 0,
    bottomGroupShiftYPx: 0,
  },
  phoneWide: {
    radiusXMultiplier: 1.07,
    radiusYMultiplier: 1.01,
    sideWeightedYMultiplier: false,
    outwardOffsetX: 5,
    outwardOffsetY: 9,
    sideInset: 4.2,
    sideVerticalOffset: 2.1,
    angleOffsetDeg: 0,
    sideAngleOffsetDeg: 0,
    topGroupShiftYPx: 0,
    bottomGroupShiftYPx: 0,
  },
  phoneTall: {
    radiusXMultiplier: 1.04,
    radiusYMultiplier: 1.1,
    sideWeightedYMultiplier: false,
    outwardOffsetX: 7,
    outwardOffsetY: 14,
    sideInset: 5.7,
    sideVerticalOffset: 3.6,
    angleOffsetDeg: 0,
    sideAngleOffsetDeg: 0,
    topGroupShiftYPx: 0,
    bottomGroupShiftYPx: 0,
  },
};

const MATCH_FOUR_PLAYER_SEAT_OVERRIDES: Partial<BoardSeatGeometryConfig> = {
  angleOffsetDeg: -14,
  sideAngleOffsetDeg: -20,
};

const MATCH_CENTER_BASE: Omit<BoardCenterStackConfig, "spreadBoost"> = {
  centerShiftXPercent: -1.2,
  centerShiftYPercent: 3.6,
  playerSpreadXPercent: 42,
  playerSpreadYPercent: 39,
  maxJitterPx: 4,
  maxRotationOffsetDeg: 6,
  facePlayerRotation: false,
};

const MATCH_CENTER_SPREAD_BOOST_BY_PROFILE: Record<BoardViewportProfile, number> = {
  desktop: 1,
  tabletWide: 1,
  tablet: 0,
  phoneWide: 0,
  phoneTall: 0,
};

const MATCH_DOCK_BY_PROFILE: Record<BoardViewportProfile, MatchDockSizingConfig> = {
  desktop: {
    handCardWidth: "clamp(3.05rem, 3.2vw, 3.7rem)",
    playedCardWidth: "clamp(2.85rem, 2.4vw, 3.2rem)",
    announcementBlockHeight: "4.75rem",
    handBlockHeight: "5.2rem",
    commandBlockHeight: "3.5rem",
    dockGap: "0.58rem",
    dockBottomOffset: "calc(env(safe-area-inset-bottom) + 3.2rem)",
    bottomDockReserveHeight: "14.8rem",
    handRowMinHeight: "4.1rem",
    handRowTranslateY: "0.08rem",
    commandCompact: true,
  },
  tabletWide: {
    handCardWidth: "clamp(3.05rem, 3.2vw, 3.7rem)",
    playedCardWidth: "clamp(2.85rem, 2.4vw, 3.2rem)",
    announcementBlockHeight: "4.75rem",
    handBlockHeight: "5.2rem",
    commandBlockHeight: "3.5rem",
    dockGap: "0.58rem",
    dockBottomOffset: "calc(env(safe-area-inset-bottom) + 3.2rem)",
    bottomDockReserveHeight: "14.8rem",
    handRowMinHeight: "4.1rem",
    handRowTranslateY: "0.08rem",
    commandCompact: true,
  },
  tablet: {
    handCardWidth: "clamp(4.9rem, 14.8dvh, 6.95rem)",
    playedCardWidth: "clamp(3.05rem, 5vw, 3.6rem)",
    announcementBlockHeight: "4.75rem",
    handBlockHeight: "6.95rem",
    commandBlockHeight: "3.95rem",
    dockGap: "0.58rem",
    dockBottomOffset: "calc(env(safe-area-inset-bottom) + 3.2rem)",
    bottomDockReserveHeight: "16.9rem",
    handRowMinHeight: "5.8rem",
    handRowTranslateY: "0rem",
    commandCompact: true,
  },
  phoneWide: {
    handCardWidth: "clamp(3.3rem, 9.2dvh, 4.5rem)",
    playedCardWidth: "clamp(3.05rem, 5vw, 3.6rem)",
    announcementBlockHeight: "4rem",
    handBlockHeight: "4.45rem",
    commandBlockHeight: "3.3rem",
    dockGap: "0.38rem",
    dockBottomOffset: "calc(env(safe-area-inset-bottom) + 3.2rem)",
    bottomDockReserveHeight: "12.7rem",
    handRowMinHeight: "3.45rem",
    handRowTranslateY: "-0.12rem",
    commandCompact: true,
  },
  phoneTall: {
    handCardWidth: "clamp(4.9rem, 14.8dvh, 6.95rem)",
    playedCardWidth: "clamp(4.0rem, 12vw, 4.6rem)",
    announcementBlockHeight: "4.75rem",
    handBlockHeight: "6.95rem",
    commandBlockHeight: "3.95rem",
    dockGap: "0.58rem",
    dockBottomOffset: "calc(env(safe-area-inset-bottom) + 3.2rem)",
    bottomDockReserveHeight: "16.9rem",
    handRowMinHeight: "5.8rem",
    handRowTranslateY: "0rem",
    commandCompact: false,
  },
};

const MATCH_SEAT_PRESENTATION_BY_PROFILE: Record<BoardViewportProfile, MatchSeatPresentationRules> = {
  desktop: {
    meTranslateY: 18,
    lowerSideTranslateY: 24,
    topSeatAvatarNudgeY: 15,
    hideTopSeatAvatarNudgeOnProfiles: [],
    hiddenHandCardWidth: "clamp(1.82rem, 5.1vw, 2.02rem)",
    hiddenHandScale: 1,
  },
  tabletWide: {
    meTranslateY: 18,
    lowerSideTranslateY: 24,
    topSeatAvatarNudgeY: 15,
    hideTopSeatAvatarNudgeOnProfiles: [],
    hiddenHandCardWidth: "clamp(1.82rem, 5.1vw, 2.02rem)",
    hiddenHandScale: 1,
  },
  tablet: {
    meTranslateY: 18,
    lowerSideTranslateY: 24,
    topSeatAvatarNudgeY: 15,
    hideTopSeatAvatarNudgeOnProfiles: [],
    hiddenHandCardWidth: "clamp(1.82rem, 5.1vw, 2.02rem)",
    hiddenHandScale: 1,
  },
  phoneWide: {
    meTranslateY: 14,
    lowerSideTranslateY: 18,
    topSeatAvatarNudgeY: 15,
    hideTopSeatAvatarNudgeOnProfiles: [],
    hiddenHandCardWidth: "clamp(1.65rem, 4.6vw, 1.88rem)",
    hiddenHandScale: 0.92,
  },
  phoneTall: {
    meTranslateY: 18,
    lowerSideTranslateY: 24,
    topSeatAvatarNudgeY: 15,
    hideTopSeatAvatarNudgeOnProfiles: ["phoneTall"],
    hiddenHandCardWidth: "clamp(1.82rem, 5.1vw, 2.02rem)",
    hiddenHandScale: 1,
  },
};

const SIX_PLAYER_LOBBY_SEAT_BY_PROFILE: Record<BoardViewportProfile, BoardSeatGeometryConfig> = {
  desktop: {
    radiusXMultiplier: 1,
    radiusYMultiplier: 1.02,
    sideWeightedYMultiplier: true,
    outwardOffsetX: 0,
    outwardOffsetY: 0,
    sideInset: 2.6,
    sideVerticalOffset: 1.8,
    angleOffsetDeg: 0,
    sideAngleOffsetDeg: 0,
    topGroupShiftYPx: -22,
    bottomGroupShiftYPx: -22,
  },
  tabletWide: {
    radiusXMultiplier: 0.98,
    radiusYMultiplier: 1.03,
    sideWeightedYMultiplier: true,
    outwardOffsetX: 0,
    outwardOffsetY: 0,
    sideInset: 2.8,
    sideVerticalOffset: 2,
    angleOffsetDeg: 0,
    sideAngleOffsetDeg: 0,
    topGroupShiftYPx: -12,
    bottomGroupShiftYPx: -12,
  },
  tablet: {
    radiusXMultiplier: 0.96,
    radiusYMultiplier: 1.05,
    sideWeightedYMultiplier: true,
    outwardOffsetX: 0,
    outwardOffsetY: 0,
    sideInset: 3.3,
    sideVerticalOffset: 2.4,
    angleOffsetDeg: 0,
    sideAngleOffsetDeg: 0,
    topGroupShiftYPx: 0,
    bottomGroupShiftYPx: 0,
  },
  phoneWide: {
    radiusXMultiplier: 0.94,
    radiusYMultiplier: 1.1,
    sideWeightedYMultiplier: true,
    outwardOffsetX: 0,
    outwardOffsetY: 0,
    sideInset: 3.8,
    sideVerticalOffset: 2.8,
    angleOffsetDeg: 0,
    sideAngleOffsetDeg: 0,
    topGroupShiftYPx: 4,
    bottomGroupShiftYPx: 4,
  },
  phoneTall: {
    radiusXMultiplier: 0.87,
    radiusYMultiplier: 1.6,
    sideWeightedYMultiplier: true,
    outwardOffsetX: 0,
    outwardOffsetY: 0,
    sideInset: 4.4,
    sideVerticalOffset: 3.1,
    angleOffsetDeg: 0,
    sideAngleOffsetDeg: 0,
    topGroupShiftYPx: 20,
    bottomGroupShiftYPx: 20,
  },
};

const LOBBY_SEAT_CARD_BY_PROFILE: Record<BoardViewportProfile, LobbySeatCardConfig> = {
  desktop: {
    minWidth: "9.8rem",
    padding: "0.8rem",
    borderRadius: "0.95rem",
    headerHeight: "2.35rem",
    cardsHeight: "3.1rem",
    actionsHeight: "4.75rem",
    hiddenCardWidth: "clamp(2.15rem, 7vw, 2.35rem)",
    hiddenCardOverlap: -1.2,
  },
  tabletWide: {
    minWidth: "9.8rem",
    padding: "0.8rem",
    borderRadius: "0.95rem",
    headerHeight: "2.3rem",
    cardsHeight: "3rem",
    actionsHeight: "4.6rem",
    hiddenCardWidth: "clamp(2.08rem, 6.5vw, 2.3rem)",
    hiddenCardOverlap: -1.16,
  },
  tablet: {
    minWidth: "9.65rem",
    padding: "0.78rem",
    borderRadius: "0.92rem",
    headerHeight: "2.3rem",
    cardsHeight: "3rem",
    actionsHeight: "4.6rem",
    hiddenCardWidth: "clamp(2.08rem, 6.5vw, 2.3rem)",
    hiddenCardOverlap: -1.16,
  },
  phoneWide: {
    minWidth: "8.7rem",
    padding: "0.68rem",
    borderRadius: "0.86rem",
    headerHeight: "2rem",
    cardsHeight: "2.55rem",
    actionsHeight: "4.15rem",
    hiddenCardWidth: "clamp(1.85rem, 5.5vw, 2.05rem)",
    hiddenCardOverlap: -1,
  },
  phoneTall: {
    minWidth: "9.3rem",
    padding: "0.8rem",
    borderRadius: "0.95rem",
    headerHeight: "2.35rem",
    cardsHeight: "3.1rem",
    actionsHeight: "4.75rem",
    hiddenCardWidth: "clamp(2.15rem, 7vw, 2.35rem)",
    hiddenCardOverlap: -1.2,
  },
};

const EMPTY_CENTER_STACK: BoardCenterStackConfig = {
  centerShiftXPercent: 0,
  centerShiftYPercent: 0,
  playerSpreadXPercent: 0,
  playerSpreadYPercent: 0,
  spreadBoost: 0,
  maxJitterPx: 0,
  maxRotationOffsetDeg: 0,
  facePlayerRotation: false,
};

const SIX_PLAYER_HAND_OVERRIDES: Partial<Record<number, (base: SeatHandTransform) => SeatHandTransform>> = {
  1: () => ({
    x: 85,
    y: -20,
    rotate: 20,
    origin: "50% -40px",
  }),
  2: (base) => ({
    ...base,
    y: base.y - 8,
  }),
  4: (base) => ({
    ...base,
    y: base.y - 8,
  }),
  5: () => ({
    x: -85,
    y: -20,
    rotate: -20,
    origin: "50% -40px",
  }),
};

const FOUR_PLAYER_HAND_OVERRIDES: Partial<Record<number, (base: SeatHandTransform) => SeatHandTransform>> = {
  1: (base) => ({
    ...base,
    x: base.x - 8,
    y: -96,
  }),
  3: (base) => ({
    ...base,
    y: 18,
  }),
};

const mergeSeatConfig = (
  base: BoardSeatGeometryConfig,
  overrides?: Partial<BoardSeatGeometryConfig>
): BoardSeatGeometryConfig => ({
  ...base,
  ...(overrides || {}),
});

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

  if (shortHeight || aspectRatio >= 1.3) {
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

export const buildSeatGeometry = ({
  index,
  totalSeats,
  config,
}: {
  index: number;
  totalSeats: number;
  config: BoardSeatGeometryConfig;
}): BoardSeatGeometry => {
  const safeSeatCount = Math.max(totalSeats, 2);
  const baseAngleDeg = 90 + config.angleOffsetDeg + (index * 360) / safeSeatCount;
  const baseAngle = (baseAngleDeg * Math.PI) / 180;
  const sideOffsetDeg = config.sideAngleOffsetDeg * Math.abs(Math.cos(baseAngle));
  const angleDeg = baseAngleDeg + sideOffsetDeg;
  const angleRad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);
  const sideStrength = Math.abs(cos);
  const effectiveYMultiplier = config.sideWeightedYMultiplier
    ? 1 + (config.radiusYMultiplier - 1) * sideStrength
    : config.radiusYMultiplier;

  const radiusX = 50 * config.radiusXMultiplier;
  const radiusY = 40 * effectiveYMultiplier;

  const leftBase = 50 + cos * radiusX;
  const topBase = 50 + sin * radiusY;

  const leftPercent = leftBase - cos * sideStrength * config.sideInset;
  const topPercent = topBase + Math.sign(sin || 1) * sideStrength * config.sideVerticalOffset;

  return {
    index,
    totalSeats: safeSeatCount,
    angleDeg,
    angleRad,
    cos,
    sin,
    sideStrength,
    leftPercent,
    topPercent,
    groupShiftY:
      sin < 0
        ? -config.topGroupShiftYPx
        : sin > 0
        ? config.bottomGroupShiftYPx
        : 0,
    seatShiftX: cos * config.outwardOffsetX,
    seatShiftY: sin * config.outwardOffsetY,
  };
};

export const buildSeatGeometries = ({
  totalSeats,
  config,
}: {
  totalSeats: number;
  config: BoardSeatGeometryConfig;
}): BoardSeatGeometry[] => {
  const safeSeatCount = Math.max(totalSeats, 2);
  return Array.from({ length: safeSeatCount }, (_, index) =>
    buildSeatGeometry({
      index,
      totalSeats: safeSeatCount,
      config,
    })
  );
};

const getSixSeatHiddenHandBaseTransform = ({
  geometry,
}: {
  geometry: BoardSeatGeometry;
}): SeatHandTransform => {
  const inwardDistance = 24 + geometry.sideStrength * 10;
  const arcShift = geometry.sideStrength > 0.2 ? 16 + geometry.sideStrength * 8 : 0;
  const arcDirection = geometry.sideStrength > 0.2 ? Math.sign(geometry.cos) : 0;

  return {
    x: -geometry.cos * inwardDistance + arcDirection * arcShift,
    y: -geometry.sin * inwardDistance - geometry.sideStrength * 16,
    rotate: geometry.cos * 44,
    origin: "50% -80px",
  };
};

const getGenericHiddenHandBaseTransform = ({
  geometry,
}: {
  geometry: BoardSeatGeometry;
}): SeatHandTransform => ({
  x: -geometry.cos * 18,
  y: -geometry.sin * 16,
  rotate: 0,
  origin: "50% -36px",
});

const scaleSeatHandTransform = (
  transform: SeatHandTransform,
  scale: number
): SeatHandTransform => ({
  ...transform,
  x: transform.x * scale,
  y: transform.y * scale,
});

export const getOpponentSeatHandTransform = ({
  seatIndex,
  totalSeats,
  geometry,
  hiddenHandScale = 1,
}: {
  seatIndex: number;
  totalSeats: number;
  geometry: BoardSeatGeometry;
  hiddenHandScale?: number;
}): SeatHandTransform => {
  const safeTotalSeats = Math.max(totalSeats, 2);

  const base =
    safeTotalSeats === 6
      ? getSixSeatHiddenHandBaseTransform({ geometry })
      : getGenericHiddenHandBaseTransform({ geometry });

  let transformed = base;

  if (safeTotalSeats === 6) {
    const override = SIX_PLAYER_HAND_OVERRIDES[seatIndex];
    transformed = override ? override(base) : base;
  } else if (safeTotalSeats === 4) {
    const override = FOUR_PLAYER_HAND_OVERRIDES[seatIndex];
    transformed = override ? override(base) : base;
  }

  return hiddenHandScale !== 1 ? scaleSeatHandTransform(transformed, hiddenHandScale) : transformed;
};

export const getMatchSeatPresentationForIndex = ({
  layout,
  seatIndex,
  isMe,
}: {
  layout: BoardLayoutModel;
  seatIndex: number;
  isMe: boolean;
}): MatchSeatPresentation => {
  if (!layout.match) {
    return {
      translateY: 0,
      avatarNudgeY: 0,
      hiddenHandCardWidth: "clamp(1.82rem, 5.1vw, 2.02rem)",
      hiddenHandScale: 1,
    };
  }

  const { seatPresentation } = layout.match;

  const isLowerSideSeat = layout.playerCount === 6 && (seatIndex === 1 || seatIndex === 5);
  const isTopSeat = layout.playerCount === 6 && seatIndex === 3;

  const translateY = isMe
    ? seatPresentation.meTranslateY
    : isLowerSideSeat
    ? seatPresentation.lowerSideTranslateY
    : 0;

  const avatarNudgeBlocked = seatPresentation.hideTopSeatAvatarNudgeOnProfiles.includes(layout.profile);
  const avatarNudgeY = isTopSeat && !avatarNudgeBlocked ? seatPresentation.topSeatAvatarNudgeY : 0;

  return {
    translateY,
    avatarNudgeY,
    hiddenHandCardWidth: seatPresentation.hiddenHandCardWidth,
    hiddenHandScale: seatPresentation.hiddenHandScale,
  };
};

export const buildBoardLayoutModel = ({
  surface,
  totalSeats,
  viewport,
}: {
  surface: BoardSurface;
  totalSeats: number;
  viewport: BoardViewport;
}): BoardLayoutModel => {
  const profile = resolveBoardViewportProfile(viewport);
  const frame = FRAME_BY_PROFILE[profile];
  const playerCount = normalizeBoardPlayerCount(totalSeats);
  const totalSeatCount = Math.max(totalSeats, 2);

  if (surface === "match") {
    const baseSeat = MATCH_SEAT_BASE_BY_PROFILE[profile];
    const seatConfig =
      playerCount === 4
        ? mergeSeatConfig(baseSeat, MATCH_FOUR_PLAYER_SEAT_OVERRIDES)
        : mergeSeatConfig(baseSeat);

    const seatGeometries = buildSeatGeometries({ totalSeats: totalSeatCount, config: seatConfig });

    return {
      surface,
      profile,
      playerCount,
      viewport,
      frame,
      seatConfig,
      seatGeometries,
      centerStack: {
        ...MATCH_CENTER_BASE,
        spreadBoost: MATCH_CENTER_SPREAD_BOOST_BY_PROFILE[profile],
      },
      match: {
        dock: MATCH_DOCK_BY_PROFILE[profile],
        seatPresentation: MATCH_SEAT_PRESENTATION_BY_PROFILE[profile],
      },
      lobby: null,
    };
  }

  const seatConfig =
    playerCount === 6 ? SIX_PLAYER_LOBBY_SEAT_BY_PROFILE[profile] : mergeSeatConfig(DEFAULT_SEAT_CONFIG);

  const seatGeometries = buildSeatGeometries({ totalSeats: totalSeatCount, config: seatConfig });

  return {
    surface,
    profile,
    playerCount,
    viewport,
    frame,
    seatConfig,
    seatGeometries,
    centerStack: EMPTY_CENTER_STACK,
    match: null,
    lobby: {
      seatCard: LOBBY_SEAT_CARD_BY_PROFILE[profile],
    },
  };
};

export const useBoardLayoutModel = ({
  surface,
  totalSeats,
}: {
  surface: BoardSurface;
  totalSeats: number;
}) => {
  const viewport = useBoardViewport();

  return useMemo(
    () =>
      buildBoardLayoutModel({
        surface,
        totalSeats,
        viewport,
      }),
    [surface, totalSeats, viewport]
  );
};
