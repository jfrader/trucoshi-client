import { fireEvent, screen } from "@testing-library/react";
import { renderWithTheme } from "../../test/renderWithTheme";
import { GameCard } from "./GameCard";

const mocks = vi.hoisted(() => ({
  inspectCard: vi.fn(),
  state: {
    cardDisplayMode: "skins",
    cardTheme: "",
    cards: {},
    cardsReady: true,
  },
}));

vi.mock("../../trucoshi/hooks/useTrucoshi", () => ({
  useTrucoshi: () => [mocks.state, { inspectCard: mocks.inspectCard }],
}));

describe("GameCard inspection", () => {
  beforeEach(() => {
    mocks.inspectCard.mockClear();
    mocks.state.cardDisplayMode = "skins";
  });

  it("inspects with an explicit card skin id", () => {
    renderWithTheme(<GameCard card="1e" cardSkinId="argentino/1e_argentino_001" />);

    fireEvent.contextMenu(screen.getByRole("button"));

    expect(mocks.inspectCard).toHaveBeenCalledWith(
      expect.objectContaining({
        card: "1e",
        cardSkinId: "argentino/1e_argentino_001",
      }),
    );
  });

  it("inspects with a skin id derived from cardSkinByCard", () => {
    renderWithTheme(
      <GameCard
        card="1e"
        cardSkinByCard={{
          "1e": "argentino/1e_argentino_002",
        }}
      />,
    );

    fireEvent.contextMenu(screen.getByRole("button"));

    expect(mocks.inspectCard).toHaveBeenCalledWith(
      expect.objectContaining({
        card: "1e",
        cardSkinId: "argentino/1e_argentino_002",
      }),
    );
  });
});
