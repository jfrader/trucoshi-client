import {
  ADMISSION_DRAIN_ERROR_MESSAGE,
  CLOSED_GAME_ADMISSION,
  canStartNewGame,
  isAdmissionDrainError,
  parseGameAdmission,
} from "./admission";

describe("game admission", () => {
  it("accepts only a consistent sanitized public payload", () => {
    const accepting = {
      admission: "accepting" as const,
      acceptingNewGames: true,
      available: true,
      version: "server-1",
    };

    expect(parseGameAdmission(accepting)).toEqual(accepting);
    expect(canStartNewGame(accepting)).toBe(true);
  });

  it.each([
    null,
    {},
    { admission: "accepting", acceptingNewGames: false, available: true, version: "server-1" },
    { admission: "draining", acceptingNewGames: false, available: true, version: null },
  ])("fails closed for invalid client payloads", (payload) => {
    expect(parseGameAdmission(payload)).toEqual(CLOSED_GAME_ADMISSION);
  });

  it("matches only the exact structured maintenance SocketError", () => {
    expect(
      isAdmissionDrainError({ code: "FORBIDDEN", message: ADMISSION_DRAIN_ERROR_MESSAGE }),
    ).toBe(true);
    expect(
      isAdmissionDrainError({
        error: { code: "FORBIDDEN", message: ADMISSION_DRAIN_ERROR_MESSAGE },
      }),
    ).toBe(true);
    expect(isAdmissionDrainError({ code: "FORBIDDEN", message: "No permitido" })).toBe(false);
    expect(isAdmissionDrainError({ message: ADMISSION_DRAIN_ERROR_MESSAGE })).toBe(false);
  });

  it("gives an explicit transport payload precedence over an outer error", () => {
    expect(
      isAdmissionDrainError({
        code: "FORBIDDEN",
        message: ADMISSION_DRAIN_ERROR_MESSAGE,
        response: { data: { code: "CONFLICT", message: "La partida ya existe" } },
      }),
    ).toBe(false);
  });
});
