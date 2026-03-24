import { Box } from "@mui/material";
import { useMemo } from "react";
import { IPlayedCard, IPublicPlayer } from "trucoshi";
import { GameCard } from "../card/GameCard";
import { BoardLayoutModel, BoardSeatGeometry } from "./boardLayoutPresets";
import { buildAlternatingSlots } from "./TrucoBoardLayout";

type TrickCenterProps = {
  rounds: IPlayedCard[][];
  slots: ReturnType<typeof buildAlternatingSlots<IPublicPlayer>>;
  layout: BoardLayoutModel;
  seatGeometries?: BoardSeatGeometry[];
};

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

const getStableJitter = ({
  seed,
  spread,
}: {
  seed: string;
  spread: number;
}) => {
  let hash = 0;

  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 33 + seed.charCodeAt(i)) | 0;
  }

  const xNorm = (((hash % 1000) + 1000) % 1000) / 1000;
  const yNorm = ((((hash / 1000) | 0) % 1000) + 1000) % 1000 / 1000;

  return {
    x: xNorm * spread * 2 - spread,
    y: yNorm * spread * 2 - spread,
  };
};

export const TrickCenter = ({
  rounds,
  slots,
  layout,
  seatGeometries,
}: TrickCenterProps) => {
  const geometries = seatGeometries || layout.seatGeometries;
  const centerLayout = layout.centerStack;
  const playedCardWidth = layout.match?.dock.playedCardWidth || "clamp(4.0rem, 12vw, 4.6rem)";

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
