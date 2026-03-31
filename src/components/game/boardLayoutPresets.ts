import { useEffect, useMemo, useState } from "react";

export type BoardSurface = "match" | "lobby";

export type BoardViewportProfile = "phoneTall" | "phoneWide" | "tablet" | "tabletWide" | "desktop";

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

export type OpponentHiddenHandCardTransform = {
  x: number;
  y: number;
  rotateDeg: number;
  zIndex: number;
};

export type OpponentHiddenHandLayout = {
  anchor: {
    x: number;
    y: number;
    rotateDeg: number;
    origin: string;
  };
  cards: OpponentHiddenHandCardTransform[];
};

type SeatOffsetVector = {
  x: number;
  y: number;
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

export type HiddenHandRadialRules = {
  tableInsetPx: number;
  axialInsetReductionPx: number;
  distanceScale: number;
  verticalLiftPx: number;
  fanSpacingPx: number;
  fanArcDepthPx: number;
  fanSpreadDeg: number;
  minClearancePx: number;
  handOrigin: string;
};

export type MatchSeatPresentationRules = {
  meTranslateY: number;
  lowerSideTranslateY: number;
  topSeatAvatarNudgeY: number;
  hideTopSeatAvatarNudgeOnProfiles: BoardViewportProfile[];
  hiddenHandCardWidth: string;
  hiddenHandScale: number;
  hiddenHandRules: HiddenHandRadialRules;
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
  hiddenHandRules: HiddenHandRadialRules;
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

type BoardProfileLayoutTokens = {
  frame: BoardSurfaceFrameConfig;
  match: {
    seatBase: BoardSeatGeometryConfig;
    center: {
      overrides: Partial<Omit<BoardCenterStackConfig, "spreadBoost">>;
      spreadBoost: number;
    };
    dock: MatchDockSizingConfig;
    seatPresentation: MatchSeatPresentationRules;
  };
  lobby: {
    sixPlayerSeat: BoardSeatGeometryConfig;
    fourPlayerMobileSeat: BoardSeatGeometryConfig | null;
    seatCard: LobbySeatCardConfig;
  };
};

const PROFILE_LAYOUT_TOKENS: Record<BoardViewportProfile, BoardProfileLayoutTokens> = {
  phoneTall: {
    frame: {
      rootPadding: "0.5rem 0.22rem 0.78rem",
      shellMaxWidth: "56rem",
      topStripGap: "0.78rem",
      topStripMarginBottom: "0.42rem",
      bottomStripMarginTop: "0.42rem",
      boardWidth: "min(calc(100% - 1.35rem), 56rem)",
      boardMaxWidth: "calc(100% - 1.35rem)",
      boardHeight: "min(88%, 41rem)",
      boardMaxHeight: "52vh",
      boardAspectRatio: "auto",
      boardBorderRadius: "50% / 48%",
      boardInnerBorderRadius: "50% / 48%",
      boardBorderWidth: "0.72rem",
      boardOutlineWidth: "0.22rem",
      centerSize: "53%",
      seatWidth: "34%",
      seatMaxWidth: "11.5rem",
    },
    match: {
      seatBase: {
        radiusXMultiplier: 1,
        radiusYMultiplier: 1,
        sideWeightedYMultiplier: false,
        outwardOffsetX: 3,
        outwardOffsetY: 6,
        sideInset: 3.4,
        sideVerticalOffset: 1.8,
        angleOffsetDeg: 0,
        sideAngleOffsetDeg: 0,
        topGroupShiftYPx: 28,
        bottomGroupShiftYPx: 24,
      },
      center: {
        overrides: {
          centerShiftYPercent: 1.2,
          playerSpreadXPercent: 37,
          playerSpreadYPercent: 32,
          maxJitterPx: 2,
        },
        spreadBoost: 3.5,
      },
      dock: {
        handCardWidth: "clamp(4.7rem, 14.2dvh, 6.65rem)",
        playedCardWidth: "clamp(3.34rem, 9.8vw, 3.9rem)",
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
      seatPresentation: {
        meTranslateY: 20,
        lowerSideTranslateY: 24,
        topSeatAvatarNudgeY: 0,
        hideTopSeatAvatarNudgeOnProfiles: ["phoneTall"],
        hiddenHandCardWidth: "clamp(1.82rem, 5.1vw, 2.02rem)",
        hiddenHandScale: 1,
        hiddenHandRules: {
          tableInsetPx: 42,
          axialInsetReductionPx: 22,
          distanceScale: 0.7,
          verticalLiftPx: 1.5,
          fanSpacingPx: 11,
          fanArcDepthPx: 1.9,
          fanSpreadDeg: 6.3,
          minClearancePx: 9,
          handOrigin: "50% 114%",
        },
      },
    },
    lobby: {
      sixPlayerSeat: {
        radiusXMultiplier: 0.94,
        radiusYMultiplier: 1.1,
        sideWeightedYMultiplier: true,
        outwardOffsetX: 0,
        outwardOffsetY: 0,
        sideInset: 3.8,
        sideVerticalOffset: 14,
        angleOffsetDeg: 0,
        sideAngleOffsetDeg: 0,
        topGroupShiftYPx: 34,
        bottomGroupShiftYPx: 34,
      },
      fourPlayerMobileSeat: {
        radiusXMultiplier: 1.03,
        radiusYMultiplier: 1.08,
        sideWeightedYMultiplier: false,
        outwardOffsetX: 2,
        outwardOffsetY: 6.5,
        sideInset: 2.8,
        sideVerticalOffset: 0,
        angleOffsetDeg: -45,
        sideAngleOffsetDeg: 0,
        topGroupShiftYPx: 54,
        bottomGroupShiftYPx: 48,
      },
      seatCard: {
        minWidth: "10rem",
        padding: "0.8rem",
        borderRadius: "0.95rem",
        headerHeight: "2.35rem",
        cardsHeight: "2.5rem",
        actionsHeight: "4.75rem",
        hiddenCardWidth: "clamp(2.15rem, 7vw, 2.35rem)",
        hiddenCardOverlap: -1.2,
      },
    },
  },
  phoneWide: {
    frame: {
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
    match: {
      seatBase: {
        radiusXMultiplier: 1,
        radiusYMultiplier: 0.96,
        sideWeightedYMultiplier: false,
        outwardOffsetX: 2,
        outwardOffsetY: 4,
        sideInset: 2.8,
        sideVerticalOffset: 1.2,
        angleOffsetDeg: 0,
        sideAngleOffsetDeg: 0,
        topGroupShiftYPx: 20,
        bottomGroupShiftYPx: 18,
      },
      center: {
        overrides: {
          centerShiftYPercent: 1.4,
          playerSpreadXPercent: 36,
          playerSpreadYPercent: 32,
          maxJitterPx: 3.2,
        },
        spreadBoost: 1.2,
      },
      dock: {
        handCardWidth: "clamp(2.42rem, 6.3dvh, 3.14rem)",
        playedCardWidth: "clamp(3rem, 4.1vw, 3.1rem)",
        announcementBlockHeight: "4rem",
        handBlockHeight: "3.6rem",
        commandBlockHeight: "3.3rem",
        dockGap: "0.38rem",
        dockBottomOffset: "calc(env(safe-area-inset-bottom) + 3.2rem)",
        bottomDockReserveHeight: "11.35rem",
        handRowMinHeight: "2.6rem",
        handRowTranslateY: "-0.12rem",
        commandCompact: true,
      },
      seatPresentation: {
        meTranslateY: 16,
        lowerSideTranslateY: 18,
        topSeatAvatarNudgeY: 0,
        hideTopSeatAvatarNudgeOnProfiles: [],
        hiddenHandCardWidth: "clamp(1.65rem, 4.6vw, 1.88rem)",
        hiddenHandScale: 1,
        hiddenHandRules: {
          tableInsetPx: 32,
          axialInsetReductionPx: 20,
          distanceScale: 0.73,
          verticalLiftPx: 1.4,
          fanSpacingPx: 10.3,
          fanArcDepthPx: 1.8,
          fanSpreadDeg: 6,
          minClearancePx: 8.5,
          handOrigin: "50% 112%",
        },
      },
    },
    lobby: {
      sixPlayerSeat: {
        radiusXMultiplier: 0.94,
        radiusYMultiplier: 1.1,
        sideWeightedYMultiplier: true,
        outwardOffsetX: 0,
        outwardOffsetY: 0,
        sideInset: 3.8,
        sideVerticalOffset: 14,
        angleOffsetDeg: 0,
        sideAngleOffsetDeg: 0,
        topGroupShiftYPx: 34,
        bottomGroupShiftYPx: 34,
      },
      fourPlayerMobileSeat: {
        radiusXMultiplier: 1.02,
        radiusYMultiplier: 1.04,
        sideWeightedYMultiplier: false,
        outwardOffsetX: 1.5,
        outwardOffsetY: 4.5,
        sideInset: 2.4,
        sideVerticalOffset: 0,
        angleOffsetDeg: -45,
        sideAngleOffsetDeg: 0,
        topGroupShiftYPx: 44,
        bottomGroupShiftYPx: 40,
      },
      seatCard: {
        minWidth: "9.1rem",
        padding: "0.72rem",
        borderRadius: "0.86rem",
        headerHeight: "2rem",
        cardsHeight: "2.55rem",
        actionsHeight: "4.15rem",
        hiddenCardWidth: "clamp(1.85rem, 5.5vw, 2.05rem)",
        hiddenCardOverlap: -1,
      },
    },
  },
  tablet: {
    frame: {
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
    match: {
      seatBase: {
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
      center: {
        overrides: {
          playerSpreadXPercent: 40,
          playerSpreadYPercent: 37,
        },
        spreadBoost: 0,
      },
      dock: {
        handCardWidth: "clamp(5.05rem, 15.2dvh, 7.15rem)",
        playedCardWidth: "clamp(3.05rem, 5vw, 3.6rem)",
        announcementBlockHeight: "4.75rem",
        handBlockHeight: "7.15rem",
        commandBlockHeight: "3.95rem",
        dockGap: "0.58rem",
        dockBottomOffset: "calc(env(safe-area-inset-bottom) + 3.2rem)",
        bottomDockReserveHeight: "17.1rem",
        handRowMinHeight: "5.95rem",
        handRowTranslateY: "0rem",
        commandCompact: true,
      },
      seatPresentation: {
        meTranslateY: 20,
        lowerSideTranslateY: 24,
        topSeatAvatarNudgeY: 0,
        hideTopSeatAvatarNudgeOnProfiles: [],
        hiddenHandCardWidth: "clamp(1.82rem, 5.1vw, 2.02rem)",
        hiddenHandScale: 1,
        hiddenHandRules: {
          tableInsetPx: 64,
          axialInsetReductionPx: 23,
          distanceScale: 0.93,
          verticalLiftPx: 1.8,
          fanSpacingPx: 11.4,
          fanArcDepthPx: 2,
          fanSpreadDeg: 6.6,
          minClearancePx: 9.5,
          handOrigin: "50% 116%",
        },
      },
    },
    lobby: {
      sixPlayerSeat: {
        radiusXMultiplier: 0.96,
        radiusYMultiplier: 1.05,
        sideWeightedYMultiplier: true,
        outwardOffsetX: 0,
        outwardOffsetY: 0,
        sideInset: 3.3,
        sideVerticalOffset: 2.4,
        angleOffsetDeg: 0,
        sideAngleOffsetDeg: 0,
        topGroupShiftYPx: 34,
        bottomGroupShiftYPx: 34,
      },
      fourPlayerMobileSeat: {
        radiusXMultiplier: 1.03,
        radiusYMultiplier: 1.08,
        sideWeightedYMultiplier: false,
        outwardOffsetX: 2,
        outwardOffsetY: 6.5,
        sideInset: 2.8,
        sideVerticalOffset: 0,
        angleOffsetDeg: -45,
        sideAngleOffsetDeg: 0,
        topGroupShiftYPx: 54,
        bottomGroupShiftYPx: 48,
      },
      seatCard: {
        minWidth: "9.65rem",
        padding: "0.78rem",
        borderRadius: "0.92rem",
        headerHeight: "2.3rem",
        cardsHeight: "2.8rem",
        actionsHeight: "4.6rem",
        hiddenCardWidth: "clamp(2.08rem, 6.5vw, 2.3rem)",
        hiddenCardOverlap: -1.16,
      },
    },
  },
  tabletWide: {
    frame: {
      rootPadding: "1rem 0.45rem 1.2rem",
      shellMaxWidth: "56rem",
      topStripGap: "0.94rem",
      topStripMarginBottom: "0.72rem",
      bottomStripMarginTop: "0.9rem",
      boardWidth: "min(calc(100% - 2.2rem), 47rem)",
      boardMaxWidth: "calc(100% - 2.2rem)",
      boardHeight: "min(60vh, 39.5rem)",
      boardMaxHeight: "41rem",
      boardAspectRatio: "1.2 / 1",
      boardBorderRadius: "50% / 48.6%",
      boardInnerBorderRadius: "50% / 48.6%",
      boardBorderWidth: "0.86rem",
      boardOutlineWidth: "0.23rem",
      centerSize: "53%",
      seatWidth: "34%",
      seatMaxWidth: "11.5rem",
    },
    match: {
      seatBase: {
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
      center: {
        overrides: {},
        spreadBoost: 1,
      },
      dock: {
        handCardWidth: "clamp(4.08rem, 4.35vw, 5.15rem)",
        playedCardWidth: "clamp(3.15rem, 2.75vw, 3.55rem)",
        announcementBlockHeight: "4.75rem",
        handBlockHeight: "6.45rem",
        commandBlockHeight: "3.5rem",
        dockGap: "0.58rem",
        dockBottomOffset: "calc(env(safe-area-inset-bottom) + 3.2rem)",
        bottomDockReserveHeight: "16.15rem",
        handRowMinHeight: "5.35rem",
        handRowTranslateY: "0.08rem",
        commandCompact: true,
      },
      seatPresentation: {
        meTranslateY: 22,
        lowerSideTranslateY: 24,
        topSeatAvatarNudgeY: 0,
        hideTopSeatAvatarNudgeOnProfiles: [],
        hiddenHandCardWidth: "clamp(1.82rem, 5.1vw, 2.02rem)",
        hiddenHandScale: 1,
        hiddenHandRules: {
          tableInsetPx: 68,
          axialInsetReductionPx: 29,
          distanceScale: 0.96,
          verticalLiftPx: 0,
          fanSpacingPx: 12,
          fanArcDepthPx: 2.2,
          fanSpreadDeg: 7,
          minClearancePx: 10,
          handOrigin: "50% 117%",
        },
      },
    },
    lobby: {
      sixPlayerSeat: {
        radiusXMultiplier: 0.98,
        radiusYMultiplier: 1.03,
        sideWeightedYMultiplier: true,
        outwardOffsetX: 0,
        outwardOffsetY: 0,
        sideInset: 2.8,
        sideVerticalOffset: 2,
        angleOffsetDeg: 0,
        sideAngleOffsetDeg: 0,
        topGroupShiftYPx: 24,
        bottomGroupShiftYPx: 24,
      },
      fourPlayerMobileSeat: {
        radiusXMultiplier: 1.02,
        radiusYMultiplier: 1.04,
        sideWeightedYMultiplier: false,
        outwardOffsetX: 1.5,
        outwardOffsetY: 4.5,
        sideInset: 2.4,
        sideVerticalOffset: 0,
        angleOffsetDeg: -45,
        sideAngleOffsetDeg: 0,
        topGroupShiftYPx: 44,
        bottomGroupShiftYPx: 40,
      },
      seatCard: {
        minWidth: "9.8rem",
        padding: "0.8rem",
        borderRadius: "0.95rem",
        headerHeight: "2.3rem",
        cardsHeight: "2.8rem",
        actionsHeight: "4.6rem",
        hiddenCardWidth: "clamp(2.08rem, 6.5vw, 2.3rem)",
        hiddenCardOverlap: -1.16,
      },
    },
  },
  desktop: {
    frame: {
      rootPadding: "1rem 0.6rem 1.35rem",
      shellMaxWidth: "56rem",
      topStripGap: "1rem",
      topStripMarginBottom: "0.72rem",
      bottomStripMarginTop: "0.92rem",
      boardWidth: "min(calc(100% - 3rem), 48rem)",
      boardMaxWidth: "calc(100% - 3rem)",
      boardHeight: "min(60vh, 40.5rem)",
      boardMaxHeight: "60vh",
      boardAspectRatio: "1.2 / 1",
      boardBorderRadius: "50% / 48.6%",
      boardInnerBorderRadius: "50% / 48.6%",
      boardBorderWidth: "0.9rem",
      boardOutlineWidth: "0.24rem",
      centerSize: "50%",
      seatWidth: "33%",
      seatMaxWidth: "11.8rem",
    },
    match: {
      seatBase: {
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
      center: {
        overrides: {},
        spreadBoost: 1,
      },
      dock: {
        handCardWidth: "clamp(4.18rem, 4.35vw, 5.28rem)",
        playedCardWidth: "clamp(3.2rem, 2.8vw, 3.65rem)",
        announcementBlockHeight: "4.75rem",
        handBlockHeight: "6.6rem",
        commandBlockHeight: "3.5rem",
        dockGap: "0.58rem",
        dockBottomOffset: "calc(env(safe-area-inset-bottom) + 0.28rem)",
        bottomDockReserveHeight: "16.35rem",
        handRowMinHeight: "5.5rem",
        handRowTranslateY: "0.08rem",
        commandCompact: true,
      },
      seatPresentation: {
        meTranslateY: 22,
        lowerSideTranslateY: 24,
        topSeatAvatarNudgeY: 0,
        hideTopSeatAvatarNudgeOnProfiles: [],
        hiddenHandCardWidth: "clamp(1.82rem, 5.1vw, 2.02rem)",
        hiddenHandScale: 1,
        hiddenHandRules: {
          tableInsetPx: 72,
          axialInsetReductionPx: 36,
          distanceScale: 1,
          verticalLiftPx: 2.2,
          fanSpacingPx: 12.6,
          fanArcDepthPx: 2.3,
          fanSpreadDeg: 7.4,
          minClearancePx: 10.5,
          handOrigin: "50% 118%",
        },
      },
    },
    lobby: {
      sixPlayerSeat: {
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
      fourPlayerMobileSeat: null,
      seatCard: {
        minWidth: "9.8rem",
        padding: "0.8rem",
        borderRadius: "0.95rem",
        headerHeight: "2.35rem",
        cardsHeight: "2.8rem",
        actionsHeight: "4.75rem",
        hiddenCardWidth: "clamp(2.15rem, 7vw, 2.35rem)",
        hiddenCardOverlap: -1.2,
      },
    },
  },
};

const mapProfileTokens = <T>(selector: (config: BoardProfileLayoutTokens) => T) =>
  ({
    phoneTall: selector(PROFILE_LAYOUT_TOKENS.phoneTall),
    phoneWide: selector(PROFILE_LAYOUT_TOKENS.phoneWide),
    tablet: selector(PROFILE_LAYOUT_TOKENS.tablet),
    tabletWide: selector(PROFILE_LAYOUT_TOKENS.tabletWide),
    desktop: selector(PROFILE_LAYOUT_TOKENS.desktop),
  }) as Record<BoardViewportProfile, T>;

const FRAME_BY_PROFILE = mapProfileTokens((config) => config.frame);

const LOBBY_FRAME_OVERRIDES_BY_PROFILE: Partial<
  Record<BoardViewportProfile, Partial<BoardSurfaceFrameConfig>>
> = {
  phoneWide: {
    boardAspectRatio: "1 / 1",
    boardBorderRadius: "50%",
    boardInnerBorderRadius: "50%",
    boardHeight: "auto",
    seatWidth: "35%",
    seatMaxWidth: "11.7rem",
  },
};

const getFrameForSurface = (surface: BoardSurface, profile: BoardViewportProfile) => {
  if (surface !== "lobby") {
    return FRAME_BY_PROFILE[profile];
  }

  return {
    ...FRAME_BY_PROFILE[profile],
    ...(LOBBY_FRAME_OVERRIDES_BY_PROFILE[profile] || {}),
  };
};

const MATCH_SEAT_BASE_BY_PROFILE = mapProfileTokens((config) => config.match.seatBase);

const MATCH_TWO_PLAYER_SEAT_OVERRIDES: Partial<BoardSeatGeometryConfig> = {
  angleOffsetDeg: -14,
  sideAngleOffsetDeg: -14,
};

const MATCH_FOUR_PLAYER_SEAT_OVERRIDES: Partial<BoardSeatGeometryConfig> = {
  angleOffsetDeg: -16,
  sideAngleOffsetDeg: -22,
};

const MATCH_CENTER_BASE: Omit<BoardCenterStackConfig, "spreadBoost"> = {
  centerShiftXPercent: -1.2,
  centerShiftYPercent: 1.8,
  playerSpreadXPercent: 42,
  playerSpreadYPercent: 39,
  maxJitterPx: 4,
  maxRotationOffsetDeg: 6,
  facePlayerRotation: false,
};

const MATCH_CENTER_OVERRIDES_BY_PROFILE = mapProfileTokens(
  (config) => config.match.center.overrides,
);

const MATCH_CENTER_SPREAD_BOOST_BY_PROFILE = mapProfileTokens(
  (config) => config.match.center.spreadBoost,
);

const MATCH_DOCK_BY_PROFILE = mapProfileTokens((config) => config.match.dock);

const MATCH_SEAT_PRESENTATION_BY_PROFILE = mapProfileTokens(
  (config) => config.match.seatPresentation,
);

const SIX_PLAYER_LOBBY_SEAT_BY_PROFILE = mapProfileTokens((config) => config.lobby.sixPlayerSeat);

const FOUR_PLAYER_LOBBY_MOBILE_SEAT_BY_PROFILE: Record<
  Exclude<BoardViewportProfile, "desktop">,
  BoardSeatGeometryConfig
> = {
  phoneTall: PROFILE_LAYOUT_TOKENS.phoneTall.lobby.fourPlayerMobileSeat!,
  phoneWide: PROFILE_LAYOUT_TOKENS.phoneWide.lobby.fourPlayerMobileSeat!,
  tablet: PROFILE_LAYOUT_TOKENS.tablet.lobby.fourPlayerMobileSeat!,
  tabletWide: PROFILE_LAYOUT_TOKENS.tabletWide.lobby.fourPlayerMobileSeat!,
};

const LOBBY_SEAT_CARD_BY_PROFILE = mapProfileTokens((config) => config.lobby.seatCard);

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

const DEFAULT_HIDDEN_HAND_RADIAL_RULES: HiddenHandRadialRules = {
  tableInsetPx: 62,
  axialInsetReductionPx: 22,
  distanceScale: 0.82,
  verticalLiftPx: 1.5,
  fanSpacingPx: 11,
  fanArcDepthPx: 1.9,
  fanSpreadDeg: 6.3,
  minClearancePx: 9,
  handOrigin: "50% 114%",
};

const mergeSeatConfig = (
  base: BoardSeatGeometryConfig,
  overrides?: Partial<BoardSeatGeometryConfig>,
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
    groupShiftY: sin < 0 ? -config.topGroupShiftYPx : sin > 0 ? config.bottomGroupShiftYPx : 0,
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
    }),
  );
};

const getHiddenHandSlots = (hiddenCardCount: number): number[] => {
  if (hiddenCardCount <= 1) {
    return [0];
  }

  if (hiddenCardCount === 2) {
    return [-0.5, 0.5];
  }

  return [-1, 0, 1];
};

export const buildOpponentHiddenHandLayout = ({
  geometry,
  profileRules,
  hiddenCardCount,
  avatarSizePx,
  nameBlockPx,
  seatOffsetPx,
  scale = 1,
}: {
  geometry: BoardSeatGeometry;
  profileRules: HiddenHandRadialRules;
  hiddenCardCount: number;
  avatarSizePx: number;
  nameBlockPx: number;
  seatOffsetPx?: SeatOffsetVector;
  scale?: number;
}): OpponentHiddenHandLayout => {
  const safeHiddenCardCount = Math.max(0, Math.min(3, Math.floor(hiddenCardCount)));
  const OVAL_NORMAL_RADIUS_X = 50;
  const OVAL_NORMAL_RADIUS_Y = 40;
  const seatVector = {
    x: geometry.leftPercent - 50,
    y: geometry.topPercent - 50,
  };
  const hasSeatVector = Math.abs(seatVector.x) > 0.0001 || Math.abs(seatVector.y) > 0.0001;
  const fallbackInward = hasSeatVector
    ? {
        x: -(seatVector.x / (OVAL_NORMAL_RADIUS_X * OVAL_NORMAL_RADIUS_X)),
        y: -(seatVector.y / (OVAL_NORMAL_RADIUS_Y * OVAL_NORMAL_RADIUS_Y)),
      }
    : { x: -geometry.cos, y: -geometry.sin };
  const inwardMagnitude = Math.hypot(fallbackInward.x, fallbackInward.y) || 1;
  const inward = {
    x: fallbackInward.x / inwardMagnitude,
    y: fallbackInward.y / inwardMagnitude,
  };
  const baseFacingDeg = (Math.atan2(inward.y, inward.x) * 180) / Math.PI + 90;
  const anchorScale = scale * profileRules.distanceScale;
  const seatOffsetInwardProjectionPx = seatOffsetPx
    ? seatOffsetPx.x * inward.x + seatOffsetPx.y * inward.y
    : 0;
  const poleStrength = Math.pow(Math.abs(geometry.sin), 3);
  const axialReductionPx = poleStrength * profileRules.axialInsetReductionPx * anchorScale;
  const targetInsetPx = Math.max(0, profileRules.tableInsetPx * anchorScale - axialReductionPx);
  const radialDistance = Math.max(0, targetInsetPx - seatOffsetInwardProjectionPx);
  const minAvatarAndNameClearance =
    avatarSizePx * 0.5 + profileRules.minClearancePx * anchorScale + nameBlockPx * 0.32;
  const anchorDistance =
    Math.max(radialDistance, minAvatarAndNameClearance) + profileRules.verticalLiftPx * anchorScale;
  const anchor = {
    x: inward.x * anchorDistance,
    y: inward.y * anchorDistance,
    rotateDeg: baseFacingDeg,
    origin: profileRules.handOrigin,
  };

  const cards = safeHiddenCardCount
    ? getHiddenHandSlots(safeHiddenCardCount).map((slot, index) => ({
        x: slot * profileRules.fanSpacingPx * scale,
        y: -Math.abs(slot) * profileRules.fanArcDepthPx * scale,
        rotateDeg: slot * profileRules.fanSpreadDeg,
        zIndex: 100 - Math.round(Math.abs(slot) * 10) + (safeHiddenCardCount - index),
      }))
    : [];

  return {
    anchor,
    cards,
  };
};

export const getOpponentSeatHandTransform = ({
  seatIndex,
  totalSeats,
  geometry,
  hiddenHandScale = 1,
  hiddenHandRules,
}: {
  seatIndex: number;
  totalSeats: number;
  geometry: BoardSeatGeometry;
  hiddenHandScale?: number;
  hiddenHandRules?: HiddenHandRadialRules;
}): SeatHandTransform => {
  void seatIndex;
  void totalSeats;

  const layout = buildOpponentHiddenHandLayout({
    geometry,
    profileRules: hiddenHandRules || DEFAULT_HIDDEN_HAND_RADIAL_RULES,
    hiddenCardCount: 3,
    avatarSizePx: 56,
    nameBlockPx: 28,
    scale: hiddenHandScale,
  });

  return {
    x: layout.anchor.x,
    y: layout.anchor.y,
    rotate: layout.anchor.rotateDeg,
    origin: layout.anchor.origin,
  };
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
      hiddenHandRules: {
        ...DEFAULT_HIDDEN_HAND_RADIAL_RULES,
      },
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

  const avatarNudgeBlocked = seatPresentation.hideTopSeatAvatarNudgeOnProfiles.includes(
    layout.profile,
  );
  const avatarNudgeY = isTopSeat && !avatarNudgeBlocked ? seatPresentation.topSeatAvatarNudgeY : 0;

  return {
    translateY,
    avatarNudgeY,
    hiddenHandCardWidth: seatPresentation.hiddenHandCardWidth,
    hiddenHandScale: seatPresentation.hiddenHandScale,
    hiddenHandRules: seatPresentation.hiddenHandRules,
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
  const frame = getFrameForSurface(surface, profile);
  const playerCount = normalizeBoardPlayerCount(totalSeats);
  const totalSeatCount = Math.max(totalSeats, 2);

  if (surface === "match") {
    const baseSeat = MATCH_SEAT_BASE_BY_PROFILE[profile];
    const seatOverridesByPlayerCount: Partial<
      Record<BoardPlayerCount, Partial<BoardSeatGeometryConfig>>
    > = {
      2: MATCH_TWO_PLAYER_SEAT_OVERRIDES,
      4: MATCH_FOUR_PLAYER_SEAT_OVERRIDES,
    };

    const seatConfig = mergeSeatConfig(baseSeat, seatOverridesByPlayerCount[playerCount]);

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
        ...(MATCH_CENTER_OVERRIDES_BY_PROFILE[profile] || {}),
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
    playerCount === 6
      ? SIX_PLAYER_LOBBY_SEAT_BY_PROFILE[profile]
      : playerCount === 4
        ? profile !== "desktop"
          ? FOUR_PLAYER_LOBBY_MOBILE_SEAT_BY_PROFILE[profile]
          : mergeSeatConfig(DEFAULT_SEAT_CONFIG)
        : mergeSeatConfig(DEFAULT_SEAT_CONFIG);

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
    [surface, totalSeats, viewport],
  );
};
