import { AppBar, Box, IconButton, Stack, Switch, Toolbar } from "@mui/material";
import { useTrucoshi } from "../../trucoshi/hooks/useTrucoshi";
import { CardDisplayModeToggle } from "../card/CardDisplayModeToggle";
import { Close, Menu } from "@mui/icons-material";
import { VolumeControl } from "./VolumeControl";
import { TomaMate } from "./TomaMate";
import { TrucoshiResponsiveLogoLink } from "../../shared/TrucoshiResponsiveLogoLink";
import { ProfileIconButton } from "./ProfileIconButton";

export const Topbar = ({
  embedded = false,
  compact = false,
}: {
  embedded?: boolean;
  compact?: boolean;
}) => {
  const [{ isSidebarOpen, dark }, { setSidebarOpen, setDark }] = useTrucoshi();

  const compactContent = (
    <Stack direction="row" spacing={embedded ? 1 : 2} alignItems="center">
      <ProfileIconButton textNameSm={!embedded} />
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
          <Stack direction="row" spacing={embedded ? 1 : 2} alignItems="center">
            {embedded ? (
              <>
                <VolumeControl />
                <TomaMate />
                <CardDisplayModeToggle />
              </>
            ) : (
              <>
                <TrucoshiResponsiveLogoLink />
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
                <VolumeControl />
                <TomaMate />
                <CardDisplayModeToggle />
              </>
            )}
          </Stack>
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
