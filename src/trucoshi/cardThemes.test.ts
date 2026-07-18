import {
  CARD_THEMES,
  getCardImageUrl,
  normalizeCardTheme,
} from "./cardThemes";

describe("fixed public card themes", () => {
  it("contains only Default, GNU, and Emoji", () => {
    expect(CARD_THEMES).toEqual(["default", "gnu", "emoji"]);
  });

  it("migrates the historical empty Emoji value and rejects removed themes", () => {
    expect(normalizeCardTheme("")).toBe("emoji");
    expect(normalizeCardTheme("criollo")).toBe("default");
    expect(normalizeCardTheme("custom-user-deck")).toBe("default");
    expect(normalizeCardTheme(null)).toBe("default");
  });

  it("uses only the fixed local card directories", () => {
    expect(getCardImageUrl("default", "1e")).toBe("/cards/default/1e.png");
    expect(getCardImageUrl("gnu", "xx")).toBe("/cards/gnu/xx.png");
  });
});
