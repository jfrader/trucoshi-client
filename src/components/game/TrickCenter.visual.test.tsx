import { screen } from "@testing-library/react";
import { TrickCenter } from "./TrickCenter";
import { BoardLayoutProvider } from "../../board";
import { renderWithTheme } from "../../test/renderWithTheme";
import { buildPlayers, buildRounds, buildSlots } from "../../test/fixtures/gameFixtures";

vi.mock("../card/GameCard", () => ({
  GameCard: ({ card }: { card: string }) => <div data-testid="trick-card">{card}</div>,
}));

describe("TrickCenter visual guard", () => {
  it("keeps all played cards visible across three rounds", () => {
    const players = buildPlayers(4);
    const rounds = buildRounds(players);
    const slots = buildSlots(players);
    const { container } = renderWithTheme(
      <BoardLayoutProvider surface="match" totalSeats={players.length}>
        <TrickCenter rounds={rounds} slots={slots} />
      </BoardLayoutProvider>
    );

    expect(screen.getAllByTestId("trick-card")).toHaveLength(12);
    expect(container.firstChild).toMatchSnapshot();
  });
});
