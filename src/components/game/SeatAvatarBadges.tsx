import { BackHand, Star } from "@mui/icons-material";
import { Box, SvgIconProps, Tooltip } from "@mui/material";
import { ReactNode } from "react";
import { IChatMessage, IPublicPlayer, SayType } from "trucoshi";
import { LocalCafe as MateIcon } from "@mui/icons-material";

type SeatAvatarBadgesProps = {
  player: IPublicPlayer;
  say?: IChatMessage | null;
  showForehand?: boolean;
  showHost?: boolean;
};

const SAY_ICON_BY_SOUND: Partial<Record<SayType, (props: SvgIconProps) => ReactNode>> = {
  ceba_toma_mate: MateIcon,
  mate: MateIcon,
};

export const SeatAvatarBadges = ({
  player,
  say,
  showForehand,
  showHost,
}: SeatAvatarBadgesProps) => {
  const saySound = typeof say?.sound === "string" ? say.sound : "";
  const SayIcon = SAY_ICON_BY_SOUND[saySound as SayType];
  const isSay = Boolean(SayIcon && say?.user?.key === player.key);

  return (
    <>
      {isSay && SayIcon ? (
        <Tooltip placement="top" title="Toma mate">
          <Box
            aria-label="Toma mate"
            sx={(theme) => ({
              ...theme.trucoshiUi.seatAvatarBadges.badge,
              ...theme.trucoshiUi.seatAvatarBadges.mateBadge,
            })}
          >
            <SayIcon sx={(theme) => theme.trucoshiUi.seatAvatarBadges.mateIcon} />
          </Box>
        </Tooltip>
      ) : null}

      {showForehand ? (
        <Tooltip placement="left" title="Mano">
          <Box
            aria-label="Mano"
            sx={(theme) => ({
              ...theme.trucoshiUi.seatAvatarBadges.badge,
              ...theme.trucoshiUi.seatAvatarBadges.roleBadge,
            })}
          >
            <BackHand sx={(theme) => theme.trucoshiUi.seatAvatarBadges.manoIcon} />
          </Box>
        </Tooltip>
      ) : showHost ? (
        <Tooltip placement="left" title="Host">
          <Box
            aria-label="Host"
            sx={(theme) => ({
              ...theme.trucoshiUi.seatAvatarBadges.badge,
              ...theme.trucoshiUi.seatAvatarBadges.roleBadge,
            })}
          >
            <Star sx={(theme) => theme.trucoshiUi.seatAvatarBadges.hostIcon} />
          </Box>
        </Tooltip>
      ) : null}
    </>
  );
};
