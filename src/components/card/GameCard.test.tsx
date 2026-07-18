import { fireEvent } from "@testing-library/react";
import { BURNT_CARD, CARDS_HUMAN_READABLE, ICard } from "trucoshi";
import { renderWithTheme } from "../../test/renderWithTheme";
import { CardTheme } from "../../trucoshi/cardThemes";
import { GameCard } from "./GameCard";

const inspectCard = vi.fn();
let cardTheme: CardTheme = "default";

vi.mock("../../trucoshi/hooks/useTrucoshi", () => ({
  useTrucoshi: () => [{ cardTheme }, { inspectCard }],
}));

describe("GameCard fixed public themes", () => {
  beforeEach(() => {
    inspectCard.mockClear();
    cardTheme = "default";
  });

  it.each(["default", "gnu"] as CardTheme[])(
    "renders the %s bitmap from the fixed public directory",
    (theme) => {
      cardTheme = theme;
      const card = "1e" as ICard;
      const { container } = renderWithTheme(<GameCard card={card} />);
      const image = container.querySelector("img");

      expect(image).not.toBeNull();
      expect(image?.getAttribute("src")).toBe(`/cards/${theme}/${card}.png`);
      expect(container.firstChild).toHaveAttribute("data-card-theme", theme);
    },
  );

  it("renders Emoji without a bitmap image", () => {
    cardTheme = "emoji";
    const card = "1e" as ICard;
    const { container } = renderWithTheme(<GameCard card={card} />);

    expect(container.querySelector("img")).toBeNull();
    expect(container).toHaveTextContent(CARDS_HUMAN_READABLE[card]);
    expect(container.firstChild).toHaveAttribute("data-card-theme", "emoji");
  });

  it("supports a fixed-theme preview without changing the global theme", () => {
    cardTheme = "emoji";
    const { container } = renderWithTheme(
      <GameCard card={BURNT_CARD} theme="gnu" />,
    );

    expect(container.querySelector("img")?.getAttribute("src")).toBe(
      "/cards/gnu/xx.png",
    );
  });

  it("falls back to the Emoji renderer if a reviewed bitmap cannot load", () => {
    cardTheme = "gnu";
    const card = "1e" as ICard;
    const { container } = renderWithTheme(<GameCard card={card} />);

    fireEvent.error(container.querySelector("img") as HTMLImageElement);

    expect(container.querySelector("img")).toBeNull();
    expect(container).toHaveTextContent(CARDS_HUMAN_READABLE[card]);
  });

  it("keeps card inspection behavior", () => {
    const card = "1e" as ICard;
    const { getByRole } = renderWithTheme(<GameCard card={card} />);

    fireEvent.doubleClick(getByRole("button"));

    expect(inspectCard).toHaveBeenCalledWith(card);
  });
});
