import { act, screen } from "@testing-library/react";
import { renderWithTheme } from "../test/renderWithTheme";
import { TrucoshiProgress } from "./TrucoshiProgress";

const mocks = vi.hoisted(() => ({
  state: {
    cardDisplayImagesReady: false,
    equippedDeck: {
      "1e": "argentino/1e_argentino_001",
    },
  },
}));

vi.mock("../trucoshi/hooks/useTrucoshi", () => ({
  useTrucoshi: () => [mocks.state, {}],
}));

vi.mock("../components/card/GameCard", () => ({
  FlipGameCard: ({ card, cardSkinByCard, flip, width }: any) => (
    <div
      data-testid="progress-card"
      data-card={card}
      data-card-skin-by-card={JSON.stringify(cardSkinByCard)}
      data-flip={String(flip)}
      data-width={width}
    />
  ),
}));

describe("TrucoshiProgress", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mocks.state.cardDisplayImagesReady = false;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("keeps the card back visible until card display images are ready", () => {
    const { rerender } = renderWithTheme(<TrucoshiProgress />);
    const progressCard = screen.getByTestId("progress-card");

    expect(progressCard).toHaveAttribute("data-flip", "true");

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(progressCard).toHaveAttribute("data-flip", "true");

    mocks.state.cardDisplayImagesReady = true;
    rerender(<TrucoshiProgress />);

    act(() => {
      vi.advanceTimersByTime(849);
    });

    expect(progressCard).toHaveAttribute("data-flip", "true");

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(progressCard).toHaveAttribute("data-flip", "false");
  });

  it("alternates between a random card front and the card back", () => {
    mocks.state.cardDisplayImagesReady = true;

    renderWithTheme(<TrucoshiProgress width="5rem" />);
    const progressCard = screen.getByTestId("progress-card");
    const initialCard = progressCard.getAttribute("data-card");

    act(() => {
      vi.advanceTimersByTime(850);
    });

    expect(progressCard).toHaveAttribute("data-flip", "false");
    expect(progressCard).not.toHaveAttribute("data-card", initialCard || "");
    expect(progressCard).toHaveAttribute("data-width", "5rem");
    expect(progressCard).toHaveAttribute(
      "data-card-skin-by-card",
      JSON.stringify(mocks.state.equippedDeck),
    );

    act(() => {
      vi.advanceTimersByTime(850);
    });

    expect(progressCard).toHaveAttribute("data-flip", "true");
  });
});
