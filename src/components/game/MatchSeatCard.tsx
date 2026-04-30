import { Box, Paper, Typography, useTheme } from "@mui/material";
import { BURNT_CARD, IPublicPlayer } from "trucoshi";
import { useTurnTimer } from "../../trucoshi/hooks/useTurnTimer";
import { getTeamColor } from "../../utils/team";
import { UserAvatar } from "../../shared/UserAvatar";
import { GameCard } from "../card/GameCard";
import {
  BoardSeatGeometry,
  MatchSeatPresentation,
  buildOpponentHiddenHandLayout,
} from "../../board";
import matchOne from "../../assets/points/matches/1.png";
import matchTwo from "../../assets/points/matches/2.png";
import matchThree from "../../assets/points/matches/3.png";
import matchFour from "../../assets/points/matches/4.png";
import matchFive from "../../assets/points/matches/5.png";
import { memo } from "react";

type MatchSeatCardProps = {
  player: IPublicPlayer;
  isTurn: boolean;
  match: Parameters<typeof useTurnTimer>[2];
  serverAheadTime: number;
  seatGeometry: BoardSeatGeometry;
  seatPresentation: MatchSeatPresentation;
  tablePoints?: number;
  tablePointsSide?: "left" | "right";
};

const matchAssetByCount: Record<number, string> = {
  1: matchOne,
  2: matchTwo,
  3: matchThree,
  4: matchFour,
  5: matchFive,
};

const decomposeScoreToMatches = (score: number) => {
  const clamped = Math.max(0, score);
  const chunks: number[] = [];
  let remaining = clamped;

  while (remaining > 0) {
    const chunk = Math.min(5, remaining);
    chunks.push(chunk);
    remaining -= chunk;
  }

  return chunks;
};

const _MatchSeatCard = ({
  player,
  isTurn,
  match,
  serverAheadTime,
  seatGeometry,
  seatPresentation,
  tablePoints,
  tablePointsSide = "left",
}: MatchSeatCardProps) => {
  const theme = useTheme();
  const turnTimer = useTurnTimer(player, serverAheadTime, match);
  const hiddenCards = Math.min(player.hand.length, 3);
  const avatarFrameSizePx = 56;
  const turnRingPaddingPx = 4;
  const avatarOrbitSizePx = avatarFrameSizePx + turnRingPaddingPx * 2;
  const playerNameBlockPx = 30;
  const timerVisible = Boolean(player.isTurn && !player.abandoned && !player.disabled);

  const hiddenHandLayout = buildOpponentHiddenHandLayout({
    geometry: seatGeometry,
    profileRules: seatPresentation.hiddenHandRules,
    hiddenCardCount: hiddenCards,
    avatarSizePx: avatarFrameSizePx,
    nameBlockPx: playerNameBlockPx,
    seatOffsetPx: {
      x: seatGeometry.seatShiftX,
      y: seatGeometry.seatShiftY + seatGeometry.groupShiftY + seatPresentation.translateY,
    },
    scale: seatPresentation.hiddenHandScale,
  });

  const ringColor = turnTimer.alert
    ? theme.trucoshiUi.match.seatTurnRing.alert
    : turnTimer.isExtension
      ? theme.trucoshiUi.match.seatTurnRing.extension
      : theme.trucoshiUi.match.seatTurnRing.normal;
  const statusColor = player.abandoned
    ? "error.main"
    : player.disabled
    ? "warning.main"
    : isTurn
    ? "info.light"
    : `${getTeamColor(player.teamIdx)}.light`;

  const ringProgress = timerVisible ? Math.max(0, Math.min(100, turnTimer.progress)) : 0;
  const ringStrokePx = 3;
  const ringRadiusPx = (avatarOrbitSizePx - ringStrokePx) * 0.5;
  const ringCircumference = 2 * Math.PI * ringRadiusPx;
  const ringOffset = ringCircumference * (1 - ringProgress / 100);
  const ringTrackColor = theme.trucoshiUi.match.seatTurnRing.track;
  const tablePointChunks = tablePoints === undefined ? [] : decomposeScoreToMatches(tablePoints);
  const tablePointsPlacement = seatPresentation.tablePoints;
  const pointsOffsetPx =
    tablePointsSide === "left"
      ? -tablePointsPlacement.sideOffsetDesktopPx
      : tablePointsPlacement.sideOffsetDesktopPx;
  const pointsInwardNudgePx = tablePointsPlacement.inwardNudgePx;
  const pointsTiltDeg =
    tablePointsSide === "left" ? tablePointsPlacement.tiltDesktopDeg : -tablePointsPlacement.tiltDesktopDeg;

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: 0,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          left: "50%",
          top: 0,
          transform: `translate(-50%, calc(-50% + ${seatPresentation.avatarNudgeY}px))`,
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            width: `${avatarOrbitSizePx}px`,
            height: `${avatarOrbitSizePx}px`,
            position: "relative",
            display: "grid",
            placeItems: "center",
          }}
        >
          {timerVisible ? (
            <Box
              component="svg"
              viewBox={`0 0 ${avatarOrbitSizePx} ${avatarOrbitSizePx}`}
              sx={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                transform: "rotate(-90deg)",
                filter: theme.trucoshiUi.match.seatTurnRing.shadow,
              }}
            >
              <circle
                cx={avatarOrbitSizePx / 2}
                cy={avatarOrbitSizePx / 2}
                r={ringRadiusPx}
                fill="none"
                stroke={ringTrackColor}
                strokeWidth={ringStrokePx}
              />
              <circle
                cx={avatarOrbitSizePx / 2}
                cy={avatarOrbitSizePx / 2}
                r={ringRadiusPx}
                fill="none"
                stroke={ringColor}
                strokeWidth={ringStrokePx}
                strokeLinecap="round"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringOffset}
              />
            </Box>
          ) : null}
          <Paper
            sx={{
              width: `${avatarFrameSizePx}px`,
              height: `${avatarFrameSizePx}px`,
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 0,
              borderRadius: "50%",
              ...theme.trucoshiUi.match.seatAvatarFrame,
              position: "relative",
              zIndex: 1,
            }}
          >
            <Box
              sx={{
                position: "absolute",
                inset: "2px",
                borderRadius: "50%",
                overflow: "hidden",
                "& .MuiBadge-root": {
                  width: "100%",
                  height: "100%",
                  display: "block",
                },
                "& .MuiAvatar-root": {
                  width: "100%",
                  height: "100%",
                },
                "& .MuiAvatar-img": {
                  objectFit: "cover",
                },
              }}
            >
              <UserAvatar
                account={player}
                size="big"
                bgcolor={`${getTeamColor(player.teamIdx)}.main`}
              />
            </Box>
            <Box
              sx={{
                position: "absolute",
                right: -1,
                bottom: -1,
                width: "0.76rem",
                height: "0.76rem",
                borderRadius: "50%",
                bgcolor: statusColor,
                ...theme.trucoshiUi.match.seatStatusDot,
                zIndex: 3,
              }}
            />
          </Paper>
        </Box>

        <Paper
          sx={{
            mt: 0.42,
            px: 1.05,
            py: 0.24,
            minWidth: "4.6rem",
            borderRadius: "0.62rem",
            ...theme.trucoshiUi.match.seatNameBadge,
          }}
        >
          <Typography
            color="common.white"
            fontWeight={800}
            lineHeight={1.1}
            textAlign="center"
            fontSize={{ xs: "1rem", sm: "0.94rem" }}
            noWrap
            title={player.name}
            sx={{ textTransform: "capitalize" }}
          >
            {player.name}
          </Typography>
        </Paper>
      </Box>

      {hiddenCards > 0 && !player.abandoned ? (
        <Box
          sx={{
            position: "absolute",
            left: "50%",
            top: 0,
            width: 0,
            height: 0,
            transform: `translate(-50%, -50%) translate(${hiddenHandLayout.anchor.x}px, ${hiddenHandLayout.anchor.y}px) rotate(${hiddenHandLayout.anchor.rotateDeg}deg)`,
            transformOrigin: hiddenHandLayout.anchor.origin,
            pointerEvents: "none",
            zIndex: 1,
          }}
        >
          {hiddenHandLayout.cards.map((cardTransform, idx) => (
            <Box
              key={`${player.key}-${idx}`}
              sx={{
                position: "absolute",
                left: 0,
                top: 0,
                zIndex: cardTransform.zIndex,
                transform: `translate(calc(-50% + ${cardTransform.x}px), calc(-50% + ${cardTransform.y}px)) rotate(${cardTransform.rotateDeg}deg)`,
                transformOrigin: "50% 86%",
              }}
            >
              <GameCard
                disableButton
                card={BURNT_CARD}
                width={seatPresentation.hiddenHandCardWidth}
                shadow
              />
            </Box>
          ))}
        </Box>
      ) : null}
      {tablePointChunks.length ? (
        <Box
          sx={{
            position: "absolute",
            left: "50%",
            top: 0,
            width: 0,
            height: 0,
            transform: `translate(-50%, -50%) translate(${hiddenHandLayout.anchor.x}px, ${hiddenHandLayout.anchor.y}px) rotate(${hiddenHandLayout.anchor.rotateDeg}deg)`,
            transformOrigin: hiddenHandLayout.anchor.origin,
            pointerEvents: "none",
            zIndex: 2,
          }}
        >
          <Box
            sx={{
              position: "absolute",
              left: 0,
              top: 0,
              transform: `translate(calc(-50% + ${pointsOffsetPx}px), calc(-50% + ${4 + pointsInwardNudgePx}px)) rotate(${pointsTiltDeg}deg)`,
              "@media (max-width:599px)": {
                transform: `translate(calc(-50% + ${tablePointsSide === "left"
                  ? -tablePointsPlacement.sideOffsetMobilePx
                  : tablePointsPlacement.sideOffsetMobilePx}px), calc(-50% + ${4 + pointsInwardNudgePx}px)) rotate(${tablePointsSide === "left"
                  ? tablePointsPlacement.tiltMobileDeg
                  : -tablePointsPlacement.tiltMobileDeg}deg)`,
              },
              display: "flex",
              alignItems: "center",
              gap: tablePointsPlacement.pileGap,
              zIndex: 220,
            }}
          >
            {tablePointChunks.map((chunk, index) => (
              <Box
                key={`${player.key}-${chunk}-${index}`}
                component="img"
                src={matchAssetByCount[chunk]}
                alt={`${chunk} puntos`}
                sx={{
                  height: {
                    xs: tablePointsPlacement.imageHeightMobile,
                    sm: tablePointsPlacement.imageHeightDesktop,
                  },
                  width: "auto",
                  display: "block",
                  objectFit: "contain",
                  filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.35))",
                }}
              />
            ))}
          </Box>
        </Box>
      ) : null}
    </Box>
  );
};

const sameSeatPresentation = (prev: MatchSeatPresentation, next: MatchSeatPresentation) =>
  prev.translateY === next.translateY &&
  prev.avatarNudgeY === next.avatarNudgeY &&
  prev.hiddenHandCardWidth === next.hiddenHandCardWidth &&
  prev.hiddenHandScale === next.hiddenHandScale &&
  prev.hiddenHandRules === next.hiddenHandRules &&
  prev.tablePoints.sideOffsetDesktopPx === next.tablePoints.sideOffsetDesktopPx &&
  prev.tablePoints.sideOffsetMobilePx === next.tablePoints.sideOffsetMobilePx &&
  prev.tablePoints.inwardNudgePx === next.tablePoints.inwardNudgePx &&
  prev.tablePoints.tiltDesktopDeg === next.tablePoints.tiltDesktopDeg &&
  prev.tablePoints.tiltMobileDeg === next.tablePoints.tiltMobileDeg &&
  prev.tablePoints.imageHeightDesktop === next.tablePoints.imageHeightDesktop &&
  prev.tablePoints.imageHeightMobile === next.tablePoints.imageHeightMobile &&
  prev.tablePoints.pileGap === next.tablePoints.pileGap;

export const MatchSeatCard = memo(
  _MatchSeatCard,
  (prev, next) =>
    prev.player === next.player &&
    prev.isTurn === next.isTurn &&
    prev.match === next.match &&
    prev.serverAheadTime === next.serverAheadTime &&
    prev.seatGeometry === next.seatGeometry &&
    prev.tablePoints === next.tablePoints &&
    prev.tablePointsSide === next.tablePointsSide &&
    sameSeatPresentation(prev.seatPresentation, next.seatPresentation)
);
