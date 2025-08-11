import { useEffect, useState } from "react";
import { EMatchState, ILobbyOptions, IPublicMatch, IPublicPlayer } from "trucoshi";
import { useSound } from "../../sound/hooks/useSound";

export type TurnTimer = { isExtension: boolean; progress: number; alert?: boolean };

const INITIAL_TIMER = {
  isExtension: false,
  alert: false,
  progress: 0,
};

export const useTurnTimer = (
  player: IPublicPlayer | null,
  serverAheadTime: number,
  match: IPublicMatch | null
) => {
  const { queue } = useSound();
  const [turnTimer, setTurnTimer] = useState<TurnTimer>(INITIAL_TIMER);

  useEffect(() => {
    if (!player || !player.isTurn || !match) {
      return;
    }

    if (player.bot) {
      return setTurnTimer({ isExtension: false, progress: 100 });
    }

    const interval = setInterval(() => {
      if (match.state === EMatchState.PAUSED) {
        return;
      }

      setTurnTimer((prev) => {
        const newTimer: TurnTimer = getPlayerTimer({
          player,
          serverAheadTime,
          options: match.options,
        });

        newTimer.alert = false;
        if (prev.isExtension && prev.progress > 50 && newTimer.progress < 50) {
          queue("deal");
          queue("mate");
          newTimer.alert = true;
        }
        if (!prev.isExtension && newTimer.isExtension) {
          queue("ceba_toma_mate");
          newTimer.alert = true;
        }
        if (prev.progress > 25 && newTimer.progress < 25) {
          queue("deal");
          newTimer.alert = true;
        }

        return newTimer;
      });
    }, 16);

    return () => clearInterval(interval);
  }, [match, player, queue, serverAheadTime]);

  return turnTimer;
};

export function getPlayerTimer({
  serverAheadTime,
  player,
  options,
}: {
  serverAheadTime: number;
  player: IPublicPlayer;
  options: ILobbyOptions;
}) {
  const now = Date.now() + serverAheadTime;
  if (!player.turnExpiresAt || !player.turnExtensionExpiresAt) {
    return { isExtension: false, progress: 0 };
  }
  const turnDifference = player.turnExpiresAt - now;
  if (turnDifference > 0) {
    const progress = (turnDifference * 100) / options.turnTime;
    return {
      isExtension: false,
      progress: Math.max(0, Math.min(100, progress)),
    };
  }

  const extensionDifference = player.turnExtensionExpiresAt - now - player.abandonedTime;
  const progress = (extensionDifference * 100) / options.abandonTime;
  return {
    isExtension: true,
    progress: Math.max(0, Math.min(100, progress)),
  };
}
