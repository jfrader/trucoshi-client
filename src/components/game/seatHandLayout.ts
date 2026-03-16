export type SeatPolarVector = {
  cos: number;
  sin: number;
  sideStrength: number;
};

export type SeatHandTransform = {
  x: number;
  y: number;
  rotate: number;
  origin: string;
};

type SeatHandContext = {
  seatIndex: number;
  totalSeats: number;
  polar: SeatPolarVector;
};

type SeatOverride = (base: SeatHandTransform) => SeatHandTransform;

const SIX_PLAYER_HAND_OVERRIDES: Partial<Record<number, SeatOverride>> = {
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

const FOUR_PLAYER_HAND_OVERRIDES: Partial<Record<number, SeatOverride>> = {
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

const getSixSeatBaseTransform = ({ polar }: SeatHandContext): SeatHandTransform => {
  const inwardDistance = 24 + polar.sideStrength * 10;
  const arcShift = polar.sideStrength > 0.2 ? 16 + polar.sideStrength * 8 : 0;
  const arcDirection = polar.sideStrength > 0.2 ? Math.sign(polar.cos) : 0;

  return {
    x: -polar.cos * inwardDistance + arcDirection * arcShift,
    y: -polar.sin * inwardDistance - polar.sideStrength * 16,
    rotate: polar.cos * 44,
    origin: "50% -80px",
  };
};

const getGenericSeatBaseTransform = ({ polar }: SeatHandContext): SeatHandTransform => ({
  x: -polar.cos * 18,
  y: -polar.sin * 16,
  rotate: 0,
  origin: "50% -36px",
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
  const baseAngleDeg = 90 + seatAngleOffsetDeg + (seatIndex * 360) / Math.max(totalSeats, 2);
  const baseAngle = (baseAngleDeg * Math.PI) / 180;
  const sideOffsetDeg = seatSideAngleOffsetDeg * Math.abs(Math.cos(baseAngle));
  const seatAngle = ((baseAngleDeg + sideOffsetDeg) * Math.PI) / 180;
  const cos = Math.cos(seatAngle);
  const sin = Math.sin(seatAngle);

  return {
    cos,
    sin,
    sideStrength: Math.abs(cos),
  };
};

export const getOpponentSeatHandTransform = ({
  seatIndex,
  totalSeats,
  polar,
}: SeatHandContext): SeatHandTransform => {
  const base =
    totalSeats === 6
      ? getSixSeatBaseTransform({ seatIndex, totalSeats, polar })
      : getGenericSeatBaseTransform({ seatIndex, totalSeats, polar });

  if (totalSeats === 6) {
    const sixSeatOverride = SIX_PLAYER_HAND_OVERRIDES[seatIndex];
    return sixSeatOverride ? sixSeatOverride(base) : base;
  }

  if (totalSeats === 4) {
    const fourSeatOverride = FOUR_PLAYER_HAND_OVERRIDES[seatIndex];
    return fourSeatOverride ? fourSeatOverride(base) : base;
  }

  return base;
};
