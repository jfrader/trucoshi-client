import {
  BoardSeatGeometry,
  HiddenHandRadialRules,
  OpponentHiddenHandLayout,
  SeatHandTransform,
  SeatOffsetVector,
} from "./types";
import { DEFAULT_HIDDEN_HAND_RADIAL_RULES } from "./tokens";

const MAX_HIDDEN_CARDS = 3;

const getHiddenHandSlots = (hiddenCardCount: number): number[] => {
  if (hiddenCardCount <= 1) {
    return [0];
  }

  if (hiddenCardCount === 2) {
    return [-0.5, 0.5];
  }

  return [-1, 0, 1];
};

const clampHiddenCardCount = (hiddenCardCount: number) =>
  Math.max(0, Math.min(MAX_HIDDEN_CARDS, Math.floor(hiddenCardCount)));

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
  const safeHiddenCardCount = clampHiddenCardCount(hiddenCardCount);
  const inward = {
    x: -geometry.cos,
    y: -geometry.sin,
  };
  const ruleScale = scale * profileRules.distanceScale;
  const axialInsetPx = profileRules.axialInsetReductionPx * (1 - geometry.sideStrength);
  const tableInsetPx = Math.max(0, profileRules.tableInsetPx - axialInsetPx) * ruleScale;
  const seatOffsetInwardPx = seatOffsetPx
    ? seatOffsetPx.x * inward.x + seatOffsetPx.y * inward.y
    : 0;
  const clearancePx =
    avatarSizePx * 0.5 + nameBlockPx * 0.32 + profileRules.minClearancePx * ruleScale;
  const anchorDistance =
    Math.max(0, Math.max(tableInsetPx - seatOffsetInwardPx, clearancePx)) +
    profileRules.verticalLiftPx * ruleScale;
  const anchor = {
    x: inward.x * anchorDistance,
    y: inward.y * anchorDistance,
    rotateDeg: (Math.atan2(inward.y, inward.x) * 180) / Math.PI + 90,
    origin: profileRules.handOrigin,
  };

  const hiddenHandSlots = getHiddenHandSlots(safeHiddenCardCount);
  const outerSlot = Math.max(...hiddenHandSlots.map((slot) => Math.abs(slot)));
  const cards = safeHiddenCardCount
    ? hiddenHandSlots.map((slot, index) => ({
        x: slot * profileRules.fanSpacingPx * scale,
        y: (Math.abs(slot) - outerSlot) * profileRules.fanArcDepthPx * scale,
        rotateDeg: slot * profileRules.fanSpreadDeg,
        zIndex: 100 + index,
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
