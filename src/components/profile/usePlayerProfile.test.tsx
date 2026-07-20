import { act, renderHook, waitFor } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { TrucoshiContext } from "../../trucoshi/trucoshi.context";
import { usePlayerProfile } from "./usePlayerProfile";

const mocks = vi.hoisted(() => ({
  emit: vi.fn(),
  isConnected: true,
}));

const Wrapper = ({ children }: PropsWithChildren) => (
  <TrucoshiContext.Provider
    value={
      {
        state: { isConnected: mocks.isConnected },
        dispatch: {},
        socket: { emit: mocks.emit },
      } as never
    }
  >
    {children}
  </TrucoshiContext.Provider>
);

describe("usePlayerProfile", () => {
  beforeEach(() => {
    mocks.emit.mockReset();
    mocks.isConnected = true;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("treats a newly requested account as loading", () => {
    const { result, rerender } = renderHook(
      ({ accountId }: { accountId?: number }) => usePlayerProfile(accountId),
      {
        initialProps: { accountId: undefined } as { accountId?: number },
        wrapper: Wrapper,
      },
    );

    expect(result.current.isLoading).toBe(false);
    rerender({ accountId: 8 });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.profile).toBeNull();
  });

  it("loads the requested profile when the socket reconnects", async () => {
    mocks.isConnected = false;
    const { result, rerender } = renderHook(() => usePlayerProfile(8), { wrapper: Wrapper });

    expect(mocks.emit).not.toHaveBeenCalled();
    mocks.isConnected = true;
    mocks.emit.mockImplementation((_event, _accountId, callback) => {
      callback({
        success: true,
        account: { id: 8, name: "Player 5" },
        matches: [],
        stats: null,
      });
    });
    rerender();

    await waitFor(() => expect(result.current.profile?.account?.name).toBe("Player 5"));
    expect(result.current.isLoading).toBe(false);
  });

  it("turns a stalled connection into an inline retryable error", () => {
    vi.useFakeTimers();
    mocks.isConnected = false;
    const { result } = renderHook(() => usePlayerProfile(8), { wrapper: Wrapper });

    act(() => vi.advanceTimersByTime(8_000));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toMatch(/No pudimos conectarnos/);
  });
});
