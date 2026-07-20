import {
  EmojiEventsRounded,
  HomeRounded,
  ReplayRounded,
  SummarizeRounded,
} from "@mui/icons-material";
import { AvatarGroup, Box, Button, Chip, Stack, Typography } from "@mui/material";
import { EClientEvent, type IPublicMatch } from "trucoshi";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMe } from "../../api/hooks/useMe";
import { EmojiRain } from "../../shared/EmojiRain";
import { Link } from "../../shared/Link";
import { SocketBackdrop } from "../../shared/SocketBackdrop";
import { useGameAdmission } from "../../trucoshi/hooks/useGameAdmission";
import { useMatchQueue } from "../../trucoshi/hooks/useMatchQueue";
import { useTrucoshi } from "../../trucoshi/hooks/useTrucoshi";
import { getTeamColor, getTeamDisplayName, getTeamName } from "../../utils/team";
import { ChatRoom, type useChatRoom } from "../chat/ChatRoom";
import { AdmissionNotice } from "../notice/AdmissionNotice";
import { UserAvatar } from "../../shared/UserAvatar";
import {
  FinishedActions,
  FinishedChatStage,
  FinishedResultBody,
  FinishedResultPanel,
  FinishedScoreCell,
  FinishedScoreboard,
  FinishedScreenContent,
  FinishedScreenShell,
} from "./MatchFinishedScreen.styles";
import { MatchBackdrop } from "./MatchBackdrop";

export const MatchFinishedScreen = ({
  match,
  error,
  chatProps,
  onPlayAgain,
}: {
  match: IPublicMatch;
  error: Error | null;
  chatProps: ReturnType<typeof useChatRoom>;
  onPlayAgain: () => void;
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [, { setQueueReplayOptions }, socket] = useTrucoshi();
  const { joinQueue } = useMatchQueue();
  const { canStartNewGames } = useGameAdmission();
  const { refetch: refetchMe } = useMe();

  const iAmWinner = match.me?.teamIdx === match.winner?.id || !match.me;
  const scoreboardTeams =
    match.teams?.length === 2
      ? match.teams
      : ([0, 1].map((teamIdx) =>
          teamIdx === match.winner?.id
            ? match.winner
            : { id: teamIdx, players: [], points: { malas: 0, buenas: 0 } },
        ) as IPublicMatch["teams"]);

  useEffect(() => {
    if (match.options.satsPerPlayer) void refetchMe();
  }, [match.options.satsPerPlayer, refetchMe]);

  useEffect(() => {
    if (match.createdFromQueue && match.queueOptions) {
      setQueueReplayOptions(match.queueOptions);
    }
  }, [match.createdFromQueue, match.queueOptions, setQueueReplayOptions]);

  const onExit = (fn: () => void) => () => {
    socket.emit(EClientEvent.LEAVE_MATCH, match.matchSessionId);
    fn();
  };

  const handlePlayAgain = async () => {
    if (match.createdFromQueue && match.queueOptions) {
      const joined = await joinQueue(match.queueOptions);
      if (!joined) return;
      socket.emit(EClientEvent.LEAVE_MATCH, match.matchSessionId);
      navigate("/");
      return;
    }
    onPlayAgain();
  };

  const Actions = ({ showPlayAgain = false }: { showPlayAgain?: boolean }) => (
    <FinishedActions onClick={(event) => event.stopPropagation()}>
      {showPlayAgain ? (
        <Button
          sx={{ flexGrow: 1 }}
          color="success"
          disabled={!canStartNewGames}
          onClick={() => void handlePlayAgain()}
          startIcon={<ReplayRounded />}
          variant="contained"
        >
          Jugar de nuevo
        </Button>
      ) : null}
      <Button
        color="info"
        component={Link}
        to={`/history/${match.id}`}
        startIcon={<SummarizeRounded />}
        variant="contained"
      >
        Resumen
      </Button>
      <Button
        aria-label="Volver al inicio"
        color="primary"
        onClick={onExit(() => (location.key === "default" ? navigate("/") : navigate(-1)))}
        startIcon={<HomeRounded />}
        variant="contained"
      >
        Inicio
      </Button>
    </FinishedActions>
  );

  if (error || !match.winner) {
    return <MatchBackdrop error={error}>{error ? <Actions /> : null}</MatchBackdrop>;
  }

  return (
    <FinishedScreenShell maxWidth="sm">
      {iAmWinner ? <EmojiRain /> : null}
      <SocketBackdrop />
      <MatchBackdrop error={error} />
      <FinishedScreenContent>
        <FinishedResultPanel>
          <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1.5}>
            <Stack direction="row" alignItems="center" gap={0.85} minWidth={0}>
              <EmojiEventsRounded color="warning" />
              <Typography
                color="warning.light"
                fontSize="0.68rem"
                fontWeight={950}
                letterSpacing="0.11em"
                textTransform="uppercase"
              >
                Partida finalizada
              </Typography>
            </Stack>
            {iAmWinner && match.awardedSatsPerPlayer ? (
              <Chip
                color="success"
                label={`+${match.awardedSatsPerPlayer - match.options.satsPerPlayer} sats`}
                size="small"
                sx={{ fontWeight: 950 }}
              />
            ) : null}
          </Stack>

          <FinishedResultBody>
            <Stack minWidth={0} gap={1}>
              <Box minWidth={0}>
                <Typography
                  color="text.secondary"
                  fontSize="0.72rem"
                  fontWeight={850}
                  textTransform="uppercase"
                >
                  Equipo ganador
                </Typography>
                <Typography
                  color={`${getTeamColor(match.winner.id)}.light`}
                  fontWeight={950}
                  lineHeight={1.05}
                  noWrap
                  variant="h4"
                >
                  {getTeamName(match.winner)}
                </Typography>
              </Box>
              <AvatarGroup
                max={3}
                sx={{
                  justifyContent: "flex-end",
                  width: "fit-content",
                  "& .MuiAvatar-root": { width: 38, height: 38 },
                }}
              >
                {match.winner.players.map((player) => (
                  <UserAvatar link key={player.key} account={player} />
                ))}
              </AvatarGroup>
            </Stack>

            <FinishedScoreboard aria-label="Resultado final">
              {scoreboardTeams.map((team, index) => {
                const total = team.points.buenas || team.points.malas;
                return (
                  <FinishedScoreCell key={team.id ?? index}>
                    <Typography
                      color={`${getTeamColor(index)}.light`}
                      fontSize="0.68rem"
                      fontWeight={900}
                      noWrap
                    >
                      {match.teams?.length === 2
                        ? getTeamDisplayName(match, index as 0 | 1)
                        : getTeamName(team)}
                    </Typography>
                    <Typography fontWeight={950} lineHeight={1} mt={0.5} variant="h4">
                      {total}
                    </Typography>
                    <Typography color="text.secondary" fontSize="0.62rem" textTransform="uppercase">
                      {team.points.buenas ? "buenas" : "malas"}
                    </Typography>
                  </FinishedScoreCell>
                );
              })}
            </FinishedScoreboard>
          </FinishedResultBody>
        </FinishedResultPanel>

        <Actions showPlayAgain />
        <AdmissionNotice compact />
        <FinishedChatStage aria-label="Chat de la partida">
          <ChatRoom alwaysVisible {...chatProps} />
        </FinishedChatStage>
      </FinishedScreenContent>
    </FinishedScreenShell>
  );
};
