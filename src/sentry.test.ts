const mocks = vi.hoisted(() => ({
  init: vi.fn(),
}));

vi.mock("@sentry/react", () => ({
  init: mocks.init,
}));

describe("sentry initialization", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    mocks.init.mockClear();
  });

  it("initializes Sentry with the configured runtime metadata", async () => {
    vi.stubEnv("VITE_APP_ENVIRONMENT", "production");
    vi.stubEnv("VITE_APP_NAME", "trucoshi-client");
    vi.stubEnv("VITE_APP_VERSION", "12.3.0");
    vi.stubEnv("VITE_SENTRY_DSN", "https://example@sentry.local/1");

    await import("./sentry");

    expect(mocks.init).toHaveBeenCalledWith({
      dsn: "https://example@sentry.local/1",
      environment: "production",
      release: "trucoshi-client@12.3.0",
      sendDefaultPii: false,
    });
  });
});
