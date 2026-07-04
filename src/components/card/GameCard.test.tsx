import { fireEvent, screen } from "@testing-library/react";
import { BURNT_CARD } from "trucoshi";
import { renderWithTheme } from "../../test/renderWithTheme";
import { FlipGameCard, GameCard } from "./GameCard";
import {
  markCardImageSourceReadyForTest,
  resetCardImageCacheForTest,
} from "../../trucoshi/cards/cardImageLoader";
import { resolveDefaultCardImage, resolveSkinImage } from "../../trucoshi/cards/cardSkinResolver";

const mocks = vi.hoisted(() => ({
  inspectCard: vi.fn(),
  state: {
    cardDisplayMode: "skins",
    cardDisplayImagesReady: true,
  },
}));

vi.mock("../../trucoshi/hooks/useTrucoshi", () => ({
  useTrucoshi: () => [mocks.state, { inspectCard: mocks.inspectCard }],
}));

describe("GameCard inspection", () => {
  beforeEach(() => {
    mocks.inspectCard.mockClear();
    mocks.state.cardDisplayMode = "skins";
    mocks.state.cardDisplayImagesReady = true;
    resetCardImageCacheForTest();
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

  it("does not render an undecoded image source", () => {
    renderWithTheme(<GameCard card="1e" cardSkinId="argentino/1e_argentino_001" />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("uses a decoded fallback skin while the primary skin is pending", () => {
    const fallbackSource = resolveSkinImage("argentino/1e_argentino_002");
    markCardImageSourceReadyForTest(fallbackSource);
    markCardImageSourceReadyForTest(resolveDefaultCardImage("1e"));

    renderWithTheme(
      <GameCard
        card="1e"
        cardSkinId="argentino/1e_argentino_001"
        fallbackCardSkinId="argentino/1e_argentino_002"
      />,
    );

    expect(screen.getByRole("img")).toHaveAttribute("src", fallbackSource);

    fireEvent.contextMenu(screen.getByRole("button"));
    expect(mocks.inspectCard).toHaveBeenCalledWith(
      expect.objectContaining({
        cardSkinId: "argentino/1e_argentino_001",
      }),
    );
  });

  it("keeps inherited display-mode cards as emoji until the app deck preload is ready", () => {
    const skinSource = resolveSkinImage("argentino/1e_argentino_001");
    markCardImageSourceReadyForTest(skinSource);
    markCardImageSourceReadyForTest(resolveDefaultCardImage("1e"));
    mocks.state.cardDisplayImagesReady = false;

    const { rerender } = renderWithTheme(
      <GameCard card="1e" cardSkinId="argentino/1e_argentino_001" />,
    );

    expect(screen.queryByRole("img")).not.toBeInTheDocument();

    mocks.state.cardDisplayImagesReady = true;
    rerender(<GameCard card="1e" cardSkinId="argentino/1e_argentino_001" width="4.5em" />);

    expect(screen.getByRole("img")).toHaveAttribute("src", skinSource);
  });

  it("inspects a known flipped backside as the known card and opens the inspector face-down", () => {
    renderWithTheme(
      <FlipGameCard flip card="1e" cardSkinId="argentino/1e_argentino_001" />,
    );

    fireEvent.contextMenu(screen.getAllByRole("button")[1]);

    expect(mocks.inspectCard).toHaveBeenCalledWith(
      expect.objectContaining({
        card: "1e",
        cardSkinId: "argentino/1e_argentino_001",
        flip: true,
      }),
    );
  });

  it("inspects an unknown flipped backside as a back on both sides", () => {
    renderWithTheme(<FlipGameCard flip card={BURNT_CARD} />);

    fireEvent.contextMenu(screen.getAllByRole("button")[1]);

    expect(mocks.inspectCard).toHaveBeenCalledWith(
      expect.objectContaining({
        card: BURNT_CARD,
        cardSkinId: undefined,
        flip: true,
      }),
    );
  });
});
