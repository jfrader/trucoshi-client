import { screen } from "@testing-library/react";
import { TrucoBoardLayout, buildAlternatingSlots } from "./TrucoBoardLayout";
import { BoardLayoutProvider } from "../../board";
import { renderWithTheme } from "../../test/renderWithTheme";
import { buildPlayers } from "../../test/fixtures/gameFixtures";

describe("TrucoBoardLayout visual guard", () => {
  it("renders shared board shell with seat population", () => {
    const players = buildPlayers(6);
    const slots = buildAlternatingSlots(players, 6);
    const { container } = renderWithTheme(
      <BoardLayoutProvider surface="lobby" totalSeats={slots.length}>
        <TrucoBoardLayout
          slots={slots}
          topContent={<div data-testid="board-top">Top</div>}
          centerContent={<div data-testid="board-center">Center</div>}
          renderSeat={(slot) => <div data-testid="board-seat">{slot.player?.name || "empty"}</div>}
        />
      </BoardLayoutProvider>
    );

    expect(screen.getByTestId("board-top")).toBeInTheDocument();
    expect(screen.getByTestId("board-center")).toBeInTheDocument();
    expect(screen.getAllByTestId("board-seat")).toHaveLength(6);
    expect(container.querySelector("[data-truco-board-surface='true']")).toBeInTheDocument();
    expect(container.firstChild).toMatchSnapshot();
  });
});
