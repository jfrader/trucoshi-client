import { describe, expect, it, vi } from "vitest";
import {
  UNAVAILABLE_ADMISSION_STATUS,
  createAdmissionStatusReader,
  sanitizeAdmissionStatus,
} from "./admission.mjs";

const response = (body, ok = true) => ({
  ok,
  json: async () => body,
});

describe("admission proxy", () => {
  it("sanitizes a valid ops response to the four public fields", () => {
    const status = sanitizeAdmissionStatus({
      admission: "draining",
      acceptingNewGames: false,
      betsEnabled: true,
      counts: { activeMatches: 12 },
      token: "never-return-this",
      version: "server-1",
    });

    expect(status).toEqual({
      admission: "draining",
      acceptingNewGames: false,
      available: true,
      version: "server-1",
    });
    expect(Object.keys(status).sort()).toEqual([
      "acceptingNewGames",
      "admission",
      "available",
      "version",
    ]);
  });

  it.each([
    null,
    {},
    { admission: "accepting", acceptingNewGames: false, version: "server-1" },
    { admission: "draining", acceptingNewGames: true, version: "server-1" },
    { admission: "unknown", acceptingNewGames: false, version: "server-1" },
  ])("fails closed for invalid or inconsistent status", (payload) => {
    expect(sanitizeAdmissionStatus(payload)).toEqual(UNAVAILABLE_ADMISSION_STATUS);
  });

  it("fails closed without runtime configuration and makes no request", async () => {
    const fetchImpl = vi.fn();
    const readStatus = createAdmissionStatusReader({ fetchImpl });

    await expect(readStatus({ serverUrl: "https://game.example.test" })).resolves.toEqual(
      UNAVAILABLE_ADMISSION_STATUS,
    );
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("uses the server-only bearer token and never returns private fields", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      response({
        admission: "accepting",
        acceptingNewGames: true,
        betsEnabled: true,
        counts: { queuedPlayers: 4 },
        version: "server-2",
      }),
    );
    const readStatus = createAdmissionStatusReader({ fetchImpl });

    const status = await readStatus({
      serverUrl: "https://game.example.test/",
      statusToken: "status-secret",
    });

    expect(fetchImpl).toHaveBeenCalledWith(
      "https://game.example.test/ops/status",
      expect.objectContaining({
        headers: {
          Accept: "application/json",
          Authorization: "Bearer status-secret",
        },
        method: "GET",
      }),
    );
    expect(status).toEqual({
      admission: "accepting",
      acceptingNewGames: true,
      available: true,
      version: "server-2",
    });
    expect(JSON.stringify(status)).not.toMatch(/secret|counts|betsEnabled/i);
  });

  it("deduplicates requests and uses a short cache", async () => {
    let now = 1_000;
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(
        response({ admission: "accepting", acceptingNewGames: true, version: "server-3" }),
      );
    const readStatus = createAdmissionStatusReader({
      cacheTtlMs: 25,
      fetchImpl,
      now: () => now,
    });
    const config = { serverUrl: "https://game.example.test", statusToken: "status-secret" };

    await Promise.all([readStatus(config), readStatus(config)]);
    expect(fetchImpl).toHaveBeenCalledOnce();

    now += 26;
    await readStatus(config);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("returns the same sanitized closed response for upstream failures", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error("sensitive upstream failure"));
    const readStatus = createAdmissionStatusReader({ fetchImpl });

    await expect(
      readStatus({ serverUrl: "https://game.example.test", statusToken: "status-secret" }),
    ).resolves.toEqual(UNAVAILABLE_ADMISSION_STATUS);
  });
});
