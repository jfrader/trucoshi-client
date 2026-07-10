import { Typography } from "@mui/material";
import { forwardRef } from "react";
import { Link, type LinkProps } from "./Link";
import { TrucoshiText } from "./TrucoshiText";
import { TrucoshiLogo } from "./TrucoshiLogo";

type LogoSize = string | number;

export type TrucoshiResponsiveLogoLinkProps = Omit<
  LinkProps,
  "children" | "height" | "to" | "width"
> & {
  width?: LogoSize;
  height?: LogoSize;
  to?: string;
};

export const TrucoshiResponsiveLogoLink = forwardRef<
  HTMLAnchorElement,
  TrucoshiResponsiveLogoLinkProps
>(function TrucoshiResponsiveLogoLink({ width, height, to = "/", ...linkProps }, ref) {
  const desktopHeight = height || 26;
  const desktopWidth = width || 80;
  const mobileSize = height || 30;
  const mobileWidth = width || 30;

  return (
    <Link ref={ref} to={to} lineHeight={4} {...linkProps}>
      <Typography
        maxWidth={width}
        display={{ xs: "none", sm: "block" }}
        height={desktopHeight}
        width={desktopWidth}
        variant="h6"
      >
        <TrucoshiText height={desktopHeight} width={desktopWidth} />
      </Typography>
      <Typography
        display={{ xs: "block", sm: "none" }}
        height={mobileSize}
        width={mobileWidth}
        variant="h6"
      >
        <TrucoshiLogo height={mobileSize} width={mobileWidth} />
      </Typography>
    </Link>
  );
});

TrucoshiResponsiveLogoLink.displayName = "TrucoshiResponsiveLogoLink";
