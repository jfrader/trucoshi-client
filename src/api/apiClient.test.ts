import axios, { AxiosAdapter, AxiosError, AxiosHeaders } from "axios";
import { createServer, RequestListener, Server } from "node:http";
import { AddressInfo } from "node:net";
import { apiClient } from "./apiClient";

const response = (config: Parameters<AxiosAdapter>[0], data = {}) => ({
  config,
  data,
  status: 200,
  statusText: "OK",
  headers: new AxiosHeaders(),
});

describe("Accounts request boundaries", () => {
  const originalAdapter = apiClient.instance.defaults.adapter;
  const originalBaseURL = apiClient.instance.defaults.baseURL;
  let server: Server | undefined;

  afterEach(async () => {
    apiClient.instance.defaults.adapter = originalAdapter;
    apiClient.instance.defaults.baseURL = originalBaseURL;
    if (server) {
      server.closeAllConnections();
      await new Promise<void>((resolve) => server!.close(() => resolve()));
      server = undefined;
    }
  });

  const serve = async (handler: RequestListener) => {
    server = createServer(handler);
    await new Promise<void>((resolve) => server!.listen(0, "127.0.0.1", resolve));
    apiClient.instance.defaults.baseURL = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    apiClient.instance.defaults.adapter = axios.getAdapter("http");
  };

  it("only bounds profile and refresh at the actual Axios adapter", async () => {
    const adapter = vi.fn<AxiosAdapter>(async (config) => response(config));
    apiClient.instance.defaults.adapter = adapter;

    await apiClient.auth.getUserProfile();
    await apiClient.auth.refreshAuthTokens();
    await apiClient.wallet.payWithdrawInvoice({ invoice: "fixture" });
    await apiClient.wallet.payWithdrawInvoice({ invoice: "fixture" }, { timeout: 35_000 });

    expect(adapter.mock.calls.map(([config]) => [config.url, config.timeout])).toEqual([
      ["/auth/me", 10_000],
      ["/auth/refresh-tokens", 10_000],
      ["/wallet/withdraw", 0],
      ["/wallet/withdraw", 35_000],
    ]);
  });

  it("accepts a real slow withdrawal response beyond the session deadline", async () => {
    let paid = false;
    await serve((request, res) => {
      expect(request.url).toBe("/wallet/withdraw");
      setTimeout(() => {
        paid = true;
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ paid }));
      }, 10_200);
    });

    const result = await apiClient.wallet.payWithdrawInvoice({ invoice: "fixture" });
    expect(paid).toBe(true);
    expect(result.data).toEqual({ paid: true });
  }, 15_000);

  it("terminates stalled profile and refresh HTTP requests", async () => {
    await serve(() => {});
    const results = await Promise.allSettled([
      apiClient.auth.getUserProfile(),
      apiClient.auth.refreshAuthTokens(),
    ]);
    for (const result of results) {
      expect(result.status).toBe("rejected");
      if (result.status === "rejected") {
        expect(result.reason).toMatchObject({ code: "ECONNABORTED" });
      }
    }
  }, 15_000);

  it("treats a real refresh HTTP 400 as definitive authentication rejection", async () => {
    await serve((request, res) => {
      res.writeHead(request.url === "/auth/me" ? 401 : 400);
      res.end();
    });
    await expect(apiClient.auth.getUserProfile()).rejects.toMatchObject({
      config: { url: "/auth/me" },
      response: { status: 401 },
    });
  });

  it("shares one refresh across concurrent 401s and retries each request once", async () => {
    let releaseRefresh!: () => void;
    const refresh = new Promise<void>((resolve) => {
      releaseRefresh = resolve;
    });
    const attempts = new Map<string, number>();
    const adapter = vi.fn<AxiosAdapter>(async (config) => {
      const path = config.url!;
      attempts.set(path, (attempts.get(path) ?? 0) + 1);
      if (path === "/auth/refresh-tokens") {
        await refresh;
      } else if (attempts.get(path) === 1) {
        throw new AxiosError("Unauthorized", "ERR_BAD_REQUEST", config, undefined, {
          ...response(config),
          status: 401,
        });
      }
      return response(config);
    });
    apiClient.instance.defaults.adapter = adapter;
    const requests = Promise.all([
      apiClient.auth.getUserProfile(),
      apiClient.wallet.payWithdrawInvoice({ invoice: "fixture" }, { timeout: 35_000 }),
    ]);
    await vi.waitFor(() => expect(attempts.get("/auth/refresh-tokens")).toBe(1));
    releaseRefresh();
    await requests;
    expect(Object.fromEntries(attempts)).toEqual({
      "/auth/me": 2,
      "/wallet/withdraw": 2,
      "/auth/refresh-tokens": 1,
    });
    const walletCalls = adapter.mock.calls.filter(([config]) => config.url === "/wallet/withdraw");
    expect(walletCalls.map(([config]) => config.timeout)).toEqual([35_000, 35_000]);
  });

  it("does not recursively refresh a rejected refresh", async () => {
    const adapter = vi.fn<AxiosAdapter>(async (config) => {
      throw new AxiosError("Unauthorized", "ERR_BAD_REQUEST", config, undefined, {
        ...response(config),
        status: 401,
      });
    });
    apiClient.instance.defaults.adapter = adapter;
    await expect(apiClient.auth.getUserProfile()).rejects.toMatchObject({
      response: { status: 401 },
    });
    expect(adapter.mock.calls.map(([config]) => config.url)).toEqual([
      "/auth/me",
      "/auth/refresh-tokens",
    ]);
  });

  it("stops after a second 401 and releases the refresh slot for the next request", async () => {
    const adapter = vi.fn<AxiosAdapter>(async (config) => {
      if (config.url === "/auth/refresh-tokens") return response(config);
      throw new AxiosError("Unauthorized", "ERR_BAD_REQUEST", config, undefined, {
        ...response(config),
        status: 401,
      });
    });
    apiClient.instance.defaults.adapter = adapter;
    for (let i = 0; i < 2; i++) {
      await expect(apiClient.auth.getUserProfile()).rejects.toMatchObject({
        response: { status: 401 },
      });
    }
    expect(adapter.mock.calls.map(([config]) => config.url)).toEqual([
      "/auth/me",
      "/auth/refresh-tokens",
      "/auth/me",
      "/auth/me",
      "/auth/refresh-tokens",
      "/auth/me",
    ]);
  });
});
