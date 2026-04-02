import { alpha, Box, Paper, Typography } from "@mui/material";
import { BURNT_CARD, IPublicPlayer } from "trucoshi";
import { useTurnTimer } from "../../trucoshi/hooks/useTurnTimer";
import { getTeamColor } from "../../utils/team";
import { UserAvatar } from "../../shared/UserAvatar";
import { GameCard } from "../card/GameCard";
import {
  BoardSeatGeometry,
  MatchSeatPresentation,
  buildOpponentHiddenHandLayout,
} from "./boardLayoutPresets";

type MatchSeatCardProps = {
  player: IPublicPlayer;
  isTurn: boolean;
  match: Parameters<typeof useTurnTimer>[2];
  serverAheadTime: number;
  seatGeometry: BoardSeatGeometry;
  seatPresentation: MatchSeatPresentation;
};

export const MatchSeatCard = ({
  player,
  isTurn,
  match,
  serverAheadTime,
  seatGeometry,
  seatPresentation,
}: MatchSeatCardProps) => {
  const turnTimer = useTurnTimer(player, serverAheadTime, match);
  const hiddenCards = Math.min(player.hand.length, 3);
  const avatarFrameSizePx = 56;
  const turnRingPaddingPx = 4;
  const avatarOrbitSizePx = avatarFrameSizePx + turnRingPaddingPx * 2;
  const playerNameBlockPx = 30;
  const timerVisible = Boolean(player.isTurn && !player.abandoned && !player.disabled);

  const hiddenHandLayout =
    !player.abandoned && hiddenCards > 0
      ? buildOpponentHiddenHandLayout({
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
        })
      : null;

  const ringColor = turnTimer.alert ? "#f6b748" : turnTimer.isExtension ? "#ff6554" : "#44cc7b";
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
  const ringTrackColor = alpha("#ffffff", 0.14);

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
                filter: "drop-shadow(0 2px 5px rgba(0,0,0,0.35))",
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
              bgcolor: "rgba(0,0,0,0.28)",
              border: "2px solid rgba(201,126,59,0.95)",
              boxShadow: "0 8px 16px rgba(0,0,0,0.3)",
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
                border: "2px solid rgba(17,24,20,0.95)",
                boxShadow: "0 0 0 1px rgba(255,255,255,0.08)",
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
            bgcolor: "rgba(11, 19, 16, 0.9)",
            border: "1px solid rgba(255,255,255,0.13)",
            boxShadow: "0 6px 10px rgba(0,0,0,0.24)",
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

      {hiddenHandLayout ? (
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
    </Box>
  );
};
