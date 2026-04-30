import { screen } from "@testing-library/react";
import { EMatchState } from "trucoshi";
import { LobbySeatCard } from "./LobbySeatCard";
import { BoardLayoutProvider } from "../../board";
import { renderWithTheme } from "../../test/renderWithTheme";
import { buildMatch, buildPlayer } from "../../test/fixtures/gameFixtures";

vi.mock("../../shared/UserAvatar", () => ({
  UserAvatar: ({ account }: { account: { name: string } }) => (
    <div data-testid="user-avatar">{account.name}</div>
  ),
}));

vi.mock("../card/GameCard", () => ({
  GameCard: ({ card }: { card: string }) => <div data-testid="game-card">{card}</div>,
}));

describe("LobbySeatCard visual guard", () => {
  const actionProps = {
    isReadyLoading: false,
    onJoinMatch: vi.fn(),
    onAddBot: vi.fn(),
    onSetReady: vi.fn(),
    onSetUnReady: vi.fn(),
    onKickPlayer: vi.fn(),
  };

  it("renders empty seat join state", () => {
    const match = buildMatch({ players: [buildPlayer({ key: "p1", teamIdx: 0, isMe: true })] });
    const { container } = renderWithTheme(
      <BoardLayoutProvider surface="lobby" totalSeats={2}>
        <LobbySeatCard
          slot={{ key: "empty-1", teamIdx: 1, player: null }}
          match={match}
          account={null}
          {...actionProps}
        />
      </BoardLayoutProvider>
    );

    expect(screen.getByRole("button", { name: /unirse/i })).toBeInTheDocument();
    expect(container.firstChild).toMatchSnapshot();
  });

  it("renders occupied seat with owner controls", () => {
    const me = buildPlayer({ key: "p1", teamIdx: 0, isMe: true, isOwner: true, ready: true });
    const teammate = buildPlayer({ key: "p2", teamIdx: 1, ready: false });
    const match = buildMatch({
      players: [me, teammate],
      state: EMatchState.READY,
    });
    const { container } = renderWithTheme(
      <BoardLayoutProvider surface="lobby" totalSeats={2}>
        <LobbySeatCard
          slot={{ key: teammate.key, teamIdx: teammate.teamIdx, player: teammate }}
          match={match}
          account={null}
          {...actionProps}
        />
      </BoardLayoutProvider>
    );

    expect(screen.getAllByText(teammate.name).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /quitar/i })).toBeInTheDocument();
    expect(container.firstChild).toMatchSnapshot();
  });
});
