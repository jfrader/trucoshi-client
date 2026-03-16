import { createTheme, ThemeOptions } from "@mui/material";
import createPalette, { PaletteColorOptions } from "@mui/material/styles/createPalette";
import { BURNT_CARD } from "trucoshi";

declare module "@mui/material" {
  interface Palette {
    twitter: PaletteColorOptions;
  }

  interface PaletteOptions {
    twitter: PaletteColorOptions;
  }

  interface ButtonPropsColorOverrides {
    twitter: true;
  }
}

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

type TrucoshiUiTokens = {
  board: {
    feltPrimary: string;
    feltSecondary: string;
    feltTertiary: string;
    woodPrimary: string;
    woodSecondary: string;
    shadow: string;
    shellBackground: string;
    shellOverlay: string;
    surfaceBackground: string;
    surfaceShadow: string;
  };
  commandBar: {
    background: string;
    defaultActionColor: string;
    envidoBaseColor: string;
    envidoBestColor: string;
    actionColors: Record<string, string>;
  };
};

declare module "@mui/material/styles" {
  interface Theme {
    trucoshiUi: TrucoshiUiTokens;
  }

  interface ThemeOptions {
    trucoshiUi?: Partial<TrucoshiUiTokens>;
  }
}

const defaultTrucoshiUiTokens: TrucoshiUiTokens = {
  board: {
    feltPrimary: "#1b6250",
    feltSecondary: "#0f4a3d",
    feltTertiary: "#0a332a",
    woodPrimary: "#7d4e2d",
    woodSecondary: "#442916",
    shadow: "rgba(0, 0, 0, 0.5)",
    shellBackground:
      "radial-gradient(110% 75% at 50% 4%, rgba(255,255,255,0.08), transparent 64%), radial-gradient(130% 90% at 50% 100%, rgba(0,0,0,0.42), transparent 70%), linear-gradient(160deg, #113b31 0%, #0d2f29 62%, #08211d 100%)",
    shellOverlay:
      "radial-gradient(circle at 10% 8%, rgba(255,255,255,0.05), transparent 30%), radial-gradient(circle at 88% 12%, rgba(255,255,255,0.04), transparent 28%), radial-gradient(circle at 18% 92%, rgba(0,0,0,0.3), transparent 25%), radial-gradient(circle at 84% 88%, rgba(0,0,0,0.34), transparent 26%)",
    surfaceBackground:
      "radial-gradient(circle at 34% 28%, rgba(255,255,255,0.09), transparent 23%), radial-gradient(circle at 70% 72%, rgba(255,255,255,0.045), transparent 20%), radial-gradient(circle at 50% 50%, rgba(0,0,0,0.22), transparent 68%), linear-gradient(166deg, var(--felt-primary), var(--felt-secondary) 66%, var(--felt-tertiary) 100%)",
    surfaceShadow:
      "0 16px 36px var(--board-shadow), inset 0 0 0 1px rgba(255,255,255,0.08), inset 0 -24px 35px rgba(0,0,0,0.24)",
  },
  commandBar: {
    background:
      "linear-gradient(164deg, rgba(63, 36, 22, 0.97) 0%, rgba(32, 20, 12, 0.98) 70%, rgba(25, 16, 11, 0.98) 100%)",
    defaultActionColor: "#3d7051",
    envidoBaseColor: "#7a3229",
    envidoBestColor: "#3d7a45",
    actionColors: {
      truco: "#ab3a2a",
      reTruco: "#b43a29",
      valeCuatro: "#c03d2b",
      envido: "#3d546a",
      realEnvido: "#7a6640",
      faltaEnvido: "#6c5b36",
      flor: "#4b6938",
      contraflor: "#4e6a39",
      contraflorAlResto: "#4e6a39",
      quiero: "#3d7a45",
      noQuiero: "#4a3224",
      sonBuenas: "#5c3e2c",
      achico: "#5b3b2a",
      paso: "#435260",
      mazo: "#5f2e24",
    },
  },
};

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
  twitter: {
    main: "#00acee",
    dark: "#1381ab",
    light: "#40bbea",
    contrastText: "#000",
  },
  error: {
    main: "#94342c",
    dark: "#6f2821",
    light: "#b54940",
    contrastText: "#000",
  },
  background: {
    default: "#f0f4f3",
    paper: "#FEFFFD",
  },
  text: {
    primary: "rgba(0, 0, 0, 0.87)",
    secondary: "#03030b",
    disabled: "rgba(0, 0, 0, 0.33)",
  },
});

export const defaultPalette = createPalette({
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
  twitter: {
    main: "#00acee",
    dark: "#1381ab",
    light: "#40bbea",
    contrastText: "#000",
  },
  background: {
    paper: "#182c1c",
    default: "#243728",
  },
  text: {
    primary: "rgba(255, 255, 255, 0.87)",
    secondary: "#f9eefb",
    disabled: "rgba(255, 255, 255, 0.3)",
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
    main: "#4c944c",
    dark: "#3c703c",
    light: "#5fa65f",
    contrastText: "#fff",
  },
  warning: {
    main: "#d79a3e",
    dark: "#ad7d31",
    light: "#e1b665",
    contrastText: "#fff",
  },
  info: {
    main: "#4e9dbd",
    dark: "#3a7a99",
    light: "#6fb9d1",
    contrastText: "#fff",
  },
  error: {
    main: "#c13f3a",
    dark: "#9f3430",
    light: "#d77772",
    contrastText: "#fff",
  },
  twitter: {
    main: "#00acee",
    dark: "#1381ab",
    light: "#40bbea",
    contrastText: "#000",
  },
  background: {
    paper: "#161516",
    default: "#000",
  },
  text: {
    primary: "rgba(255, 255, 255, 0.87)",
    secondary: "#f9eefb",
    disabled: "rgba(255, 255, 255, 0.3)",
  },
});

const base = {
  trucoshiUi: defaultTrucoshiUiTokens,
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
            ":hover": {},
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
        // {
        //   props: { variant: "emojicard", name: "1e" },
        //   style: () => ({
        //     animation: `${glow} 1s infinite alternate`,
        //   }),
        // },
        // {
        //   props: { variant: "card", name: "1e" },
        //   style: () => ({
        //     animation: `${glow} 1s infinite alternate`,
        //   }),
        // },
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
    MuiListItem: {
      styleOverrides: {
        divider: ({ theme }) => ({
          borderColor: theme.palette.background.default,
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

export const trucoshi = createTheme({
  palette: defaultPalette,
  ...base,
} satisfies ThemeOptions);

export const themes = { trucoshi, light, dark };
