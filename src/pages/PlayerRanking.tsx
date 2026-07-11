import { useContext, useEffect, useState } from "react";
import { TrucoshiContext } from "../trucoshi/trucoshi.context";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  ListItemSecondaryAction,
  Stack,
  Typography,
} from "@mui/material";
import { EClientEvent, IPlayerRanking } from "trucoshi";
import { useToast } from "../hooks/useToast";
import { UserAvatar } from "../shared/UserAvatar";
import { getPlayerWinRatio } from "../utils/player";
import { Link } from "../shared/Link";
import { PageContainer } from "../shared/PageContainer";
import { Star } from "@mui/icons-material";
import { OnlinePlayers } from "../components/menu/PlayMenu";

export const PlayerRanking = () => {
  const context = useContext(TrucoshiContext);
  const toast = useToast();

  const [isLoading, setLoading] = useState(true);
  const [ranking, setRanking] = useState<IPlayerRanking[]>([]);

  if (!context) {
    throw new Error("useTrucoshiState must be used inside TrucoshiProvider");
  }

  useEffect(() => {
    setLoading(true);
    context.socket.emit(EClientEvent.LIST_RANKING, {}, ({ success, ranking, error }) => {
      if (error) {
        toast.error(error.message);
      }

      if (success) {
        setRanking(ranking);
      }

      setLoading(false);
    });
  }, [context.socket, toast]);

  return (
    <PageContainer title="Ranking" icon={<Star fontSize="large" />}>
      <Card sx={{ flexGrow: 1 }}>
        <CardContent>
          {isLoading ? (
            <CircularProgress />
          ) : (
            <Box display="flex" flexDirection="column" justifyContent="center">
              <Stack direction="row" justifyContent="space-between">
                <Typography
                  textAlign="left"
                  color="text.disabled"
                  textTransform="uppercase"
                  variant="subtitle1"
                >
                  Ranking
                </Typography>
                <OnlinePlayers stats={context.state.stats} />
              </Stack>
              <List>
                <ListItem>
                  <ListItemIcon>Pos.</ListItemIcon>
                  <ListItemAvatar>Jugador</ListItemAvatar>
                  <ListItemSecondaryAction>
                    Partidas /{" "}
                    <Typography variant="caption" fontWeight="bold">
                      Tasa de Victoria
                    </Typography>
                  </ListItemSecondaryAction>
                </ListItem>
                {ranking.map((player, i) => {
                  const linkProps = {
                    component: Link,
                    to: "/profile/$accountId" as const,
                    params: { accountId: String(player.accountId) },
                  };
                  return (
                    <ListItem key={player.accountId}>
                      <ListItemIcon>#{i + 1}</ListItemIcon>
                      <ListItemAvatar>
                        <UserAvatar status link account={player} />
                      </ListItemAvatar>
                      <ListItemButton sx={{ mr: 6 }} {...linkProps}>
                        {player.name}
                      </ListItemButton>
                      <ListItemSecondaryAction>
                        {player.win + player.loss} /{" "}
                        <Typography variant="caption" fontWeight="bold" color="primary">
                          {getPlayerWinRatio(player)}
                        </Typography>
                      </ListItemSecondaryAction>
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
};
