import { Box, BoxProps, Paper, styled } from "@mui/material";
import { ReactNode, useMemo } from "react";

export type SeatLike = {
  key: string;
  teamIdx: 0 | 1;
  isMe?: boolean;
};

export type TrucoBoardSlot<T extends SeatLike> = {
  key: string;
  teamIdx: 0 | 1;
  player: T | null;
};

export const buildAlternatingSlots = <T extends SeatLike>(
  players: T[],
  fill?: number
): TrucoBoardSlot<T>[] => {
  const length = Math.max(fill && players.length < fill ? fill : players.length, 2);
  const teamPlayers: Record<0 | 1, T[]> = { 0: [], 1: [] };
  players.forEach((player) => {
    teamPlayers[player.teamIdx].push(player);
  });
  const teamIndex: Record<0 | 1, number> = { 0: 0, 1: 0 };

  const slots: TrucoBoardSlot<T>[] = Array.from({ length }, (_, i) => {
    const teamIdx = (i % 2) as 0 | 1;
    const queue = teamPlayers[teamIdx];
    const player = queue[teamIndex[teamIdx]] || null;
    if (player) {
      teamIndex[teamIdx] += 1;
    }

    return {
      key: player?.key || `slot-${i}`,
      teamIdx,
      player,
    };
  });

  const meIndex = slots.findIndex((slot) => slot.player?.isMe);

  if (meIndex <= 0) {
    return slots;
  }

  return [...slots.slice(meIndex), ...slots.slice(0, meIndex)];
};

const getSeatPosition = (
  index: number,
  total: number,
  xMultiplier: number = 1,
  yMultiplier: number = 1,
  sideWeightedYMultiplier: boolean = false,
  sideInset: number = 0,
  sideVerticalOffset: number = 0,
  angleOffsetDeg: number = 0,
  sideAngleOffsetDeg: number = 0,
  topGroupShiftYPx: number = 0,
  bottomGroupShiftYPx: number = 0
) => {
  const baseAngleDeg = 90 + angleOffsetDeg + (index * 360) / total;
  const baseAngle = (baseAngleDeg * Math.PI) / 180;
  const sideOffsetDeg = sideAngleOffsetDeg * Math.abs(Math.cos(baseAngle));
  const angle = ((baseAngleDeg + sideOffsetDeg) * Math.PI) / 180;
  const radiusX = 50 * xMultiplier;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const sideStrength = Math.abs(cos);
  const effectiveYMultiplier = sideWeightedYMultiplier
    ? 1 + (yMultiplier - 1) * sideStrength
    : yMultiplier;
  const radiusY = 40 * effectiveYMultiplier;
  const leftBase = 50 + cos * radiusX;
  const topBase = 50 + sin * radiusY;

  return {
    left: `${leftBase - cos * sideStrength * sideInset}%`,
    top: `${topBase + Math.sign(sin || 1) * sideStrength * sideVerticalOffset}%`,
    groupShiftY: sin < 0 ? -topGroupShiftYPx : sin > 0 ? bottomGroupShiftYPx : 0,
    cos,
    sin,
  };
};

export type TrucoBoardLayoutProps<T extends SeatLike> = {
  slots: TrucoBoardSlot<T>[];
  renderSeat: (slot: TrucoBoardSlot<T>, index: number) => ReactNode;
  seatRadiusXMultiplier?: number;
  seatRadiusYMultiplier?: number;
  seatSideWeightedYMultiplier?: boolean;
  seatOutwardOffset?: number;
  seatOutwardOffsetX?: number;
  seatOutwardOffsetY?: number;
  seatSideInset?: number;
  seatSideVerticalOffset?: number;
  seatAngleOffsetDeg?: number;
  seatSideAngleOffsetDeg?: number;
  seatTopGroupShiftYPx?: number;
  seatBottomGroupShiftYPx?: number;
  topContent?: ReactNode;
  centerContent?: ReactNode;
  bottomContent?: ReactNode;
  floatingLeft?: ReactNode;
  floatingRight?: ReactNode;
  boardFooter?: ReactNode;
} & Omit<BoxProps, "children">;

export const TrucoBoardLayout = <T extends SeatLike>({
  slots,
  renderSeat,
  seatRadiusXMultiplier = 1,
  seatRadiusYMultiplier = 1,
  seatSideWeightedYMultiplier = false,
  seatOutwardOffset = 0,
  seatOutwardOffsetX,
  seatOutwardOffsetY,
  seatSideInset = 0,
  seatSideVerticalOffset = 0,
  seatAngleOffsetDeg = 0,
  seatSideAngleOffsetDeg = 0,
  seatTopGroupShiftYPx = 0,
  seatBottomGroupShiftYPx = 0,
  topContent,
  centerContent,
  bottomContent,
  floatingLeft,
  floatingRight,
  boardFooter,
  ...props
}: TrucoBoardLayoutProps<T>) => {
  const outwardX = seatOutwardOffsetX ?? seatOutwardOffset;
  const outwardY = seatOutwardOffsetY ?? seatOutwardOffset;
  const seatPositions = useMemo(
    () =>
      slots.map((_, index) =>
        getSeatPosition(
          index,
          slots.length,
          seatRadiusXMultiplier,
          seatRadiusYMultiplier,
          seatSideWeightedYMultiplier,
          seatSideInset,
          seatSideVerticalOffset,
          seatAngleOffsetDeg,
          seatSideAngleOffsetDeg,
          seatTopGroupShiftYPx,
          seatBottomGroupShiftYPx
        )
      ),
    [
      seatAngleOffsetDeg,
      seatBottomGroupShiftYPx,
      seatRadiusXMultiplier,
      seatRadiusYMultiplier,
      seatSideAngleOffsetDeg,
      seatSideInset,
      seatSideVerticalOffset,
      seatSideWeightedYMultiplier,
      seatTopGroupShiftYPx,
      slots,
    ]
  );

  return (
    <Root {...props}>
      {topContent ? <TopStrip>{topContent}</TopStrip> : null}
      <BoardShell>
        <BoardSurface elevation={8}>
          <BoardCenter>{centerContent}</BoardCenter>
          {slots.map((slot, index) => {
            const pos = seatPositions[index];
            return (
              <SeatPosition
                key={`${slot.key}-${index}`}
                style={{
                  left: pos.left,
                  top: pos.top,
                  ["--seat-shift-x" as any]: `${pos.cos * outwardX}px`,
                  ["--seat-shift-y" as any]: `${pos.sin * outwardY}px`,
                  ["--seat-group-shift-y" as any]: `${pos.groupShiftY}px`,
                }}
                data-slot-team={slot.teamIdx}
              >
                {renderSeat(slot, index)}
              </SeatPosition>
            );
          })}
        </BoardSurface>
      </BoardShell>
      {boardFooter ? <BoardFooter>{boardFooter}</BoardFooter> : null}
      {bottomContent ? <BottomStrip>{bottomContent}</BottomStrip> : null}
      {floatingLeft ? <FloatingLeft>{floatingLeft}</FloatingLeft> : null}
      {floatingRight ? <FloatingRight>{floatingRight}</FloatingRight> : null}
    </Root>
  );
};

const Root = styled(Box)(({ theme }) => ({
  "--board-shadow": theme.trucoshiUi.board.shadow,
  "--felt-primary": theme.trucoshiUi.board.feltPrimary,
  "--felt-secondary": theme.trucoshiUi.board.feltSecondary,
  "--felt-tertiary": theme.trucoshiUi.board.feltTertiary,
  "--wood-primary": theme.trucoshiUi.board.woodPrimary,
  "--wood-secondary": theme.trucoshiUi.board.woodSecondary,
  position: "relative",
  height: "100%",
  maxHeight: "100%",
  minHeight: 0,
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  padding: theme.spacing(0.62, 0.05, 0.9),
  background: theme.trucoshiUi.board.shellBackground,
  "&::before": {
    content: '""',
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    background: theme.trucoshiUi.board.shellOverlay,
    zIndex: 0,
  },
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(1.05, 0.35, 1.25),
  },
  [theme.breakpoints.up("md")]: {
    padding: theme.spacing(1.2, 0.6, 1.45),
  },
}));

const TopStrip = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexWrap: "wrap",
  gap: theme.spacing(0.7),
  marginBottom: theme.spacing(0.36),
  position: "relative",
  zIndex: 2,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    gap: theme.spacing(1),
    marginBottom: theme.spacing(0.72),
  },
}));

const BoardShell = styled(Box)(() => ({
  position: "relative",
  width: "100%",
  maxWidth: "56rem",
  margin: "0 auto",
  flexGrow: 1,
  minHeight: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
}));

const BoardSurface = styled(Paper)(({ theme }) => ({
  width: "120%",
  maxWidth: "46rem",
  aspectRatio: "1 / 1",
  borderRadius: "50%",
  position: "relative",
  overflow: "visible",
  background: theme.trucoshiUi.board.surfaceBackground,
  boxShadow: theme.trucoshiUi.board.surfaceShadow,
  border: "0.68rem solid var(--wood-primary)",
  outline: "0.22rem solid var(--wood-secondary)",
  "&::before": {
    content: '""',
    position: "absolute",
    inset: "-0.12rem",
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.18)",
    pointerEvents: "none",
  },
  "&::after": {
    content: '""',
    position: "absolute",
    inset: "5.5%",
    borderRadius: "50%",
    pointerEvents: "none",
    boxShadow: "inset 0 0 45px rgba(0,0,0,0.26)",
  },
  [theme.breakpoints.up("sm")]: {
    width: "108%",
    borderWidth: "0.9rem",
    outlineWidth: "0.24rem",
  },
  [theme.breakpoints.up("md")]: {
    width: "auto",
    maxWidth: "100%",
    height: "100%",
    maxHeight: "46.5rem",
  },
  [theme.breakpoints.between("sm", "md")]: {
    maxHeight: "34rem",
  },
}));

const BoardCenter = styled(Box)(({ theme }) => ({
  position: "absolute",
  left: "50%",
  top: "50%",
  transform: "translate(-50%, -50%)",
  width: "57%",
  height: "57%",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  zIndex: 2,
  [theme.breakpoints.up("md")]: {
    width: "50%",
    height: "50%",
  },
}));

const SeatPosition = styled(Box)(() => ({
  position: "absolute",
  transform:
    "translate(calc(-50% + var(--seat-shift-x, 0px)), calc(-50% + var(--seat-shift-y, 0px) + var(--seat-group-shift-y, 0px)))",
  width: "35%",
  maxWidth: "11.8rem",
  zIndex: 3,
}));

const BottomStrip = styled(Box)(({ theme }) => ({
  position: "relative",
  zIndex: theme.zIndex.fab,
  width: "100%",
  maxWidth: "58rem",
  margin: "0 auto",
  marginTop: theme.spacing(0.34),
  [theme.breakpoints.up("sm")]: {
    marginTop: theme.spacing(0.92),
  },
}));

const BoardFooter = styled(Box)(({ theme }) => ({
  width: "100%",
  maxWidth: "56rem",
  margin: "0.8rem auto 0",
  textAlign: "center",
  color: theme.palette.grey[300],
  fontSize: "0.84rem",
}));

const FloatingLeft = styled(Box)(({ theme }) => ({
  position: "fixed",
  left: theme.spacing(1.2),
  bottom: theme.spacing(7.2),
  zIndex: theme.zIndex.drawer,
  [theme.breakpoints.up("sm")]: {
    bottom: theme.spacing(1.6),
  },
}));

const FloatingRight = styled(Box)(({ theme }) => ({
  position: "fixed",
  right: theme.spacing(1.2),
  bottom: theme.spacing(7.2),
  zIndex: theme.zIndex.drawer,
  [theme.breakpoints.up("sm")]: {
    bottom: theme.spacing(1.6),
  },
}));
