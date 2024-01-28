import {
  AvatarGroup,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fade,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMatch } from "../trucoshi/hooks/useMatch";
import { GameTable } from "../components/game/GameTable";
import { Rounds } from "../components/game/Rounds";
import { IPublicPlayer, EMatchState } from "trucoshi";
import { SocketBackdrop } from "../shared/SocketBackdrop";
import { MatchBackdrop } from "../components/game/MatchBackdrop";
import {
  FixedChatContainer,
  ChatMessage,
  ChatRoom,
  useChatRoom,
} from "../components/chat/ChatRoom";
import { getTeamColor, getTeamName } from "../utils/team";
import { MatchPlayer } from "../components/game/MatchPlayer";
import { MatchPoints } from "../components/game/MatchPoints";
import { useSound } from "../sound/hooks/useSound";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";
import { FloatingProgress } from "../shared/FloatingProgress";
import { PropsWithPlayer } from "../trucoshi/types";
import { Backdrop } from "../shared/Backdrop";
import { UserAvatar } from "../shared/UserAvatar";

const Match = () => {
  const [, , hydrated] = useTrucoshi();
  const [isAbandonOpen, setAbandonOpen] = useState(false);

  const isUpXs = useMediaQuery((theme: any) => theme.breakpoints.up("sm"));

  const { sessionId } = useParams<{ sessionId: string }>();
  const { queue } = useSound();

  const [
    { match, error, canSay, canPlay, previousHand, me },
    { playCard, sayCommand, nextHand, leaveMatch },
  ] = useMatch(sessionId, {
    onMyTurn: () => queue("turn"),
    onFreshHand: () => queue("round"),
  });

  const chatProps = useChatRoom(match);

  const navigate = useNavigate();

  useEffect(() => {
    if (match && match.state === EMatchState.UNREADY) {
      navigate(`/lobby/${sessionId}`);
    }
  }, [match, navigate, sessionId]);

  const [inspecting, inspect] = useState<IPublicPlayer | null>(null);

  const Slot = useCallback(
    ({ player }: PropsWithPlayer) => (
      <MatchPlayer
        key={player.idx}
        previousHand={previousHand}
        canSay={canSay}
        canPlay={canPlay}
        player={player}
        onPlayCard={playCard}
        onSayCommand={sayCommand}
        match={match}
      />
    ),
    [canPlay, canSay, match, playCard, previousHand, sayCommand]
  );

  const InnerSlot = useCallback(
    ({ player }: PropsWithPlayer) =>
      match ? (
        <Rounds
          key={player.idx}
          onMouseEnter={() => inspect(player)}
          onMouseLeave={() => inspect(null)}
          previousHand={previousHand}
          previousHandCallback={nextHand}
          player={player}
          match={match}
        />
      ) : null,
    [match, nextHand, previousHand]
  );

  const MiddleSlot = useCallback(
    () =>
      chatProps.latestMessage && chatProps.latestMessage.command ? (
        <Box
          width="100%"
          height="100%"
          display="flex"
          textAlign="center"
          alignItems="center"
          justifyContent="center"
          position="relative"
        >
          <ChatMessage hideAuthor Component={Fade} message={chatProps.latestMessage} />
        </Box>
      ) : null,
    [chatProps.latestMessage]
  );

  if (!hydrated) {
    return (
      <Container maxWidth="sm">
        <Backdrop open loading message="Cargando..." />
      </Container>
    );
  }

  if (match && match.winner) {
    return (
      <Container maxWidth="sm" sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <SocketBackdrop />
        <MatchBackdrop error={error} />
        <Stack flexGrow={1} gap={1}>
          <Typography pt="1em" pb={2} variant="h4">
            Partida Finalizada
          </Typography>
          <Box display="flex" justifyContent="center" alignItems="center">
            <Stack flexGrow={1} textAlign="left" gap={1}>
              <Typography variant="h5">
                Equipo ganador
              </Typography>
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
            <MatchPoints match={match} prevHandPoints={previousHand?.points} />
          </Box>
          <Button component={Link} to="/" variant="text">
            Volver al inicio
          </Button>
          <Button color="info" component={Link} to={`/history/${match.id}`} variant="text">
            Ver resumen
          </Button>
          <ChatRoom
            alwaysVisible
            mb={4}
            position="relative"
            width="100%"
            flexGrow={1}
            {...chatProps}
          />
        </Stack>
      </Container>
    );
  }

  return (
    <Box position="relative" flexGrow={1}>
      <SocketBackdrop />
      <MatchBackdrop error={error} />
      {match ? (
        <>
          <GameTable
            zoomOnIndex={me ? 1 : -1}
            zoomOnMiddle
            zoomFactor={isUpXs ? (match.players.length > 4 ? 1.1 : 1.2) : 1.25}
            match={match}
            inspecting={inspecting}
            Slot={Slot}
            InnerSlot={InnerSlot}
            MiddleSlot={
              chatProps.latestMessage && chatProps.latestMessage.command ? MiddleSlot : undefined
            }
          />
          <Box position="fixed" right={0} top="52px">
            <MatchPoints match={match} prevHandPoints={previousHand?.points} />
          </Box>
        </>
      ) : (
        <FloatingProgress />
      )}
      <FixedChatContainer>
        <ChatRoom {...chatProps} />
      </FixedChatContainer>
      <Button
        onClick={() => setAbandonOpen(true)}
        color="error"
        sx={{ position: "absolute", bottom: "1em", right: "2em" }}
      >
        Rendirse
      </Button>
      <Dialog open={isAbandonOpen} onClose={() => setAbandonOpen(false)}>
        <DialogTitle>Atencion</DialogTitle>
        <DialogContent>
          <Typography>Estas a punto de abandonar la partida</Typography>
        </DialogContent>
        <DialogActions>
          <Stack direction="row" width="100%" justifyContent="center" gap={2}>
            <Button color="success" onClick={() => setAbandonOpen(false)}>
              Continuar Partida
            </Button>
            <Button
              color="error"
              onClick={() => {
                leaveMatch();
                setAbandonOpen(false);
              }}
            >
              Rendirse
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export { Match };
