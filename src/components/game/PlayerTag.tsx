import { Stack, styled, Typography, TypographyProps } from "@mui/material";
import { Box, css } from "@mui/system";
import { bounce } from "../../assets/animations/bounce";
import { TeamTag } from "./TeamTag";
import { PropsWithPlayer } from "../../trucoshi/types";
import { UserAvatar } from "../../shared/UserAvatar";
import { getTeamColor } from "../../utils/team";

type ITeamTagProps = PropsWithPlayer<{
  isTurn?: boolean;
  disabled?: boolean;
}>;

export const PlayerTag = ({
  player,
  isTurn,
  disabled,
  ...props
}: ITeamTagProps & TypographyProps) => {
  return (
    <AnimatedBox isturn={Number(!disabled && isTurn && player.isMe)}>
      <Stack alignItems="center" gap="0.2rem">
        <Stack direction="row" justifyContent="center" alignItems="center" gap={1}>
          <UserAvatar
            size="small"
            bgcolor={getTeamColor(player.teamIdx) + ".main"}
            account={player}
          />
          <PlayerName
            color={disabled ? "text.disabled" : undefined}
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

export const AnimatedBox = styled(Box)<{ isturn: number }>(({ isturn }) =>
  isturn
    ? css`
        animation: ${bounce} 0.8s ease 2;
      `
    : {}
);
