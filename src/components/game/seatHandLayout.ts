import {
  BoardSeatGeometry,
  SeatHandTransform as CanonicalSeatHandTransform,
  getOpponentSeatHandTransform as getCanonicalOpponentSeatHandTransform,
} from "../../board";

type SeatPolarVector = {
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
