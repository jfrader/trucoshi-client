import { ReactNode, createContext, useContext } from "react";
import { IPublicMatch } from "trucoshi";

export const MatchStateContext = createContext<IPublicMatch | null | undefined>(undefined);

type MatchStateProviderProps = {
  match: IPublicMatch | null;
  children: ReactNode;
};

export const MatchStateProvider = ({ match, children }: MatchStateProviderProps) => {
  return <MatchStateContext.Provider value={match}>{children}</MatchStateContext.Provider>;
};

export const useMatchState = () => {
  const match = useContext(MatchStateContext);

  if (match === undefined) {
    throw new Error("useMatchState must be used within a MatchStateProvider");
  }

  return match;
};
