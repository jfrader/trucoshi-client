import { fireEvent, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ReactElement } from "react";
import { renderWithTheme } from "../../test/renderWithTheme";
import { CardDisplayModeToggle } from "./CardDisplayModeToggle";
import { CardToggler } from "./CardToggler";
import { InventoryButton } from "./InventoryButton";
import { CardBackdrop } from "../../shared/CardBackdrop";

const mocks = vi.hoisted(() => ({
  queue: vi.fn(),
  setCardDisplayMode: vi.fn(),
  inspectCard: vi.fn(),
  state: {
    account: { id: 1, name: "Player 0" },
    cardDisplayMode: "skins",
    cardsLoading: false,
    cardsReady: true,
    equippedDeck: {
      "1e": "argentino/1e_argentino_001",
    },
    treasureStatus: {
      progress: 0,
      threshold: 3,
      unopenedChests: [{ id: 4, earnedAt: "2026-07-01T00:00:00.000Z" }],
    },
  },
}));

vi.mock("../../sound/hooks/useSound", () => ({
  useSound: () => ({
    queue: mocks.queue,
  }),
}));

vi.mock("../../trucoshi/hooks/useTrucoshi", () => ({
  useTrucoshi: () => [
    mocks.state,
    {
      inspectCard: mocks.inspectCard,
      setCardDisplayMode: mocks.setCardDisplayMode,
    },
  ],
}));

vi.mock("./GameCard", () => ({
  FlipGameCard: ({ card, cardSkinByCard, cardSkinId, displayMode, flip, width }: any) => (
    <div
      data-testid={`flip-game-card-${card}`}
      data-card-skin-map={JSON.stringify(cardSkinByCard || {})}
      data-card-skin-id={cardSkinId || ""}
      data-display-mode={displayMode || ""}
      data-flip={flip ? "true" : "false"}
      data-width={width}
    />
  ),
}));

const renderInRouter = (ui: ReactElement) =>
  renderWithTheme(<MemoryRouter>{ui}</MemoryRouter>);

beforeEach(() => {
  mocks.queue.mockClear();
  mocks.setCardDisplayMode.mockClear();
  mocks.inspectCard.mockClear();
  mocks.state.account = { id: 1, name: "Player 0" };
  mocks.state.cardDisplayMode = "skins";
  mocks.state.treasureStatus = {
    progress: 0,
    threshold: 3,
    unopenedChests: [{ id: 4, earnedAt: "2026-07-01T00:00:00.000Z" }],
  };
});

describe("InventoryButton", () => {
  it("hides without an account", () => {
    mocks.state.account = null as any;

    renderInRouter(<InventoryButton />);

    expect(screen.queryByRole("link", { name: /inventario/i })).not.toBeInTheDocument();
  });

  it("links to inventory and shows unopened chest count", () => {
    renderInRouter(<InventoryButton />);

    const link = screen.getByRole("link", { name: /inventario/i });
    expect(link).toHaveAttribute("href", "/inventory");
    expect(within(link).getByText("1")).toBeInTheDocument();
    expect(screen.getByTestId("inventory-button-badge")).toHaveClass("MuiBadge-root");
  });

  it("hides the badge when there are no unopened chests", () => {
    mocks.state.treasureStatus = {
      progress: 0,
      threshold: 3,
      unopenedChests: [],
    };

    renderInRouter(<InventoryButton />);

    expect(
      screen.getByTestId("inventory-button-badge").querySelector(".MuiBadge-invisible"),
    ).toBeInTheDocument();
  });
});

describe("Card display inventory access", () => {
  it("shows the inventory menu item for logged-in users", () => {
    renderInRouter(<CardDisplayModeToggle />);

    fireEvent.click(screen.getByRole("button", { name: /ver skins/i }));
    expect(screen.getByRole("menuitem", { name: /ver tus skins/i })).toHaveAttribute(
      "href",
      "/inventory",
    );
  });

  it("hides the inventory menu item for logged-out users", () => {
    mocks.state.account = null as any;

    renderInRouter(<CardDisplayModeToggle />);

    fireEvent.click(screen.getByRole("button", { name: /ver skins/i }));
    expect(screen.queryByRole("menuitem", { name: /ver tus skins/i })).not.toBeInTheDocument();
  });

  it("does not change display mode when opening inventory from the menu", () => {
    renderInRouter(<CardDisplayModeToggle />);

    fireEvent.click(screen.getByRole("button", { name: /ver skins/i }));
    fireEvent.click(screen.getByRole("menuitem", { name: /ver tus skins/i }));

    expect(mocks.setCardDisplayMode).not.toHaveBeenCalled();
  });
});

describe("selected card skins", () => {
  it("passes equipped skins to CardToggler preview cards", () => {
    renderInRouter(<CardToggler />);

    expect(screen.getAllByTestId(/flip-game-card-/)[0]).toHaveAttribute(
      "data-card-skin-map",
      JSON.stringify(mocks.state.equippedDeck),
    );
  });

  it("passes equipped skins and shows inventory access in CardBackdrop", () => {
    renderInRouter(
      <CardBackdrop
        card={{
          card: "1e",
          cardSkinId: "argentino/1e_argentino_002",
          displayMode: "skins",
        }}
        cardsReady
        inspectCard={mocks.inspectCard}
      />,
    );

    expect(screen.getByTestId("flip-game-card-1e")).toHaveAttribute(
      "data-card-skin-id",
      "argentino/1e_argentino_002",
    );
    expect(screen.getByTestId("flip-game-card-1e")).toHaveAttribute("data-display-mode", "skins");
    expect(screen.getByRole("link", { name: /inventario/i, hidden: true })).toHaveAttribute(
      "href",
      "/inventory",
    );
  });
});
