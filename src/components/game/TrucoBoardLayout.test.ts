import { buildPlayers } from "../../test/fixtures/gameFixtures";
import { buildTableOrderSlots } from "./TrucoBoardLayout";

describe("buildTableOrderSlots", () => {
  it("preserves clockwise turn order for a team-zero player", () => {
    const players = buildPlayers(6, "p1");

    expect(buildTableOrderSlots(players).map((slot) => slot.player?.key)).toEqual([
      "p1",
      "p2",
      "p3",
      "p4",
      "p5",
      "p6",
    ]);
  });

  it("preserves clockwise turn order with a team-one player at bottom-center", () => {
    const tableOrder = buildPlayers(6, "p2");
    const serverOrder = [...tableOrder.slice(1), tableOrder[0]];

    expect(buildTableOrderSlots(serverOrder).map((slot) => slot.player?.key)).toEqual([
      "p2",
      "p3",
      "p4",
      "p5",
      "p6",
      "p1",
    ]);
  });

  it("rotates an unrotated table order so the local player is bottom-center", () => {
    const players = buildPlayers(4, "p4");

    expect(buildTableOrderSlots(players).map((slot) => slot.player?.key)).toEqual([
      "p4",
      "p1",
      "p2",
      "p3",
    ]);
  });
});
