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
  match: {
    scoreCard: Record<string, any>;
    topBadge: Record<string, any>;
    settingsButton: Record<string, any>;
    emptySeat: Record<string, any>;
    announcementPanel: Record<string, any>;
    handPanel: Record<string, any>;
    waitingPanel: Record<string, any>;
  };
  lobby: {
    seatCard: Record<string, any>;
  };
  chatDrawer: {
    actionsPanelBorder: string;
    actionsPanelBackground: string;
    actionsPanelShadow: string;
    actionButtonBorder: string;
    actionButtonBackground: string;
    actionButtonShadow: string;
    announcementPanelBorder: string;
    announcementPanelBackground: string;
    announcementPanelShadow: string;
    drawerPanelBackground: string;
    drawerPanelBorderTop: string;
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
  match: {
    scoreCard: {
      px: { xs: 1.2, sm: 1.35 },
      py: { xs: 0.55, sm: 0.7 },
      minWidth: { xs: "5.2rem", sm: "5.55rem" },
      borderRadius: "0.95rem",
      background: "linear-gradient(170deg, rgba(19, 43, 35, 0.9), rgba(7, 24, 20, 0.92))",
      border: "1px solid rgba(255,255,255,0.16)",
      boxShadow: "0 10px 20px rgba(0,0,0,0.34)",
    },
    topBadge: {
      px: { xs: 1.35, sm: 1.6 },
      py: { xs: 0.56, sm: 0.7 },
      borderRadius: "0.8rem",
      bgcolor: "rgba(13, 27, 22, 0.89)",
      border: "1px solid rgba(255,255,255,0.15)",
      boxShadow: "0 8px 18px rgba(0,0,0,0.28)",
    },
    settingsButton: {
      bgcolor: "rgba(23, 18, 13, 0.96)",
      color: "warning.light",
      border: "1px solid rgba(255,255,255,0.2)",
      boxShadow: "0 8px 16px rgba(0,0,0,0.35)",
    },
    emptySeat: {
      borderRadius: "999px",
      border: "1px dashed rgba(255,255,255,0.35)",
      bgcolor: "rgba(7,15,12,0.5)",
      px: 1.05,
      py: 0.45,
      textAlign: "center",
      minWidth: "4.2rem",
    },
    announcementPanel: {
      borderRadius: "0.8rem",
      bgcolor: "rgba(14, 23, 20, 0.88)",
      border: "1px solid rgba(255,255,255,0.14)",
      boxShadow: "0 8px 14px rgba(0,0,0,0.28)",
    },
    handPanel: {
      borderRadius: "0.86rem",
      background:
        "linear-gradient(180deg, rgba(112,72,39,0.96) 0%, rgba(70,45,27,0.98) 18%, rgba(45,28,18,0.98) 100%)",
      border: "1px solid rgba(255,255,255,0.16)",
      overflow: "hidden",
      boxShadow:
        "0 10px 20px rgba(0,0,0,0.35), inset 0 2px 0 rgba(255,255,255,0.08), inset 0 -5px 12px rgba(0,0,0,0.28)",
    },
    waitingPanel: {
      borderRadius: "0.75rem",
      bgcolor: "rgba(33, 23, 16, 0.82)",
      border: "1px solid rgba(255,255,255,0.12)",
      boxShadow: "0 6px 14px rgba(0,0,0,0.24)",
    },
  },
  lobby: {
    seatCard: {
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      background: "rgba(17, 28, 24, 0.87)",
      border: "1px solid rgba(255,255,255,0.12)",
      boxShadow: "0 10px 22px rgba(0,0,0,0.34)",
    },
  },
  chatDrawer: {
    actionsPanelBorder: "1px solid rgba(255,255,255,0.12)",
    actionsPanelBackground:
      "linear-gradient(180deg, rgba(92,58,34,0.95), rgba(63,39,24,0.98) 40%, rgba(42,27,17,0.98))",
    actionsPanelShadow: "0 8px 18px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.06)",
    actionButtonBorder: "1px solid rgba(255,255,255,0.2)",
    actionButtonBackground:
      "linear-gradient(165deg, rgba(52,52,48,0.97), rgba(31,30,28,0.97))",
    actionButtonShadow: "0 6px 12px rgba(0,0,0,0.35)",
    announcementPanelBorder: "1px solid rgba(255,255,255,0.12)",
    announcementPanelBackground: "rgba(9,16,14,0.94)",
    announcementPanelShadow: "0 10px 26px rgba(0,0,0,0.4)",
    drawerPanelBackground:
      "linear-gradient(180deg, rgba(17,24,22,0.98), rgba(9,14,13,0.99))",
    drawerPanelBorderTop: "1px solid rgba(255,255,255,0.12)",
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
