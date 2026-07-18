import { ListItemText } from "@mui/material";
import { getPlayerWinRatio, PlayerWinLossStats } from "../../utils/player";

export const PlayerRatioListItemText = (props: PlayerWinLossStats) => {
  return <ListItemText primary="Ratio de Victoria" secondary={getPlayerWinRatio(props)} />;
};
