import { Box, Button, ButtonGroup } from "@mui/material";
import { ICard, IPublicPlayer } from "trucoshi";
import { useRounds } from "../trucoshi/hooks/useRounds";
import { ITrucoshiMatchActions, ITrucoshiMatchState } from "../trucoshi/types";
import { GameCard } from "./GameCard";
import { PlayerTag } from "./PlayerTag";
import { DANGEROUS_COMMANDS, COMMANDS_HUMAN_READABLE } from "../trucoshi/constants";

type PlayerProps = Pick<ITrucoshiMatchState, "canPlay" | "canSay" | "previousHand" | "match"> & {
  player: IPublicPlayer;
  onPlayCard: ITrucoshiMatchActions["playCard"];
  onSayCommand: ITrucoshiMatchActions["sayCommand"];
};

export const MatchPlayer = ({
  match,
  previousHand,
  player,
  canSay,
  canPlay,
  onPlayCard,
  onSayCommand,
}: PlayerProps) => {
  const [, isPrevious] = useRounds(match, previousHand);
  return (
    <Box maxWidth="100%" pt={1} display="flex" flexDirection="column" flexGrow={1} height="100%">
      <PlayerTag player={player} isTurn={player.isTurn} />
      <Box pt={1}>
        {!isPrevious &&
          player.hand
            .map((c, i) => [c, i + c + player.key])
            .map(([card, key], idx) =>
              canPlay && player.isMe && player.isTurn ? (
                <GameCard
                  enableHover
                  key={key}
                  card={card as ICard}
                  onClick={() => onPlayCard(idx, card as ICard)}
                />
              ) : (
                <GameCard key={key} card={card as ICard} />
              )
            )}
      </Box>
      {player.isMe && canSay && !isPrevious ? (
        <Box
          pt={1}
          bgcolor="background.paper"
          justifySelf="end"
          flexGrow={1}
          display="flex"
          flexDirection="column"
          alignItems="center"
        >
          <ButtonGroup sx={{ flexWrap: "wrap", alignItems: "center", justifyContent: "center" }}>
            {player.commands.map((command) => (
              <Button
                key={command}
                onClick={() => onSayCommand(command)}
                size="small"
                variant="text"
                color={DANGEROUS_COMMANDS.includes(command) ? "error" : "success"}
              >
                {COMMANDS_HUMAN_READABLE[command]}
              </Button>
            ))}
            {player.isEnvidoTurn &&
              player.envido.map((points) => (
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
