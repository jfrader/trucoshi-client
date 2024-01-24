import { EmojiEvents, LooksOne, LooksTwo, VideogameAsset } from "@mui/icons-material";
import { PageLayout } from "../shared/PageLayout";
import {
  Card,
  CardContent,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemSecondaryAction,
  ListItemText,
  Tab,
  Typography,
} from "@mui/material";
import { SyntheticEvent, useContext, useEffect, useState } from "react";
import { TrucoshiContext } from "../trucoshi/context";
import { EClientEvent, ILobbyOptions, IMatchDetails, ITeamPoints } from "trucoshi";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useToast } from "../hooks/useToast";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { getTeamColor, getTeamName } from "../utils/team";
import { SatoshiIcon } from "../assets/icons/SatoshiIcon";

export const MatchDetails = () => {
  const navigate = useNavigate();
  const context = useContext(TrucoshiContext);
  const toast = useToast();
  const { matchId } = useParams<{ matchId: string }>();
  const [match, setMatch] = useState<IMatchDetails | null>();
  const [isLoading, setLoading] = useState(false);
  const { pathname } = useLocation();
  const [search] = useSearchParams();

  const handleChange = (_event: SyntheticEvent, newValue: string) => {
    navigate(pathname + "?t=" + newValue);
  };

  if (!context) {
    throw new Error("useTrucoshiState must be used inside TrucoshiProvider");
  }

  useEffect(() => {
    if (context.state.isConnected) {
      setLoading(true);
      context.socket.emit(EClientEvent.FETCH_MATCH_DETAILS, Number(matchId), ({ match, error }) => {
        setLoading(false);
        if (error) {
          toast.error(error.message);
        }
        if (match) {
          setMatch(match);
        }
      });
    }
  }, [context.socket, context.state.isConnected, matchId, toast]);

  const results = (match?.results || [{}, {}]) as [ITeamPoints, ITeamPoints];

  return (
    <PageLayout title="Resumen de Partida" icon={<VideogameAsset fontSize="large" />}>
      <Card>
        <CardContent>
          {!isLoading ? (
            <TabContext value={search.get("t") || "1"}>
              <TabList
                textColor="inherit"
                onChange={handleChange}
                aria-label="lab API tabs example"
              >
                <Tab label="Resumen" value="1" />
                <Tab label="Jugadores" value="2" />
              </TabList>
              <TabPanel sx={{ px: 0 }} value="1">
                {match ? (
                  <List>
                    {results.map((result, idx) => (
                      <ListItem key={idx} divider>
                        <ListItemAvatar>
                          {idx === 0 ? (
                            <LooksOne color={getTeamColor(idx)} />
                          ) : (
                            <LooksTwo color={getTeamColor(idx)} />
                          )}
                        </ListItemAvatar>
                        <ListItemText
                          secondary={match.winnerIdx === idx ? "Ganador" : "Perdedor"}
                          color={getTeamColor(idx)}
                          primary={getTeamName(idx)}
                        />
                        <ListItemAvatar>
                          {result.buenas || result.malas} {result.buenas ? "Buenas" : "Malas"}
                        </ListItemAvatar>
                      </ListItem>
                    ))}

                    <ListItem divider>
                      <ListItemAvatar>
                        <EmojiEvents color="success" />
                      </ListItemAvatar>
                      <ListItemText secondary={match.sessionId} primary="Sesion" />
                    </ListItem>

                    {match.players.findIndex((p) => p.accountId === context.state.account?.id) !==
                    -1 ? (
                      <ListItem divider>
                        <ListItemAvatar>
                          <SatoshiIcon color="warning" />
                        </ListItemAvatar>
                        <ListItemText
                          secondary={(match.options as any as ILobbyOptions)?.satsPerPlayer}
                          primary="Sats por jugador"
                        />
                      </ListItem>
                    ) : null}
                  </List>
                ) : (
                  <Typography>No se pudo encontrar la partida</Typography>
                )}
              </TabPanel>
              <TabPanel sx={{ px: 0 }} value="2">
                {match ? (
                  <List>
                    {match.players
                      .sort((a, b) => (a.idx || 0) - (b.idx || 0))
                      .map((player) => (
                        <ListItemButton
                          key={player.id}
                          disabled={!player.accountId}
                          onClick={() => navigate(`/profile/${player.accountId}`)}
                        >
                          <ListItemAvatar>{(player.idx || 0) + 1}</ListItemAvatar>
                          <ListItemText
                            primary={player.name}
                            secondary={
                              <Typography
                                fontSize="small"
                                color={getTeamColor(player.teamIdx || 0)}
                              >
                                {getTeamName(player.teamIdx)}
                              </Typography>
                            }
                          />
                          <ListItemSecondaryAction>
                            {results[player.teamIdx].winner && <EmojiEvents />}
                          </ListItemSecondaryAction>
                        </ListItemButton>
                      ))}
                  </List>
                ) : (
                  <Typography>No se pudo encontrar la partida</Typography>
                )}
              </TabPanel>
            </TabContext>
          ) : (
            <CircularProgress />
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
};
