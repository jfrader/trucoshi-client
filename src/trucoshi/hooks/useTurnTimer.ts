import { useEffect, useState } from "react";
import { ILobbyOptions, IPublicPlayer } from "trucoshi";
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
  options?: ILobbyOptions
) => {
  const { queue } = useSound();
  const [turnTimer, setTurnTimer] = useState<TurnTimer>(INITIAL_TIMER);

  useEffect(() => {
    if (!player || !player.isTurn || !options) {
      return;
    }
    const interval = setInterval(() => {
      setTurnTimer(({ isExtension, progress }) => {
        const newTimer: TurnTimer = getPlayerTimer({
          player,
          serverAheadTime,
          options,
          isExtension,
        });
        newTimer.alert = false;
        if (isExtension && progress > 50 && newTimer.progress < 50) {
          queue("turn");
          newTimer.alert = true;
        }
        if (!isExtension && newTimer.isExtension) {
          queue("turn");
          newTimer.alert = true;
        }
        if (progress > 15 && newTimer.progress < 15) {
          queue("turn");
          newTimer.alert = true;
        }
        return newTimer;
      });
    }, 16);

    return () => clearInterval(interval);
  }, [options, player, queue, serverAheadTime]);

  return turnTimer;
};

export function getPlayerTimer({
  serverAheadTime,
  player,
  options,
  isExtension,
}: {
  serverAheadTime: number;
  player: IPublicPlayer;
  options: ILobbyOptions;
  isExtension: boolean;
}) {
  const now = Date.now() + serverAheadTime;
  if (!player.turnExpiresAt || !player.turnExtensionExpiresAt) {
    return { isExtension: false, progress: 0 };
  }
  if (isExtension) {
    const difference = player.turnExtensionExpiresAt - now - player.abandonedTime;
    const progress = (difference * 100) / options.abandonTime;
    return { isExtension, progress };
  }
  const difference = player.turnExpiresAt - now;
  if (difference > 0) {
    const progress = (difference * 100) / options.turnTime;
    return {
      isExtension: false,
      progress,
    };
  }
  return { isExtension: true, progress: 100 };
}
