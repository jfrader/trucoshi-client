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
  match: IPublicMatch | null,
) => {
  const { queue } = useSound();
  const [turnTimer, setTurnTimer] = useState<TurnTimer>(INITIAL_TIMER);

  useEffect(() => {
    if (!player || !player.isTurn || !match) {
      setTurnTimer((prev) => (prev === INITIAL_TIMER ? prev : INITIAL_TIMER));
      return;
    }

    if (player.bot) {
      return setTurnTimer({ isExtension: false, progress: 100 });
    }

    const queueMe = (key: string) => {
      if (player.isMe) {
        queue(key);
      }
    };

    const updateTimer = () => {
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
        } else if (!prev.isExtension && newTimer.isExtension) {
          queueMe("deal");
          queue("ceba_toma_mate");
          newTimer.alert = true;
        } else if (prev.progress > 25 && newTimer.progress < 25) {
          queueMe("menu1");
          queue("deal");
          newTimer.alert = true;
        }  else if (prev.isExtension && prev.progress > 10 && newTimer.progress < 10) {
          queueMe("deal");
          newTimer.alert = true;
        }

        // Skip no-op updates to avoid unnecessary re-renders.
        if (
          !newTimer.alert &&
          prev.isExtension === newTimer.isExtension &&
          Math.abs(prev.progress - newTimer.progress) < 0.75
        ) {
          return prev;
        }

        return newTimer;
      });
    };

    updateTimer();

    const interval = setInterval(updateTimer, 120);

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
