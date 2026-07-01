import { Box, Button, Container, Stack, StackProps, Typography } from "@mui/material";
import { EClientEvent, IPublicMatch } from "trucoshi";
import { getTeamColor, getTeamName } from "../../utils/team";
import { MatchBackdrop } from "./MatchBackdrop";
import { SocketBackdrop } from "../../shared/SocketBackdrop";
import { MatchPoints } from "./MatchPoints";
import { ChatRoom, useChatRoom } from "../chat/ChatRoom";
import { UserAvatar } from "../../shared/UserAvatar";
import { AvatarGroup } from "@mui/material";
import { Link } from "../../shared/Link";
import { EmojiRain } from "../../shared/EmojiRain";
import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMe } from "../../api/hooks/useMe";
import { useTrucoshi } from "../../trucoshi/hooks/useTrucoshi";
import { useMatchQueue } from "../../trucoshi/hooks/useMatchQueue";
import { TreasureChestPanel } from "../treasure/TreasureChestPanel";

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
  const location = useLocation();
  const navigate = useNavigate();
  const [
    { treasureStatus, treasureLoading, treasureOpening, treasureResult },
    { devGrantTreasureChest, fetchTreasureStatus, openTreasureChest, setQueueReplayOptions },
    socket,
  ] = useTrucoshi();
  const { joinQueue } = useMatchQueue();

  const { refetch: refetchMe } = useMe();

  const iAmWinner = useMemo(
    () => match.me?.teamIdx === match.winner?.id || !match.me,
    [match.me, match.winner?.id]
  );

  useEffect(() => {
    if (match.options.satsPerPlayer) {
      refetchMe();
    }
  }, [match.options.satsPerPlayer, refetchMe]);

  useEffect(() => {
    if (match.createdFromQueue && match.queueOptions) {
      setQueueReplayOptions(match.queueOptions);
    }
  }, [match.createdFromQueue, match.queueOptions, setQueueReplayOptions]);

  useEffect(() => {
    if (match.createdFromQueue && match.me) {
      fetchTreasureStatus();
    }
  }, [fetchTreasureStatus, match.createdFromQueue, match.me]);

  const onExit = (fn: () => void) => () => {
    socket.emit(EClientEvent.LEAVE_MATCH, match.matchSessionId);
    fn();
  };

  const handlePlayAgain = () => {
    if (match.createdFromQueue && match.queueOptions) {
      joinQueue(match.queueOptions);
      socket.emit(EClientEvent.LEAVE_MATCH, match.matchSessionId);
      navigate("/");
      return;
    }

    onPlayAgain();
  };

  const Actions = ({ children, ...props }: StackProps) => (
    <Stack {...props} onClick={(e) => e.stopPropagation()}>
      {children}
      <Button color="info" component={Link} to={`/history/${match.id}`} variant="text">
        Ver resumen
      </Button>
      <Button
        onClick={onExit(() => (location.key === "default" ? navigate("/") : navigate(-1)))}
        variant="text"
      >
        Volver al inicio
      </Button>
    </Stack>
  );

  if (error || !match || !match.winner) {
    return (
      <MatchBackdrop error={error}>{error && match ? <Actions spacing={1} /> : null}</MatchBackdrop>
    );
  }

  return (
    <Container
      maxWidth="sm"
      sx={{
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        maxHeight: "100dvh",
        overflow: "hidden",
      }}
    >
      {iAmWinner ? <EmojiRain /> : null}
      <SocketBackdrop />
      <MatchBackdrop error={error} />
      <Stack flex={1} minHeight={0} gap={1}>
        <Typography
          display="flex"
          flexDirection="column"
          alignItems="center"
          component="div"
          pt="1em"
          pb={2}
          variant="h4"
        >
          Partida Finalizada
          {iAmWinner && match.awardedSatsPerPlayer ? (
            <Typography
              fontWeight="bold"
              variant="button"
              fontSize="0.6em"
              py={1}
              color="success.light"
            >
              Ganaste{" "}
              <Typography component="span" fontWeight="bold" fontSize="1.3em" variant="inherit">
                {match.awardedSatsPerPlayer - match.options.satsPerPlayer}
              </Typography>{" "}
              sats!
            </Typography>
          ) : null}
        </Typography>
        <Box display="flex" justifyContent="center" alignItems="center">
          <Stack flexGrow={1} textAlign="left" gap={1}>
            <Typography variant="h5">Equipo ganador</Typography>
            <Typography variant="h4" color={getTeamColor(match.winner.id)}>
              {getTeamName(match.winner.id)}
            </Typography>
            <Box mb={1} pr={4}>
              <AvatarGroup sx={{ justifyContent: "start" }}>
                {match.winner.players.map((p) => (
                  <UserAvatar link size="big" key={p.key} account={p} />
                ))}
              </AvatarGroup>
            </Box>
          </Stack>
          <MatchPoints match={match} prevHandPoints={match.previousHand?.points} />
        </Box>
        <Actions>
          <Button color="success" onClick={handlePlayAgain} variant="text">
            Jugar de nuevo!
          </Button>
        </Actions>
        {match.createdFromQueue && match.me ? (
          <TreasureChestPanel
            status={treasureStatus}
            result={treasureResult}
            loading={treasureLoading}
            opening={treasureOpening}
            onOpenChest={openTreasureChest}
            onDevGrantChest={devGrantTreasureChest}
          />
        ) : null}
        <Box flex={1} minHeight={0} mb={2} overflow="hidden" position="relative" width="100%">
          <ChatRoom alwaysVisible {...chatProps} />
        </Box>
      </Stack>
    </Container>
  );
};
