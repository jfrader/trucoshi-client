import { Person, PsychologyAlt, SmartToy } from "@mui/icons-material";
import { Avatar, AvatarProps, Badge, BoxProps, styled } from "@mui/material";
import { User } from "lightning-accounts";
import { useRef, useState } from "react";
import { Link } from "./Link";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";

const SIZES = {
  tiny: 16,
  small: 24,
  medium: 36,
  big: 48,
  large: 64,
};

export const UserAvatar = ({
  size = "medium",
  link = false,
  account,
  bgcolor,
  status,
  ...rest
}: {
  link?: boolean;
  account: Pick<User, "name" | "avatarUrl" | "id"> & {
    accountId?: number | null;
    bot?: string | null | boolean;
  };
  status?: boolean;
  size?: keyof typeof SIZES;
  bgcolor?: BoxProps["bgcolor"];
} & AvatarProps) => {
  const [{ stats }] = useTrucoshi();
  const [error, setError] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  const iconSx = { height: SIZES[size] * 0.9 + "px", width: SIZES[size] * 0.9 + "px" };
  const opt =
    account.avatarUrl && !error
      ? { src: account.avatarUrl }
      : {
          children: account.bot ? (
            <SmartToy sx={iconSx} color="action" />
          ) : error ? (
            <Person sx={iconSx} color="action" />
          ) : (
            <PsychologyAlt sx={iconSx} color="action" />
          ),
        };

  const props: AvatarProps = {
    alt: account.name,
    title: account.name,
    role: "button",
    sx: {
      bgcolor: bgcolor || stringToColor(account.name),
      width: SIZES[size] + "px",
      height: SIZES[size] + "px",
      ...rest.sx,
    },
    ...opt,
    ...rest,
  };

  const accountId = account.accountId || account.id;

  const linkProps =
    link && accountId
      ? {
          component: Link,
          to: `/profile/${account.accountId || account.id}`,
        }
      : {};

  const online = !!accountId && stats.onlinePlayers.includes(accountId);

  return (
    <StyledBadge
      variant="dot"
      overlap="circular"
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      invisible={!status || !!account.bot || !accountId}
      online={online}
      title={online ? "Conectado" : "Desconectado"}
    >
      <Avatar
        ref={ref}
        onError={() => {
          setError(true);
        }}
        {...linkProps}
        {...props}
      />
    </StyledBadge>
  );
};

function stringToColor(string: string) {
  let hash = 0;
  let i;

  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = "#";

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }

  return color;
}

const StyledBadge = styled(Badge)<{ online?: boolean }>(({ theme, online }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: theme.palette[online ? "success" : "error"].main,
    color: theme.palette[online ? "success" : "error"].main,
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": online
      ? {
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          animation: "ripple 1.2s infinite ease-in-out",
          border: "1px solid currentColor",
          content: '""',
        }
      : {},
  },
  "@keyframes ripple": {
    "0%": {
      transform: "scale(.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(2.4)",
      opacity: 0,
    },
  },
}));
