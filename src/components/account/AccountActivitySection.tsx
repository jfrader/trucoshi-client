import { Box, Skeleton, Stack, Typography } from "@mui/material";
import type { IAccountDetails } from "trucoshi";
import { Sats } from "../../shared/Sats";
import { AccountPanel, AccountPanelHeader } from "./accountUi";

const SatsMetric = ({ label, amount }: { label: string; amount: number }) => (
  <Box sx={{ px: 1.25, py: 1.5, minWidth: 0, textAlign: "center" }}>
    <Sats amount={amount} color="warning.light" fontSize="1.3rem" fontWeight={950} />
    <Typography
      color="text.secondary"
      display="block"
      fontSize="0.66rem"
      fontWeight={850}
      letterSpacing="0.055em"
      mt={0.45}
      textTransform="uppercase"
    >
      {label}
    </Typography>
  </Box>
);

export const AccountActivitySection = ({
  profile,
  loading,
}: {
  profile: IAccountDetails | null;
  loading: boolean;
}) => (
  <AccountPanel data-testid="account-activity-section">
    <AccountPanelHeader
      title="Actividad con sats"
      description="Tu resumen privado de partidas con apuestas."
    />
    <Box
      sx={(theme) => ({
        display: "flex",
        borderTop: `1px solid ${theme.trucoshiUi.account.divider}`,
        "& > *": { flex: "1 1 0", minWidth: 0 },
        "& > * + *": {
          borderLeft: `1px solid ${theme.trucoshiUi.account.divider}`,
        },
      })}
    >
      {loading ? (
        Array.from({ length: 3 }).map((_, index) => (
          <Stack key={index} alignItems="center" px={1.25} py={1.5}>
            <Skeleton width="3.5rem" height="1.65rem" />
            <Skeleton width="70%" />
          </Stack>
        ))
      ) : (
        <>
          <SatsMetric label="Apostados" amount={profile?.stats?.satsBet || 0} />
          <SatsMetric label="Ganados" amount={profile?.stats?.satsWon || 0} />
          <SatsMetric label="Perdidos" amount={profile?.stats?.satsLost || 0} />
        </>
      )}
    </Box>
  </AccountPanel>
);
