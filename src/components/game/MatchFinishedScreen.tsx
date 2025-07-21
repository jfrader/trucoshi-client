import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { IPublicMatch } from "trucoshi";
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
import { useSound } from "../../sound/hooks/useSound";

export const MatchFinishedScreen = ({
  match,
  error,
  chatProps,
}: {
  match: IPublicMatch;
  error: Error | null;
  chatProps: ReturnType<typeof useChatRoom>;
}) => {
  const { queue } = useSound();

  const iAmWinner = useMemo(
    () => match.me?.teamIdx === match.winner?.id || !match.me,
    [match.me, match.winner?.id]
  );

  useEffect(() => {
    if (iAmWinner) {
      queue("winner");
    } else {
      queue("deal");
      queue("ceba_toma_mate");
    }
  }, [iAmWinner, match.teams, match.winner, queue]);

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
            <Typography variant="button" fontSize="0.7em" pt={2} pb={1} color="success">
              Ganaste {match.awardedSatsPerPlayer} sats!
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
};
