import { screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { EMatchState } from "trucoshi";
import { LobbySeatCard } from "./LobbySeatCard";
import { BoardLayoutProvider } from "../../board";
import { renderWithTheme } from "../../test/renderWithTheme";
import { buildMatch, buildPlayer } from "../../test/fixtures/gameFixtures";
import { LobbyGameplayProvider } from "./LobbyGameplayContext";

vi.mock("../../shared/UserAvatar", () => ({
  UserAvatar: ({ account }: { account: { name: string } }) => (
    <div data-testid="user-avatar">{account.name}</div>
  ),
}));

vi.mock("../card/GameCard", () => ({
  GameCard: ({ card }: { card: string }) => <div data-testid="game-card">{card}</div>,
}));

describe("LobbySeatCard visual guard", () => {
  const renderSeat = ({
    match,
    slot,
  }: {
    match: ReturnType<typeof buildMatch>;
    slot: ComponentProps<typeof LobbySeatCard>["slot"];
  }) =>
    renderWithTheme(
      <BoardLayoutProvider surface="lobby" totalSeats={2}>
        <LobbyGameplayProvider
          state={{
            match,
            chatProps: {} as any,
            slots: [],
            isDesktopChat: false,
            account: null,
            isReadyLoading: false,
            sessionId: "test",
          }}
          actions={{
            onJoinMatch: vi.fn(),
            onAddBot: vi.fn(),
            onSetReady: vi.fn(),
            onSetUnReady: vi.fn(),
            onStartMatch: vi.fn(),
            onOpenOptions: vi.fn(),
            kickPlayer: vi.fn(),
          }}
        >
          <LobbySeatCard slot={slot} />
        </LobbyGameplayProvider>
      </BoardLayoutProvider>
    );

  it("renders empty seat join state", () => {
    const match = buildMatch({ players: [buildPlayer({ key: "p1", teamIdx: 0, isMe: true })] });
    const { container } = renderSeat({
      match,
      slot: { key: "empty-1", teamIdx: 1, player: null },
    });

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
    const { container } = renderSeat({
      match,
      slot: { key: teammate.key, teamIdx: teammate.teamIdx, player: teammate },
    });

    expect(screen.getAllByText(teammate.name).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /quitar/i })).toBeInTheDocument();
    expect(container.firstChild).toMatchSnapshot();
  });
});
