import {
  CalendarMonthOutlined,
  PersonSearchOutlined,
  SportsScoreOutlined,
} from "@mui/icons-material";
import { Box, Button, Skeleton, Stack, Typography } from "@mui/material";
import type { User } from "lightning-accounts";
import type { IAccountDetails } from "trucoshi";
import { Link } from "react-router-dom";
import { UserAvatar } from "../../shared/UserAvatar";
import { AccountHeroSurface, AccountInset } from "./accountUi";

const formatMemberSince = (createdAt?: string) => {
  if (!createdAt) {
    return "Jugador de Trucoshi";
  }

  return `Desde ${new Intl.DateTimeFormat("es-AR", {
    month: "long",
    year: "numeric",
  }).format(new Date(createdAt))}`;
};

const AccountMetric = ({ label, value }: { label: string; value: string | number }) => (
  <Box sx={{ minWidth: 0, px: { xs: 1.1, sm: 1.75 }, py: 1.25 }}>
    <Typography component="div" variant="h5" fontWeight={950} color="warning.light" lineHeight={1}>
      {value}
    </Typography>
    <Typography
      component="div"
      variant="caption"
      color="text.secondary"
      fontWeight={800}
      sx={{ mt: 0.45, textTransform: "uppercase", letterSpacing: "0.045em" }}
    >
      {label}
    </Typography>
  </Box>
);

export const AccountHero = ({
  account,
  profile,
  profileLoading,
}: {
  account: User;
  profile: IAccountDetails | null;
  profileLoading: boolean;
}) => {
  const wins = profile?.stats?.win || 0;
  const losses = profile?.stats?.loss || 0;
  const totalMatches = wins + losses;
  const winRate = totalMatches ? Math.round((wins / totalMatches) * 100) : 0;

  return (
    <AccountHeroSurface data-testid="account-hero">
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "center",
          gap: { xs: 2.25, md: 3.5 },
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          gap={{ xs: 1.5, sm: 2.25 }}
          flex="1 1 0"
          minWidth={0}
          width="100%"
        >
          <Box
            sx={{
              p: 0.55,
              borderRadius: "50%",
              border: "1px solid rgba(226,178,70,0.34)",
              boxShadow: "0 0 0 5px rgba(215,154,62,0.07)",
              flexShrink: 0,
            }}
          >
            <UserAvatar
              status
              size="large"
              account={account}
              sx={{ width: { xs: 68, sm: 80 }, height: { xs: 68, sm: 80 } }}
            />
          </Box>
          <Box minWidth={0}>
            <Typography
              variant="overline"
              color="warning.light"
              fontWeight={950}
              letterSpacing="0.12em"
            >
              Tu cuenta
            </Typography>
            <Typography
              component="h1"
              variant="h4"
              fontWeight={950}
              lineHeight={1.05}
              noWrap
              title={account.name}
            >
              {account.name}
            </Typography>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              gap={{ xs: 0.2, sm: 1.4 }}
              mt={0.75}
              color="text.secondary"
            >
              <Stack direction="row" alignItems="center" gap={0.55}>
                <CalendarMonthOutlined sx={{ fontSize: "1rem" }} />
                <Typography variant="body2" textTransform="capitalize">
                  {formatMemberSince(account.createdAt)}
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" gap={0.55}>
                <SportsScoreOutlined sx={{ fontSize: "1rem" }} />
                <Typography variant="body2">Jugador #{account.id}</Typography>
              </Stack>
            </Stack>
            <Button
              component={Link}
              color="warning"
              size="small"
              startIcon={<PersonSearchOutlined />}
              sx={{ mt: 1.35, fontWeight: 900 }}
              to={`/profile/${account.id}`}
              variant="outlined"
            >
              Ver perfil público
            </Button>
          </Box>
        </Stack>

        <AccountInset
          sx={(theme) => ({
            display: "flex",
            width: { xs: "100%", md: "auto" },
            minWidth: { md: "22rem" },
            "& > *": { flex: "1 1 0", minWidth: 0 },
            "& > * + *": {
              borderLeft: `1px solid ${theme.trucoshiUi.account.divider}`,
            },
          })}
        >
          {profileLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Box key={index} sx={{ px: 1.5, py: 1.25 }}>
                <Skeleton width="40%" height="1.7rem" />
                <Skeleton width="72%" />
              </Box>
            ))
          ) : (
            <>
              <AccountMetric label="Partidas" value={totalMatches} />
              <AccountMetric label="Ganadas" value={wins} />
              <AccountMetric label="Efectividad" value={`${winRate}%`} />
            </>
          )}
        </AccountInset>
      </Box>
    </AccountHeroSurface>
  );
};
