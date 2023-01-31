import { Box, Container, Typography } from "@mui/material";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { EMatchTableState, IPublicMatch } from "trucoshi/dist/server/classes/MatchTable";
import { useTrucoshi } from "../hooks/useTrucoshi";
import { useMatch } from "../hooks/useMatch";
import { Table } from "./Table";
import { IPublicPlayer } from "trucoshi/dist/lib/classes/Player";
import { ICard } from "trucoshi/dist/lib/types";
import { Card } from "./Card";

const Player =
  ({
    session,
    isMyTurn,
    onPlayCard,
  }: {
    session: string | null;
    isMyTurn: boolean;
    onPlayCard: (idx: number) => void;
  }) =>
  ({ player }: { player: IPublicPlayer }) => {
    const isMe = player.session === session;
    return (
      <Box maxWidth="100%">
        <Typography variant="h5" color={isMe && isMyTurn ? "green" : undefined}>
          {player.id}
        </Typography>
        <Box sx={{ zIndex: 9 }}>
          {player.hand
            .map((c, idx) => [c, idx + c + player.session])
            .map(([card, key], idx) =>
              isMe && isMyTurn ? (
                <Card
                  key={key}
                  card={card as ICard}
                  variant="contained"
                  color="primary"
                  onClick={() => onPlayCard(idx)}
                />
              ) : (
                <Card
                  key={key}
                  card={isMe ? <span>{card}</span> : <span>&nbsp;&nbsp;</span>}
                  variant="contained"
                  color={isMe ? "primary" : "error"}
                />
              )
            )}
        </Box>
      </Box>
    );
  };

const PlayerCards =
  ({ match }: { match: IPublicMatch }) =>
  ({ player }: { player: IPublicPlayer }) => {
    return (
      <Box maxWidth="100%" pt={2} pr={4}>
        <Box margin="0 auto" position="relative">
          {match.rounds.map((round, i) =>
            round.map((pc) => {
              if (pc.player.session === player.session) {
                return (
                  <Box position="absolute" left="50%" right="50%">
                    <Card {...pc} i={i} variant="contained" color="primary" />
                  </Box>
                );
              }
              return <span key={pc.key} />;
            })
          )}
        </Box>
      </Box>
    );
  };

export const Match = () => {
  const { sessionId } = useParams<{ sessionId: string }>();

  const [{ session }] = useTrucoshi();
  const [match, isMyTurn, { playCard }] = useMatch(sessionId);

  const navigate = useNavigate();

  useEffect(() => {
    if (match && match.state === EMatchTableState.UNREADY) {
      navigate(`/lobby/${sessionId}`);
    }
  }, [match, navigate, sessionId]);

  if (!sessionId || !match) {
    return null;
  }

  return (
    <Container>
      <Table
        match={match}
        Component={Player({ session, isMyTurn, onPlayCard: playCard })}
        InnerComponent={PlayerCards({ match })}
      />
    </Container>
  );
};
