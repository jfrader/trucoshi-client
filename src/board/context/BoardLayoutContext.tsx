import { ReactNode, createContext } from "react";
import { useBoardLayoutModel } from "../hooks/useBoardLayoutModel";
import { BoardLayoutModel, BoardSurface } from "../types";

export const BoardLayoutContext = createContext<BoardLayoutModel | null>(null);

type BoardLayoutProviderProps = {
  surface: BoardSurface;
  totalSeats: number;
  children: ReactNode;
};

export const BoardLayoutProvider = ({ surface, totalSeats, children }: BoardLayoutProviderProps) => {
  const layout = useBoardLayoutModel({ surface, totalSeats });

  return <BoardLayoutContext.Provider value={layout}>{children}</BoardLayoutContext.Provider>;
};
