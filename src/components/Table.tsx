import { CSSProperties } from "react";
import { Box, Button, ButtonGroup, Typography } from "@mui/material";
import styled from "@emotion/styled";
import { useTrucoshiState } from "../hooks/useTrucoshiState";
import { useTrucoshiAction } from "../hooks/useTrucoshiAction";

const Container = styled("div")`
  --d: 8em; /* image size */
  --rel: 1; /* how much extra space we want between images, 1 = one image size */
  --r: calc(0.5 * (1 + var(--rel)) * var(--d) / var(--tan)); /* circle radius */
  --s: calc(2 * var(--r) + var(--d)); /* container size */
  position: relative;
  margin: 0 auto;
  width: var(--s);
  height: var(--s);
`;

const Item = styled("div")`
  position: absolute;
  top: 50%;
  left: 50%;
  margin: calc(-0.5 * var(--d));
  width: var(--d);
  height: var(--d);
  --az: calc(var(--i) * 1turn / var(--m));
  transform: rotate(var(--az)) translate(var(--r)) rotate(calc(-1 * var(--az)));
`;

export const Table = () => {
  const { match, session, isMyTurn } = useTrucoshiState();
  const { playTurnCard } = useTrucoshiAction();

  if (!match) {
    return null;
  }

  const { players } = match;
  const length = players.length;
  const tan = length > 2 ? Math.tan(Math.PI / length) : 1;

  return (
    <div>
      <Container style={{ "--m": length, "--tan": tan.toFixed(2) } as CSSProperties}>
        {players.map((player, i) => (
          <Item style={i >= 0 ? ({ "--i": `${i}` } as CSSProperties) : {}}>
            <Box sx={{ maxWidth: "100%" }}>
              <Box height="2em">
                <Typography variant="body2">{player.id}</Typography>
                {player.hand.map((card, idx) =>
                  isMyTurn && player.session === session ? (
                    <ButtonGroup>
                      <Button
                        size="large"
                        variant="contained"
                        color="primary"
                        onClick={() => playTurnCard(idx)}
                      >
                        {card}
                      </Button>
                    </ButtonGroup>
                  ) : (
                    <ButtonGroup>
                      <Button size="large" variant="contained" color="error">
                        {player.session !== session ? <span>&nbsp;&nbsp;</span> : <span>{card}</span>}
                      </Button>
                    </ButtonGroup>
                  )
                )}
              </Box>
              <Box mt="1em">
                <Box margin="0 auto" position="relative" width="3em">
                  {match.rounds.map((round, i) =>
                    round.map((pc) => {
                      if (pc.player.session === player.session) {
                        return (
                          <Button
                            sx={{
                              position: "absolute",
                              left: `calc(8px * ${i})`,
                              top: `calc(8px * ${i})`,
                            }}
                            size="large"
                            variant="contained"
                            color="success"
                          >
                            {pc.card}
                          </Button>
                        );
                      }
                      return null;
                    })
                  )}
                </Box>
              </Box>
            </Box>
          </Item>
        ))}
      </Container>
    </div>
  );
};
