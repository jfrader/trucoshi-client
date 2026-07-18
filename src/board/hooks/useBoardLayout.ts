import { useCallback, useContext } from "react";
import { BoardLayoutContext } from "../context/BoardLayoutContext";
import { getMatchSeatPresentationForIndex } from "./useBoardLayoutModel";

export const useBoardLayout = () => {
  const layout = useContext(BoardLayoutContext);

  if (!layout) {
    throw new Error("useBoardLayout must be used within a BoardLayoutProvider");
  }

  return layout;
};

export const useBoardLayoutHelpers = () => {
  const layout = useBoardLayout();

  const getMatchSeatPresentation = useCallback(
    (seatIndex: number, isMe: boolean) =>
      getMatchSeatPresentationForIndex({
        layout,
        seatIndex,
        isMe,
      }),
    [layout],
  );

  return {
    getMatchSeatPresentation,
  };
};
