import { LinearProgress } from "@mui/material";
import { IMatchPreviousHand, IPublicMatch } from "trucoshi";
import { useTurnTimer } from "../../trucoshi/hooks/useTurnTimer";
import { useTrucoshi } from "../../trucoshi/hooks/useTrucoshi";
import { PropsWithPlayer } from "../../trucoshi/types";
import { useEffect, useState } from "react";

type Props = PropsWithPlayer<{
  match: IPublicMatch | null;
  previousHand: IMatchPreviousHand | undefined | null;
}>;

export const TurnProgress = ({ match, player, previousHand }: Props) => {
  const [{ serverAheadTime }] = useTrucoshi();
  const turnTimer = useTurnTimer(player, serverAheadTime, match?.options);

  const [alert, setAlert] = useState(false);

  useEffect(() => {
    setAlert(true);
    const timer = setTimeout(() => {
      setAlert(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [turnTimer.alert]);

  return (
    <LinearProgress
      sx={
        player.bot
          ? { visibility: player.isTurn && !previousHand ? "visible" : "hidden" }
          : {
              visibility:
                player.isTurn && !previousHand && turnTimer.progress ? "visible" : "hidden",
            }
      }
      variant="determinate"
      color={alert ? "warning" : turnTimer.isExtension ? "error" : "success"}
      value={player.bot ? 100 : turnTimer.progress}
    />
  );
};
