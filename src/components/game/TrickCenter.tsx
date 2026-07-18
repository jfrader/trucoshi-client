import { Box, Typography } from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { IChatMessage, IPlayedCard } from "trucoshi";
import { GameCard } from "../card/GameCard";
import { useBoardLayout } from "../../board";
import { useMatchGameplay } from "./MatchGameplayContext";
import { getMessageContent } from "../chat/ChatRoom";
import { getTeamColor } from "../../utils/team";

const COMMAND_ANNOUNCEMENT_DURATION_MS = 3000;

const getStableRotation = ({
  seed,
  maxRotationOffsetDeg,
}: {
  seed: string;
  maxRotationOffsetDeg: number;
}) => {
  let hash = 0;

  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }

  const normalized = (((hash % 1000) + 1000) % 1000) / 1000;
  return normalized * (maxRotationOffsetDeg * 2) - maxRotationOffsetDeg;
};

const getStableJitter = ({ seed, spread }: { seed: string; spread: number }) => {
  let hash = 0;

  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 33 + seed.charCodeAt(i)) | 0;
  }

  const xNorm = (((hash % 1000) + 1000) % 1000) / 1000;
  const yNorm = (((((hash / 1000) | 0) % 1000) + 1000) % 1000) / 1000;

  return {
    x: xNorm * spread * 2 - spread,
    y: yNorm * spread * 2 - spread,
  };
};

const getStackOffset = ({
  index,
  total,
  open,
}: {
  index: number;
  total: number;
  open: boolean;
}) => {
  const center = (total - 1) / 2;
  const delta = index - center;

  if (open) {
    return {
      x: delta * 22,
      y: -Math.abs(delta) * 4,
    };
  }

  return {
    x: delta * 4,
    y: Math.abs(delta) * 1.5,
  };
};

export const TrickCenter = () => {
  const {
    announcements: { latestAnnouncement },
    state: { rounds, slots, chatProps },
  } = useMatchGameplay();
  const layout = useBoardLayout();
  const [openStackPlayerKey, setOpenStackPlayerKey] = useState<string | null>(null);
  const [visibleCommandAnnouncement, setVisibleCommandAnnouncement] = useState<IChatMessage | null>(
    null,
  );
  const lastShownCommandIdRef = useRef<IChatMessage["id"] | null>(null);
  const commandTimerRef = useRef<number | null>(null);
  const geometries = layout.seatGeometries;
  const centerLayout = layout.centerStack;
  const playedCardWidth = layout.match?.dock.playedCardWidth || "clamp(4.0rem, 12vw, 4.6rem)";
  const room = chatProps.useChatState?.[0];
  const latestCommandAnnouncement =
    [...(room?.messages || [])].reverse().find((message) => Boolean(message.command)) ||
    (latestAnnouncement?.command ? latestAnnouncement : null);
  const visibleCommandAnnouncementColor =
    visibleCommandAnnouncement?.user?.key !== undefined
      ? `${getTeamColor(Number(visibleCommandAnnouncement.user.key))}.light`
      : "grey.100";

  useEffect(() => {
    if (!latestCommandAnnouncement?.id) {
      return;
    }

    if (lastShownCommandIdRef.current === latestCommandAnnouncement.id) {
      return;
    }

    lastShownCommandIdRef.current = latestCommandAnnouncement.id;
    setVisibleCommandAnnouncement(latestCommandAnnouncement);

    if (commandTimerRef.current) {
      window.clearTimeout(commandTimerRef.current);
    }

    commandTimerRef.current = window.setTimeout(() => {
      setVisibleCommandAnnouncement((current) =>
        current?.id === latestCommandAnnouncement.id ? null : current,
      );
      commandTimerRef.current = null;
    }, COMMAND_ANNOUNCEMENT_DURATION_MS);
  }, [latestCommandAnnouncement]);

  useEffect(
    () => () => {
      if (commandTimerRef.current) {
        window.clearTimeout(commandTimerRef.current);
      }
    },
    [],
  );

  const slotByPlayer = useMemo(
    () =>
      slots.reduce<Record<string, number>>((acc, slot, i) => {
        if (slot.player) {
          acc[slot.player.key] = i;
        }

        return acc;
      }, {}),
    [slots],
  );

  const playOrder = useMemo(() => {
    const orderByCard: Record<string, number> = {};
    let order = 1;

    rounds.forEach((round, roundIdx) => {
      round.forEach((played) => {
        orderByCard[`${roundIdx}-${played.player.key}-${played.card}`] = order;
        order += 1;
      });
    });

    return orderByCard;
  }, [rounds]);

  const playerRoundCardsByPlayerKey = useMemo(() => {
    const byPlayer: Record<string, { roundIdx: number; played: IPlayedCard }[]> = {};

    rounds.forEach((round, roundIdx) => {
      round.forEach((played) => {
        if (!byPlayer[played.player.key]) {
          byPlayer[played.player.key] = [];
        }

        if (byPlayer[played.player.key].length < 3) {
          byPlayer[played.player.key].push({ roundIdx, played });
        }
      });
    });

    return byPlayer;
  }, [rounds]);

  return (
    <Box width="100%" height="100%" position="relative">
      {visibleCommandAnnouncement ? (
        <Box
          position="absolute"
          sx={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            zIndex: 260,
          }}
        >
          <Typography
            variant="body2"
            fontWeight="bold"
            fontSize="large"
            color={visibleCommandAnnouncementColor}
            sx={{
              textShadow: "0 2px 10px rgba(0, 0, 0, 0.65)",
              whiteSpace: "nowrap",
            }}
          >
            {getMessageContent(visibleCommandAnnouncement)}
          </Typography>
        </Box>
      ) : null}
      {slots.flatMap((slot) => {
        if (!slot.player) {
          return [];
        }

        const slotIndex = slotByPlayer[slot.player.key] ?? 0;
        const geometry = geometries[slotIndex];

        if (!geometry) {
          return [];
        }

        const x =
          50 +
          centerLayout.centerShiftXPercent +
          geometry.cos * (centerLayout.playerSpreadXPercent + centerLayout.spreadBoost);

        const y =
          50 +
          centerLayout.centerShiftYPercent +
          geometry.sin * (centerLayout.playerSpreadYPercent + centerLayout.spreadBoost);

        const playerRoundCards = playerRoundCardsByPlayerKey[slot.player.key] || [];

        if (!playerRoundCards.length) {
          return [];
        }

        const playerKey = slot.player.key;
        const isStackOpen = openStackPlayerKey === playerKey;

        return (
          <Box
            key={`stack-${playerKey}`}
            onMouseEnter={() => setOpenStackPlayerKey(playerKey)}
            onMouseLeave={() =>
              setOpenStackPlayerKey((current) => (current === playerKey ? null : current))
            }
            onClick={() =>
              setOpenStackPlayerKey((current) => (current === playerKey ? null : playerKey))
            }
            sx={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: playedCardWidth,
              height: `calc(${playedCardWidth} * 1.48)`,
              transform: "translate(-50%, -50%)",
              zIndex: isStackOpen ? 240 : 40,
            }}
          >
            {playerRoundCards.map(({ played, roundIdx }, index) => {
              const orderKey = `${roundIdx}-${played.player.key}-${played.card}`;
              const zOrder = playOrder[orderKey] || 0;
              const baseRotation = centerLayout.facePlayerRotation ? geometry.angleDeg - 90 : 0;
              const rotation =
                baseRotation +
                getStableRotation({
                  seed: orderKey,
                  maxRotationOffsetDeg: centerLayout.maxRotationOffsetDeg,
                });

              const jitter = getStableJitter({
                seed: orderKey,
                spread: centerLayout.maxJitterPx,
              });

              const stackOffset = getStackOffset({
                index,
                total: playerRoundCards.length,
                open: isStackOpen,
              });

              return (
                <Box
                  key={`${played.player.key}-${played.card}-${roundIdx}`}
                  sx={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    transform: `translate(calc(-50% + ${jitter.x + stackOffset.x}px), calc(-50% + ${jitter.y + stackOffset.y}px)) rotate(${rotation}deg)`,
                    transition: "transform 170ms ease, box-shadow 170ms ease",
                    zIndex: isStackOpen ? 280 + index : 20 + zOrder,
                  }}
                >
                  <GameCard card={played.card} width={playedCardWidth} shadow disableButton />
                </Box>
              );
            })}
          </Box>
        );
      })}
    </Box>
  );
};
