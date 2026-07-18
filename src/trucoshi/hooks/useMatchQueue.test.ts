import { reduceQueueStatus } from "./useMatchQueue";

describe("reduceQueueStatus", () => {
  const current = { requestId: "queue-1" } as any;

  it("clears queue state when the shared server emits null", () => {
    expect(reduceQueueStatus(current, null)).toBeNull();
  });

  it("accepts matching updates and ignores stale request ids", () => {
    const next = { requestId: "queue-1", queuedPlayers: 2 } as any;
    expect(reduceQueueStatus(current, next)).toBe(next);
    expect(reduceQueueStatus(current, { requestId: "queue-2" } as any)).toBe(current);
  });
});
