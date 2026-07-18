import { BoardSeatGeometry, BoardSeatGeometryConfig } from "./types";

export const mergeSeatConfig = (
  base: BoardSeatGeometryConfig,
  overrides?: Partial<BoardSeatGeometryConfig>
): BoardSeatGeometryConfig => ({
  ...base,
  ...(overrides || {}),
});

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
