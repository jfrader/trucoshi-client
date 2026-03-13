import { Box, BoxProps, Paper, styled } from "@mui/material";
import { ReactNode } from "react";

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
  const length = fill && players.length < fill ? fill : players.length;
  const used = new Set<string>();

  const slots: TrucoBoardSlot<T>[] = Array.from({ length: Math.max(length, 2) }, (_, i) => {
    const teamIdx = (i % 2) as 0 | 1;
    const player = players.find((candidate) => {
      if (used.has(candidate.key)) {
        return false;
      }
      return candidate.teamIdx === teamIdx;
    });

    if (player) {
      used.add(player.key);
    }

    return {
      key: player?.key || `slot-${i}`,
      teamIdx,
      player: player || null,
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
  yMultiplier: number = 1
) => {
  const angle = ((90 + (index * 360) / total) * Math.PI) / 180;
  const radiusX = 50 * xMultiplier;
  const radiusY = 40 * yMultiplier;

  return {
    left: `${50 + Math.cos(angle) * radiusX}%`,
    top: `${50 + Math.sin(angle) * radiusY}%`,
  };
};

export type TrucoBoardLayoutProps<T extends SeatLike> = {
  slots: TrucoBoardSlot<T>[];
  renderSeat: (slot: TrucoBoardSlot<T>, index: number) => ReactNode;
  seatRadiusXMultiplier?: number;
  seatRadiusYMultiplier?: number;
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
  topContent,
  centerContent,
  bottomContent,
  floatingLeft,
  floatingRight,
  boardFooter,
  ...props
}: TrucoBoardLayoutProps<T>) => {
  return (
    <Root {...props}>
      {topContent ? <TopStrip>{topContent}</TopStrip> : null}
      <BoardShell>
        <BoardSurface elevation={8}>
          <BoardCenter>{centerContent}</BoardCenter>
          {slots.map((slot, index) => {
            const pos = getSeatPosition(index, slots.length, seatRadiusXMultiplier, seatRadiusYMultiplier);
            return (
              <SeatPosition
                key={`${slot.key}-${index}`}
                style={{ left: pos.left, top: pos.top }}
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
  "--board-shadow": "rgba(0, 0, 0, 0.44)",
  "--felt-primary": "#0f5b4a",
  "--felt-secondary": "#0a4639",
  "--wood-primary": "#6f4728",
  "--wood-secondary": "#3a2214",
  position: "relative",
  height: "100%",
  maxHeight: "100%",
  minHeight: 0,
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  padding: theme.spacing(0.9, 0.2, 1.2),
  background:
    "radial-gradient(circle at 20% 12%, rgba(255,255,255,0.06), transparent 22%), radial-gradient(circle at 80% 10%, rgba(0,0,0,0.15), transparent 26%), linear-gradient(160deg, #123f35 0%, #0b3029 72%, #092722 100%)",
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(1.2, 0.45, 1.6),
  },
  [theme.breakpoints.up("md")]: {
    padding: theme.spacing(1.2, 0.7, 1.6),
  },
}));

const TopStrip = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexWrap: "wrap",
  gap: theme.spacing(0.7),
  marginBottom: theme.spacing(0.7),
  position: "relative",
  zIndex: 2,
  [theme.breakpoints.up("sm")]: {
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}));

const BoardShell = styled(Box)(() => ({
  position: "relative",
  width: "100%",
  maxWidth: "54rem",
  margin: "0 auto",
  flexGrow: 1,
  minHeight: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
}));

const BoardSurface = styled(Paper)(({ theme }) => ({
  width: "116%",
  maxWidth: "46rem",
  aspectRatio: "1 / 1",
  borderRadius: "50%",
  position: "relative",
  overflow: "visible",
  background:
    "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.06), transparent 24%), radial-gradient(circle at 65% 65%, rgba(255,255,255,0.04), transparent 22%), linear-gradient(165deg, var(--felt-primary), var(--felt-secondary))",
  boxShadow: "0 14px 34px var(--board-shadow)",
  border: "0.55rem solid var(--wood-primary)",
  outline: "0.2rem solid var(--wood-secondary)",
  [theme.breakpoints.up("sm")]: {
    width: "106%",
    borderWidth: "0.9rem",
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
  width: "55%",
  height: "55%",
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
  transform: "translate(-50%, -50%)",
  width: "30%",
  maxWidth: "10.4rem",
  zIndex: 3,
}));

const BottomStrip = styled(Box)(({ theme }) => ({
  position: "relative",
  zIndex: theme.zIndex.fab,
  width: "100%",
  maxWidth: "58rem",
  margin: "0 auto",
  marginTop: theme.spacing(1),
  [theme.breakpoints.up("sm")]: {
    marginTop: theme.spacing(1.4),
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
