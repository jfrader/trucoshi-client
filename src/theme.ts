import { createTheme } from "@mui/material";
import createPalette from "@mui/material/styles/createPalette";

const palette = createPalette({ mode: "dark" });

export const theme = createTheme({
  palette,
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
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: "rgb(0, 0, 0, 0.9)",
        },
      },
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
});
