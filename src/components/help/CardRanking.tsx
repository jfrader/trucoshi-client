import { Stack, Typography } from "@mui/material";
import { GameCard } from "../card/GameCard";
import { HandCardContainer } from "../card/HandCardContainer";
import groupBy from "lodash.groupby";
import { useTrucoshi } from "../../trucoshi/hooks/useTrucoshi";
import { CARDS, ICard } from "trucoshi";

const groupedCards = groupBy(
  Object.entries(CARDS),
  ([, value]: [ICard, number]) => value,
) as Record<string, Array<[ICard, number]>>;

export const CardRanking = ({
  compact = false,
  title = "",
}: {
  compact?: boolean;
  title?: string;
}) => {
  const [, { inspectCard }] = useTrucoshi();
  return (
    <Stack pt={compact ? 0 : 2} direction="row" flexWrap="wrap" gap={compact ? 2 : 4}>
      {title ? (
        <Typography
          variant="caption"
          fontWeight="bold"
          fontSize={compact ? "medium" : "large"}
          width="100%"
        >
          {title}
        </Typography>
      ) : null}
      {Object.entries(groupedCards)
        .sort(([a], [b]) => Number(b) - Number(a))
        .map(([value, cards], i) => {
          return (
            <Stack alignItems="center" gap={compact ? 1 : 2} direction="row" key={value}>
              <Typography fontSize={compact ? "0.8rem" : undefined}>{i + 1}. </Typography>
              {cards.map(([c], j) => (
                <HandCardContainer
                  open={false}
                  sx={{
                    transform: compact ? "scale(0.72)" : undefined,
                    transformOrigin: "left center",
                    position: "relative",
                    left: "initial",
                    right: "initial",
                    marginLeft: `calc(-${compact ? 1.9 : 1.2}em * ${j})`,
                  }}
                  cards={cards.length}
                  i={j}
                  key={c}
                  rotationSeed={c}
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
