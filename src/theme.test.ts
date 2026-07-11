import { themes } from "./theme";

describe("application shell themes", () => {
  it("keeps a distinct background for each theme variant", () => {
    const shellBackgrounds = [
      themes.light.trucoshiUi.shell.background,
      themes.trucoshi.trucoshiUi.shell.background,
      themes.dark.trucoshiUi.shell.background,
    ];

    expect(new Set(shellBackgrounds).size).toBe(3);
    expect(themes.dark.palette.background.default).toBe("#000");
    expect(themes.dark.trucoshiUi.shell.background).not.toContain("#1f3828");
  });

  it("darkens the gameplay room without changing the table felt", () => {
    expect(themes.dark.trucoshiUi.board.shellBackground).not.toBe(
      themes.trucoshi.trucoshiUi.board.shellBackground,
    );
    expect(themes.dark.trucoshiUi.board.feltPrimary).toBe(
      themes.trucoshi.trucoshiUi.board.feltPrimary,
    );
    expect(themes.dark.trucoshiUi.board.surfaceBackground).toBe(
      themes.trucoshi.trucoshiUi.board.surfaceBackground,
    );
  });
});
