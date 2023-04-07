import { CSSProperties, FC, Fragment } from "react";
import { Box, Paper, styled } from "@mui/material";
import { IPublicMatch, IPublicPlayer } from "trucoshi";

const Container = styled(Box)`
  padding: 16px;
  --d: 13rem; /* image size */
  --rel: 0.74; /* how much extra space we want between images, 1 = one image size */
  --r: calc(0.42 * (1 + var(--rel)) * var(--d) / var(--tan)); /* circle radius */
  --s: calc(2 * var(--r) + var(--d)); /* container size */
  position: relative;
  margin: 0 auto;
  width: var(--s);
  height: var(--s);
  transform: rotate(90deg);
`;

const Item = styled(Paper)`
  position: absolute;
  top: 50%;
  left: 50%;
  margin: calc(-0.5 * var(--d));
  width: var(--d);
  height: var(--d);
  zoom: var(--z);
  --az: calc(var(--i) * 1turn / var(--m));
  transform: rotate(var(--az)) translate(var(--r)) rotate(calc(-1 * var(--az))) rotate(270deg);
`;

const InnerItem = styled(Box)`
  position: absolute;
  top: 50%;
  left: 50%;
  margin-left: calc(-0.22 * var(--d));
  margin-top: calc(-0.17 * var(--d));
  width: calc(var(--d) / 2);
  height: calc(var(--d) / 2);
  --az: calc(var(--i) * 1turn / var(--m));
  transform: rotate(var(--az)) translate(calc(var(--r) / 2.8)) rotate(calc(-1 * var(--az)))
    rotate(270deg);
`;

interface GameTableProps {
  fill?: number;
  match: IPublicMatch;
  Slot: FC<{ player: IPublicPlayer }>;
  InnerSlot?: FC<{ player: IPublicPlayer }>;
  FillSlot?: FC<{ i: number }>;
  zoomOnIndex?: number;
}

export const GameTable = ({
  match,
  Slot,
  InnerSlot,
  FillSlot,
  fill,
  zoomOnIndex = 0,
}: GameTableProps) => {
  const { players } = match;

  const length = fill && players.length < fill ? fill : players.length;
  const tan = Math.tan(Math.PI / 6);

  let items: Array<IPublicPlayer | { key: number; hand?: undefined }> = [];
  let slots = [];

  for (let i = 0; i < length; i++) {
    if (players[i]) {
      items.push(players[i]);
      continue;
    }
    if (slots.length < 2) {
      items.push({ key: i });
      slots.push(i);
      continue;
    }
    items.push({ key: -1 - i });
  }

  return (
    <Box position="relative">
      <Container style={{ "--m": length, "--tan": tan.toFixed(2) } as CSSProperties}>
        {items.map((player, i) => (
          <Fragment key={player.key}>
            <Item
              style={
                {
                  "--i": `${i}`,
                  "--z": zoomOnIndex === i ? `1.2` : `1`,
                  zIndex: 12 - i,
                } as CSSProperties
              }
            >
              {player.hand ? (
                <Slot player={player} />
              ) : (
                FillSlot &&
                player.key > -1 && (
                  <Box margin="30% auto">
                    <FillSlot i={i} />
                  </Box>
                )
              )}
            </Item>
            {player.hand && InnerSlot ? (
              <InnerItem style={{ "--i": `${i}`, zIndex: 13 } as CSSProperties}>
                <InnerSlot player={player} />
              </InnerItem>
            ) : null}
          </Fragment>
        ))}
      </Container>
    </Box>
  );
};
