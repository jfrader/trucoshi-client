import { Card, CardContent, Stack, Typography } from "@mui/material";
import type { IPublicMatchInfo } from "trucoshi";
import { Link } from "../../shared/Link";
import { TrucoshiText } from "../../shared/TrucoshiText";
import { MatchList } from "../game/MatchList";
import { PlayMenu } from "../menu/PlayMenu";
import { WalletMenu } from "../menu/WalletMenu";

export const SidebarMainContent = ({
  activeMatches,
  onMenuClick,
}: {
  activeMatches: IPublicMatchInfo[];
  onMenuClick: () => void;
}) => (
  <>
    <WalletMenu />
    <Stack pt={1} alignItems="center">
      <Link to="/" lineHeight={4}>
        <Typography height="26px" variant="h6">
          <TrucoshiText height="26px" />
        </Typography>
      </Link>
    </Stack>
    <PlayMenu smallPlayButton onMenuClick={onMenuClick} />
    {activeMatches.length ? (
      <Card sx={(theme) => ({ mx: 2, ...theme.trucoshiUi.treasure.rewardFrame })}>
        <CardContent>
          <MatchList dense matches={activeMatches} title="Partidas activas" />
        </CardContent>
      </Card>
    ) : null}
  </>
);
