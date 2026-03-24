import {
  BoardSeatGeometry,
  BoardSeatGeometryConfig,
  SeatHandTransform as CanonicalSeatHandTransform,
  buildSeatGeometry,
  getOpponentSeatHandTransform as getCanonicalOpponentSeatHandTransform,
} from "./boardLayoutPresets";

export type SeatPolarVector = {
  cos: number;
  sin: number;
  sideStrength: number;
};

export type SeatHandTransform = CanonicalSeatHandTransform;

type SeatHandContext = {
  seatIndex: number;
  totalSeats: number;
  polar: SeatPolarVector;
};

const POLAR_ONLY_GEOMETRY_CONFIG: BoardSeatGeometryConfig = {
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

const toGeometryFromPolar = ({
  seatIndex,
  totalSeats,
  polar,
}: SeatHandContext): BoardSeatGeometry => ({
  index: seatIndex,
  totalSeats,
  angleDeg: 0,
  angleRad: 0,
  cos: polar.cos,
  sin: polar.sin,
  sideStrength: polar.sideStrength,
  leftPercent: 50,
  topPercent: 50,
  groupShiftY: 0,
  seatShiftX: 0,
  seatShiftY: 0,
});

export const getSeatPolarVector = ({
  seatIndex,
  totalSeats,
  seatAngleOffsetDeg = 0,
  seatSideAngleOffsetDeg = 0,
}: {
  seatIndex: number;
  totalSeats: number;
  seatAngleOffsetDeg?: number;
  seatSideAngleOffsetDeg?: number;
}): SeatPolarVector => {
  const geometry = buildSeatGeometry({
    index: seatIndex,
    totalSeats,
    config: {
      ...POLAR_ONLY_GEOMETRY_CONFIG,
      angleOffsetDeg: seatAngleOffsetDeg,
      sideAngleOffsetDeg: seatSideAngleOffsetDeg,
    },
  });

  return {
    cos: geometry.cos,
    sin: geometry.sin,
    sideStrength: geometry.sideStrength,
  };
};

export const getOpponentSeatHandTransform = ({
  seatIndex,
  totalSeats,
  polar,
}: SeatHandContext): SeatHandTransform => {
  const geometry = toGeometryFromPolar({
    seatIndex,
    totalSeats,
    polar,
  });

  return getCanonicalOpponentSeatHandTransform({
    seatIndex,
    totalSeats,
    geometry,
  });
};
