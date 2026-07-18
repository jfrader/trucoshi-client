export const CARD_THEMES = ["default", "gnu", "emoji"] as const;

export type CardTheme = (typeof CARD_THEMES)[number];

export const DEFAULT_CARD_THEME: CardTheme = "default";

export const isCardTheme = (value: unknown): value is CardTheme =>
  typeof value === "string" && CARD_THEMES.includes(value as CardTheme);

export const normalizeCardTheme = (value: unknown): CardTheme => {
  if (value === "") {
    return "emoji";
  }

  return isCardTheme(value) ? value : DEFAULT_CARD_THEME;
};

export const getCardImageUrl = (
  theme: Exclude<CardTheme, "emoji">,
  card: string,
) => `${import.meta.env.BASE_URL}cards/${theme}/${card}.png`;
