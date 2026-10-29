import { screen } from "@testing-library/react";
import { EEnvidoCommand, ESayCommand, ETrucoCommand } from "trucoshi";
import { BoardLayoutContext, buildBoardLayoutModel, LOBBY_RADIAL_MIN_WIDTH } from "../../board";
import { renderWithTheme } from "../../test/renderWithTheme";
import { buildPlayer } from "../../test/fixtures/gameFixtures";
import { buildAlternatingSlots, TrucoBoardLayout } from "./TrucoBoardLayout";
import { CommandBar } from "./CommandBar";

describe("responsive game controls", () => {
  for (const width of [320, 600, 767, 768, 769, 1440]) {
    it(`uses non-overlapping lobby flow at ${width}px`, () => {
      const layout = buildBoardLayoutModel({
        surface: "lobby", totalSeats: 6,
        viewport: { width, height: 800, aspectRatio: width / 800 },
      });
      const { container } = renderWithTheme(
        <BoardLayoutContext.Provider value={layout}>
          <TrucoBoardLayout
            slots={buildAlternatingSlots([], 6)}
            centerContent={<div>Rules</div>}
            renderSeat={(_, i) => <button>Seat {i}</button>}
          />
        </BoardLayoutContext.Provider>,
      );
      expect(screen.getAllByRole("button")).toHaveLength(6);
      for (const seat of container.querySelectorAll<HTMLElement>("[data-slot-team]")) {
        expect(getComputedStyle(seat).position).toBe(width < LOBBY_RADIAL_MIN_WIDTH ? "relative" : "absolute");
        expect(seat.style.left === "").toBe(width < LOBBY_RADIAL_MIN_WIDTH);
      }
    });
  }

  it("wraps commands instead of forcing a horizontally scrolling row", () => {
    renderWithTheme(<CommandBar canSay onSayCommand={vi.fn()} player={buildPlayer({
      key: "p1", teamIdx: 0, isMe: true,
      commands: [EEnvidoCommand.FALTA_ENVIDO, EEnvidoCommand.REAL_ENVIDO,
        EEnvidoCommand.ENVIDO, ETrucoCommand.TRUCO, ESayCommand.MAZO],
    })} />);
    const row = screen.getByRole("button", { name: "Mazo" }).parentElement!;
    expect(getComputedStyle(row).flexWrap).toBe("wrap");
    expect(getComputedStyle(row).width).toBe("100%");
  });
});
