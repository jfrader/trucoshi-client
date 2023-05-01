import { CSSProperties, FC, Fragment, useMemo } from "react";
import { Box, Paper, styled } from "@mui/material";
import { IPublicMatch, IPublicPlayer } from "trucoshi";

const Container = styled(Box)`
  padding: 16px;
  --d: 12.5rem; /* image size */
  --rel: 0.45; /* how much extra space we want between images, 1 = one image size */
  --r: calc(0.4 * (1 + var(--rel)) * var(--d) / var(--tan)); /* circle radius */
  --s: calc(2 * var(--r) + var(--d)); /* container size */
  position: relative;
  margin: 0 auto;
  width: var(--s);
  height: var(--s);
  transform: rotate(90deg);
`;

const Item = styled(Paper)(({ theme }) => {
  return `
    background: ${theme.palette.background.paper};
    position: absolute;
    top: 50%;
    left: 50%;
    display: flex;
    flex-direction: column;
    margin: calc(-0.5 * var(--d));
    width: var(--d);
    height: var(--d);
    zoom: var(--z);
    --az: calc(var(--i) * 1turn / var(--m));
    transform: rotate(var(--az)) translate(calc(var(--r) - var(--mr))) rotate(calc(-1 * var(--az)))
      rotate(270deg);
  `;
});

const MiddleItem = styled(Box)(() => {
  return `
    position: absolute;
    top: 50%;
    left: 50%;
    display: flex;
    flex-direction: column;
    margin: calc(-0.5 * var(--d));
    width: calc(var(--d));
    height: calc(var(--d));
    --az: calc(1turn / var(--m));
    transform: rotate(calc(-1 * var(--az)))
      rotate(90deg);
  `;
});

const InnerItem = styled(Box)`
  position: absolute;
  top: 50%;
  left: 50%;
  margin-left: calc(-0.33 * var(--d));
  margin-top: calc(-0.18 * var(--d));
  width: calc(var(--d) / 2);
  height: calc(var(--d) / 2);
  --az: calc(var(--i) * 1turn / var(--m));
  transform: rotate(var(--az)) translate(calc(var(--r) / 2.87)) rotate(calc(-1 * var(--az)))
    rotate(270deg);
`;

interface GameTableProps {
  fill?: number;
  match: IPublicMatch;
  Slot: FC<{ player: IPublicPlayer }>;
  InnerSlot?: FC<{ player: IPublicPlayer }>;
  FillSlot?: FC<{ i: number }>;
  MiddleSlot?: FC<{ i: number }>;
  zoomOnIndex?: number;
}

export const GameTable = ({
  match,
  Slot,
  InnerSlot,
  FillSlot,
  MiddleSlot,
  fill,
  zoomOnIndex = -1,
}: GameTableProps) => {
  const { players } = match;

  const { items, length, tan } = useMemo(() => {
    const length = fill && players.length < fill ? fill : players.length;
    const tan = Math.tan(Math.PI / 7);
    const items: Array<IPublicPlayer | { key: number; hand?: undefined }> = [];
    const slots = [];

    items.push({ key: 0 });

    for (let i = 0; i < length; i++) {
      if (players[i]) {
        items.push(players[i]);
        continue;
      }
      if (slots.length < 2) {
        items.push({ key: i + 1 });
        slots.push(i + 1);
        continue;
      }
      items.push({ key: -1 - i });
    }

    return { items, length, tan };
  }, [fill, players]);

  return (
    <Box position="relative">
      <Container style={{ "--m": length, "--tan": tan.toFixed(2) } as CSSProperties}>
        {items.map((player, i) => (
          <Fragment key={player.key}>
            {i === 0 ? (
              <MiddleItem
                style={
                  {
                    "--mr": "0px",
                    "--i": `${i - 1}`,
                    "--z": zoomOnIndex === i ? `1.1` : `1`,
                    zIndex: 12 - i,
                  } as CSSProperties
                }
              >
                {MiddleSlot ? <MiddleSlot i={i} /> : null}
              </MiddleItem>
            ) : (
              <Item
                style={
                  {
                    "--mr": "0px",
                    "--i": `${i - 1}`,
                    "--z": zoomOnIndex === i ? `1.1` : `1`,
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
                      <FillSlot i={i - 1} />
                    </Box>
                  )
                )}
              </Item>
            )}
            {player.hand && InnerSlot ? (
              <InnerItem style={{ "--i": `${i - 1}`, zIndex: 13 } as CSSProperties}>
                <InnerSlot player={player} />
              </InnerItem>
            ) : null}
          </Fragment>
        ))}
      </Container>
    </Box>
  );
};
