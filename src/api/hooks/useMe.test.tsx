import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Cookies, CookiesProvider } from "react-cookie";
import { PropsWithChildren } from "react";
import { apiClient } from "../apiClient";
import { getCookieName } from "../../utils/cookie";
import { useMe } from "./useMe";

vi.mock("../apiClient", () => ({
  apiClient: { auth: { getUserProfile: vi.fn(async () => ({ data: { id: 42, name: "Player" } })) } },
}));

describe("profile initialization", () => {
  beforeEach(() => vi.clearAllMocks());

  it("connects as a guest without querying the authenticated profile, then loads it after login", async () => {
    const cookies = new Cookies();
    const identity = getCookieName("identity");
    cookies.remove(identity);
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: PropsWithChildren) => (
      <CookiesProvider cookies={cookies}>
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      </CookiesProvider>
    );
    const { result, unmount } = renderHook(() => useMe(), { wrapper });

    expect(result.current.hasIdentity).toBe(false);
    expect(result.current.isFetching).toBe(false);
    expect(apiClient.auth.getUserProfile).not.toHaveBeenCalled();

    act(() => cookies.set(identity, "authenticated-identity"));
    await waitFor(() => expect(result.current.me?.id).toBe(42));
    expect(result.current.hasIdentity).toBe(true);
    expect(apiClient.auth.getUserProfile).toHaveBeenCalledTimes(1);
    unmount();
    cookies.remove(identity);
    client.clear();
  });
});
