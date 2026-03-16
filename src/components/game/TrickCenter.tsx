import { Box } from "@mui/material";
import { useMemo } from "react";
import { IPlayedCard, IPublicPlayer } from "trucoshi";
import { GameCard } from "../card/GameCard";
import { buildAlternatingSlots } from "./TrucoBoardLayout";

type TrickCenterProps = {
  rounds: IPlayedCard[][];
  slots: ReturnType<typeof buildAlternatingSlots<IPublicPlayer>>;
  facePlayerRotation?: boolean;
  spreadBoost?: number;
  playedCardWidth?: string;
};

const TRICK_CENTER_LAYOUT = {
  centerShiftX: -1.2,
  centerShiftY: 3.6,
  playerSpreadX: 42,
  playerSpreadY: 39,
  maxJitterPx: 4,
  maxRotationOffsetDeg: 6,
};

const getStableRotation = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  const normalized = (((hash % 1000) + 1000) % 1000) / 1000;
  return normalized * (TRICK_CENTER_LAYOUT.maxRotationOffsetDeg * 2) - TRICK_CENTER_LAYOUT.maxRotationOffsetDeg;
};

const getStableJitter = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 33 + seed.charCodeAt(i)) | 0;
  }
  const xNorm = (((hash % 1000) + 1000) % 1000) / 1000;
  const yNorm = ((((hash / 1000) | 0) % 1000) + 1000) % 1000 / 1000;
  const spread = TRICK_CENTER_LAYOUT.maxJitterPx;

  return {
    x: xNorm * spread * 2 - spread,
    y: yNorm * spread * 2 - spread,
  };
};

export const TrickCenter = ({
  rounds,
  slots,
  facePlayerRotation = false,
  spreadBoost = 0,
  playedCardWidth = "clamp(4.0rem, 12vw, 4.6rem)",
}: TrickCenterProps) => {
  const slotByPlayer = useMemo(
    () =>
      slots.reduce<Record<string, number>>((acc, slot, i) => {
        if (slot.player) {
          acc[slot.player.key] = i;
        }
        return acc;
      }, {}),
    [slots]
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

  return (
    <Box width="100%" height="100%" position="relative">
      {slots.flatMap((slot) => {
        if (!slot.player) {
          return [];
        }

        const slotIndex = slotByPlayer[slot.player.key] ?? 0;
        const angleDeg = 90 + (slotIndex * 360) / Math.max(slots.length, 2);
        const angle = (angleDeg * Math.PI) / 180;
        const x =
          50 + TRICK_CENTER_LAYOUT.centerShiftX + Math.cos(angle) * (TRICK_CENTER_LAYOUT.playerSpreadX + spreadBoost);
        const y =
          50 + TRICK_CENTER_LAYOUT.centerShiftY + Math.sin(angle) * (TRICK_CENTER_LAYOUT.playerSpreadY + spreadBoost);

        const playerRoundCards = rounds
          .map((round, roundIdx) => ({
            roundIdx,
            played: round.find((entry) => entry.player.key === slot.player?.key),
          }))
          .filter((entry): entry is { roundIdx: number; played: IPlayedCard } => Boolean(entry.played))
          .slice(0, 3);

        return playerRoundCards.map(({ played, roundIdx }) => {
          const orderKey = `${roundIdx}-${played.player.key}-${played.card}`;
          const zOrder = playOrder[orderKey] || 0;
          const baseRotation = facePlayerRotation ? angleDeg - 90 : 0;
          const rotation = baseRotation + getStableRotation(orderKey);
          const jitter = getStableJitter(orderKey);

          return (
            <Box
              key={`${played.player.key}-${played.card}-${roundIdx}`}
              sx={{
                position: "absolute",
                left: `${x}%`,
                top: `${y}%`,
                transform: `translate(calc(-50% + ${jitter.x}px), calc(-50% + ${jitter.y}px)) rotate(${rotation}deg)`,
                zIndex: 20 + zOrder,
              }}
            >
              <GameCard card={played.card} width={playedCardWidth} shadow disableButton />
            </Box>
          );
        });
      })}
    </Box>
  );
};
