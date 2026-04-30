import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { User } from "lightning-accounts";
import type { IPublicMatch, IPublicPlayer } from "trucoshi";
import type { useChatRoom } from "../chat/ChatRoom";
import type { useMatch } from "../../trucoshi/hooks/useMatch";
import type { TrucoBoardSlot } from "./TrucoBoardLayout";

export type LobbyGameplayContextValue = {
  state: {
    match: IPublicMatch;
    chatProps: ReturnType<typeof useChatRoom>;
    slots: TrucoBoardSlot<IPublicPlayer>[];
    isDesktopChat: boolean;
    account: User | null;
    isReadyLoading: boolean;
    sessionId?: string;
  };
  actions: {
    onJoinMatch: (teamIdx: 0 | 1) => void;
    onAddBot: (teamIdx: 0 | 1) => void;
    onSetReady: () => void;
    onSetUnReady: () => void;
    onStartMatch: () => void;
    onOpenOptions: () => void;
    kickPlayer: ReturnType<typeof useMatch>[1]["kickPlayer"];
  };
};

const LobbyGameplayContext = createContext<LobbyGameplayContextValue | null>(null);

export const LobbyGameplayProvider = ({
  state,
  actions,
  children,
}: LobbyGameplayContextValue & {
  children: ReactNode;
}) => (
  <LobbyGameplayContext.Provider value={{ state, actions }}>
    {children}
  </LobbyGameplayContext.Provider>
);

export const useLobbyGameplay = () => {
  const value = useContext(LobbyGameplayContext);

  if (!value) {
    throw new Error("useLobbyGameplay must be used within a LobbyGameplayProvider");
  }

  return value;
};
