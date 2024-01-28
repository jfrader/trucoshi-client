import { PsychologyAlt } from "@mui/icons-material";
import { Avatar, AvatarProps, BoxProps } from "@mui/material";
import { User } from "lightning-accounts";
import { useRef, useState } from "react";
import { Link } from "./Link";

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
  ...rest
}: {
  link?: boolean;
  account: Pick<User, "name" | "avatarUrl" | "id"> & { accountId?: number | null };
  size?: keyof typeof SIZES;
  bgcolor?: BoxProps["bgcolor"];
} & AvatarProps) => {
  const [error, setError] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  const opt =
    account.avatarUrl && !error
      ? { src: account.avatarUrl }
      : {
          children: (
            <PsychologyAlt
              sx={{ height: SIZES[size] * 0.9 + "px", width: SIZES[size] * 0.9 + "px" }}
              color="action"
            />
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

  const linkProps = link
    ? {
        component: Link,
        to: `/profile/${account.accountId || account.id}`,
      }
    : {};

  return (
    <Avatar
      ref={ref}
      onError={() => {
        setError(true);
      }}
      {...linkProps}
      {...props}
    />
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
