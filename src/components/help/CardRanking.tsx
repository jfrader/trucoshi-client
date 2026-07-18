import { Stack, Typography } from "@mui/material";
import { GameCard } from "../card/GameCard";
import { HandCardContainer } from "../card/HandCardContainer";
import groupBy from "lodash.groupby";
import { useTrucoshi } from "../../trucoshi/hooks/useTrucoshi";
import { CARDS, ICard } from "trucoshi";

const groupedCards = groupBy(
  Object.entries(CARDS),
  ([, value]: [ICard, number]) => value
) as Record<string, Array<[ICard, number]>>;

export const CardRanking = () => {
  const [, { inspectCard }] = useTrucoshi();
  return (
    <Stack pt={2} direction="row" flexWrap="wrap" gap={4}>
      <Typography variant="caption" fontWeight="bold" fontSize="large" width="100%">
        Ranking de Cartas en el Truco
      </Typography>
      {Object.entries(groupedCards)
        .sort(([a], [b]) => Number(b) - Number(a))
        .map(([value, cards], i) => {
          return (
            <Stack gap={2} direction="row" key={value}>
              <Typography>{i + 1}. </Typography>
              {cards.map(([c], j) => (
                <HandCardContainer
                  open={false}
                  sx={{
                    position: "relative",
                    left: "initial",
                    right: "initial",
                    marginLeft: `calc(-1.2em * ${j})`,
                  }}
                  cards={cards.length}
                  i={j}
                  key={c}
                >
                  <GameCard onClick={() => inspectCard(c)} card={c} />
                </HandCardContainer>
              ))}
            </Stack>
          );
        })}
    </Stack>
  );
};
