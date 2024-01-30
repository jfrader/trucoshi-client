import {
  EmojiEvents,
  LooksOne,
  LooksTwo,
  Person,
  SupervisorAccount,
  VideogameAsset,
} from "@mui/icons-material";
import { PageContainer } from "../shared/PageContainer";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Divider,
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
import {
  EClientEvent,
  ECommand,
  ILobbyOptions,
  IMatchDetails,
  ITeamPoints,
  IHandRoundLog,
  CARDS_HUMAN_READABLE,
  IHandPoints,
} from "trucoshi";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useToast } from "../hooks/useToast";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { getTeamColor, getTeamName } from "../utils/team";
import { SatoshiIcon } from "../assets/icons/SatoshiIcon";
import { COMMANDS_HUMAN_READABLE } from "../trucoshi/constants";
import { Link } from "../shared/Link";
import { ProvablyFair } from "../components/game/ProvablyFair";
import { GameOptionsList, LOBBY_OPTIONS_HUMAN_READABLE } from "../components/game/GameOptionsList";

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

  const finalResults = (
    <>
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
            secondary={match?.winnerIdx === idx ? "Ganador" : "Perdedor"}
            color={getTeamColor(idx)}
            primary={getTeamName(idx)}
          />
          <ListItemAvatar>
            {result.buenas || result.malas} {result.buenas ? "Buenas" : "Malas"}
          </ListItemAvatar>
        </ListItem>
      ))}
    </>
  );

  const owner = match?.players.find((p) => match.ownerAccountId === p.accountId);
  const isPlayer =
    match?.players.findIndex((p) => p.accountId === context.state.account?.id) !== -1;

  return (
    <PageContainer title="Resumen de Partida" icon={<VideogameAsset fontSize="large" />}>
      <Card>
        <CardContent>
          {!isLoading ? (
            <>
              {match ? (
                <TabContext value={search.get("t") || "1"}>
                  <TabList
                    textColor="inherit"
                    onChange={handleChange}
                    aria-label="lab API tabs example"
                  >
                    <Tab label="Resumen" value="1" />
                    <Tab label="Reglas" value="2" />
                    <Tab label="Jugadores" value="3" />
                    <Tab label="Manos" value="4" />
                    <Tab label="Provably Fair" value="5" />
                  </TabList>

                  <TabPanel sx={{ px: 0 }} value="1">
                    <List>
                      {finalResults}
                      <ListItem divider>
                        <ListItemAvatar>
                          <EmojiEvents color="success" />
                        </ListItemAvatar>
                        <ListItemText secondary={match.sessionId} primary="Sesion" />
                      </ListItem>
                      {owner?.accountId ? (
                        <ListItemButton
                          onClick={() => navigate(`/profile/${owner?.accountId}`)}
                          divider
                        >
                          <ListItemAvatar>
                            <SupervisorAccount color="info" />
                          </ListItemAvatar>
                          <ListItemText secondary={owner?.name} primary="Host" />
                          <ListItemSecondaryAction>
                            <Person />
                          </ListItemSecondaryAction>
                        </ListItemButton>
                      ) : (
                        <ListItem divider>
                          <ListItemAvatar>
                            <SupervisorAccount color="info" />
                          </ListItemAvatar>
                          <ListItemText secondary={owner?.name} primary="Host" />
                        </ListItem>
                      )}
                      {isPlayer ? (
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
                  </TabPanel>

                  <TabPanel sx={{ px: 0 }} value="2">
                    <GameOptionsList
                      divider
                      options={match.options as any as ILobbyOptions}
                      keys={
                        isPlayer
                          ? undefined
                          : (Object.keys(LOBBY_OPTIONS_HUMAN_READABLE).filter(
                              (o) => o !== "satsPerPlayer"
                            ) as (keyof ILobbyOptions)[])
                      }
                    />
                  </TabPanel>

                  <TabPanel sx={{ px: 0 }} value="3">
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
                  </TabPanel>

                  <TabPanel sx={{ px: 0 }} value="4">
                    {match.hands.map((hand) => {
                      const rounds = hand.rounds as IHandRoundLog[][];
                      const results = hand.results as any as IHandPoints;
                      return (
                        <Box key={hand.id} pb={4}>
                          <List dense>
                            <ListItem divider>
                              <ListItemText>
                                <Typography variant="h5">Mano {hand.idx}</Typography>
                              </ListItemText>
                            </ListItem>
                            {rounds
                              .flatMap((round) => round)
                              .map((round, idx) => (
                                <ListItem key={idx}>
                                  <ListItemText
                                    primary={
                                      match.players[round.player].accountId ? (
                                        <Link
                                          to={`/profile/${match.players[round.player].accountId}`}
                                        >
                                          {match.players[round.player].name}
                                        </Link>
                                      ) : (
                                        match.players[round.player].name
                                      )
                                    }
                                    secondary={
                                      <Typography
                                        variant="subtitle2"
                                        color={getTeamColor(match.players[round.player].teamIdx)}
                                      >
                                        {getTeamName(match.players[round.player].teamIdx)}
                                      </Typography>
                                    }
                                  />
                                  <ListItemAvatar>
                                    <Typography textAlign="right">
                                      {round.card
                                        ? CARDS_HUMAN_READABLE[round.card]
                                        : COMMANDS_HUMAN_READABLE[round.command as ECommand] ||
                                          `${round.command}`}
                                    </Typography>
                                  </ListItemAvatar>
                                </ListItem>
                              ))}
                            <Divider sx={{ pt: 4 }} />
                            <ListItem divider>
                              <ListItemText primary={<Typography>Resultados</Typography>} />
                            </ListItem>
                            {Object.values(results).map((points, idx) => (
                              <ListItem divider key={idx}>
                                <ListItemText secondary={getTeamName(idx)} />
                                <ListItemAvatar>
                                  <Typography textAlign="right">{points}</Typography>
                                </ListItemAvatar>
                              </ListItem>
                            ))}
                            {hand.trucoWinnerIdx !== null ? (
                              <ListItem divider>
                                <ListItemText primary="Ganador Truco" />
                                <ListItemAvatar>
                                  <Typography textAlign="right">
                                    {getTeamName(hand.trucoWinnerIdx)}
                                  </Typography>
                                </ListItemAvatar>
                              </ListItem>
                            ) : null}
                            {hand.envidoWinnerIdx !== null ? (
                              <ListItem divider>
                                <ListItemText primary="Ganador Envido" />
                                <ListItemAvatar>
                                  <Typography textAlign="right">
                                    {getTeamName(hand.envidoWinnerIdx)}
                                  </Typography>
                                </ListItemAvatar>
                              </ListItem>
                            ) : null}
                            {hand.florWinnerIdx !== null ? (
                              <ListItem divider>
                                <ListItemText primary="Ganador Flor" />
                                <ListItemAvatar>
                                  <Typography textAlign="right">
                                    {getTeamName(hand.florWinnerIdx)}
                                  </Typography>
                                </ListItemAvatar>
                              </ListItem>
                            ) : null}
                            <Divider />
                          </List>
                        </Box>
                      );
                    })}
                    <List>
                      <ListItem divider>
                        <ListItemText
                          primary={<Typography variant="h5">Resultado Final</Typography>}
                        />
                      </ListItem>
                      {finalResults}
                    </List>
                  </TabPanel>

                  <TabPanel sx={{ px: 0 }} value="5">
                    <ProvablyFair players={match.players} hands={match.hands} />
                  </TabPanel>
                </TabContext>
              ) : (
                <Typography>No se pudo encontrar la partida</Typography>
              )}
            </>
          ) : (
            <CircularProgress />
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
};
