import { AppBar, Box, IconButton, Stack, Switch, Toolbar, Typography } from "@mui/material";
import { useTrucoshi } from "../../trucoshi/hooks/useTrucoshi";
import { Link } from "../../shared/Link";
import { TrucoshiText } from "../../shared/TrucoshiText";
import { Close, Login, Menu } from "@mui/icons-material";
import { UserAvatar } from "../../shared/UserAvatar";
import { CardThemeSelector } from "../card/CardThemeSelector";
import { useLocation } from "react-router-dom";

export const Topbar = ({
  embedded = false,
  compact = false,
}: {
  embedded?: boolean;
  compact?: boolean;
}) => {
  const { pathname } = useLocation();
  const [{ isSidebarOpen, account, activeMatches, dark }, { setSidebarOpen, setDark }] =
    useTrucoshi();
  const isMatchRoute = pathname === "/match" || pathname.startsWith("/match/");
  const activeMatchCount = activeMatches.length;
  const showActiveMatchBadge = !isSidebarOpen && !isMatchRoute && activeMatchCount > 0;
  const menuLabel = isSidebarOpen
    ? "Cerrar menú"
    : showActiveMatchBadge
      ? `Abrir menú, ${activeMatchCount} ${activeMatchCount === 1 ? "partida activa" : "partidas activas"}`
      : "Abrir menú";

  const compactContent = (
    <Stack direction="row" spacing={0.5} alignItems="center">
      {compact && !embedded ? (
        <Switch
          size="small"
          title="Tema oscuro"
          checked={Boolean(dark)}
          onChange={() => setDark((current) => (current ? "" : "true"))}
        />
      ) : null}
      <CardThemeSelector />
      {account ? (
        <Link to="/account" aria-label="Mi cuenta">
          <Stack direction="row" fontSize="small" gap={1} alignItems="center">
            <UserAvatar size="small" account={account} />
            <Box display={embedded || compact ? "none" : { xs: "none", sm: "inline" }}>
              {account.name}
            </Box>
          </Stack>
        </Link>
      ) : (
        <IconButton component={Link} title="Iniciar Sesion" to="/login">
          <Login fontSize="small" />
        </IconButton>
      )}
      <Box
        sx={(theme) => ({
          position: "relative",
          width: theme.trucoshiUi.navigation.controlSize,
          height: theme.trucoshiUi.navigation.controlSize,
          flex: "0 0 auto",
          overflow: "visible",
        })}
      >
        <IconButton
          aria-label={menuLabel}
          title="Menu"
          size="small"
          onClick={() => setSidebarOpen((current) => !current)}
          sx={{ width: "100%", height: "100%", p: 0 }}
        >
          {isSidebarOpen ? <Close fontSize="small" /> : <Menu fontSize="small" />}
        </IconButton>
        {showActiveMatchBadge ? (
          <Box
            aria-hidden="true"
            component="span"
            sx={{
              position: "absolute",
              top: 2,
              right: 2,
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: "primary.main",
              pointerEvents: "none",
            }}
          />
        ) : null}
      </Box>
    </Stack>
  );

  const toolbar = (
    <Toolbar
      variant="dense"
      disableGutters
      sx={(theme) => ({
        minHeight: embedded
          ? `${theme.trucoshiUi.navigation.gameBarHeight} !important`
          : {
              xs: `${theme.trucoshiUi.navigation.appBarHeightMobile} !important`,
              md: `${theme.trucoshiUi.navigation.appBarHeightDesktop} !important`,
            },
        height: embedded
          ? theme.trucoshiUi.navigation.gameBarHeight
          : {
              xs: theme.trucoshiUi.navigation.appBarHeightMobile,
              md: theme.trucoshiUi.navigation.appBarHeightDesktop,
            },
        px: `${theme.trucoshiUi.navigation.edgeInset} !important`,
        mx: 0,
        background: embedded ? "transparent" : undefined,
      })}
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
              {!compact ? (
                <Switch
                  size="small"
                  title="Tema oscuro"
                  checked={Boolean(dark)}
                  onChange={() => setDark((current) => (current ? "" : "true"))}
                />
              ) : null}
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

  return (
    <AppBar position="fixed" sx={(theme) => ({ zIndex: theme.zIndex.drawer + 3 })}>
      {toolbar}
    </AppBar>
  );
};
