import { Card, styled } from "@mui/material";
import { CONTENT_GUTTER } from "../layout/contentLayout";

export const HomePanel = styled(Card)(({ theme }) => ({
  ...theme.trucoshiUi.home.panel,
  "& > .MuiCardContent-root": {
    padding: theme.spacing(CONTENT_GUTTER.mobile),
    "&:last-child": { paddingBottom: theme.spacing(CONTENT_GUTTER.mobile) },
    [theme.breakpoints.up("sm")]: {
      padding: theme.spacing(CONTENT_GUTTER.desktop),
      "&:last-child": { paddingBottom: theme.spacing(CONTENT_GUTTER.desktop) },
    },
  },
}));
