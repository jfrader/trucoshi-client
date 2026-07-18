import { AppBar, Box, IconButton, Stack, Switch, Toolbar, Typography } from "@mui/material";
import { useTrucoshi } from "../../trucoshi/hooks/useTrucoshi";
import { Link } from "../../shared/Link";
import { TrucoshiText } from "../../shared/TrucoshiText";
import { Close, Login, Menu } from "@mui/icons-material";
import { UserAvatar } from "../../shared/UserAvatar";
import { CardThemeSelector } from "../card/CardThemeSelector";

export const Topbar = ({
  embedded = false,
  compact = false,
}: {
  embedded?: boolean;
  compact?: boolean;
}) => {
  const [{ isSidebarOpen, account, dark }, { setSidebarOpen, setDark }] = useTrucoshi();

  const compactContent = (
    <Stack direction="row" spacing={embedded ? 1 : 2} alignItems="center">
      <CardThemeSelector />
      {account ? (
        <Link to="/profile">
          <Stack direction="row" fontSize="small" gap={1} alignItems="center">
            <UserAvatar size="small" account={account} />
            <Box display={embedded ? "none" : { xs: "none", sm: "inline" }}>{account.name}</Box>
          </Stack>
        </Link>
      ) : (
        <IconButton component={Link} title="Iniciar Sesion" to="/login">
          <Login fontSize="small" />
        </IconButton>
      )}
      <IconButton title="Menu" size="small" onClick={() => setSidebarOpen((current) => !current)}>
        {isSidebarOpen ? <Close /> : <Menu />}
      </IconButton>
    </Stack>
  );

  const toolbar = (
    <Toolbar
      variant="dense"
      disableGutters={embedded}
      sx={
        embedded
          ? { minHeight: "40px !important", px: 0, mx: 0, background: "transparent" }
          : undefined
      }
    >
      {compact ? (
        compactContent
      ) : (
        <>
          {!embedded ? (
            <Stack direction="row" spacing={2} alignItems="center">
              <Link to="/" lineHeight={4}>
                <Typography height="26px" variant="h6">
                  <Box display={{ xs: "none", md: "inline-block" }}>
                    <TrucoshiText height="26px" />
                  </Box>
                </Typography>
              </Link>
              <Switch
                size="small"
                title="Dark Theme"
                defaultChecked={Boolean(dark)}
                onChange={() =>
                  setDark((current) => {
                    return current ? "" : "true";
                  })
                }
              />
            </Stack>
          ) : null}
          <Box flexGrow={1} pr={2} />
          {compactContent}
        </>
      )}
    </Toolbar>
  );

  if (embedded) {
    return <Box sx={{ width: "100%" }}>{toolbar}</Box>;
  }

  return <AppBar position="fixed">{toolbar}</AppBar>;
};
