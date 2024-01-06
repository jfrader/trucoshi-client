import { createTheme, ThemeOptions } from "@mui/material";
import createPalette from "@mui/material/styles/createPalette";
import { BURNT_CARD } from "trucoshi";

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

export const lightPalette = createPalette({
  mode: "light",
  primary: {
    main: "#ec6c34",
    dark: "#d15829",
    light: "#f17e59",
    contrastText: "#000",
  },
  secondary: {
    main: "#9c548c",
    dark: "#6d315e",
    light: "#c28fb5",
    contrastText: "#000",
  },
  success: {
    main: "#749424",
    dark: "#5d751c",
    light: "#8bc450",
    contrastText: "#000",
  },
  warning: {
    main: "#c4941c",
    dark: "#a0721a",
    light: "#e2b246",
    contrastText: "#000",
  },
  info: {
    main: "#248493",
    dark: "#1c6a7a",
    light: "#4a9bb2",
    contrastText: "#000",
  },
  error: {
    main: "#94342c",
    dark: "#6f2821",
    light: "#b54940",
    contrastText: "#000",
  },
  background: {
    paper: "#f4f4f4",
    default: "#FEFFFD",
  },
  text: {
    primary: "rgba(0, 0, 0, 0.78)",
    secondary: "#f3e3db",
    disabled: "rgba(0, 0, 0, 0.34)",
  },
});

export const darkPalette = createPalette({
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
    default: "#243728",
  },
  text: {
    primary: "rgba(255, 255, 255, 0.87)",
    secondary: "#f3e3db",
    disabled: "rgba(255, 255, 255, 0.3)",
  },
});

const base = {
  typography: {},
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
            color: theme.palette.background.paper,
            border: "none",
            ":hover": {
            },
          }),
        },
        {
          props: { variant: "emojicard" },
          style: ({ theme }) => ({
            minWidth: "initial",
            padding: 0,
            backgroundColor: theme.palette.text.secondary,
            color: theme.palette.getContrastText(theme.palette.text.secondary),
            border: `1px solid ${theme.palette.background.paper}`,
            ":active": {
              background: theme.palette.text.secondary,
            },
            ":hover": {
              backgroundColor: theme.palette.text.secondary,
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
          props: { variant: "emojicard", name: BURNT_CARD },
          style: ({ theme }) => ({
            border: "1px solid",
            color: theme.palette.background.paper,
            background: theme.palette.error.main,
            // backgroundImage: "url(/trucoshi-logo.svg)",
            // backgroundRepeat: "no-repeat",
            // backgroundPosition: "center center",
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
    MuiPaper: {
      styleOverrides: {
        root: () => ({
          backgroundImage: "none",
        }),
      },
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
          style: ({ theme }) => ({
            color: theme.palette.success.main,
          }),
        },
        {
          props: { color: "warning" },
          style: ({ theme }) => ({
            color: theme.palette.warning.main,
          }),
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
} satisfies ThemeOptions;

export const light = createTheme({
  palette: lightPalette,
  ...base,
} satisfies ThemeOptions);

export const dark = createTheme({
  palette: darkPalette,
  ...base,
} satisfies ThemeOptions);

export const themes = { dark, light };
