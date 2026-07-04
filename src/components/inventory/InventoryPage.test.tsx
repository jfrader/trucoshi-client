import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ITreasureOpenResult } from "trucoshi";
import { IInventoryCardGroup, IInventoryCardSkin } from "../../trucoshi/cards/skinRegistry";
import { renderWithTheme } from "../../test/renderWithTheme";
import { InventoryPage } from "./InventoryPage";

const navigate = vi.fn();
const fetchInventory = vi.fn();
const setDeckCardSkin = vi.fn();
const setCardDisplayMode = vi.fn();
const inspectCard = vi.fn();
const fetchTreasureStatus = vi.fn();
const openTreasureChest = vi.fn();
const devGrantTreasureChest = vi.fn();
const soundMocks = vi.hoisted(() => ({
  queue: vi.fn(),
}));
const cardImageMocks = vi.hoisted(() => ({
  ready: true,
  choiceImagesReady: true,
  preloadCardImageSources: vi.fn(() => Promise.resolve()),
}));

let inventory: IInventoryCardGroup[] = [];
let account: any = { id: 1, name: "Player 0" };
let treasureResult: ITreasureOpenResult | null = null;
let inventoryLoading = false;

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigate,
  };
});

vi.mock("../../trucoshi/hooks/useTrucoshi", () => ({
  useTrucoshi: () => [
    {
      account,
      isAccountPending: false,
      inventory,
      inventoryLoading,
      treasureStatus: {
        progress: 1,
        threshold: 3,
        unopenedChests: [{ id: 3, earnedAt: "2026-07-01T00:00:00.000Z" }],
      },
      treasureLoading: false,
      treasureOpening: false,
      treasureResult,
      cardDisplayMode: "skins",
    },
    {
      devGrantTreasureChest,
      fetchInventory,
      fetchTreasureStatus,
      inspectCard,
      openTreasureChest,
      setDeckCardSkin,
      setCardDisplayMode,
    },
  ],
}));

vi.mock("../../sound/hooks/useSound", () => ({
  useSound: () => ({
    queue: soundMocks.queue,
  }),
}));

vi.mock("../../trucoshi/cards/cardImageLoader", () => ({
  getCardImageRequestSources: ({ card, cardSkinId, displayMode }: any) => [
    `${displayMode || "skins"}-${card}-${cardSkinId || "default"}`,
  ],
  getCardImageSource: ({ card, cardSkinId, displayMode }: any) =>
    `${displayMode || "skins"}-${card}-${cardSkinId || "default"}`,
  getInventoryCardImageSources: () => ["inventory-source"],
  getReadyCardImageSource: ({ card, cardSkinId, displayMode }: any) =>
    cardImageMocks.choiceImagesReady
      ? `${displayMode || "skins"}-${card}-${cardSkinId || "default"}`
      : undefined,
  isCardImageSourceComplete: () => cardImageMocks.choiceImagesReady,
  isCardImageSourceReady: () => cardImageMocks.choiceImagesReady,
  preloadCardImageSources: cardImageMocks.preloadCardImageSources,
  useCardImagePreload: () => ({
    ready: cardImageMocks.ready,
    loading: !cardImageMocks.ready,
  }),
}));

vi.mock("../card/GameCard", () => ({
  GameCard: ({ card, cardSkinId, displayMode, disabledMask, width }: any) => (
    <div
      data-testid={`game-card-${card}`}
      data-card-skin-id={cardSkinId || ""}
      data-display-mode={displayMode}
      data-disabled-mask={disabledMask ? "true" : "false"}
      data-width={width || ""}
    />
  ),
  FlipGameCard: ({ card, cardSkinId, displayMode, flip }: any) => (
    <div
      data-testid={`flip-game-card-${card}`}
      data-card-skin-id={cardSkinId || ""}
      data-display-mode={displayMode}
      data-flip={flip ? "true" : "false"}
    />
  ),
}));

const argentino1e: IInventoryCardSkin = {
  id: "argentino/1e_argentino_001",
  release: "argentino",
  card: "1e",
  fileName: "1e_argentino_001.png",
  assetPath: "skins/argentino/1e_argentino_001.png",
  rarity: "RARE" as const,
  enabled: true,
  unlockable: true,
  unlocked: true,
  equipped: false,
};

const promo1e: IInventoryCardSkin = {
  ...argentino1e,
  id: "argentino/1e_argentino_002",
  fileName: "1e_argentino_002.png",
  assetPath: "skins/argentino/1e_argentino_002.png",
  rarity: "EPIC" as const,
};

const renderInventory = () =>
  renderWithTheme(
    <MemoryRouter>
      <InventoryPage />
    </MemoryRouter>
  );

describe("InventoryPage stack selector", () => {
  beforeEach(() => {
    navigate.mockClear();
    fetchInventory.mockClear();
    setDeckCardSkin.mockReset();
    setDeckCardSkin.mockResolvedValue(true);
    setCardDisplayMode.mockClear();
    inspectCard.mockClear();
    fetchTreasureStatus.mockClear();
    openTreasureChest.mockClear();
    devGrantTreasureChest.mockClear();
    soundMocks.queue.mockClear();
    cardImageMocks.ready = true;
    cardImageMocks.choiceImagesReady = true;
    cardImageMocks.preloadCardImageSources.mockReset();
    cardImageMocks.preloadCardImageSources.mockResolvedValue(undefined);
    account = { id: 1, name: "Player 0" };
    treasureResult = null;
    inventoryLoading = false;
    inventory = [
      {
        card: "1e",
        skins: [
          argentino1e,
        ],
      },
      {
        card: "3c",
        skins: [],
      },
    ];
  });

  it("renders inline stacks without the modal picker or skin names", () => {
    renderInventory();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByTestId("inventory-game-header")).toHaveTextContent("Arma tu mazo");
    expect(screen.getByTestId("inventory-grid")).toBeInTheDocument();
    expect(screen.queryByText("argentino/1e_argentino_001")).not.toBeInTheDocument();
    expect(screen.getByTestId("inventory-stack-1e")).toHaveAttribute("data-preview-count", "1");
    expect(screen.getByTestId("inventory-stack-3c")).toHaveAttribute("data-preview-count", "0");
    expect(screen.getByTestId("inventory-stack-choice-1e-default")).toHaveAttribute(
      "data-card-width",
      "var(--inventory-card-width)"
    );
    expect(screen.getAllByTestId("game-card-1e")[0]).toHaveAttribute(
      "data-width",
      "var(--inventory-card-width)"
    );
    expect(screen.getByTestId("inventory-skin-count-1e")).toHaveTextContent("1");
    expect(screen.queryByTestId("inventory-skin-count-3c")).not.toBeInTheDocument();
    expect(screen.getByTestId("inventory-hover-overlay")).toHaveAttribute("data-active", "false");
    expect(screen.getByTestId("treasure-panel")).toHaveTextContent("Cofre listo");
  });

  it("shows card skeletons while inventory or skin images are loading", () => {
    cardImageMocks.ready = false;

    renderInventory();

    expect(screen.getByTestId("inventory-card-skeleton-1e")).toBeInTheDocument();
    expect(screen.queryByTestId("inventory-stack-1e")).not.toBeInTheDocument();
  });

  it("opens a saved treasure chest from inventory", () => {
    renderInventory();

    fireEvent.click(screen.getByRole("button", { name: /abrir cofre/i }));

    expect(openTreasureChest).toHaveBeenCalledWith(3);
    expect(soundMocks.queue).toHaveBeenCalledWith("menu1");
  });

  it("equips the latest treasure skin from inventory", async () => {
    treasureResult = {
      chestId: 3,
      granted: false,
      duplicate: true,
      rarity: "RARE" as const,
      cardSkin: argentino1e,
    };

    renderInventory();

    fireEvent.click(screen.getByRole("button", { name: /equipar/i }));

    await waitFor(() => {
      expect(setDeckCardSkin).toHaveBeenCalledWith("1e", "argentino/1e_argentino_001");
    });
    expect(soundMocks.queue).toHaveBeenCalledWith("play0");
  });

  it("opens the stack with an overlay, equips a clicked skin, and waits for accept to close", async () => {
    renderInventory();

    fireEvent.click(screen.getByTestId("inventory-stack-choice-1e-default"));

    expect(soundMocks.queue).toHaveBeenCalledWith("miss1");
    expect(screen.getByTestId("inventory-stack-1e")).toHaveAttribute("data-open", "true");
    expect(screen.getByTestId("inventory-stack-choice-1e-default")).toHaveAttribute(
      "data-selected",
      "true"
    );
    expect(screen.getByTestId("inventory-stack-choice-1e-default")).toHaveAttribute(
      "data-stack-index",
      "0"
    );
    expect(screen.getByTestId("inventory-skin-selector-1e")).toHaveAttribute(
      "data-layout",
      "viewport-hand"
    );
    expect(screen.getByTestId("inventory-skin-selector-1e")).toHaveAttribute("data-fit", "fan-clamp");
    expect(screen.getByTestId("inventory-skin-selector-hand-1e")).toBeInTheDocument();
    expect(screen.getByTestId("inventory-selector-choice-1e-1")).toHaveAttribute(
      "data-size",
      "large"
    );
    expect(screen.getByTestId("inventory-selector-choice-1e-1")).toHaveAttribute(
      "data-card-width",
      "var(--inventory-open-card-width)"
    );
    expect(screen.getByTestId("inventory-selector-selected-1e-default")).toHaveAttribute(
      "data-position",
      "left"
    );
    expect(screen.getByTestId("inventory-hover-overlay")).toHaveAttribute("data-active", "true");

    fireEvent.click(screen.getByTestId("inventory-selector-choice-1e-default"));
    expect(screen.getByTestId("inventory-skin-selector-1e")).toBeInTheDocument();
    expect(screen.getByTestId("inventory-hover-overlay")).toHaveAttribute("data-active", "true");

    fireEvent.click(screen.getByTestId("inventory-selector-choice-1e-1"));

    await waitFor(() => {
      expect(setDeckCardSkin).toHaveBeenCalledWith("1e", "argentino/1e_argentino_001");
    });
    expect(soundMocks.queue).toHaveBeenCalledWith("play0");

    expect(screen.getByTestId("inventory-skin-selector-1e")).toBeInTheDocument();
    expect(screen.getByTestId("inventory-hover-overlay")).toHaveAttribute("data-active", "true");

    fireEvent.click(screen.getByTestId("inventory-skin-selector-accept-1e"));

    expect(soundMocks.queue).toHaveBeenCalledWith("back");
    expect(screen.getByTestId("inventory-hover-overlay")).toHaveAttribute("data-active", "false");
    expect(screen.queryByTestId("inventory-skin-selector-1e")).not.toBeInTheDocument();
  });

  it("waits for the exact selector card images before mounting the selector", async () => {
    let resolvePreload: () => void = () => undefined;
    cardImageMocks.choiceImagesReady = false;
    cardImageMocks.preloadCardImageSources.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolvePreload = resolve;
        }),
    );

    renderInventory();

    fireEvent.click(screen.getByTestId("inventory-stack-choice-1e-default"));

    expect(soundMocks.queue).toHaveBeenCalledWith("miss1");
    expect(screen.getByTestId("inventory-stack-1e")).toHaveAttribute("data-open", "false");
    expect(screen.queryByTestId("inventory-skin-selector-1e")).not.toBeInTheDocument();

    await act(async () => {
      cardImageMocks.choiceImagesReady = true;
      resolvePreload();
    });

    expect(screen.getByTestId("inventory-stack-1e")).toHaveAttribute("data-open", "true");
    expect(screen.getByTestId("inventory-skin-selector-1e")).toBeInTheDocument();
  });

  it("clears an equipped skin by selecting the default card", async () => {
    inventory = [
      {
        card: "1e",
        equippedCardSkinId: "argentino/1e_argentino_001",
        skins: [
          {
            ...argentino1e,
            equipped: true,
          },
        ],
      },
    ];

    renderInventory();

    fireEvent.click(screen.getByTestId("inventory-stack-choice-1e-0"));
    fireEvent.click(screen.getByTestId("inventory-selector-choice-1e-default"));

    await waitFor(() => {
      expect(setDeckCardSkin).toHaveBeenCalledWith("1e", null);
    });
    expect(soundMocks.queue).toHaveBeenCalledWith("play0");

    expect(screen.getByTestId("inventory-skin-selector-1e")).toBeInTheDocument();
  });

  it("keeps locked skins visible but disabled", () => {
    inventory = [
      {
        card: "1e",
        skins: [
          promo1e,
          {
            ...argentino1e,
            id: "argentino/1e_argentino_locked",
            unlocked: false,
          },
        ],
      },
    ];

    renderInventory();

    fireEvent.click(screen.getByTestId("inventory-stack-choice-1e-default"));

    expect(screen.getByTestId("inventory-selector-choice-1e-default")).toHaveAttribute(
      "data-stack-index",
      "0"
    );
    expect(screen.getByTestId("inventory-selector-choice-1e-1")).toHaveAttribute(
      "data-stack-index",
      "1"
    );
    const lockedChoice = screen.getByTestId("inventory-selector-choice-1e-2");
    expect(lockedChoice).toHaveAttribute("data-stack-index", "2");
    expect(lockedChoice).toBeDisabled();
  });

  it("closes the picker when clicking outside", () => {
    renderInventory();

    fireEvent.click(screen.getByTestId("inventory-stack-choice-1e-default"));
    expect(screen.getByTestId("inventory-skin-selector-1e")).toBeInTheDocument();
    expect(screen.getByTestId("inventory-hover-overlay")).toHaveAttribute("data-active", "true");

    fireEvent.click(screen.getByTestId("inventory-hover-overlay"));

    expect(soundMocks.queue).toHaveBeenCalledWith("back");
    expect(screen.getByTestId("inventory-hover-overlay")).toHaveAttribute("data-active", "false");
    expect(screen.queryByTestId("inventory-skin-selector-1e")).not.toBeInTheDocument();
  });

  it("inspects a card on right click, double click, or long touch", () => {
    vi.useFakeTimers();
    renderInventory();

    const defaultChoice = screen.getByTestId("inventory-stack-choice-1e-default");
    fireEvent.contextMenu(defaultChoice);
    expect(inspectCard).toHaveBeenCalledWith(
      expect.objectContaining({ card: "1e", displayMode: "default" }),
    );

    fireEvent.doubleClick(defaultChoice);
    expect(inspectCard).toHaveBeenCalledWith(
      expect.objectContaining({ card: "1e", displayMode: "default" }),
    );

    fireEvent.touchStart(defaultChoice);
    vi.advanceTimersByTime(560);
    fireEvent.touchEnd(defaultChoice);

    expect(inspectCard).toHaveBeenCalledTimes(3);
    expect(inspectCard).toHaveBeenLastCalledWith(
      expect.objectContaining({ card: "1e", displayMode: "default" }),
    );
    vi.useRealTimers();
  });
});
