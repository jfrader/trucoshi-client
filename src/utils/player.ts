import { UserStats } from "@trucoshi/prisma";
import numeral from "numeral";

export const getPlayerWinRatio = ({ win, loss }: Pick<UserStats, "win" | "loss">) => {
  return numeral(win / (win + loss)).format("0.0");
};
