import { Box, Container, Typography } from "@mui/material";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { EMatchTableState, IPublicMatch } from "trucoshi/dist/server/classes/MatchTable";
import { useTrucoshi } from "../hooks/useTrucoshi";
import { useMatch } from "../hooks/useMatch";
import { Table } from "./Table";
import { IPublicPlayer } from "trucoshi/dist/lib/classes/Player";
import { ICard } from "trucoshi/dist/lib/types";
import { GameCard } from "./GameCard";

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
      <Box maxWidth="100%" pt={2}>
        <Typography variant="h5" color={isMe && isMyTurn ? "green" : undefined}>
          {player.id}
        </Typography>
        <Box zIndex={9} pt={2}>
          {player.hand
            .map((c, idx) => [c, idx + c + player.session])
            .map(([card, key], idx) =>
              isMe && isMyTurn ? (
                <GameCard
                  key={key}
                  card={card as ICard}
                  variant="contained"
                  color="primary"
                  onClick={() => onPlayCard(idx)}
                />
              ) : (
                <GameCard
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

const Rounds = ({ match, player }: { match: IPublicMatch; player: IPublicPlayer }) => {
  return (
    <Box maxWidth="100%" marginTop="74px" pr={8}>
      <Box margin="0 auto" position="relative">
        {match.rounds.map((round, i) =>
          round.map((pc) => {
            if (player.usedHand.includes(pc.card)) {
              return (
                <Box position="absolute" left="50%" right="50%">
                  <GameCard {...pc} i={i} variant="contained" color="primary" />
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
  const [{ match, isMyTurn }, { playCard }] = useMatch(sessionId);

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
        fill={6}
        match={match}
        Component={Player({ session, isMyTurn, onPlayCard: playCard })}
        InnerComponent={({ player }) => <Rounds match={match} player={player} />}
      />
    </Container>
  );
};
