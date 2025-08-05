import { HelpOutlined } from "@mui/icons-material";
import {
  Card,
  CardContent,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { Link } from "../shared/Link";
import { GITHUB_LINK_FRAN, HELP_LINKS } from "../assets/links/links";
import { PageContainer } from "../shared/PageContainer";
import groupBy from "lodash.groupby";
import { CARDS, ICard } from "trucoshi";
import { GameCard } from "../components/card/GameCard";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";
import { HandCardContainer } from "../components/card/HandCardContainer";

export const Help = () => {
  const [, { inspectCard }] = useTrucoshi();
  const groupedCards = groupBy(
    Object.entries(CARDS),
    ([, value]: [ICard, number]) => value
  ) as Record<string, Array<[ICard, number]>>;

  return (
    <PageContainer title="Ayuda" icon={<HelpOutlined fontSize="large" />}>
      <Card>
        <CardContent>
          <List>
            {HELP_LINKS.map(({ to, label, Icon }) => {
              return (
                <ListItemButton key={to}>
                  <ListItemIcon>
                    <Icon />
                  </ListItemIcon>
                  <ListItemText>
                    <Link target="_blank" to={to}>
                      <Typography>{label}</Typography>
                    </Link>
                  </ListItemText>
                </ListItemButton>
              );
            })}
          </List>
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
          <Typography pt={4} display="block" variant="caption">
            Made with ❤️ by{" "}
            <Link target="_blank" to={GITHUB_LINK_FRAN.to}>
              Fran
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </PageContainer>
  );
};
