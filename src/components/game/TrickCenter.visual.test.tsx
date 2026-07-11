import { screen } from "@testing-library/react";
import { ICard, IPlayedCard, IPublicMatch } from "trucoshi";
import { TrickCenter } from "./TrickCenter";
import { BoardLayoutProvider } from "../../board";
import { renderWithTheme } from "../../test/renderWithTheme";
import { buildMatch, buildPlayers, buildRounds, buildSlots } from "../../test/fixtures/gameFixtures";
import { MatchGameplayProvider } from "./MatchGameplayContext";

vi.mock("../card/GameCard", () => ({
  GameCard: ({ card }: { card: string }) => <div data-testid="trick-card">{card}</div>,
}));

const renderCenter = (match: IPublicMatch, rounds: IPlayedCard[][]) => {
  const players = match.players;

  return renderWithTheme(
    <BoardLayoutProvider surface="match" totalSeats={players.length}>
      <MatchGameplayProvider
        state={{
          match,
          chatProps: {} as any,
          slots: buildSlots(players),
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
          frontLeaderSeatIndex: Math.floor(players.length / 2),
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
    </BoardLayoutProvider>,
  );
};

describe("TrickCenter visual guard", () => {
  it("keeps all played cards visible across three rounds", () => {
    const players = buildPlayers(4);
    const match = buildMatch({ players });
    const rounds = buildRounds(players);
    const { container } = renderCenter(match, rounds);

    expect(screen.getAllByTestId("trick-card")).toHaveLength(12);
    expect(container.firstChild).toMatchSnapshot();
  });

  it("reveals the unplayed cards used by the previous hand envido winner", () => {
    const players = buildPlayers(2).map((player, idx) => ({ ...player, idx }));
    const rounds: IPlayedCard[][] = [
      [
        {
          key: "played-p1-1e",
          player: players[0],
          card: "1e" as ICard,
        },
      ],
    ];
    const match = {
      ...buildMatch({ players, maxPlayers: 2 }),
      matchSessionId: "envido-reveal",
      florBattle: null,
      previousHand: {
        matchSessionId: "envido-reveal",
        rounds,
        points: { 0: 2, 1: 0 },
        flor: null,
        envido: {
          winner: players[0],
          data: { value: 28, cards: ["1e", "7e"] as ICard[] },
        },
      },
    } as IPublicMatch;

    renderCenter(match, rounds);

    expect(screen.getAllByTestId("trick-card")).toHaveLength(2);
    expect(screen.getByText("1e")).toBeInTheDocument();
    expect(screen.getByText("7e")).toBeInTheDocument();
  });

  it("reveals every flor card left unplayed when the previous hand ends", () => {
    const players = buildPlayers(2).map((player, idx) => ({
      ...player,
      idx,
      hasSaidFlor: idx === 0,
    }));
    const rounds: IPlayedCard[][] = [
      [
        {
          key: "played-p1-1c",
          player: players[0],
          card: "1c" as ICard,
        },
      ],
    ];
    const match = {
      ...buildMatch({ players, maxPlayers: 2 }),
      matchSessionId: "flor-reveal",
      florBattle: null,
      previousHand: {
        matchSessionId: "flor-reveal",
        rounds,
        points: { 0: 3, 1: 0 },
        envido: null,
        flor: {
          winner: players[0],
          data: [{ idx: players[0].idx, value: 26, cards: ["1c", "2c", "3c"] as ICard[] }],
        },
      },
    } as IPublicMatch;

    renderCenter(match, rounds);

    expect(screen.getAllByTestId("trick-card")).toHaveLength(3);
    expect(screen.getByText("1c")).toBeInTheDocument();
    expect(screen.getByText("2c")).toBeInTheDocument();
    expect(screen.getByText("3c")).toBeInTheDocument();
  });
});
