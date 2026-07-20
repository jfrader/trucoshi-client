import { Box, Divider, Stack, Typography } from "@mui/material";
import type { IAccountDetails } from "trucoshi";
import { UserAvatar } from "../../shared/UserAvatar";

type PublicPlayer = NonNullable<IAccountDetails["account"]>;

const ProfileMetric = ({ label, value }: { label: string; value: string | number }) => (
  <Stack
    alignItems="center"
    minWidth={0}
    px={{ xs: 1, sm: 2 }}
    py={0.5}
    sx={{ flex: { xs: "1 1 0", sm: "0 0 auto" } }}
  >
    <Typography color="warning.light" fontSize={{ xs: "1.25rem", sm: "1.5rem" }} fontWeight={950}>
      {value}
    </Typography>
    <Typography
      color="text.secondary"
      fontSize="0.68rem"
      fontWeight={850}
      letterSpacing="0.08em"
      textTransform="uppercase"
    >
      {label}
    </Typography>
  </Stack>
);

export const PublicProfileHero = ({
  account,
  win,
  loss,
}: {
  account: PublicPlayer;
  win: number;
  loss: number;
}) => {
  const total = win + loss;
  const winRate = total ? Math.round((win / total) * 100) : 0;

  return (
    <Box
      sx={(theme) => ({
        ...theme.trucoshiUi.account.hero,
        overflow: "hidden",
        p: { xs: 2.25, sm: 3 },
      })}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems="center"
        justifyContent="space-between"
        gap={{ xs: 2.25, sm: 3 }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems="center"
          gap={2}
          minWidth={0}
          maxWidth="100%"
        >
          <UserAvatar status size="large" account={account} />
          <Box minWidth={0} maxWidth="100%" textAlign={{ xs: "center", sm: "left" }}>
            <Typography
              color="text.secondary"
              fontSize="0.72rem"
              fontWeight={900}
              letterSpacing="0.12em"
              textTransform="uppercase"
            >
              Perfil de jugador
            </Typography>
            <Typography
              component="h1"
              variant="h4"
              fontWeight={950}
              lineHeight={1.08}
              noWrap
              title={account.name}
            >
              {account.name}
            </Typography>
            <Typography color="text.secondary" mt={0.55} variant="body2">
              {total} {total === 1 ? "partida registrada" : "partidas registradas"}
            </Typography>
          </Box>
        </Stack>

        <Stack
          direction="row"
          alignItems="stretch"
          divider={<Divider flexItem orientation="vertical" />}
          sx={{ flexShrink: 0, width: { xs: "100%", sm: "auto" } }}
        >
          <ProfileMetric label="Victorias" value={win} />
          <ProfileMetric label="Derrotas" value={loss} />
          <ProfileMetric label="Efectividad" value={`${winRate}%`} />
        </Stack>
      </Stack>
    </Box>
  );
};
