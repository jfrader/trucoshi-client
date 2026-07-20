import {
  BoardCenterStackConfig,
  BoardPlayerCount,
  BoardSeatGeometryConfig,
  HiddenHandRadialRules,
  TablePointsPlacementRules,
} from "../types";

export const DEFAULT_SEAT_CONFIG: BoardSeatGeometryConfig = {
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


export const EMPTY_CENTER_STACK: BoardCenterStackConfig = {
  centerShiftXPercent: 0,
  centerShiftYPercent: 0,
  playerSpreadXPercent: 0,
  playerSpreadYPercent: 0,
  spreadBoost: 0,
  sideVerticalSpreadBoost: 0,
  maxJitterPx: 0,
  maxRotationOffsetDeg: 0,
  facePlayerRotation: false,
};

export const DEFAULT_MATCH_TWO_PLAYER_SEAT_OVERRIDES: Partial<BoardSeatGeometryConfig> = {
  angleOffsetDeg: -14,
  sideAngleOffsetDeg: -14,
};

export const DEFAULT_MATCH_FOUR_PLAYER_SEAT_OVERRIDES: Partial<BoardSeatGeometryConfig> = {
  angleOffsetDeg: -16,
  sideAngleOffsetDeg: -22,
};

export const DEFAULT_MATCH_CENTER_BASE: Omit<BoardCenterStackConfig, "spreadBoost"> = {
  centerShiftXPercent: -1.2,
  centerShiftYPercent: 1.8,
  playerSpreadXPercent: 42,
  playerSpreadYPercent: 39,
  sideVerticalSpreadBoost: 0,
  maxJitterPx: 4,
  maxRotationOffsetDeg: 6,
  facePlayerRotation: false,
};

export const MATCH_CENTER_OVERRIDES_BY_PLAYER_COUNT: Partial<
  Record<BoardPlayerCount, Partial<BoardCenterStackConfig>>
> = {
  6: {
    sideVerticalSpreadBoost: 7,
  },
};

export const DEFAULT_HIDDEN_HAND_RADIAL_RULES: HiddenHandRadialRules = {
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

export const DEFAULT_TABLE_POINTS_PLACEMENT_RULES: TablePointsPlacementRules = {
  sideOffsetDesktopPx: 88,
  sideOffsetMobilePx: 56,
  inwardNudgePx: -10,
  tiltDesktopDeg: 10,
  tiltMobileDeg: 24,
  imageHeightDesktop: "1.35rem",
  imageHeightMobile: "1.1rem",
  pileGap: "0.24rem",
};
