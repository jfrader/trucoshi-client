import {
  BoardSeatGeometry,
  HiddenHandRadialRules,
  OpponentHiddenHandLayout,
  SeatHandTransform,
  SeatOffsetVector,
} from "./types";
import { DEFAULT_HIDDEN_HAND_RADIAL_RULES } from "./tokens";

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
