import { Box, Button, Container, Stack, Typography } from "@mui/material";
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

export const MatchFinishedScreen = ({
  match,
  error,
  chatProps,
}: {
  match: IPublicMatch;
  error: Error | null;
  chatProps: ReturnType<typeof useChatRoom>;
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [, , socket] = useTrucoshi();

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

  const onExit = (fn: () => void) => () => {
    socket.emit(EClientEvent.LEAVE_MATCH, match.matchSessionId);
    fn();
  };

  if (error || !match || !match.winner) {
    return <MatchBackdrop error={error} />;
  }
  return (
    <Container maxWidth="sm" sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
      {iAmWinner ? <EmojiRain /> : null}
      <SocketBackdrop />
      <MatchBackdrop error={error} />
      <Stack flexGrow={1} gap={1}>
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
        <Button
          onClick={onExit(() => (location.key === "default" ? navigate("/") : navigate(-1)))}
          variant="text"
        >
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
};
