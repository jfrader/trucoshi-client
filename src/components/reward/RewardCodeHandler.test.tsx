import { waitFor } from "@testing-library/react";
import { useLocation } from "@tanstack/react-router";
import { GAME_ERROR } from "trucoshi";
import { renderWithThemeAt } from "../../test/renderWithTheme";
import { RewardCodeHandler } from "./RewardCodeHandler";
import { PENDING_REWARD_CODE_KEY, PROMO_CHEST_READY_KEY } from "./rewardCodeStorage";

const mocks = vi.hoisted(() => ({
  state: {
    account: null as any,
    isConnected: true,
  },
  redeemRewardCode: vi.fn(),
}));

vi.mock("../../trucoshi/hooks/useTrucoshi", () => ({
  useTrucoshi: () => [
    mocks.state,
    {
      redeemRewardCode: mocks.redeemRewardCode,
    },
  ],
}));

const LocationProbe = () => {
  const location = useLocation();

  return <div data-testid="location-path">{location.pathname}</div>;
};

const renderHandler = (entry = "/") =>
  renderWithThemeAt(
    <>
      <RewardCodeHandler />
      <LocationProbe />
    </>,
    entry,
  );

describe("RewardCodeHandler", () => {
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
    mocks.state.account = null;
    mocks.state.isConnected = true;
    mocks.redeemRewardCode.mockReset();
    mocks.redeemRewardCode.mockResolvedValue({ success: true });
  });

  it("stores reward codes for guests and redirects to login", async () => {
    renderHandler("/?code=ABC123");

    await waitFor(() => {
      expect(window.localStorage.getItem(PENDING_REWARD_CODE_KEY)).toBe("ABC123");
    });
    await waitFor(() => {
      expect(document.querySelector('[data-testid="location-path"]')).toHaveTextContent("/login");
    });
    expect(mocks.redeemRewardCode).not.toHaveBeenCalled();
  });

  it("redeems a pending code after login", async () => {
    window.localStorage.setItem(PENDING_REWARD_CODE_KEY, "ABC123");
    mocks.state.account = { id: 1, name: "Player" };

    renderHandler();

    await waitFor(() => {
      expect(mocks.redeemRewardCode).toHaveBeenCalledWith("ABC123", { silent: true });
    });
    await waitFor(() => {
      expect(window.localStorage.getItem(PENDING_REWARD_CODE_KEY)).toBe(null);
    });
    expect(window.localStorage.getItem(PROMO_CHEST_READY_KEY)).toBe("true");
  });

  it("clears invalid pending codes", async () => {
    window.localStorage.setItem(PENDING_REWARD_CODE_KEY, "BADCODE");
    mocks.state.account = { id: 1, name: "Player" };
    mocks.redeemRewardCode.mockResolvedValue({
      success: false,
      errorCode: GAME_ERROR.REWARD_CODE_INVALID,
    });

    renderHandler();

    await waitFor(() => {
      expect(mocks.redeemRewardCode).toHaveBeenCalledWith("BADCODE", { silent: true });
    });
    await waitFor(() => {
      expect(window.localStorage.getItem(PENDING_REWARD_CODE_KEY)).toBe(null);
    });
  });
});
