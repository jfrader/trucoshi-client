import { fireEvent } from "@testing-library/react";
import { BURNT_CARD, CARDS_HUMAN_READABLE, ICard } from "trucoshi";
import { renderWithTheme } from "../../test/renderWithTheme";
import { CardTheme } from "../../trucoshi/cardThemes";
import { GameCard } from "./GameCard";
import {
  markCardImageSourceReadyForTest,
  resetCardImageCacheForTest,
} from "../../trucoshi/cardImageLoader";

const inspectCard = vi.fn();
let cardTheme: CardTheme = "default";

vi.mock("../../trucoshi/hooks/useTrucoshi", () => ({
  useTrucoshi: () => [{ cardTheme }, { inspectCard }],
}));

describe("GameCard fixed public themes", () => {
  beforeEach(() => {
    inspectCard.mockClear();
    cardTheme = "default";
    resetCardImageCacheForTest();
  });

  it.each(["default", "gnu"] as CardTheme[])(
    "renders the %s bitmap from the fixed public directory",
    (theme) => {
      cardTheme = theme;
      const card = "1e" as ICard;
      markCardImageSourceReadyForTest(`/cards/${theme}/${card}.png`);
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
    markCardImageSourceReadyForTest("/cards/gnu/xx.png");
    const { container } = renderWithTheme(
      <GameCard card={BURNT_CARD} theme="gnu" />,
    );

    expect(container.querySelector("img")?.getAttribute("src")).toBe(
      "/cards/gnu/xx.png",
    );
  });

  it("keeps a stable Emoji placeholder while a bitmap is loading", () => {
    cardTheme = "gnu";
    const card = "1e" as ICard;
    const { container } = renderWithTheme(<GameCard card={card} />);

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
