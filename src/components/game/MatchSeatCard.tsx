import { alpha, Box, Paper, Stack, Typography } from "@mui/material";
import { IPublicPlayer } from "trucoshi";
import { useTurnTimer } from "../../trucoshi/hooks/useTurnTimer";
import { getTeamColor } from "../../utils/team";
import { UserAvatar } from "../../shared/UserAvatar";
import { GameCard } from "../card/GameCard";
import { BURNT_CARD } from "trucoshi";
import { getOpponentSeatHandTransform, getSeatPolarVector } from "./seatHandLayout";

type MatchSeatCardProps = {
  player: IPublicPlayer;
  isTurn: boolean;
  match: Parameters<typeof useTurnTimer>[2];
  serverAheadTime: number;
  seatIndex: number;
  totalSeats: number;
  seatAngleOffsetDeg?: number;
  seatSideAngleOffsetDeg?: number;
  avatarNudgeYPx?: number;
};

export const MatchSeatCard = ({
  player,
  isTurn,
  match,
  serverAheadTime,
  seatIndex,
  totalSeats,
  seatAngleOffsetDeg = 0,
  seatSideAngleOffsetDeg = 0,
  avatarNudgeYPx = 0,
}: MatchSeatCardProps) => {
  const turnTimer = useTurnTimer(player, serverAheadTime, match);
  const hiddenCards = Math.min(player.hand.length, 3);
  const timerVisible = Boolean(player.isTurn && !player.abandoned && !player.disabled);
  const polar = getSeatPolarVector({
    seatIndex,
    totalSeats,
    seatAngleOffsetDeg,
    seatSideAngleOffsetDeg,
  });
  const seatHandTransform = player.isMe
    ? { x: 0, y: 0, rotate: 0, origin: "center center" }
    : getOpponentSeatHandTransform({
        seatIndex,
        totalSeats,
        polar,
      });

  const ringColor = turnTimer.alert ? "#f6b748" : turnTimer.isExtension ? "#ff6554" : "#44cc7b";
  const statusColor = player.abandoned
    ? "error.main"
    : player.disabled
    ? "warning.main"
    : isTurn
    ? "info.light"
    : `${getTeamColor(player.teamIdx)}.light`;

  const ringAngle = timerVisible ? Math.max(0, Math.min(100, turnTimer.progress)) * 3.6 : 0;

  return (
    <Stack
      alignItems="center"
      spacing={0.42}
      sx={{
        position: "relative",
        width: "100%",
        minHeight: { xs: "9rem", sm: "9.4rem" },
        justifyContent: "flex-start",
      }}
    >
      <Box sx={{ transform: avatarNudgeYPx ? `translateY(${avatarNudgeYPx}px)` : "none" }}>
        <Box
          sx={{
            p: timerVisible ? "2px" : 0,
            borderRadius: "999px",
            transition: (theme) =>
              theme.transitions.create(["background", "padding"], {
                duration: theme.transitions.duration.shortest,
              }),
            background: timerVisible
              ? `conic-gradient(from -90deg, ${ringColor} ${ringAngle}deg, ${alpha(
                  "#ffffff",
                  0.12
                )} ${ringAngle}deg 360deg)`
              : "transparent",
          }}
        >
          <Paper
            sx={{
              p: 0.25,
              borderRadius: "999px",
              bgcolor: "rgba(0,0,0,0.28)",
              border: "2px solid rgba(201,126,59,0.95)",
              boxShadow: "0 8px 16px rgba(0,0,0,0.3)",
              position: "relative",
            }}
          >
            <UserAvatar
              account={player}
              size={player.isMe ? "large" : "big"}
              bgcolor={`${getTeamColor(player.teamIdx)}.main`}
              sx={{
                border: "2px solid rgba(255,255,255,0.12)",
                boxSizing: "border-box",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                right: 1,
                bottom: 1,
                width: "0.76rem",
                height: "0.76rem",
                borderRadius: "50%",
                bgcolor: statusColor,
                border: "2px solid rgba(17,24,20,0.95)",
                boxShadow: "0 0 0 1px rgba(255,255,255,0.08)",
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

      {!player.isMe ? (
        <Stack
          direction="row"
          justifyContent="center"
          sx={{
            position: "absolute",
            left: "50%",
            top: "4.7rem",
            width: "7rem",
            minHeight: "3.35rem",
            transform: `translate(calc(-50% + ${seatHandTransform.x}px), ${seatHandTransform.y}px) rotate(${seatHandTransform.rotate}deg)`,
            transformOrigin: seatHandTransform.origin,
          }}
        >
          {Array.from({ length: 3 }).map((_, idx) => {
            const visible = idx < hiddenCards && !player.abandoned;
            return (
              <Box
                key={`${player.key}-${idx}`}
                ml={idx ? -1.42 : 0}
                sx={{
                  transform: `rotate(${(idx - 1) * 5}deg)`,
                  transformOrigin: "bottom center",
                  visibility: visible ? "visible" : "hidden",
                }}
              >
                <GameCard disableButton card={BURNT_CARD} width="clamp(1.82rem, 5.1vw, 2.02rem)" shadow />
              </Box>
            );
          })}
        </Stack>
      ) : null}
    </Stack>
  );
};
