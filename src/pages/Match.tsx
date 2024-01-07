import { Box, Button, Container, Fade, Typography, useMediaQuery } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMatch } from "../trucoshi/hooks/useMatch";
import { GameTable } from "../components/game/GameTable";
import { Rounds } from "../components/game/Rounds";
import { EMatchState, IPublicPlayer } from "trucoshi";
import { SocketBackdrop } from "../shared/SocketBackdrop";
import { MatchBackdrop } from "../components/game/MatchBackdrop";
import { FixedChatContainer, ChatMessage, ChatRoom, useChatRoom } from "../components/chat/ChatRoom";
import { getTeamColor, getTeamName } from "../utils/team";
import { MatchPlayer } from "../components/game/MatchPlayer";
import { MatchPoints } from "../components/game/MatchPoints";
import { useSound } from "../sound/hooks/useSound";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";
import { FloatingProgress } from "../shared/FloatingProgress";
import { TrucoshiLogo } from "../shared/TrucoshiLogo";
import { PropsWithPlayer } from "../trucoshi/types";
import { Backdrop } from "../shared/Backdrop";

const Match = () => {
  const [, , hydrated] = useTrucoshi();

  const isUpXs = useMediaQuery((theme: any) => theme.breakpoints.up("sm"));

  const { sessionId } = useParams<{ sessionId: string }>();
  const { queue } = useSound();

  const [
    { match, error, canSay, canPlay, previousHand, me },
    { playCard, sayCommand, leaveMatch, nextHand },
  ] = useMatch(sessionId, {
    onMyTurn: () => {
      console.log("onMyTurn");
      queue("turn");
    },
    onFreshHand: () => queue("round"),
  });

  const chatProps = useChatRoom(match);

  const navigate = useNavigate();

  useEffect(() => {
    return () => leaveMatch();
  }, [leaveMatch]);

  useEffect(() => {
    if (match && match.state === EMatchState.UNREADY) {
      navigate(`/lobby/${sessionId}`);
    }
  }, [match, navigate, sessionId]);

  const [inspecting, inspect] = useState<IPublicPlayer | null>(null);

  const Slot = useCallback(
    ({ player }: PropsWithPlayer) => (
      <MatchPlayer
        key={player.key}
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
          key={player.key}
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
        <Box width="100%" height="100%" display="flex" textAlign="center">
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
        <Box>
          <Typography pt="1em" variant="h4">
            Partida Finalizada
          </Typography>
          <Button component={Link} to="/" variant="text">
            Volver al inicio
          </Button>
        </Box>
        <Box display="flex" justifyContent="center" alignItems="center">
          <Box flexGrow={1} textAlign="left">
            <Typography pt="1em" variant="h5">
              Equipo ganador
            </Typography>
            <Typography variant="h4" color={getTeamColor(match.winner.id)}>
              {getTeamName(match.winner.id)}
            </Typography>
            <Box mb={4}>
              {match.winner.players.map((p) => (
                <Typography key={p.key} display="inline" pt="1em" pr="1.6em" variant="h6">
                  {p.id}
                </Typography>
              ))}
            </Box>
          </Box>
          <TrucoshiLogo width="80em" />
          <MatchPoints match={match} prevHandPoints={previousHand?.points} />
        </Box>
        <ChatRoom
          alwaysVisible
          mb={4}
          position="relative"
          width="100%"
          flexGrow={1}
          {...chatProps}
        />
      </Container>
    );
  }

  return (
    <Box>
      <SocketBackdrop />
      <MatchBackdrop error={error} />
      {match ? (
        <>
          <GameTable
            zoomOnIndex={me ? 1 : -1}
            zoomOnMiddle
            zoomFactor={isUpXs ? 1.18 : 1.25}
            match={match}
            inspecting={inspecting}
            Slot={Slot}
            InnerSlot={InnerSlot}
            MiddleSlot={MiddleSlot}
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
    </Box>
  );
};

Match.whyDidYouRender = false;

export { Match };
