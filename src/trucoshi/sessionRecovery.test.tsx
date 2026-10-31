import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AxiosAdapter, AxiosError, AxiosHeaders } from "axios";
import { Cookies, CookiesProvider } from "react-cookie";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { apiClient } from "../api/apiClient";
import { useMe } from "../api/hooks/useMe";
import { SocketBackdrop } from "../shared/SocketBackdrop";
import { PageLayout } from "../components/layout/PageLayout";
import { Account } from "../pages/Account";
import { Profile } from "../pages/Profile";
import { renderWithTheme } from "../test/renderWithTheme";
import { getCookieName } from "../utils/cookie";
import { useTrucoshi } from "./hooks/useTrucoshi";
import { TrucoshiProvider } from "./trucoshi.context";

const transport = vi.hoisted(() => ({ handshakes: [] as Array<Record<string, any>> }));

vi.mock("socket.io-client", () => ({
  io: (_host: string, options: { auth: (cb: (data: Record<string, any>) => void) => void }) => {
    const handlers = new Map<string, (...args: any[]) => void>();
    let connectedData: Record<string, any> | undefined;
    const socket = {
      auth: options.auth,
      active: false,
      connected: false,
      io: { reconnection: vi.fn() },
      on(event: string, cb: (...args: any[]) => void) {
        handlers.set(event, cb);
        if (socket.connected && connectedData && event === "SET_SESSION") {
          const data = connectedData;
          setTimeout(() => {
            if (handlers.get(event) === cb) {
              cb({ session: "fixture", account: data.user ?? null }, "15.0.4", []);
            }
          }, 0);
        }
        return socket;
      },
      off(event: string) {
        handlers.delete(event);
        return socket;
      },
      emit: vi.fn(),
      disconnect() {
        socket.active = false;
        socket.connected = false;
        return socket;
      },
      connect() {
        socket.active = true;
        socket.connected = true;
        options.auth((data) => {
          connectedData = data;
          transport.handshakes.push(data);
          setTimeout(() => handlers.get("connect")?.(), 0);
        });
        return socket;
      },
    };
    return socket;
  },
}));

const Probe = ({ overlay = true }: { overlay?: boolean }) => {
  const [state, actions] = useTrucoshi();
  const { session } = useMe();
  return (
    <>
      <output data-testid="session-status">{session.status}</output>
      <output data-testid="account-id">{state.account?.id ?? "none"}</output>
      <button onClick={() => void actions.refetchMe()}>Refresh profile</button>
      {overlay ? <SocketBackdrop /> : null}
    </>
  );
};

const profile = { id: 42, name: "Fixture player" };
const response = (config: Parameters<AxiosAdapter>[0], data: unknown = profile) => ({
  config,
  data,
  status: 200,
  statusText: "OK",
  headers: new AxiosHeaders(),
});
const failure = (config: Parameters<AxiosAdapter>[0], status?: number) =>
  new AxiosError(
    status ? "Unavailable" : "timeout",
    status ? "ERR_BAD_RESPONSE" : "ECONNABORTED",
    config,
    undefined,
    status ? { ...response(config), status } : undefined,
  );

describe("stored account recovery through the real provider and Accounts client", () => {
  const originalAdapter = apiClient.instance.defaults.adapter;
  let cookies: Cookies;
  let client: QueryClient;
  let unmount: (() => void) | undefined;

  beforeEach(() => {
    vi.stubEnv("VITE_LIGHTNING_ACCOUNTS_COOKIE_PREFIX", "oss_fixture_");
    transport.handshakes.length = 0;
    localStorage.clear();
    cookies = new Cookies();
    cookies.set(getCookieName("identity"), "stored-fixture-identity", { path: "/" });
    client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  });

  afterEach(() => {
    unmount?.();
    unmount = undefined;
    client.clear();
    cookies.remove(getCookieName("identity"), { path: "/" });
    apiClient.instance.defaults.adapter = originalAdapter;
    vi.unstubAllEnvs();
  });

  const mount = (route?: "/account" | "/profile") => {
    ({ unmount } = renderWithTheme(
      <CookiesProvider cookies={cookies}>
        <QueryClientProvider client={client}>
          <TrucoshiProvider>
            <Probe overlay={!route} />
            {route ? (
              <MemoryRouter initialEntries={[route]}>
                <Routes>
                  <Route
                    path="/account"
                    element={<PageLayout hideFooter><Account /></PageLayout>}
                  />
                  <Route
                    path="/profile"
                    element={<PageLayout hideFooter><Profile /></PageLayout>}
                  />
                  <Route path="/login" element={<h1>Login redirect</h1>} />
                </Routes>
              </MemoryRouter>
            ) : null}
          </TrucoshiProvider>
        </QueryClientProvider>
      </CookiesProvider>,
    ));
  };

  const expectPreservedIdentity = () => {
    expect(cookies.get(getCookieName("identity"))).toBe("stored-fixture-identity");
    expect(document.cookie).toContain(`${getCookieName("identity")}=stored-fixture-identity`);
    expect(transport.handshakes.filter((data) => !data.identity)).toHaveLength(0);
  };

  it.each([undefined, 503])("never connects a cold stored identity as a guest after profile failure %s, and retries", async (status) => {
    let unavailable = true;
    const adapter = vi.fn<AxiosAdapter>(async (config) => {
      if (config.url === "/auth/me" && unavailable) throw failure(config, status);
      return response(config);
    });
    apiClient.instance.defaults.adapter = adapter;
    mount();

    await waitFor(() => expect(client.getQueryState(["me"])?.status).toBe("error"));
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 30));
    });
    expect(transport.handshakes).toHaveLength(0);
    expectPreservedIdentity();
    expect(screen.getByTestId("session-status")).toHaveTextContent("unavailable");
    expect(screen.queryAllByRole("progressbar", { hidden: true })).toHaveLength(0);
    expect(adapter.mock.calls.some(([config]) => config.url === "/auth/logout")).toBe(false);

    unavailable = false;
    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    await waitFor(() => expect(screen.getByTestId("account-id")).toHaveTextContent("42"));
    expect(screen.getByTestId("session-status")).toHaveTextContent("authenticated");
    expect(transport.handshakes.length).toBeGreaterThan(0);
    expectPreservedIdentity();
  });

  it.each(["/account", "/profile"] as const)("keeps %s on its retry UI instead of redirecting an unavailable identity to login", async (route) => {
    const adapter = vi.fn<AxiosAdapter>(async (config) => {
      throw failure(config, 503);
    });
    apiClient.instance.defaults.adapter = adapter;
    mount(route);
    const retry = await screen.findByRole("button", { name: "Reintentar" });
    expect(screen.getAllByRole("button", { name: "Reintentar" })).toHaveLength(1);
    expect(screen.queryByText("Login redirect")).toBeNull();
    expectPreservedIdentity();
    const attempts = adapter.mock.calls.length;
    fireEvent.click(retry);
    await waitFor(() => expect(adapter.mock.calls.length).toBeGreaterThan(attempts));
    await screen.findByRole("button", { name: "Reintentar" });
    expect(screen.queryByText("Login redirect")).toBeNull();
    expectPreservedIdentity();
  });

  it.each([undefined, 503])("preserves the cookie and does not logout after profile 401 and transient refresh failure %s", async (status) => {
    const adapter = vi.fn<AxiosAdapter>(async (config) => {
      if (config.url === "/auth/me") throw failure(config, 401);
      if (config.url === "/auth/refresh-tokens") throw failure(config, status);
      return response(config);
    });
    apiClient.instance.defaults.adapter = adapter;
    mount();
    await waitFor(() => expect(client.getQueryState(["me"])?.status).toBe("error"));
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 30));
    });
    expectPreservedIdentity();
    expect(client.getQueryState(["me"])?.error).toMatchObject(
      status ? { response: { status } } : { code: "ECONNABORTED" },
    );
    expect(transport.handshakes).toHaveLength(0);
    expect(adapter.mock.calls.some(([config]) => config.url === "/auth/logout")).toBe(false);
    expect(screen.getByRole("button", { name: "Reintentar" })).toBeVisible();
  });

  it("still clears definitive invalid credentials after profile 401 and refresh 401", async () => {
    const adapter = vi.fn<AxiosAdapter>(async (config) => {
      if (config.url === "/auth/me" || config.url === "/auth/refresh-tokens") {
        throw failure(config, 401);
      }
      return response(config);
    });
    apiClient.instance.defaults.adapter = adapter;
    mount();
    await waitFor(() => expect(cookies.get(getCookieName("identity"))).toBeUndefined());
    expect(adapter.mock.calls.some(([config]) => config.url === "/auth/logout")).toBe(true);
    expect(screen.getByTestId("session-status")).toHaveTextContent("guest");
  });

  it.each([false, true])("keeps cached authenticated identity during a background failure (refresh=%s)", async (refreshFailure) => {
    client.setQueryData(["me"], { data: profile });
    let unavailable = false;
    const adapter = vi.fn<AxiosAdapter>(async (config) => {
      if (!unavailable) return response(config);
      if (config.url === "/auth/me") throw failure(config, refreshFailure ? 401 : 503);
      if (config.url === "/auth/refresh-tokens") throw failure(config);
      return response(config);
    });
    apiClient.instance.defaults.adapter = adapter;
    mount();
    await waitFor(() => expect(screen.getByTestId("account-id")).toHaveTextContent("42"));
    const handshakeCount = transport.handshakes.length;
    unavailable = true;
    fireEvent.click(screen.getByRole("button", { name: "Refresh profile" }));
    await waitFor(() => expect(client.getQueryState(["me"])?.status).toBe("error"));
    expect(screen.getByTestId("account-id")).toHaveTextContent("42");
    expect(transport.handshakes).toHaveLength(handshakeCount);
    expect(screen.getByTestId("session-status")).toHaveTextContent("authenticated");
    expectPreservedIdentity();
    expect(screen.queryByRole("button", { name: "Reintentar" })).toBeNull();
    expect(adapter.mock.calls.some(([config]) => config.url === "/auth/logout")).toBe(false);
  });
});
