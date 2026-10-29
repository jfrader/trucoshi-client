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
    expect(screen.getByTestId("board-top").parentElement).toHaveStyle({
      transform: "translateY(calc(0px - 0.5rem))",
    });
    expect(screen.getByTestId("board-center")).toBeInTheDocument();
    expect(screen.getAllByTestId("board-seat")).toHaveLength(6);
    expect(container.querySelector("[data-truco-board-surface='true']")).toBeInTheDocument();
    expect(container.firstChild).toMatchSnapshot();
  });

  it("can lift match center content above seats without blocking the table", () => {
    const players = buildPlayers(2);
    const slots = buildAlternatingSlots(players, 2);

    renderWithTheme(
      <BoardLayoutProvider surface="match" totalSeats={slots.length}>
        <TrucoBoardLayout
          slots={slots}
          centerLayer="foreground"
          centerContent={<div data-testid="foreground-center">Center</div>}
          renderSeat={(slot) => <div data-testid="foreground-seat">{slot.player?.name}</div>}
        />
      </BoardLayoutProvider>,
    );

    const centerLayer = screen.getByTestId("foreground-center").parentElement;
    const seatLayer = screen.getAllByTestId("foreground-seat")[0].parentElement;

    expect(centerLayer).not.toBeNull();
    expect(seatLayer).not.toBeNull();
    expect(Number(window.getComputedStyle(centerLayer!).zIndex)).toBeGreaterThan(
      Number(window.getComputedStyle(seatLayer!).zIndex),
    );
    expect(centerLayer).toHaveStyle({ pointerEvents: "none" });
  });
});
