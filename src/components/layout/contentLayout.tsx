import { Stack, styled } from "@mui/material";

export const CONTENT_GUTTER = {
  mobile: 1.75,
  desktop: 2.25,
} as const;

export const contentGutterSx = {
  xs: CONTENT_GUTTER.mobile,
  sm: CONTENT_GUTTER.desktop,
} as const;

export const ContentPageStack = styled(Stack)(({ theme }) => ({
  width: "100%",
  marginInline: "auto",
  gap: theme.spacing(2.25),
  animation: "contentPageReveal 360ms ease-out both",
  "@keyframes contentPageReveal": {
    from: { opacity: 0, transform: "translateY(8px)" },
    to: { opacity: 1, transform: "translateY(0)" },
  },
  "@media (prefers-reduced-motion: reduce)": {
    animation: "none",
  },
}));
