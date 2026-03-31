import { Box } from "@mui/material";
import { useMemo, useState } from "react";
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

export const TrickCenter = ({
  rounds,
  slots,
  layout,
  seatGeometries,
}: TrickCenterProps) => {
  const [openStackPlayerKey, setOpenStackPlayerKey] = useState<string | null>(null);
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
