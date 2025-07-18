import { ListItemText } from "@mui/material";
import { UserStats } from "@trucoshi/prisma";
import { getPlayerWinRatio } from "../../utils/player";

export const PlayerRatioListItemText = (props: Pick<UserStats, "win" | "loss">) => {
  return <ListItemText primary="Ratio de Victoria" secondary={getPlayerWinRatio(props)} />;
};
