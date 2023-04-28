import { useEffect, useState } from "react";
import { IPublicPlayer, PLAYER_ABANDON_TIMEOUT, PLAYER_TURN_TIMEOUT } from "trucoshi";

export type TurnTimer = { isExtension: boolean; progress: number };

export const useTurnTimer = (player: IPublicPlayer | null, serverAheadTime: number) => {
  const [turnTimer, setTurnTimer] = useState<TurnTimer>({
    isExtension: false,
    progress: 0,
  });

  useEffect(() => {
    if (!player || !player.isTurn) {
      return;
    }
    const interval = setInterval(() => {
      setTurnTimer(({ isExtension }) => {
        const now = Math.floor(Date.now()) + serverAheadTime;
        if (!player.turnExpiresAt || !player.turnExtensionExpiresAt) {
          return { isExtension: false, progress: 0 };
        }
        if (isExtension) {
          const difference = player.turnExtensionExpiresAt - now;
          const progress = Math.floor((difference * 100) / PLAYER_ABANDON_TIMEOUT);
          return { isExtension, progress };
        }
        const difference = player.turnExpiresAt - now;
        if (difference > 0) {
          const progress = Math.floor((difference * 100) / PLAYER_TURN_TIMEOUT);
          return {
            isExtension: false,
            progress,
          };
        }
        return { isExtension: true, progress: 100 };
      });
    }, 16);

    return () => clearInterval(interval);
  }, [player, serverAheadTime]);

  return turnTimer;
};
