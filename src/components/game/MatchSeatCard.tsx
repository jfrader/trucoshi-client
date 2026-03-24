import { alpha, Box, Paper, Stack, Typography } from "@mui/material";
import { useLayoutEffect, useRef, useState } from "react";
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

const ELLIPSE_SOLVER_EPSILON = 1e-5;
const ELLIPSE_SOLVER_MAX_ITERATIONS = 18;

const getClosestPointOnEllipse = ({
  x,
  y,
  radiusX,
  radiusY,
}: {
  x: number;
  y: number;
  radiusX: number;
  radiusY: number;
}): { x: number; y: number } | null => {
  const px = Math.abs(x);
  const py = Math.abs(y);

  if (px < ELLIPSE_SOLVER_EPSILON && py < ELLIPSE_SOLVER_EPSILON) {
    return null;
  }

  const a2 = radiusX * radiusX;
  const b2 = radiusY * radiusY;
  const ap = radiusX * px;
  const bp = radiusY * py;
  let t = 0;

  for (let i = 0; i < ELLIPSE_SOLVER_MAX_ITERATIONS; i += 1) {
    const tx = t + a2;
    const ty = t + b2;
    const tx2 = tx * tx;
    const ty2 = ty * ty;
    const fx = (ap * ap) / tx2 + (bp * bp) / ty2 - 1;

    if (Math.abs(fx) < ELLIPSE_SOLVER_EPSILON) {
      break;
    }

    const dfx = (-2 * ap * ap) / (tx2 * tx) + (-2 * bp * bp) / (ty2 * ty);

    if (Math.abs(dfx) < ELLIPSE_SOLVER_EPSILON) {
      break;
    }

    t = Math.max(0, t - fx / dfx);
  }

  const closestX = (Math.sign(x) || 1) * ((a2 * px) / (t + a2));
  const closestY = (Math.sign(y) || 1) * ((b2 * py) / (t + b2));

  return {
    x: closestX,
    y: closestY,
  };
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
  const avatarFrameSizePx = player.isMe ? 72 : 56;
  const turnRingPaddingPx = 4;
  const avatarOrbitSizePx = avatarFrameSizePx + turnRingPaddingPx * 2;
  const playerNameBlockPx = 30;
  const avatarAnchorTopPx = avatarOrbitSizePx / 2 + seatPresentation.avatarNudgeY;
  const timerVisible = Boolean(player.isTurn && !player.abandoned && !player.disabled);
  const seatRootRef = useRef<HTMLDivElement | null>(null);
  const avatarFrameRef = useRef<HTMLDivElement | null>(null);
  const [anchorOverride, setAnchorOverride] = useState<{
    x: number;
    y: number;
    rotateDeg: number;
  } | null>(null);

  useLayoutEffect(() => {
    if (player.isMe || player.abandoned || hiddenCards <= 0) {
      setAnchorOverride(null);
      return;
    }

    const seatRoot = seatRootRef.current;
    const avatarFrame = avatarFrameRef.current;

    if (!seatRoot || !avatarFrame) {
      return;
    }

    const boardSurface = seatRoot.closest("[data-truco-board-surface='true']") as HTMLElement | null;

    if (!boardSurface) {
      setAnchorOverride(null);
      return;
    }

    const measure = () => {
      const boardRect = boardSurface.getBoundingClientRect();
      const avatarRect = avatarFrame.getBoundingClientRect();

      if (boardRect.width < 10 || boardRect.height < 10 || avatarRect.width < 2 || avatarRect.height < 2) {
        return;
      }

      const centerX = boardRect.left + boardRect.width * 0.5;
      const centerY = boardRect.top + boardRect.height * 0.5;
      const avatarX = avatarRect.left + avatarRect.width * 0.5;
      const avatarY = avatarRect.top + avatarRect.height * 0.5;
      const dx = avatarX - centerX;
      const dy = avatarY - centerY;
      const distanceFromCenter = Math.hypot(dx, dy);

      if (distanceFromCenter < 1) {
        setAnchorOverride(null);
        return;
      }

      const rimInsetPx = seatPresentation.hiddenHandRules.rimEllipseInsetPx;
      const rimRadiusX = Math.max(1, boardRect.width * 0.5 - rimInsetPx);
      const boardAspect = boardRect.width / Math.max(boardRect.height, 1);
      const rimYRatio = boardAspect > 1.08 ? 0.48 : 0.5;
      const rimRadiusY = Math.max(1, boardRect.height * rimYRatio - rimInsetPx);
      const closest = getClosestPointOnEllipse({
        x: dx,
        y: dy,
        radiusX: rimRadiusX,
        radiusY: rimRadiusY,
      });

      if (!closest) {
        setAnchorOverride(null);
        return;
      }

      const normalInwardRawX = -(closest.x / (rimRadiusX * rimRadiusX));
      const normalInwardRawY = -(closest.y / (rimRadiusY * rimRadiusY));
      const normalInwardMagnitude = Math.hypot(normalInwardRawX, normalInwardRawY);

      if (normalInwardMagnitude < 1e-6) {
        setAnchorOverride(null);
        return;
      }

      const normalizedInwardX = normalInwardRawX / normalInwardMagnitude;
      const normalizedInwardY = normalInwardRawY / normalInwardMagnitude;
      const handInsetPx =
        seatPresentation.hiddenHandRules.rimClearancePx * seatPresentation.hiddenHandScale;
      const desiredX = closest.x + normalizedInwardX * handInsetPx;
      const desiredY = closest.y + normalizedInwardY * handInsetPx;
      const nextAnchorX = desiredX - dx;
      const nextAnchorY = desiredY - dy;
      const nextRotateDeg = (Math.atan2(normalizedInwardY, normalizedInwardX) * 180) / Math.PI + 90;

      setAnchorOverride((prev) => {
        if (
          prev &&
          Math.abs(prev.x - nextAnchorX) < 0.2 &&
          Math.abs(prev.y - nextAnchorY) < 0.2 &&
          Math.abs(prev.rotateDeg - nextRotateDeg) < 0.35
        ) {
          return prev;
        }

        return {
          x: nextAnchorX,
          y: nextAnchorY,
          rotateDeg: nextRotateDeg,
        };
      });
    };

    measure();

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(boardSurface);
    resizeObserver.observe(avatarFrame);
    window.addEventListener("resize", measure);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [
    hiddenCards,
    player.abandoned,
    player.isMe,
    seatPresentation.hiddenHandRules.rimEllipseInsetPx,
    seatPresentation.hiddenHandRules.rimClearancePx,
    seatPresentation.hiddenHandScale,
  ]);

  const hiddenHandLayout =
    !player.isMe && !player.abandoned && hiddenCards > 0
      ? buildOpponentHiddenHandLayout({
          geometry: seatGeometry,
          profileRules: seatPresentation.hiddenHandRules,
          hiddenCardCount: hiddenCards,
          avatarSizePx: avatarFrameSizePx,
          nameBlockPx: playerNameBlockPx,
          anchorOverride: anchorOverride || undefined,
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
    <Stack
      ref={seatRootRef}
      alignItems="center"
      spacing={0.42}
      sx={{
        position: "relative",
        width: "100%",
        minHeight: { xs: "9rem", sm: "9.4rem" },
        justifyContent: "flex-start",
      }}
    >
      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          transform: seatPresentation.avatarNudgeY ? `translateY(${seatPresentation.avatarNudgeY}px)` : "none",
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
            ref={avatarFrameRef}
            sx={{
              width: `${avatarFrameSizePx}px`,
              height: `${avatarFrameSizePx}px`,
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 0.25,
              borderRadius: "50%",
              bgcolor: "rgba(0,0,0,0.28)",
              border: "2px solid rgba(201,126,59,0.95)",
              boxShadow: "0 8px 16px rgba(0,0,0,0.3)",
              position: "relative",
              zIndex: 1,
              overflow: "hidden",
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

      {hiddenHandLayout ? (
        <Box
          sx={{
            position: "absolute",
            left: "50%",
            top: `${avatarAnchorTopPx}px`,
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
    </Stack>
  );
};
