import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useEffect, useRef, useState } from "react";
import type { IChatMessage, IPlayedCard } from "trucoshi";
import { useBoardLayout } from "../../board";
import { GameCard } from "../card/GameCard";
import { getMessageContent } from "../chat/ChatRoom";
import { getTeamColor } from "../../utils/team";
import { useMatchGameplay } from "./MatchGameplayContext";

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
  cardWidth,
  openSpreadRatio,
}: {
  index: number;
  total: number;
  open: boolean;
  cardWidth: string;
  openSpreadRatio: number;
}) => {
  const center = (total - 1) / 2;
  const delta = index - center;

  if (open) {
    return {
      x: `calc(${cardWidth} * ${delta * openSpreadRatio})`,
      y: -Math.abs(delta) * 4,
    };
  }

  return {
    x: `${delta * 4}px`,
    y: Math.abs(delta) * 1.5,
  };
};

type PlayerTableCard = {
  roundIdx: number;
  played: IPlayedCard;
};

const getPlayerTableCards = (rounds: IPlayedCard[][]) => {
  const cardsByPlayerKey: Record<string, PlayerTableCard[]> = {};

  rounds.forEach((round, roundIdx) => {
    round.forEach((played) => {
      if (!cardsByPlayerKey[played.player.key]) {
        cardsByPlayerKey[played.player.key] = [];
      }

      if (cardsByPlayerKey[played.player.key].length < 3) {
        cardsByPlayerKey[played.player.key].push({ roundIdx, played });
      }
    });
  });

  return cardsByPlayerKey;
};

const getPlayerStackPosition = ({
  geometry,
  centerShiftXPercent,
  centerShiftYPercent,
  playerSpreadXPercent,
  playerSpreadYPercent,
  spreadBoost,
  sideVerticalSpreadBoost,
}: {
  geometry: ReturnType<typeof useBoardLayout>["seatGeometries"][number];
  centerShiftXPercent: number;
  centerShiftYPercent: number;
  playerSpreadXPercent: number;
  playerSpreadYPercent: number;
  spreadBoost: number;
  sideVerticalSpreadBoost: number;
}) => ({
  x: 50 + centerShiftXPercent + geometry.cos * (playerSpreadXPercent + spreadBoost),
  y:
    50 +
    centerShiftYPercent +
    geometry.sin *
      (playerSpreadYPercent + spreadBoost + geometry.sideStrength * sideVerticalSpreadBoost),
});

export const TrickCenter = () => {
  const {
    announcements: { latestAnnouncement },
    state: { rounds, slots, chatProps },
  } = useMatchGameplay();
  const layout = useBoardLayout();
  const playedCardStackStyle = useTheme().trucoshiUi.match.playedCardStack;
  const [openStackPlayerKey, setOpenStackPlayerKey] = useState<string | null>(null);
  const [visibleCommandAnnouncement, setVisibleCommandAnnouncement] = useState<IChatMessage | null>(
    null,
  );
  const interactionPointerTypeRef = useRef<string | null>(null);
  const lastShownCommandIdRef = useRef<IChatMessage["id"] | null>(null);
  const commandTimerRef = useRef<number | null>(null);
  const geometries = layout.seatGeometries;
  const centerLayout = layout.centerStack;
  const playedCardWidth = layout.match?.dock.playedCardWidth || "clamp(4.0rem, 12vw, 4.6rem)";
  const expandedCardWidth = `calc(${playedCardWidth} * ${playedCardStackStyle.openScale})`;
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

  useEffect(() => {
    if (!openStackPlayerKey) {
      return;
    }

    const closeStackFromOutsideInteraction = (event: Event) => {
      const target = event.target;

      if (target instanceof Element && target.closest('[data-trick-card-stack="true"]')) {
        return;
      }

      setOpenStackPlayerKey(null);
    };

    document.addEventListener("pointerdown", closeStackFromOutsideInteraction, true);
    document.addEventListener("click", closeStackFromOutsideInteraction, true);

    return () => {
      document.removeEventListener("pointerdown", closeStackFromOutsideInteraction, true);
      document.removeEventListener("click", closeStackFromOutsideInteraction, true);
    };
  }, [openStackPlayerKey]);

  const slotByPlayer = slots.reduce<Record<string, number>>((acc, slot, index) => {
    if (slot.player) {
      acc[slot.player.key] = index;
    }

    return acc;
  }, {});

  const playOrder: Record<string, number> = {};
  let nextPlayOrder = 1;

  rounds.forEach((round, roundIdx) => {
    round.forEach((played) => {
      playOrder[`${roundIdx}-${played.player.key}-${played.card}`] = nextPlayOrder;
      nextPlayOrder += 1;
    });
  });

  const cardsByPlayerKey = getPlayerTableCards(rounds);
  const mySlotIndex = slots.findIndex((slot) => Boolean(slot.player?.isMe));
  const myGeometry = geometries[mySlotIndex];
  const myStackPosition = myGeometry
    ? getPlayerStackPosition({ geometry: myGeometry, ...centerLayout })
    : null;

  return (
    <Box width="100%" height="100%" position="relative" sx={{ pointerEvents: "none" }}>
      {myStackPosition ? (
        <Box
          aria-hidden="true"
          data-truco-play-target="true"
          sx={{
            position: "absolute",
            left: `${myStackPosition.x}%`,
            top: `${myStackPosition.y}%`,
            width: playedCardWidth,
            height: `calc(${playedCardWidth} * 1.48)`,
            transform: "translate(-50%, -50%)",
            opacity: 0,
            pointerEvents: "none",
          }}
        />
      ) : null}

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

        const geometry = geometries[slotByPlayer[slot.player.key] ?? 0];

        if (!geometry) {
          return [];
        }

        const { x, y } = getPlayerStackPosition({ geometry, ...centerLayout });
        const playerRoundCards = cardsByPlayerKey[slot.player.key] || [];

        if (!playerRoundCards.length) {
          return [];
        }

        const playerKey = slot.player.key;
        const isStackOpen = openStackPlayerKey === playerKey;
        const visibleCardWidth = isStackOpen ? expandedCardWidth : playedCardWidth;

        return (
          <Box
            key={`stack-${playerKey}`}
            role="button"
            tabIndex={0}
            aria-label={`Cartas jugadas por ${slot.player.name}`}
            aria-expanded={isStackOpen}
            data-trick-card-stack="true"
            data-testid={`trick-stack-${playerKey}`}
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse") {
                setOpenStackPlayerKey(playerKey);
              }
            }}
            onPointerLeave={(event) => {
              if (event.pointerType === "mouse") {
                setOpenStackPlayerKey((current) => (current === playerKey ? null : current));
              }
            }}
            onPointerDown={(event) => {
              interactionPointerTypeRef.current = event.pointerType;
            }}
            onPointerCancel={() => {
              interactionPointerTypeRef.current = null;
            }}
            onClick={() => {
              const pointerType = interactionPointerTypeRef.current;
              interactionPointerTypeRef.current = null;

              if (pointerType === "mouse") {
                return;
              }

              setOpenStackPlayerKey((current) => (current === playerKey ? null : playerKey));
            }}
            onKeyDown={(event) => {
              if (event.key !== "Enter" && event.key !== " ") {
                return;
              }

              event.preventDefault();
              setOpenStackPlayerKey((current) => (current === playerKey ? null : playerKey));
            }}
            sx={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: playedCardWidth,
              height: `calc(${playedCardWidth} * 1.48)`,
              transform: "translate(-50%, -50%)",
              zIndex: isStackOpen ? 240 : 40,
              cursor: "pointer",
              pointerEvents: "auto",
            }}
          >
            {playerRoundCards.map(({ played, roundIdx }, index) => {
              const orderKey = `${roundIdx}-${played.player.key}-${played.card}`;
              const zOrder = playOrder[orderKey] || 0;
              const baseRotation = centerLayout.facePlayerRotation ? geometry.angleDeg - 90 : 0;
              const rotation =
                baseRotation +
                getStableRotation({
                  seed: isStackOpen ? `${orderKey}:inspected` : orderKey,
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
                cardWidth: visibleCardWidth,
                openSpreadRatio: playedCardStackStyle.openSpreadRatio,
              });
              const isTopCard = index === playerRoundCards.length - 1;

              return (
                <Box
                  key={`${played.player.key}-${played.card}-${roundIdx}`}
                  data-testid={`trick-card-${playerKey}-${index}`}
                  sx={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    width: visibleCardWidth,
                    height: `calc(${visibleCardWidth} * 1.48)`,
                    borderRadius: `calc(${visibleCardWidth} / 13)`,
                    boxShadow: isStackOpen
                      ? playedCardStackStyle.openShadow
                      : isTopCard
                        ? playedCardStackStyle.restingShadow
                        : "none",
                    transform: `translate(calc(-50% + ${jitter.x}px + ${stackOffset.x}), calc(-50% + ${jitter.y + stackOffset.y}px)) rotate(${rotation}deg)`,
                    transformOrigin: "center",
                    transition: playedCardStackStyle.cardTransition,
                    zIndex: isStackOpen ? 280 + index : 20 + zOrder,
                  }}
                >
                  <GameCard card={played.card} width="100%" sx={{ height: "100%" }} />
                </Box>
              );
            })}
          </Box>
        );
      })}
    </Box>
  );
};
