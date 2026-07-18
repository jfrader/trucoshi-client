import numeral from "numeral";

export type PlayerWinLossStats = {
  win: number;
  loss: number;
};

export const getPlayerWinRatio = ({ win, loss }: PlayerWinLossStats) => {
  const total = win + loss;

  return numeral(total ? win / total : 0).format("0.0");
};
