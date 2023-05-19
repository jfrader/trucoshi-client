import { CSSProperties, Fragment, useMemo } from "react";
import { Box, Paper, styled } from "@mui/material";
import { GameTableProps } from "./GameTable";
import { IPublicPlayer } from "trucoshi";

export type IGameTableSlot = IPublicPlayer | { key: number; hand?: undefined };

type Props = Pick<
  GameTableProps,
  "FillSlot" | "InnerSlot" | "MiddleSlot" | "Slot" | "zoomOnIndex" | "inspecting"
> & {
  player: IGameTableSlot;
  i: number;
};

export const GameTableSlot = ({
  player,
  zoomOnIndex,
  i,
  inspecting,
  FillSlot,
  MiddleSlot,
  Slot,
  InnerSlot,
}: Props) => {
  const { middleStyle, itemStyle, innerStyle } = useMemo<Record<string, CSSProperties>>(
    () => ({
      middleStyle: {
        "--mr": "0px",
        "--i": `${-1}`,
        "--z": zoomOnIndex === i ? `1.1` : `1`,
        zIndex: 12 - i,
      },
      itemStyle: {
        "--mr": "0px",
        "--i": `${i - 1}`,
        "--z": zoomOnIndex === i ? `1.1` : `1`,
        zIndex: 12 - i,
      },
      innerStyle: {
        "--i": `${i - 1}`,
        zIndex: inspecting?.key === player.key ? 9000 : 13,
      },
    }),
    [i, inspecting, player, zoomOnIndex]
  );

  return (
    <Fragment>
      {i === 0 ? (
        <MiddleItem style={middleStyle}>{MiddleSlot ? <MiddleSlot i={i} /> : null}</MiddleItem>
      ) : (
        <Item elevation={2} style={itemStyle}>
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
        <InnerItem style={innerStyle}>
          <InnerSlot player={player} />
        </InnerItem>
      ) : null}
    </Fragment>
  );
};

const Item = styled(Paper)(({ theme }) => {
  return `
      background: ${theme.palette.background.paper};
      overlay: none;
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
      --az: calc(1turn / 2);
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
