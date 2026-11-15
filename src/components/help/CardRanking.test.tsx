import { fireEvent, screen } from "@testing-library/react";
import { CARDS, CARDS_HUMAN_READABLE } from "trucoshi";
import { renderWithTheme } from "../../test/renderWithTheme";
import { CardRanking } from "./CardRanking";

const inspectCard = vi.fn();
vi.mock("../../trucoshi/hooks/useTrucoshi", () => ({
  useTrucoshi: () => [{ cardTheme: "emoji" }, { inspectCard }],
}));

describe("visual card ranking", () => {
  it.each([true, false])(
    "keeps all 40 cards accessible with constant adjacent overlap (compact=%s)",
    (compact) => {
      renderWithTheme(<CardRanking compact={compact} />);
      const buttons = screen.getAllByRole("button");
      const byLabel = new Map(buttons.map((button) => [button.getAttribute("aria-label"), button]));
      expect(buttons).toHaveLength(40);
      expect(byLabel.size).toBe(40);
      for (const card of Object.keys(CARDS) as Array<keyof typeof CARDS>) {
        const button = byLabel.get(CARDS_HUMAN_READABLE[card]);
        expect(button).toBeDefined();
        fireEvent.click(button!);
        expect(inspectCard).toHaveBeenLastCalledWith(card);
      }
      for (const rank of ["3", "2"]) {
        const cards = (Object.keys(CARDS) as Array<keyof typeof CARDS>)
          .filter((card) => card.startsWith(rank))
          .map((card) => byLabel.get(CARDS_HUMAN_READABLE[card])!);
        expect(cards).toHaveLength(4);
        expect(cards.map((card) => getComputedStyle(card.parentElement!).marginLeft)).toEqual([
          "0px",
          ...Array(3).fill(compact ? "-1.9em" : "-1.2em"),
        ]);
      }
    },
  );
});
