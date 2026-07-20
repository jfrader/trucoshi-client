import { fireEvent, screen, within } from "@testing-library/react";
import type { ICard } from "trucoshi";
import { renderWithTheme } from "../../test/renderWithTheme";
import { PlayableMatchCard } from "./PlayableMatchCard";

vi.mock("../card/GameCard", () => ({
  GameCard: ({
    card,
    onClick,
    onPointerCancel,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  }: any) => (
    <button
      type="button"
      data-card={card}
      onClick={onClick}
      onPointerCancel={onPointerCancel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {card}
    </button>
  ),
}));

const domRect = ({
  left,
  top,
  width,
  height,
}: {
  left: number;
  top: number;
  width: number;
  height: number;
}): DOMRect =>
  ({
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    x: left,
    y: top,
    toJSON: () => ({}),
  }) as DOMRect;

const setRect = (element: Element, rect: DOMRect) => {
  Object.defineProperty(element, "getBoundingClientRect", {
    configurable: true,
    value: () => rect,
  });
};

const renderCard = (
  onPlayIntent: (card: ICard, cardIdx: number) => void,
  initialCanPlay = true,
) => {
  const cardNode = (canPlay: boolean) => (
    <>
      <div data-truco-board-surface="true" data-testid="board-surface" />
      <PlayableMatchCard
        card="1e"
        cardIdx={0}
        canPlay={canPlay}
        overlap={0}
        rotation={0}
        width="5rem"
        onPlayIntent={onPlayIntent}
      />
    </>
  );
  const result = renderWithTheme(cardNode(initialCanPlay));
  const source = screen.getByTestId("playable-match-card-0");
  const card = within(source).getByRole("button");

  setRect(card, domRect({ left: 20, top: 600, width: 80, height: 118 }));
  setRect(
    screen.getByTestId("board-surface"),
    domRect({ left: 100, top: 80, width: 300, height: 430 }),
  );
  Object.defineProperty(card, "setPointerCapture", { configurable: true, value: vi.fn() });
  Object.defineProperty(card, "releasePointerCapture", { configurable: true, value: vi.fn() });

  return {
    card,
    source,
    rerenderCanPlay: (canPlay: boolean) => result.rerender(cardNode(canPlay)),
  };
};

describe("PlayableMatchCard", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("plays a pointer tap once without moving the card optimistically", () => {
    const onPlayIntent = vi.fn();
    const { card, source } = renderCard(onPlayIntent);

    fireEvent.pointerDown(card, { button: 0, pointerId: 1, clientX: 60, clientY: 650 });
    fireEvent.pointerUp(card, { button: 0, pointerId: 1, clientX: 60, clientY: 650 });
    fireEvent.click(card);

    expect(onPlayIntent).toHaveBeenCalledTimes(1);
    expect(onPlayIntent).toHaveBeenCalledWith("1e", 0);
    expect(source).toHaveStyle({ visibility: "visible" });
    expect(screen.queryByTestId("card-play-drag-layer")).not.toBeInTheDocument();
  });

  it("keeps a submitted dragged card where it was dropped until server state replaces it", () => {
    const onPlayIntent = vi.fn();
    const { card, source } = renderCard(onPlayIntent);

    fireEvent.pointerDown(card, { button: 0, pointerId: 2, clientX: 60, clientY: 650 });
    fireEvent.pointerMove(card, { pointerId: 2, clientX: 170, clientY: 300 });

    expect(screen.getByTestId("card-drop-cue")).toBeInTheDocument();

    fireEvent.pointerUp(card, { button: 0, pointerId: 2, clientX: 170, clientY: 300 });

    expect(onPlayIntent).toHaveBeenCalledWith("1e", 0);
    expect(screen.getByTestId("card-play-drag-layer")).toBeInTheDocument();
    expect(source).toHaveStyle({ visibility: "hidden" });
  });

  it("returns a submitted drag when the backend makes the card playable again", () => {
    const onPlayIntent = vi.fn();
    const { card, source, rerenderCanPlay } = renderCard(onPlayIntent);

    fireEvent.pointerDown(card, { button: 0, pointerId: 5, clientX: 60, clientY: 650 });
    fireEvent.pointerMove(card, { pointerId: 5, clientX: 170, clientY: 300 });
    fireEvent.pointerUp(card, { button: 0, pointerId: 5, clientX: 170, clientY: 300 });

    rerenderCanPlay(false);
    rerenderCanPlay(true);
    fireEvent.transitionEnd(screen.getByTestId("card-play-drag-layer"));

    expect(screen.queryByTestId("card-play-drag-layer")).not.toBeInTheDocument();
    expect(source).toHaveStyle({ visibility: "visible" });
  });

  it("returns a dragged card released outside the table", () => {
    const onPlayIntent = vi.fn();
    const { card, source } = renderCard(onPlayIntent);

    fireEvent.pointerDown(card, { button: 0, pointerId: 3, clientX: 60, clientY: 650 });
    fireEvent.pointerMove(card, { pointerId: 3, clientX: 70, clientY: 560 });
    fireEvent.pointerUp(card, { button: 0, pointerId: 3, clientX: 70, clientY: 560 });
    fireEvent.click(card);

    expect(onPlayIntent).not.toHaveBeenCalled();
    expect(source).toHaveStyle({ visibility: "hidden" });

    fireEvent.transitionEnd(screen.getByTestId("card-play-drag-layer"));

    expect(screen.queryByTestId("card-play-drag-layer")).not.toBeInTheDocument();
    expect(source).toHaveStyle({ visibility: "visible" });
  });

  it("does not play when the pointer gesture is cancelled", () => {
    const onPlayIntent = vi.fn();
    const { card } = renderCard(onPlayIntent);

    fireEvent.pointerDown(card, { button: 0, pointerId: 4, clientX: 60, clientY: 650 });
    fireEvent.pointerMove(card, { pointerId: 4, clientX: 170, clientY: 300 });
    fireEvent.pointerCancel(card, { pointerId: 4, clientX: 170, clientY: 300 });

    expect(onPlayIntent).not.toHaveBeenCalled();
  });

  it("keeps the card in hand when tap submission does not change server state", () => {
    const onPlayIntent = vi.fn();
    const { card, source } = renderCard(onPlayIntent);

    fireEvent.click(card);

    expect(screen.queryByTestId("card-play-drag-layer")).not.toBeInTheDocument();
    expect(source).toHaveStyle({ visibility: "visible" });
  });
});
