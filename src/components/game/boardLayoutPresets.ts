export type BoardViewport = "mobile" | "tablet" | "desktop";

export type BoardSeatLayoutPreset = {
  seatRadiusXMultiplier: number;
  seatRadiusYMultiplier: number;
  seatSideWeightedYMultiplier: boolean;
  seatOutwardOffsetX: number;
  seatOutwardOffsetY: number;
  seatSideInset: number;
  seatSideVerticalOffset: number;
  seatAngleOffsetDeg: number;
  seatSideAngleOffsetDeg: number;
  seatTopGroupShiftYPx: number;
  seatBottomGroupShiftYPx: number;
};

type MatchSeatOffsets = {
  meTranslateYPx: number;
  lowerSideTranslateYPx: number;
};

export type MatchBoardLayoutPreset = {
  seat: BoardSeatLayoutPreset;
  offsets: MatchSeatOffsets;
};

const BASE_MATCH_LAYOUT_BY_VIEWPORT: Record<BoardViewport, BoardSeatLayoutPreset> = {
  desktop: {
    seatRadiusXMultiplier: 1.1,
    seatRadiusYMultiplier: 1.12,
    seatSideWeightedYMultiplier: false,
    seatOutwardOffsetX: 4,
    seatOutwardOffsetY: 10,
    seatSideInset: 4.5,
    seatSideVerticalOffset: 2.8,
    seatAngleOffsetDeg: 0,
    seatSideAngleOffsetDeg: 0,
    seatTopGroupShiftYPx: 0,
    seatBottomGroupShiftYPx: 0,
  },
  tablet: {
    seatRadiusXMultiplier: 1.07,
    seatRadiusYMultiplier: 1.08,
    seatSideWeightedYMultiplier: false,
    seatOutwardOffsetX: 6,
    seatOutwardOffsetY: 12,
    seatSideInset: 5.1,
    seatSideVerticalOffset: 3.2,
    seatAngleOffsetDeg: 0,
    seatSideAngleOffsetDeg: 0,
    seatTopGroupShiftYPx: 0,
    seatBottomGroupShiftYPx: 0,
  },
  mobile: {
    seatRadiusXMultiplier: 1.04,
    seatRadiusYMultiplier: 1.1,
    seatSideWeightedYMultiplier: false,
    seatOutwardOffsetX: 7,
    seatOutwardOffsetY: 14,
    seatSideInset: 5.7,
    seatSideVerticalOffset: 3.6,
    seatAngleOffsetDeg: 0,
    seatSideAngleOffsetDeg: 0,
    seatTopGroupShiftYPx: 0,
    seatBottomGroupShiftYPx: 0,
  },
};

const FOUR_PLAYER_MATCH_OVERRIDES: Partial<BoardSeatLayoutPreset> = {
  seatAngleOffsetDeg: -14,
  seatSideAngleOffsetDeg: -20,
};

const DEFAULT_MATCH_OFFSETS: MatchSeatOffsets = {
  meTranslateYPx: 18,
  lowerSideTranslateYPx: 0,
};

const SIX_PLAYER_MATCH_OFFSETS: MatchSeatOffsets = {
  meTranslateYPx: 18,
  lowerSideTranslateYPx: 24,
};

const DEFAULT_LOBBY_LAYOUT: BoardSeatLayoutPreset = {
  seatRadiusXMultiplier: 1,
  seatRadiusYMultiplier: 1,
  seatSideWeightedYMultiplier: false,
  seatOutwardOffsetX: 0,
  seatOutwardOffsetY: 0,
  seatSideInset: 0,
  seatSideVerticalOffset: 0,
  seatAngleOffsetDeg: 0,
  seatSideAngleOffsetDeg: 0,
  seatTopGroupShiftYPx: 0,
  seatBottomGroupShiftYPx: 0,
};

const SIX_PLAYER_LOBBY_LAYOUT_BY_VIEWPORT: Record<BoardViewport, BoardSeatLayoutPreset> = {
  desktop: {
    seatRadiusXMultiplier: 1,
    seatRadiusYMultiplier: 1.02,
    seatSideWeightedYMultiplier: true,
    seatOutwardOffsetX: 0,
    seatOutwardOffsetY: 0,
    seatSideInset: 2.6,
    seatSideVerticalOffset: 1.8,
    seatAngleOffsetDeg: 0,
    seatSideAngleOffsetDeg: 0,
    seatTopGroupShiftYPx: -22,
    seatBottomGroupShiftYPx: -22,
  },
  tablet: {
    seatRadiusXMultiplier: 0.96,
    seatRadiusYMultiplier: 1.05,
    seatSideWeightedYMultiplier: true,
    seatOutwardOffsetX: 0,
    seatOutwardOffsetY: 0,
    seatSideInset: 3.3,
    seatSideVerticalOffset: 2.4,
    seatAngleOffsetDeg: 0,
    seatSideAngleOffsetDeg: 0,
    seatTopGroupShiftYPx: 0,
    seatBottomGroupShiftYPx: 0,
  },
  mobile: {
    seatRadiusXMultiplier: 0.87,
    seatRadiusYMultiplier: 1.6,
    seatSideWeightedYMultiplier: true,
    seatOutwardOffsetX: 0,
    seatOutwardOffsetY: 0,
    seatSideInset: 4.4,
    seatSideVerticalOffset: 3.1,
    seatAngleOffsetDeg: 0,
    seatSideAngleOffsetDeg: 0,
    seatTopGroupShiftYPx: 20,
    seatBottomGroupShiftYPx: 20,
  },
};

export const resolveBoardViewport = ({
  isDesktop,
  isMidViewport,
}: {
  isDesktop: boolean;
  isMidViewport: boolean;
}): BoardViewport => {
  if (isDesktop) {
    return "desktop";
  }

  if (isMidViewport) {
    return "tablet";
  }

  return "mobile";
};

export const getMatchBoardLayout = ({
  totalSeats,
  viewport,
}: {
  totalSeats: number;
  viewport: BoardViewport;
}): MatchBoardLayoutPreset => {
  const baseSeat = BASE_MATCH_LAYOUT_BY_VIEWPORT[viewport];
  const seat = totalSeats === 4 ? { ...baseSeat, ...FOUR_PLAYER_MATCH_OVERRIDES } : baseSeat;
  const offsets = totalSeats === 6 ? SIX_PLAYER_MATCH_OFFSETS : DEFAULT_MATCH_OFFSETS;

  return {
    seat,
    offsets,
  };
};

export const getMatchSeatTranslateYPx = ({
  totalSeats,
  seatIndex,
  isMe,
  layout,
}: {
  totalSeats: number;
  seatIndex: number;
  isMe: boolean;
  layout: MatchBoardLayoutPreset;
}): number => {
  if (isMe) {
    return layout.offsets.meTranslateYPx;
  }

  const isLowerSideSeat = totalSeats === 6 && (seatIndex === 1 || seatIndex === 5);
  return isLowerSideSeat ? layout.offsets.lowerSideTranslateYPx : 0;
};

export const getMatchSeatAvatarNudgeYPx = ({
  totalSeats,
  seatIndex,
  viewport,
  isShortViewport,
}: {
  totalSeats: number;
  seatIndex: number;
  viewport: BoardViewport;
  isShortViewport: boolean;
}): number => {
  const isTopSeat = totalSeats === 6 && seatIndex === 3;
  const shouldNudgeTopSeatDown = isTopSeat && !(viewport === "mobile" && !isShortViewport);
  return shouldNudgeTopSeatDown ? 15 : 0;
};

export const getLobbyBoardLayout = ({
  totalSeats,
  viewport,
}: {
  totalSeats: number;
  viewport: BoardViewport;
}): BoardSeatLayoutPreset => {
  if (totalSeats === 6) {
    return SIX_PLAYER_LOBBY_LAYOUT_BY_VIEWPORT[viewport];
  }

  return DEFAULT_LOBBY_LAYOUT;
};
