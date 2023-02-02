import { CSSProperties, FC, Fragment } from "react";
import styled from "@emotion/styled";
import { Box, Paper } from "@mui/material";
import { IPublicMatch, IPublicPlayer } from "trucoshi";

const Container = styled(Box)`
  padding: 24px;
  --d: 7.5em; /* image size */
  --rel: 0.8; /* how much extra space we want between images, 1 = one image size */
  --r: calc(0.5 * (1 + var(--rel)) * var(--d) / var(--tan)); /* circle radius */
  --s: calc(2 * var(--r) + var(--d)); /* container size */
  position: relative;
  margin: 0 auto;
  width: var(--s);
  height: var(--s);
  transform: rotate(90deg);
`;

const Item = styled(Paper)`
  z-index: 9;
  position: absolute;
  top: 50%;
  left: 50%;
  margin: calc(-0.5 * var(--d));
  width: var(--d);
  height: var(--d);
  --az: calc(var(--i) * 1turn / var(--m));
  transform: rotate(var(--az)) translate(var(--r)) rotate(calc(-1 * var(--az))) rotate(270deg);
`;

const InnerItem = styled(Box)`
  position: absolute;
  top: 50%;
  left: 50%;
  margin: calc(-0.5 * var(--d));
  width: var(--d);
  height: var(--d);
  --az: calc(var(--i) * 1turn / var(--m));
  transform: rotate(var(--az)) translate(calc(var(--r) / 2.8)) rotate(calc(-1 * var(--az)))
    rotate(270deg);
`;

interface ITableProps {
  fill?: number;
  match: IPublicMatch;
  Component: FC<{ player: IPublicPlayer }>;
  InnerComponent?: FC<{ player: IPublicPlayer }>;
  MidComponent?: FC<{}>;
  FillComponent?: FC<{ i: number }>;
}

export const Table = ({ match, Component, InnerComponent, FillComponent: MidComponent, fill }: ITableProps) => {
  const { players } = match;

  const length = fill && players.length < fill ? fill : players.length;
  const tan = Math.tan(Math.PI / 6);

  let items: Array<IPublicPlayer | { id: number; hand?: undefined }> = [];
  let slots = [];

  for (let i = 0; i < length; i++) {
    if (players[i]) {
      items.push(players[i]);
      continue;
    }
    if (slots.length < 2) {
      items.push({ id: i });
      slots.push(i);
      continue;
    }
    items.push({ id: - 1 - i });
  }

  return (
    <Box position="relative">
      <Container style={{ "--m": length, "--tan": tan.toFixed(2) } as CSSProperties}>
        {items.map((player, i) =>
        (
          <Fragment key={player.id}>
            <Item style={{ "--i": `${i}` } as CSSProperties}>
              {player.hand ? (
                <Component player={player} />
              ) : (
                MidComponent &&
                player.id > -1 && (
                  <Box margin="30% auto">
                    <MidComponent i={i} />
                  </Box>
                )
              )}
            </Item>
            {player.hand && InnerComponent ? (
              <InnerItem style={{ "--i": `${i}` } as CSSProperties}>
                <InnerComponent player={player} />
              </InnerItem>
            ) : null}
          </Fragment>
        )
        )}
      </Container>
    </Box>
  );
};
