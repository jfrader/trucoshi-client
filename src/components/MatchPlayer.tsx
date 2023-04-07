import { Box, Button, ButtonGroup, Paper } from "@mui/material";
import { ICard, IPublicPlayer } from "trucoshi";
import { useRounds } from "../trucoshi/hooks/useRounds";
import { ITrucoshiMatchActions, ITrucoshiMatchState } from "../trucoshi/types";
import { GameCard } from "./GameCard";
import { PlayerTag } from "./PlayerTag";

type PlayerProps = Pick<ITrucoshiMatchState, "canPlay" | "canSay" | "previousHand" | "match"> & {
  session: string | null;
  player: IPublicPlayer;
  onPlayCard: ITrucoshiMatchActions["playCard"];
  onSayCommand: ITrucoshiMatchActions["sayCommand"];
};

export const MatchPlayer = ({
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
                key={command}
                onClick={() => onSayCommand(command)}
                size="small"
                color="success"
              >
                {command}
              </Button>
            ))}
            {player.isEnvidoTurn && player.envido.map((points) => (
              <Button
                key={points}
                onClick={() => onSayCommand(points)}
                size="small"
                variant="text"
                color="success"
              >
                {points}
              </Button>
            ))}
          </ButtonGroup>
        </Box>
      ) : null}
    </Box>
  );
};
