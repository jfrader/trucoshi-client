import { LinearProgress } from "@mui/material";
import { IMatchPreviousHand, IPublicMatch } from "trucoshi";
import { useTurnTimer } from "../../trucoshi/hooks/useTurnTimer";
import { useTrucoshi } from "../../trucoshi/hooks/useTrucoshi";
import { PropsWithPlayer } from "../../trucoshi/types";

type Props = PropsWithPlayer<{
  match: IPublicMatch | null;
  previousHand: IMatchPreviousHand | null;
}>;

export const TurnProgress = ({ match, player, previousHand }: Props) => {
  const [{ serverAheadTime }] = useTrucoshi();
  const turnTimer = useTurnTimer(player, serverAheadTime, match?.options);
  return (
    <LinearProgress
      sx={{
        visibility: player.isTurn && !previousHand && turnTimer.progress ? "visible" : "hidden",
      }}
      variant="determinate"
      color={turnTimer.isExtension ? "error" : "success"}
      value={turnTimer.progress}
    />
  );
};
