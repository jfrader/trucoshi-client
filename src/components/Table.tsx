import { CSSProperties, FC, Fragment } from "react";
import styled from "@emotion/styled";
import { IPublicMatch } from "trucoshi/dist/server/classes/MatchTable";
import { IPublicPlayer } from "trucoshi/dist/lib/classes/Player";
import { Box } from "@mui/material";

const Container = styled("div")`
  --d: 9em; /* image size */
  --rel: 1; /* how much extra space we want between images, 1 = one image size */
  --r: calc(0.5 * (1 + var(--rel)) * var(--d) / var(--tan)); /* circle radius */
  --s: calc(2 * var(--r) + var(--d)); /* container size */
  position: relative;
  margin: 0 auto;
  width: var(--s);
  height: var(--s);
  transform: rotate(90deg);
`;

const Item = styled("div")`
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

const InnerItem = styled("div")`
  position: absolute;
  top: 50%;
  left: 50%;
  margin: calc(-0.5 * var(--d));
  width: var(--d);
  height: var(--d);
  --az: calc(var(--i) * 1turn / var(--m));
  transform: rotate(var(--az)) translate(calc(var(--r) / 2)) rotate(calc(-1 * var(--az)))
    rotate(270deg);
`;

interface ITableProps {
  match: IPublicMatch;
  Component: FC<{ player: IPublicPlayer }>;
  InnerComponent: FC<{ player: IPublicPlayer }>;
}

export const Table = ({ match, Component, InnerComponent }: ITableProps) => {
  if (!match) {
    return null;
  }

  const { players } = match;

  const length = players.length;
  const tan = length > 2 ? Math.tan(Math.PI / length) : 1;

  return (
    <Box sx={{ position: "relative" }}>
      <Container style={{ "--m": length, "--tan": tan.toFixed(2) } as CSSProperties}>
        {players.map((player, i) => (
          <Fragment key={player.session}>
            <Item style={{ "--i": `${i}` } as CSSProperties}>
              <Component player={player} />
            </Item>
            <InnerItem style={{ "--i": `${i}` } as CSSProperties}>
              <InnerComponent player={player} />
            </InnerItem>
          </Fragment>
        ))}
      </Container>
    </Box>
  );
};
