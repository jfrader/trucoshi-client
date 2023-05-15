import { CSSProperties, FC, useEffect, useState } from "react";
import { Box, styled } from "@mui/material";
import { IPublicMatch, IPublicPlayer } from "trucoshi";
import { PropsWithPlayer } from "../trucoshi/types";
import { GameTableSlot, IGameTableSlot } from "./GameTableSlot";

export interface GameTableProps {
  fill?: number;
  match: IPublicMatch;
  Slot: FC<PropsWithPlayer>;
  InnerSlot?: FC<PropsWithPlayer>;
  FillSlot?: FC<{ i: number }>;
  MiddleSlot?: FC<{ i: number }>;
  zoomOnIndex?: number;
  inspecting?: IPublicPlayer | null;
}

const init = ({ fill, players }: { fill?: number; players: IPublicPlayer[] }) => {
  const length = fill && players.length < fill ? fill : players.length;
  const tan = Math.tan(Math.PI / 7);
  const items: Array<IGameTableSlot> = [];
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

  return {
    items,
    style: { "--m": length, "--tan": tan.toFixed(2) } as CSSProperties,
  };
};

export const GameTable = ({
  match,
  Slot,
  InnerSlot,
  FillSlot,
  MiddleSlot,
  fill,
  inspecting,
  zoomOnIndex = -1,
}: GameTableProps) => {
  const { players } = match;

  const [{ items, style }, setState] = useState<{
    items: Array<IPublicPlayer | { key: number; hand?: undefined }>;
    style: CSSProperties;
  }>(() => init({ fill, players }));

  useEffect(() => {
    setState(init({ fill, players }));
  }, [fill, players]);

  return (
    <Box position="relative">
      <Container style={style}>
        {items.map((player, i) => (
          <GameTableSlot
            i={i}
            key={player.key}
            player={player}
            Slot={Slot}
            FillSlot={FillSlot}
            InnerSlot={InnerSlot}
            MiddleSlot={MiddleSlot}
            inspecting={inspecting}
            zoomOnIndex={zoomOnIndex}
          />
        ))}
      </Container>
    </Box>
  );
};

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
