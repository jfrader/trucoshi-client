import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { IMatchPreviousHand, IPublicMatch } from "trucoshi";
import { getTeamColor, getTeamName } from "../../utils/team";
import { MatchBackdrop } from "./MatchBackdrop";
import { SocketBackdrop } from "../../shared/SocketBackdrop";
import { MatchPoints } from "./MatchPoints";
import { ChatRoom, useChatRoom } from "../chat/ChatRoom";
import { UserAvatar } from "../../shared/UserAvatar";
import { AvatarGroup } from "@mui/material";
import { Link } from "../../shared/Link";
import { EmojiRain } from "../../shared/EmojiRain";

export const MatchFinishedScreen = ({
  match,
  error,
  previousHand,
  chatProps,
}: {
  match: IPublicMatch;
  error: Error | null;
  previousHand: IMatchPreviousHand | null;
  chatProps: ReturnType<typeof useChatRoom>;
}) => {
  if (error || !match || !match.winner) {
    return <MatchBackdrop error={error} />;
  }
  return (
    <Container maxWidth="sm" sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
      {match.me?.teamIdx === match.winner.id || !match.me ? <EmojiRain /> : null}
      <SocketBackdrop />
      <MatchBackdrop error={error} />
      <Stack flexGrow={1} gap={1}>
        <Typography pt="1em" pb={2} variant="h4">
          Partida Finalizada
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
};
