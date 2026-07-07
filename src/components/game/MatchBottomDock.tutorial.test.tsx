import { fireEvent, screen, waitFor } from "@testing-library/react";
import type { ComponentProps } from "react";
import { ETrucoCommand, ICard, IChatMessage, IPublicChatRoom } from "trucoshi";
import { BoardLayoutProvider, MatchStateProvider } from "../../board";
import { buildMatch, buildPlayer, buildSlots } from "../../test/fixtures/gameFixtures";
import { renderWithTheme } from "../../test/renderWithTheme";
import { MatchBottomDock } from "./MatchBottomDock";
import { MatchGameplayProvider } from "./MatchGameplayContext";

vi.mock("../card/GameCard", () => ({
  GameCard: ({
    card,
    disabledMask,
    onClick,
  }: {
    card: string;
    disabledMask?: boolean;
    onClick?: () => void;
  }) => (
    <button type="button" data-testid="game-card" disabled={disabledMask} onClick={onClick}>
      {card}
    </button>
  ),
}));

vi.mock("../chat/ChatRoom", () => ({
  getMessageContent: (message: { content?: string; message?: string }) =>
    message.content || message.message || "",
}));

const buildRoom = (messages: IChatMessage[]): IPublicChatRoom =>
  ({
    id: "room",
    messages,
  }) as IPublicChatRoom;

const buildChat = ({
  id,
  tutorial,
  content = "Mensaje nuevo",
}: {
  id: string;
  tutorial?: boolean;
  content?: string;
}): IChatMessage =>
  ({
    id,
    date: Date.now(),
    user: { key: "bot", name: "Profe Truco" },
    content,
    sound: false,
    tutorial,
  }) as IChatMessage;

const defaultAnnouncements: ComponentProps<typeof MatchGameplayProvider>["announcements"] = {
  latestAnnouncement: null,
  previousAnnouncement: null,
  thirdAnnouncement: null,
  latestAnnouncementColor: "grey.100",
  previousAnnouncementColor: "grey.400",
  thirdAnnouncementColor: "grey.500",
  animateAnnouncement: false,
};

const DockHarness = ({
  room,
  active = false,
  setActive,
  canSay = false,
  hasCommandActions = false,
  canInteractWithHand = false,
  tutorialInputLocked = false,
  onPlayCard = vi.fn(),
  sayCommand = vi.fn(),
}: {
  room: IPublicChatRoom;
  active?: boolean;
  setActive: (active: boolean) => void;
  canSay?: boolean;
  hasCommandActions?: boolean;
  canInteractWithHand?: boolean;
  tutorialInputLocked?: boolean;
  onPlayCard?: (card: ICard, cardIdx: number) => void;
  sayCommand?: (command: ETrucoCommand) => void;
}) => {
  const me = buildPlayer({
    key: "p1",
    teamIdx: 0,
    isMe: true,
    isTurn: true,
    hand: ["1e", "7o", "3c"],
    commands: [ETrucoCommand.TRUCO],
  });
  const match = {
    ...buildMatch({ players: [me], maxPlayers: 2 }),
    tutorial: {
      id: "basic-truco-v1",
      title: "Aprende a jugar",
      botKey: "bot",
      inputLocked: tutorialInputLocked,
    },
  } as ReturnType<typeof buildMatch>;
  const slots = buildSlots([me], 2);

  return (
    <BoardLayoutProvider surface="match" totalSeats={2}>
      <MatchStateProvider match={match}>
        <MatchGameplayProvider
          state={{
            match,
            chatProps: {
              active,
              setActive,
              latestMessage: null,
              useChatState: [room, vi.fn(), false, null],
            } as any,
            slots,
            rounds: [],
            isDesktopChat: false,
            canSay,
            pauseRequested: false,
            me,
            serverAheadTime: 0,
            hasCommandActions,
            canInteractWithHand,
          }}
          score={{
            myTeamIdx: 0,
            myTeamPoints: 1,
            myTeamPointsLabel: "Malas",
            opponentTeamPoints: 0,
            opponentTeamPointsLabel: "Malas",
          }}
          seat={{
            bottomLeaderSeatIndex: 0,
            frontLeaderSeatIndex: 1,
          }}
          announcements={defaultAnnouncements}
          actions={{
            onPlayCard,
            sayCommand,
            pauseMatch: vi.fn(),
            setRulesOpen: vi.fn(),
            setAbandonOpen: vi.fn(),
          }}
        >
          <MatchBottomDock />
        </MatchGameplayProvider>
      </MatchStateProvider>
    </BoardLayoutProvider>
  );
};

describe("MatchBottomDock tutorial chat polish", () => {
  it("shows and clears the mobile unread dot for tutorial chat", async () => {
    const setActive = vi.fn();
    const firstMessage = buildChat({ id: "m1", tutorial: true });
    const secondMessage = buildChat({ id: "m2", tutorial: true });
    const { rerender } = renderWithTheme(
      <DockHarness room={buildRoom([firstMessage])} setActive={setActive} />,
    );

    expect(screen.queryByTestId("mobile-chat-unread-dot")).not.toBeInTheDocument();

    rerender(
      <DockHarness room={buildRoom([firstMessage, secondMessage])} setActive={setActive} />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("mobile-chat-unread-dot")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /abrir chat/i }));

    expect(setActive).toHaveBeenCalledWith(true);
    expect(screen.queryByTestId("mobile-chat-unread-dot")).not.toBeInTheDocument();
  });

  it("keeps tutorial actions disabled while the decision is locked", () => {
    const onPlayCard = vi.fn();
    const sayCommand = vi.fn();

    renderWithTheme(
      <DockHarness
        room={buildRoom([buildChat({ id: "t1", tutorial: true })])}
        setActive={vi.fn()}
        canSay
        hasCommandActions={false}
        canInteractWithHand={false}
        tutorialInputLocked
        onPlayCard={onPlayCard}
        sayCommand={sayCommand}
      />,
    );

    expect(screen.queryByRole("button", { name: /truco/i })).not.toBeInTheDocument();

    const [firstCard] = screen.getAllByTestId("game-card");
    fireEvent.click(firstCard);

    expect(onPlayCard).not.toHaveBeenCalled();
    expect(sayCommand).not.toHaveBeenCalled();
  });

  it("allows the current tutorial action while the tutorial bubble can still be visible", () => {
    const onPlayCard = vi.fn();
    const sayCommand = vi.fn();

    renderWithTheme(
      <DockHarness
        room={buildRoom([buildChat({ id: "t1", tutorial: true })])}
        setActive={vi.fn()}
        canSay
        hasCommandActions
        canInteractWithHand
        onPlayCard={onPlayCard}
        sayCommand={sayCommand}
      />,
    );

    fireEvent.click(screen.getAllByTestId("game-card")[0]);
    fireEvent.click(screen.getByRole("button", { name: /truco/i }));

    expect(onPlayCard).toHaveBeenCalledWith("1e", 0);
    expect(sayCommand).toHaveBeenCalledWith(ETrucoCommand.TRUCO);
  });
});
