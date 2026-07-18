import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { ICard, IPublicMatch, IPublicPlayer } from "trucoshi";
import type { TrucoBoardSlot } from "./TrucoBoardLayout";
import type { useChatRoom } from "../chat/ChatRoom";
import type { useMatch } from "../../trucoshi/hooks/useMatch";
import type { useRounds } from "../../trucoshi/hooks/useRounds";

export type MatchGameplayContextValue = {
  state: {
    match: IPublicMatch;
    chatProps: ReturnType<typeof useChatRoom>;
    slots: TrucoBoardSlot<IPublicPlayer>[];
    rounds: ReturnType<typeof useRounds>[0];
    isDesktopChat: boolean;
    canSay: boolean;
    pauseRequested: boolean;
    me: IPublicPlayer | null;
    serverAheadTime: number;
    hasCommandActions: boolean;
    canInteractWithHand: boolean;
  };
  score: {
    myTeamIdx: 0 | 1;
    myTeamPoints: number;
    myTeamPointsLabel: string;
    opponentTeamPoints: number;
    opponentTeamPointsLabel: string;
  };
  seat: {
    bottomLeaderSeatIndex: number;
    frontLeaderSeatIndex: number;
  };
  announcements: {
    latestAnnouncement: ReturnType<typeof useChatRoom>["latestMessage"];
    previousAnnouncement: ReturnType<typeof useChatRoom>["latestMessage"];
    thirdAnnouncement: ReturnType<typeof useChatRoom>["latestMessage"];
    latestAnnouncementColor: string;
    previousAnnouncementColor: string;
    thirdAnnouncementColor: string;
    animateAnnouncement: boolean;
  };
  actions: {
    onPlayCard: (card: ICard, cardIdx: number) => void;
    sayCommand: ReturnType<typeof useMatch>[1]["sayCommand"];
    pauseMatch: ReturnType<typeof useMatch>[1]["pauseMatch"];
    setRulesOpen: (open: boolean) => void;
    setAbandonOpen: (open: boolean) => void;
  };
};

const MatchGameplayContext = createContext<MatchGameplayContextValue | null>(null);

export const MatchGameplayProvider = ({
  state,
  score,
  seat,
  announcements,
  actions,
  children,
}: MatchGameplayContextValue & {
  children: ReactNode;
}) => (
  <MatchGameplayContext.Provider value={{ state, score, seat, announcements, actions }}>
    {children}
  </MatchGameplayContext.Provider>
);

export const useMatchGameplay = () => {
  const value = useContext(MatchGameplayContext);

  if (!value) {
    throw new Error("useMatchGameplay must be used within a MatchGameplayProvider");
  }

  return value;
};
