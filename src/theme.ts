import { createTheme, ThemeOptions } from "@mui/material";
import createPalette from "@mui/material/styles/createPalette";

declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    "0": true;
    "1": true;
  }
}

const palette = createPalette({ mode: "dark" });

export const theme = createTheme({
  palette,
  typography: {
    0: {
      color: palette.primary.main,
    },
    1: {
      color: palette.secondary.main,
    },
  },
  components: {
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
            color: "rgb(0, 0, 0, 0.5)",
          },
        },
      },
    },
  },
} as ThemeOptions);
