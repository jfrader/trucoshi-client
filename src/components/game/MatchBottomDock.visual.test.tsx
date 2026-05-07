import { screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { ETrucoCommand } from "trucoshi";
import { MatchBottomDock } from "./MatchBottomDock";
import { BoardLayoutProvider, MatchStateProvider } from "../../board";
import { renderWithTheme } from "../../test/renderWithTheme";
import { buildAnnouncements, buildMatch, buildPlayer, buildSlots } from "../../test/fixtures/gameFixtures";
import { MatchGameplayProvider } from "./MatchGameplayContext";

vi.mock("../card/GameCard", () => ({
  GameCard: ({ card }: { card: string }) => <div data-testid="game-card">{card}</div>,
}));

vi.mock("../chat/ChatRoom", () => ({
  getMessageContent: (message: { message?: string }) => message.message || "",
}));

describe("MatchBottomDock visual guard", () => {
  const renderDock = ({
    me,
    announcements = {
      latestAnnouncement: null,
      previousAnnouncement: null,
      thirdAnnouncement: null,
      latestAnnouncementColor: "grey.100",
      previousAnnouncementColor: "grey.400",
      thirdAnnouncementColor: "grey.500",
      animateAnnouncement: false,
    },
    canSay = false,
    hasCommandActions = false,
    canInteractWithHand = false,
  }: {
    me: ReturnType<typeof buildPlayer> | null;
    announcements?: ComponentProps<typeof MatchGameplayProvider>["announcements"];
    canSay?: boolean;
    hasCommandActions?: boolean;
    canInteractWithHand?: boolean;
  }) => {
    const players = me ? [me] : [];
    const match = buildMatch({ players: players.length ? players : undefined, maxPlayers: 2 });
    const slots = buildSlots(players, 2);

    return renderWithTheme(
      <BoardLayoutProvider surface="match" totalSeats={2}>
        <MatchStateProvider match={match}>
          <MatchGameplayProvider
            state={{
              match,
              chatProps: { setActive: vi.fn(), latestMessage: null, useChatState: [{}] } as any,
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
              myTeamPoints: 12,
              myTeamPointsLabel: "Malas",
              opponentTeamPoints: 9,
              opponentTeamPointsLabel: "Malas",
            }}
            seat={{
              bottomLeaderSeatIndex: 0,
              frontLeaderSeatIndex: 1,
            }}
            announcements={announcements}
            actions={{
              onPlayCard: vi.fn(),
              sayCommand: vi.fn(),
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

  it("renders announcements, hand cards and command lane", () => {
    const me = buildPlayer({
      key: "p1",
      teamIdx: 0,
      isMe: true,
      isTurn: true,
      commands: [ETrucoCommand.TRUCO],
      hand: ["1e", "7o", "3c"],
    });
    const sourceAnnouncements = buildAnnouncements();
    const { container } = renderDock({
      me,
      announcements: {
        latestAnnouncement: sourceAnnouncements.latest,
        previousAnnouncement: sourceAnnouncements.previous,
        thirdAnnouncement: sourceAnnouncements.third,
        latestAnnouncementColor: "warning.light",
        previousAnnouncementColor: "grey.300",
        thirdAnnouncementColor: "grey.400",
        animateAnnouncement: false,
      },
      canSay: true,
      hasCommandActions: true,
      canInteractWithHand: true,
    });

    expect(screen.getByRole("button", { name: /abrir chat/i })).toBeInTheDocument();
    expect(screen.getAllByTestId("game-card")).toHaveLength(3);
    expect(screen.getByRole("button", { name: /truco/i })).toBeInTheDocument();
    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders spectator waiting mode with hidden hand placeholders", () => {
    const { container } = renderDock({ me: null });

    expect(screen.getByText("Modo Espectador")).toBeInTheDocument();
    expect(container.firstChild).toMatchSnapshot();
  });
});
