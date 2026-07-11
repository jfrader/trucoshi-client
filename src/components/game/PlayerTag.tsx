import {
  Box,
  Stack,
  styled,
  SvgIconProps,
  Tooltip,
  Typography,
  TypographyProps,
  useTheme,
} from "@mui/material";
import { css } from "@mui/material/styles";
import { bounce } from "../../assets/animations/bounce";
import { TeamTag } from "./TeamTag";
import { PropsWithPlayer } from "../../trucoshi/types";
import { UserAvatar } from "../../shared/UserAvatar";
import { getTeamColor } from "../../utils/team";
import { BackHand, Star } from "@mui/icons-material";
import { IChatMessage, SayType } from "trucoshi";
import MateIcon from "../../assets/icons/MateIcon";
import { ReactNode } from "react";

type ITeamTagProps = PropsWithPlayer<{
  isTurn?: boolean;
  isDisabled?: boolean;
  isForehand?: boolean;
  isLobby?: boolean;
  say?: IChatMessage | null;
}>;

const SAY_MAP: Record<SayType, (props: SvgIconProps) => ReactNode> = {
  ceba_toma_mate: MateIcon,
  mate: MateIcon,
};

export const PlayerTag = ({
  player,
  say,
  isTurn,
  isForehand,
  isDisabled,
  isLobby,
  ...props
}: ITeamTagProps & TypographyProps) => {
  const theme = useTheme();

  const isSay = say && player.key === say.user.key;
  const SayIcon = isSay ? SAY_MAP[say.sound as SayType] || (() => null) : () => null;

  return (
    <AnimatedBox isturn={Number(isSay || (!isDisabled && isTurn && player.isMe))}>
      <Stack alignItems="center" gap="0.2rem">
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          gap={1}
          position="relative"
        >
          {isSay ? (
            <Box
              sx={{
                position: "absolute",
                zIndex: theme.zIndex.snackbar - 1,
                left: -24,
                top: -4,
              }}
            >
              <SayIcon color="success" />
            </Box>
          ) : null}
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

export const PlayerName = styled(Typography, {
  shouldForwardProp: (prop) => prop !== "isturn",
})<{ isturn: number }>(({ theme, isturn }) =>
  isturn
    ? {
        color: theme.palette.success.main,
      }
    : {}
);

export const AnimatedBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== "isturn" && prop !== "infinite",
})<{ isturn: number; infinite?: number }>(
  ({ isturn, infinite = 0 }) =>
    isturn
      ? css`
          animation: ${bounce} 0.8s ease ${infinite ? "infinite" : "2"};
        `
      : {}
);
