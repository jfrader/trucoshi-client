import { Box, BoxProps, Paper, styled } from "@mui/material";
import { ReactNode, useMemo } from "react";
import {
  BoardLayoutModel,
  BoardSeatGeometry,
  buildSeatGeometries,
} from "./boardLayoutPresets";

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

export type TrucoBoardLayoutProps<T extends SeatLike> = {
  slots: TrucoBoardSlot<T>[];
  layout: BoardLayoutModel;
  renderSeat: (slot: TrucoBoardSlot<T>, index: number, geometry: BoardSeatGeometry) => ReactNode;
  topContent?: ReactNode;
  centerContent?: ReactNode;
  bottomContent?: ReactNode;
  floatingLeft?: ReactNode;
  floatingRight?: ReactNode;
  boardFooter?: ReactNode;
} & Omit<BoxProps, "children">;

export const TrucoBoardLayout = <T extends SeatLike>({
  slots,
  layout,
  renderSeat,
  topContent,
  centerContent,
  bottomContent,
  floatingLeft,
  floatingRight,
  boardFooter,
  ...props
}: TrucoBoardLayoutProps<T>) => {
  const rootSx = props.sx;
  const mergedRootSx: any = rootSx
    ? [{ padding: layout.frame.rootPadding }, ...(Array.isArray(rootSx) ? rootSx : [rootSx])]
    : { padding: layout.frame.rootPadding };

  const seatGeometries = useMemo(
    () =>
      layout.seatGeometries.length === slots.length
        ? layout.seatGeometries
        : buildSeatGeometries({
            totalSeats: slots.length,
            config: layout.seatConfig,
          }),
    [layout.seatConfig, layout.seatGeometries, slots.length]
  );

  const fallbackGeometry = seatGeometries[0];

  return (
    <Root {...props} sx={mergedRootSx}>
      {topContent ? (
        <TopStrip
          sx={{
            gap: layout.frame.topStripGap,
            marginBottom: layout.frame.topStripMarginBottom,
          }}
        >
          {topContent}
        </TopStrip>
      ) : null}

      <BoardShell sx={{ maxWidth: layout.frame.shellMaxWidth }}>
        <BoardSurface
          elevation={8}
          sx={{
            width: layout.frame.boardWidth,
            maxWidth: layout.frame.boardMaxWidth,
            height: layout.frame.boardHeight,
            maxHeight: layout.frame.boardMaxHeight,
            aspectRatio: layout.frame.boardAspectRatio,
            borderRadius: layout.frame.boardBorderRadius,
            borderWidth: layout.frame.boardBorderWidth,
            outlineWidth: layout.frame.boardOutlineWidth,
            "&::before, &::after": {
              borderRadius: layout.frame.boardInnerBorderRadius,
            },
          }}
        >
          <BoardCenter
            sx={{
              width: layout.frame.centerSize,
              height: layout.frame.centerSize,
            }}
          >
            {centerContent}
          </BoardCenter>

          {slots.map((slot, index) => {
            const geometry = seatGeometries[index] || fallbackGeometry;

            if (!geometry) {
              return null;
            }

            return (
              <SeatPosition
                key={`${slot.key}-${index}`}
                style={{
                  left: `${geometry.leftPercent}%`,
                  top: `${geometry.topPercent}%`,
                }}
                sx={{
                  width: layout.frame.seatWidth,
                  maxWidth: layout.frame.seatMaxWidth,
                  ["--seat-shift-x" as any]: `${geometry.seatShiftX}px`,
                  ["--seat-shift-y" as any]: `${geometry.seatShiftY}px`,
                  ["--seat-group-shift-y" as any]: `${geometry.groupShiftY}px`,
                }}
                data-slot-team={slot.teamIdx}
              >
                {renderSeat(slot, index, geometry)}
              </SeatPosition>
            );
          })}
        </BoardSurface>
      </BoardShell>

      {boardFooter ? <BoardFooter>{boardFooter}</BoardFooter> : null}

      {bottomContent ? (
        <BottomStrip sx={{ marginTop: layout.frame.bottomStripMarginTop }}>{bottomContent}</BottomStrip>
      ) : null}

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
  background: theme.trucoshiUi.board.shellBackground,
  "&::before": {
    content: '""',
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    background: theme.trucoshiUi.board.shellOverlay,
    zIndex: 0,
  },
}));

const TopStrip = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexWrap: "wrap",
  position: "relative",
  zIndex: 2,
  width: "100%",
}));

const BoardShell = styled(Box)(() => ({
  position: "relative",
  width: "100%",
  margin: "0 auto",
  flexGrow: 1,
  minHeight: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
}));

const BoardSurface = styled(Paper)(({ theme }) => ({
  boxSizing: "border-box",
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
    border: "1px solid rgba(255,255,255,0.18)",
    pointerEvents: "none",
  },
  "&::after": {
    content: '""',
    position: "absolute",
    inset: "5.5%",
    pointerEvents: "none",
    boxShadow: "inset 0 0 45px rgba(0,0,0,0.26)",
  },
}));

const BoardCenter = styled(Box)(() => ({
  position: "absolute",
  left: "50%",
  top: "50%",
  transform: "translate(-50%, -50%)",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  zIndex: 2,
}));

const SeatPosition = styled(Box)(() => ({
  position: "absolute",
  transform:
    "translate(calc(-50% + var(--seat-shift-x, 0px)), calc(-50% + var(--seat-shift-y, 0px) + var(--seat-group-shift-y, 0px)))",
  zIndex: 3,
}));

const BottomStrip = styled(Box)(({ theme }) => ({
  position: "relative",
  zIndex: theme.zIndex.fab,
  width: "100%",
  maxWidth: "58rem",
  marginLeft: "auto",
  marginRight: "auto",
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
