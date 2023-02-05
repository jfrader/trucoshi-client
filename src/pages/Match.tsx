import { Box, Button, Container, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";
import { useMatch } from "../trucoshi/hooks/useMatch";
import { GameTable } from "../components/GameTable";
import { GameCard } from "../components/GameCard";
import { useRounds } from "../trucoshi/hooks/useRounds";
import { PlayerTag } from "../components/PlayerTag";
import { TeamCard, TeamTag } from "../components/TeamTag";
import { Rounds } from "../components/Rounds";
import {
  ECommand,
  EMatchTableState,
  ICard,
  IHandPoints,
  IPublicMatch,
  IPublicPlayer,
  IPublicTeam,
} from "trucoshi";
import { PREVIOUS_HAND_ANIMATION_DURATION } from "../trucoshi/constants";
import { SocketBackdrop } from "../components/SocketBackdrop";
import { MatchBackdrop } from "../components/MatchBackdrop";
import { ChatRoom } from "../components/ChatRoom";

const Player = ({
  session,
  match,
  player,
  canSay,
  canPlay,
  onPlayCard,
  onSayCommand,
}: {
  session: string | null;
  match: IPublicMatch;
  player: IPublicPlayer;
  canSay: boolean,
  canPlay: boolean,
  onPlayCard: (cardIdx: number, card: ICard) => void;
  onSayCommand: (command: ECommand) => void;
}) => {
  const isMe = player.session === session;
  const [, isPrevious] = useRounds(match);
  return (
    <Box maxWidth="100%" pt={2}>
      <PlayerTag player={player} isTurn={player.isTurn} />
      <Box zIndex={10} pt={2}>
        {!isPrevious &&
          player.hand
            .map((c, idx) => [c, idx + c + player.session])
            .map(([card, key], idx) =>
              isMe && player.isTurn ? (
                <GameCard
                  enableHover
                  key={key}
                  card={card as ICard}
                  color="primary"
                  onClick={() => onPlayCard(idx, card as ICard)}
                />
              ) : (
                <GameCard
                  key={key}
                  card={isMe ? <span>{card}</span> : <span>&nbsp;&nbsp;</span>}
                  color={isMe ? "primary" : "error"}
                />
              )
            )}
      </Box>

      {isMe && canSay && !isPrevious ? <Box>
        {player.commands.map(command => <Button onClick={() => onSayCommand(command)} size="small" variant="text">{command}</Button>)}
      </Box> : null}
    </Box>
  );
};

const MatchPoints = ({
  teams,
  prevHandPoints,
}: {
  teams: Array<IPublicTeam>;
  prevHandPoints?: IHandPoints | null;
}) => {
  const [points, setPoints] = useState<IHandPoints | void | null>(prevHandPoints);

  useEffect(() => {
    setPoints(prevHandPoints);
    setTimeout(() => setPoints(), PREVIOUS_HAND_ANIMATION_DURATION);
  }, [prevHandPoints]);

  return (
    <Box display="flex">
      {teams.map((team, i) => (
        <Box key={i} mx={1}>
          {team.points.buenas ? (
            <TeamCard>
              <TeamTag teamIdx={i} />
              <Typography>
                {team.points.buenas} <span>buenas</span>
              </Typography>
              {points && points[i as 0 | 1] !== undefined ? (
                <Typography variant="h6">
                  {"+"} {points[i as 0 | 1]}
                </Typography>
              ) : null}
            </TeamCard>
          ) : (
            <TeamCard>
              <TeamTag teamIdx={i} />
              <Typography>
                {team.points.malas} <span>malas</span>
              </Typography>
              {points && points[i as 0 | 1] !== undefined ? (
                <Typography variant="h6">
                  {"+"} {points[i as 0 | 1]}
                </Typography>
              ) : null}
            </TeamCard>
          )}
        </Box>
      ))}
    </Box>
  );
};

export const Match = () => {
  const [{ session }] = useTrucoshi();
  const { sessionId } = useParams<{ sessionId: string }>();

  const [{ match, error, canSay, canPlay }, { playCard, sayCommand }] = useMatch(sessionId);

  const navigate = useNavigate();

  useEffect(() => {
    if (match && match.state === EMatchTableState.UNREADY) {
      navigate(`/lobby/${sessionId}`);
    }
  }, [match, navigate, sessionId]);

  return (
    <Container>
      <SocketBackdrop />
      <MatchBackdrop error={error} />
      <Box position="fixed" left="2em" top="4em">
        <ChatRoom matchId={sessionId} players={match?.players} />
      </Box>
      {match && (
        <>
          <Box position="fixed" right="2em" top="4em">
            <MatchPoints teams={match.teams} prevHandPoints={match.prevHandPoints} />
          </Box>
          <GameTable
            match={match}
            Slot={({ player }) => (
              <Player canSay={canSay} canPlay={canPlay} player={player} session={session} onPlayCard={playCard} onSayCommand={sayCommand} match={match} />
            )}
            InnerSlot={({ player }) => <Rounds player={player} match={match} />}
          />
        </>
      )}
    </Container>
  );
};
