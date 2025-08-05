import { Box, BoxProps, Button, FormGroup, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTrucoshi } from "../../trucoshi/hooks/useTrucoshi";
import { CreateMatchButton } from "./CreateMatchButton";
import { ITrucoshiStats } from "trucoshi";
import { ReactNode, SyntheticEvent } from "react";

export const OnlinePlayers = ({ stats, label }: { stats: ITrucoshiStats; label?: ReactNode }) => {
  if (!stats.onlinePlayers.length) {
    return null;
  }

  return (
    <Box textTransform="uppercase">
      <Typography color="text.disabled" pr={1} component="span" variant="inherit">
        {label || "Online"}
      </Typography>
      <Typography color="success" component="span" fontSize="inherit" variant="inherit">
        {stats.onlinePlayers.length}
      </Typography>
    </Box>
  );
};

export const PlayMenu = ({
  onMenuClick,
  ...props
}: BoxProps & { onMenuClick?: (e: SyntheticEvent) => void }) => {
  const navigate = useNavigate();
  const [{ account, stats }] = useTrucoshi();

  return (
    <Box display="flex" flexDirection="column" justifyContent="center" {...props}>
      <Stack direction="row" justifyContent="space-between">
        <Typography
          textAlign="left"
          color="text.disabled"
          textTransform="uppercase"
          variant="subtitle1"
        >
          Jugar
        </Typography>
        <OnlinePlayers stats={stats} />
      </Stack>
      <FormGroup onClick={onMenuClick}>
        <CreateMatchButton />
        <Button color="secondary" size="large" onClick={() => navigate("/matches")}>
          Buscar Partida
        </Button>
        <Button color="warning" size="large" onClick={() => navigate("/ranking")}>
          Ranking
        </Button>
        {account ? null : (
          <Button size="large" color="info" onClick={() => navigate("/login")}>
            Iniciar Sesion
          </Button>
        )}
      </FormGroup>
    </Box>
  );
};
