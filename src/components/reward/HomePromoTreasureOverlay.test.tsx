import { fireEvent, screen, waitFor } from "@testing-library/react";
import { renderWithTheme } from "../../test/renderWithTheme";
import { HomePromoTreasureOverlay } from "./HomePromoTreasureOverlay";
import { PROMO_CHEST_READY_KEY } from "./rewardCodeStorage";

const mocks = vi.hoisted(() => ({
  readyStatus: {
    progress: 3,
    threshold: 3,
    unopenedChests: [{ id: 22, earnedAt: "2026-07-01T00:00:00.000Z" }],
  },
  state: {
    treasureStatus: {
      progress: 3,
      threshold: 3,
      unopenedChests: [{ id: 22, earnedAt: "2026-07-01T00:00:00.000Z" }],
    },
    treasureLoading: false,
    treasureOpening: false,
    treasureResult: null,
  },
  openTreasureChest: vi.fn(),
}));

vi.mock("../../trucoshi/hooks/useTrucoshi", () => ({
  useTrucoshi: () => [
    mocks.state,
    {
      openTreasureChest: mocks.openTreasureChest,
    },
  ],
}));

describe("HomePromoTreasureOverlay", () => {
  beforeEach(() => {
    const storage = new Map<string, string>();
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
        clear: () => storage.clear(),
        getItem: (key: string) => storage.get(key) || null,
        removeItem: (key: string) => storage.delete(key),
        setItem: (key: string, value: string) => storage.set(key, value),
      },
    });

    window.localStorage.clear();
    mocks.state.treasureStatus = mocks.readyStatus;
    mocks.state.treasureLoading = false;
    mocks.state.treasureOpening = false;
    mocks.state.treasureResult = null;
    mocks.openTreasureChest.mockReset();
    mocks.openTreasureChest.mockResolvedValue(true);
  });

  afterEach(() => {
    document.body.style.overflow = "";
  });

  it("shows the promo overlay and opens the first unopened chest", async () => {
    window.localStorage.setItem(PROMO_CHEST_READY_KEY, "true");

    renderWithTheme(<HomePromoTreasureOverlay />);

    expect(await screen.findByTestId("treasure-opening-overlay")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /abrir cofre/i }));

    await waitFor(() => {
      expect(mocks.openTreasureChest).toHaveBeenCalledWith(22);
    });
    await waitFor(() => {
      expect(window.localStorage.getItem(PROMO_CHEST_READY_KEY)).toBe(null);
    });
  });

  it("stays hidden without the promo-ready marker", () => {
    renderWithTheme(<HomePromoTreasureOverlay />);

    expect(screen.queryByTestId("treasure-opening-overlay")).not.toBeInTheDocument();
  });
});
