import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { ADMISSION_DRAIN_ERROR_MESSAGE } from "../admission";
import { useGameAdmission } from "./useGameAdmission";

const createHarness = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { wrapper };
};

const response = (body: unknown, ok = true) => ({ ok, json: async () => body }) as Response;

describe("useGameAdmission", () => {
  it("opens new-game actions only after a valid same-origin response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      response({
        admission: "accepting",
        acceptingNewGames: true,
        available: true,
        version: "server-1",
      }),
    );
    const { result } = renderHook(() => useGameAdmission(), createHarness());

    await waitFor(() => expect(result.current.canStartNewGames).toBe(true));
    expect(fetch).toHaveBeenCalledWith(
      "/admission.json",
      expect.objectContaining({ cache: "no-store", credentials: "same-origin" }),
    );
  });

  it("fails closed when the admission endpoint is unavailable", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(response({}, false));
    const { result } = renderHook(() => useGameAdmission(), createHarness());

    await waitFor(() => expect(result.current.isChecking).toBe(false));
    expect(result.current.canStartNewGames).toBe(false);
    expect(result.current.isDraining).toBe(true);
  });

  it("learns drain state from the exact socket error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      response({
        admission: "accepting",
        acceptingNewGames: true,
        available: true,
        version: "server-1",
      }),
    );
    const { result } = renderHook(() => useGameAdmission(), createHarness());
    await waitFor(() => expect(result.current.canStartNewGames).toBe(true));

    act(() => {
      expect(
        result.current.reportAdmissionError({
          code: "FORBIDDEN",
          message: ADMISSION_DRAIN_ERROR_MESSAGE,
        }),
      ).toBe(true);
    });

    await waitFor(() => expect(result.current.isDraining).toBe(true));
  });
});
