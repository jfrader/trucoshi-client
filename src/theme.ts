import { createTheme, ThemeOptions } from "@mui/material";
import createPalette from "@mui/material/styles/createPalette";

declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    "0": true;
    "1": true;
  }
}

declare module "@mui/material/Button" {
  interface ButtonPropsVariantOverrides {
    card: true;
    emojicard: true;
  }
}

const palette = createPalette({
  mode: "dark",
  primary: {
    main: "#ec6c34",
    dark: "#d15829",
    light: "#f17e59",
    contrastText: "#fff",
  },
  secondary: {
    main: "#9c548c",
    dark: "#6d315e",
    light: "#c28fb5",
    contrastText: "#fff",
  },
  success: {
    main: "#749424",
    dark: "#5d751c",
    light: "#8bc450",
    contrastText: "#fff",
  },
  warning: {
    main: "#c4941c",
    dark: "#a0721a",
    light: "#e2b246",
    contrastText: "#fff",
  },
  info: {
    main: "#248493",
    dark: "#1c6a7a",
    light: "#4a9bb2",
    contrastText: "#fff",
  },
  error: {
    main: "#94342c",
    dark: "#6f2821",
    light: "#b54940",
    contrastText: "#fff",
  },
  background: {
    paper: "#182c1c",
    default: "#44644c",
  },
  text: {
    secondary: "#f3e3db",
    disabled: "rgba(255, 255, 255, 0.3)",
  },
});

export const theme = createTheme({
  palette,
  typography: [
    {
      color: palette.primary.main,
    },
    {
      color: palette.secondary.main,
    },
  ],
  components: {
    MuiLinearProgress: {
      styleOverrides: {
        bar: {
          transition: "none",
        },
      },
    },
    MuiButton: {
      variants: [
        {
          props: { variant: "card" },
          style: ({ theme }) => ({
            padding: 0,
            minWidth: "initial",
            minHeight: "initial",
            background: 'transparent',
            color: theme.palette.background.paper,
            border: "none",
          }),
        },
        {
          props: { variant: "emojicard" },
          style: ({ theme }) => ({
            minWidth: "initial",
            padding: 0,
            background: theme.palette.text.secondary,
            color: theme.palette.background.paper,
            borderColor: theme.palette.background.paper,
            border: "1px solid",
            ":active": {
              background: theme.palette.text.secondary,
            },
            ":hover": {
              background: theme.palette.text.secondary,
            },
          }),
        },
        {
          props: { variant: "emojicard", name: "1e" },
          style: () => ({
            // animation: `${glow} 1s infinite alternate`,
          }),
        },
        {
          props: { variant: "emojicard", name: "xx" },
          style: ({ theme }) => ({
            border: "1px solid",
            background: theme.palette.error.main,
            color: theme.palette.background.paper,
            borderColor: theme.palette.background.paper,
            ":active": {
              background: theme.palette.error.main,
            },
            ":hover": {
              background: theme.palette.error.main,
            },
          }),
        },
      ],
    },
    MuiListItemButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          background: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.background.default}`,
        }),
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: ({ theme }) => ({
          background: theme.palette.background.paper,
        }),
      },
    },
    MuiTypography: {
      variants: [
        {
          props: { color: "success" },
          style: {
            color: palette.success.main,
          },
        },
        {
          props: { color: "warning" },
          style: {
            color: palette.warning.main,
          },
        },
      ],
    },
    MuiLink: {
      styleOverrides: {
        root: {
          textDecoration: "none",
          "&:hover": {
            opacity: 0.5,
          },
        },
      },
    },
  },
} as ThemeOptions);
