import { Box, CircularProgress, Stack, styled, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { CONTENT_GUTTER, ContentPageStack, contentGutterSx } from "../layout/contentLayout";

export const AccountPageRoot = styled(ContentPageStack)(() => ({
  maxWidth: "78rem",
}));

export const AccountContentLoading = ({ minHeight = "22rem" }: { minHeight?: string | number }) => (
  <Stack alignItems="center" justifyContent="center" minHeight={minHeight} gap={1.25}>
    <CircularProgress color="warning" size={34} />
    <Typography color="text.secondary" variant="body2" fontWeight={700}>
      Cargando tu cuenta…
    </Typography>
  </Stack>
);

export const AccountHeroSurface = styled(Box)(({ theme }) => ({
  position: "relative",
  isolation: "isolate",
  overflow: "hidden",
  padding: theme.spacing(2.25),
  textAlign: "left",
  ...theme.trucoshiUi.account.hero,
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(3),
  },
}));

export const AccountColumns = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  alignItems: "start",
  gap: theme.spacing(2.25),
  [theme.breakpoints.up("lg")]: {
    gridTemplateColumns: "minmax(0, 0.9fr) minmax(24rem, 1.1fr)",
    gap: theme.spacing(2.75),
  },
}));

export const AccountPanel = styled("section")(({ theme }) => ({
  overflow: "hidden",
  textAlign: "left",
  ...theme.trucoshiUi.account.panel,
}));

export const AccountPanelHeader = ({
  title,
  description,
}: {
  title: string;
  description?: string;
}) => (
  <Box sx={{ px: contentGutterSx, pt: contentGutterSx, pb: 1.4 }}>
    <Typography component="h2" variant="h6" fontWeight={950}>
      {title}
    </Typography>
    {description ? (
      <Typography color="text.secondary" variant="body2" sx={{ mt: 0.35 }}>
        {description}
      </Typography>
    ) : null}
  </Box>
);

export const AccountSettingsList = styled(Stack)(({ theme }) => ({
  borderTop: `1px solid ${theme.trucoshiUi.account.divider}`,
}));

const SettingRowRoot = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.25),
  minHeight: 72,
  padding: theme.spacing(1.35, CONTENT_GUTTER.mobile),
  borderBottom: `1px solid ${theme.trucoshiUi.account.divider}`,
  "&:last-of-type": {
    borderBottom: 0,
  },
  [theme.breakpoints.up("sm")]: {
    gap: theme.spacing(1.5),
    padding: theme.spacing(1.5, CONTENT_GUTTER.desktop),
  },
}));

export const AccountIconFrame = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  ...theme.trucoshiUi.account.iconFrame,
  "& svg": {
    fontSize: "1.25rem",
  },
}));

export const AccountSettingRow = ({
  icon,
  title,
  description,
  action,
  testId,
}: {
  icon: ReactNode;
  title: string;
  description: ReactNode;
  action?: ReactNode;
  testId?: string;
}) => (
  <SettingRowRoot data-testid={testId}>
    <AccountIconFrame aria-hidden="true">{icon}</AccountIconFrame>
    <Box flex={1} minWidth={0}>
      <Typography fontWeight={900} lineHeight={1.2}>
        {title}
      </Typography>
      <Typography
        component="div"
        color="text.secondary"
        variant="body2"
        sx={{ mt: 0.25, overflowWrap: "anywhere" }}
      >
        {description}
      </Typography>
    </Box>
    {action ? <Box sx={{ flexShrink: 0 }}>{action}</Box> : null}
  </SettingRowRoot>
);

export const AccountInset = styled(Box)(({ theme }) => ({
  ...theme.trucoshiUi.account.inset,
}));
