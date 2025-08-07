import { PaletteMode, Theme } from "@mui/material";
import { Theme as EmojiTheme } from "emoji-picker-react";
import { ButtonGroupProps, ButtonProps, TextFieldProps } from "@mui/material";

export interface ChatFieldProps {
  alwaysVisible?: boolean;
  disableEmojis?: boolean;
  active?: boolean;
  chat: (message: string) => void;
  isLoading: boolean;
}

export interface EmojiOption {
  label: string;
  emoji: string;
}

export const PALETTE_EMOJI_THEME_MAP: Record<PaletteMode, EmojiTheme> = {
  light: EmojiTheme.LIGHT,
  dark: EmojiTheme.DARK,
};

export const buttonGroupProps: ButtonGroupProps = {
  size: "small",
  fullWidth: true,
  component: "div",
  sx: (theme: Theme) => ({
    background: theme.palette.background.paper,
    display: "flex",
    alignItems: "center",
  }),
};

export const sendButtonProps: ButtonProps = {
  color: "warning",
  variant: "text",
  size: "small",
  type: "submit",
  sx: (theme: Theme) => ({
    width: theme.spacing(4),
  }),
};

export const textFieldProps: TextFieldProps = {
  fullWidth: true,
  color: "warning",
  size: "small",
  "aria-autocomplete": "none",
  autoComplete: "off",
  sx: { flexGrow: 1 },
};
