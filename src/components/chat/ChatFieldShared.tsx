import { Theme } from "@mui/material";
import { ButtonGroupProps, ButtonProps, TextFieldProps } from "@mui/material";

export interface ChatFieldProps {
  alwaysVisible?: boolean;
  active?: boolean;
  chat: (message: string) => void;
  isLoading: boolean;
}

export const buttonGroupProps: ButtonGroupProps = {
  size: "small",
  fullWidth: true,
  component: "div",
  sx: (theme: Theme) => ({
    background: theme.trucoshiUi.chatDrawer.railBackground,
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
  sx: (theme: Theme) => ({
    background: theme.trucoshiUi.chatDrawer.actionButtonBackground,
    flexGrow: 1,
  }),
};
