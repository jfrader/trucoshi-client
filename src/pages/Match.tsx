import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMatch } from "../trucoshi/hooks/useMatch";
import { GameTable } from "../components/game/GameTable";
import { Rounds } from "../components/game/Rounds";
import { IPublicPlayer, EMatchState } from "trucoshi";
import { SocketBackdrop } from "../shared/SocketBackdrop";
import { MatchBackdrop } from "../components/game/MatchBackdrop";
import {
  FixedChatContainer,
  ChatRoom,
  useChatRoom,
  ChatButton,
  getMessageContent,
} from "../components/chat/ChatRoom";
import { MatchPlayer } from "../components/game/MatchPlayer";
import { MatchPoints } from "../components/game/MatchPoints";
import { useSound } from "../sound/hooks/useSound";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";
import { FloatingProgress } from "../shared/FloatingProgress";
import { PropsWithPlayer } from "../trucoshi/types";
import { Backdrop } from "../shared/Backdrop";
import { MatchFinishedScreen } from "../components/game/MatchFinishedScreen";
import { CommandBar } from "../components/game/CommandBar";
import { getTeamColor } from "../utils/team";

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
        canPlay={canPlay}
        player={player}
        onPlayCard={playCard}
        match={match}
      />
    ),
    [canPlay, match, playCard, previousHand]
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
          <ChatButton
            color={getTeamColor(Number(chatProps.latestMessage.user.name))}
            variant="contained"
            sx={{ fontSize: "1rem" }}
            message={chatProps.latestMessage}
          >
            <Stack whiteSpace="nowrap" direction="row" flexWrap="nowrap" gap={1}>
              <span>{getMessageContent(chatProps.latestMessage)}</span>
            </Stack>
          </ChatButton>
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
      <MatchFinishedScreen
        match={match}
        chatProps={chatProps}
        error={error}
        previousHand={previousHand}
      />
    );
  }

  return (
    <Box flexGrow={1} maxWidth="100%">
      <SocketBackdrop />
      <MatchBackdrop error={error} />
      {match ? (
        <>
          <GameTable
            zoomOnIndex={me ? 1 : -1}
            zoomOnMiddle
            zoomFactor={isUpXs ? (match.players.length > 4 ? 1.1 : 1.15) : 1.25}
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
            <Button variant="text" onClick={() => setAbandonOpen(true)} color="error">
              Rendirse
            </Button>
          </Box>
        </>
      ) : (
        <FloatingProgress />
      )}
      <FixedChatContainer>
        <ChatRoom {...chatProps} />
      </FixedChatContainer>

      {match?.me ? (
        <CommandBar
          isPrevious={!!previousHand}
          canSay={canSay}
          onSayCommand={sayCommand}
          player={match.me}
        />
      ) : null}
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
