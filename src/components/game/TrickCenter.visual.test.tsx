import { screen } from "@testing-library/react";
import { TrickCenter } from "./TrickCenter";
import { BoardLayoutProvider } from "../../board";
import { renderWithTheme } from "../../test/renderWithTheme";
import { buildMatch, buildPlayers, buildRounds, buildSlots } from "../../test/fixtures/gameFixtures";
import { MatchGameplayProvider } from "./MatchGameplayContext";

vi.mock("../card/GameCard", () => ({
  GameCard: ({ card }: { card: string }) => <div data-testid="trick-card">{card}</div>,
}));

describe("TrickCenter visual guard", () => {
  it("keeps all played cards visible across three rounds", () => {
    const players = buildPlayers(4);
    const match = buildMatch({ players });
    const rounds = buildRounds(players);
    const slots = buildSlots(players);
    const { container } = renderWithTheme(
      <BoardLayoutProvider surface="match" totalSeats={players.length}>
        <MatchGameplayProvider
          state={{
            match,
            chatProps: {} as any,
            slots,
            rounds,
            isDesktopChat: false,
            canSay: false,
            pauseRequested: false,
            me: match.me,
            serverAheadTime: 0,
            hasCommandActions: false,
            canInteractWithHand: false,
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
            frontLeaderSeatIndex: 2,
          }}
          announcements={{
            latestAnnouncement: null,
            previousAnnouncement: null,
            thirdAnnouncement: null,
            latestAnnouncementColor: "grey.100",
            previousAnnouncementColor: "grey.400",
            thirdAnnouncementColor: "grey.500",
            animateAnnouncement: false,
          }}
          actions={{
            onPlayCard: vi.fn(),
            sayCommand: vi.fn(),
            pauseMatch: vi.fn(),
            setRulesOpen: vi.fn(),
            setAbandonOpen: vi.fn(),
          }}
        >
          <TrickCenter />
        </MatchGameplayProvider>
      </BoardLayoutProvider>
    );

    expect(screen.getAllByTestId("trick-card")).toHaveLength(12);
    expect(container.firstChild).toMatchSnapshot();
  });
});
