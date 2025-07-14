import { Stack, styled, Tooltip, Typography, TypographyProps, useTheme } from "@mui/material";
import { Box, css } from "@mui/system";
import { bounce } from "../../assets/animations/bounce";
import { TeamTag } from "./TeamTag";
import { PropsWithPlayer } from "../../trucoshi/types";
import { UserAvatar } from "../../shared/UserAvatar";
import { getTeamColor } from "../../utils/team";
import { BackHand, Star } from "@mui/icons-material";

type ITeamTagProps = PropsWithPlayer<{
  isTurn?: boolean;
  isDisabled?: boolean;
  isForehand?: boolean;
  isLobby?: boolean;
}>;

export const PlayerTag = ({
  player,
  isTurn,
  isForehand,
  isDisabled,
  isLobby,
  ...props
}: ITeamTagProps & TypographyProps) => {
  const theme = useTheme();
  return (
    <AnimatedBox isturn={Number(!isDisabled && isTurn && player.isMe)}>
      <Stack alignItems="center" gap="0.2rem">
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          gap={1}
          position="relative"
        >
          {isForehand && (
            <Box
              sx={{ position: "absolute", zIndex: theme.zIndex.snackbar - 1, left: -8, bottom: -6 }}
            >
              <Tooltip placement="left" title="Mano">
                <BackHand sx={{ fontSize: "13px" }} />
              </Tooltip>
            </Box>
          )}
          {isLobby && player.isOwner && (
            <Box
              sx={{ position: "absolute", zIndex: theme.zIndex.snackbar - 1, left: -8, bottom: -6 }}
            >
              <Tooltip placement="left" title="Host">
                <Star sx={{ fontSize: "13px" }} />
              </Tooltip>
            </Box>
          )}
          <UserAvatar
            size="small"
            bgcolor={getTeamColor(player.teamIdx) + ".main"}
            account={player}
          />
          <PlayerName
            color={isDisabled ? "text.disabled" : undefined}
            isturn={Number(isTurn)}
            display="inline"
            variant="h6"
            {...props}
          >
            {player.name}
          </PlayerName>
        </Stack>
        <TeamTag teamIdx={player.teamIdx} />
      </Stack>
    </AnimatedBox>
  );
};

export const PlayerName = styled(Typography)<{ isturn: number }>(({ theme, isturn }) =>
  isturn
    ? {
        color: theme.palette.success.main,
      }
    : {}
);

export const AnimatedBox = styled(Box)<{ isturn: number; infinite?: number }>(
  ({ isturn, infinite = 0 }) =>
    isturn
      ? css`
          animation: ${bounce} 0.8s ease ${infinite ? "infinite" : "2"};
        `
      : {}
);
