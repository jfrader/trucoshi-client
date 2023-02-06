import { Box, Button, ButtonGroup, Container, Typography } from "@mui/material";
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
import { EMatchTableState, ICard, IHandPoints, IPublicPlayer, IPublicTeam } from "trucoshi";
import { PREVIOUS_HAND_ANIMATION_DURATION } from "../trucoshi/constants";
import { SocketBackdrop } from "../components/SocketBackdrop";
import { MatchBackdrop } from "../components/MatchBackdrop";
import { ChatRoom } from "../components/ChatRoom";
import { ITrucoshiMatchActions, ITrucoshiMatchState } from "../trucoshi/types";
import Paper from "@mui/material/Paper";

type PlayerProps = Pick<ITrucoshiMatchState, "canPlay" | "canSay" | "previousHand" | "match"> & {
  session: string | null;
  player: IPublicPlayer;
  onPlayCard: ITrucoshiMatchActions["playCard"];
  onSayCommand: ITrucoshiMatchActions["sayCommand"];
};

const Player = ({
  session,
  match,
  previousHand,
  player,
  canSay,
  canPlay,
  onPlayCard,
  onSayCommand,
}: PlayerProps) => {
  const isMe = player.session === session;
  const [, isPrevious] = useRounds(match, previousHand);
  return (
    <Box maxWidth="100%" pt={1} display="flex" flexDirection="column" flexGrow={1} height="100%">
      <PlayerTag player={player} isTurn={player.isTurn} isMe={isMe} />
      <Box pt={1}>
        {!isPrevious &&
          player.hand
            .map((c, i) => [c, i + c + player.key])
            .map(([card, key], idx) =>
              canPlay && isMe && player.isTurn ? (
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
      {isMe && canSay && !isPrevious ? (
        <Box
          pt={1}
          component={Paper}
          justifySelf="end"
          flexGrow={1}
          height="100%"
          display="flex"
          flexDirection="column"
          justifyContent="flex-end"
          alignItems="center"
        >
          <ButtonGroup sx={{ flexWrap: "wrap", alignItems: "center", justifyContent: "center" }}>
            {player.commands.map((command) => (
              <Button
                onClick={() => onSayCommand(command)}
                size="small"
                variant="text"
                color="success"
              >
                {command}
              </Button>
            ))}
          </ButtonGroup>
        </Box>
      ) : null}
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

  const [{ match, error, canSay, canPlay, previousHand }, { playCard, sayCommand, nextHand }] =
    useMatch(sessionId);

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
      {match && (
        <>
          <Box position="fixed" right="2em" top="2em">
            <MatchPoints teams={match.teams} prevHandPoints={previousHand?.points} />
          </Box>
          <GameTable
            match={match}
            Slot={({ player }) => (
              <Player
                key={player.key}
                previousHand={previousHand}
                canSay={canSay}
                canPlay={canPlay}
                player={player}
                session={session}
                onPlayCard={playCard}
                onSayCommand={sayCommand}
                match={match}
              />
            )}
            InnerSlot={({ player }) => (
              <Rounds
                previousHand={previousHand}
                previousHandCallback={nextHand}
                player={player}
                match={match}
              />
            )}
          />
        </>
      )}
      <ChatRoom matchId={sessionId} players={match?.players} />
    </Container>
  );
};
