import { LinkProps as MuiLinkProps, Link as MuiLink } from "@mui/material";
import { Link as RouterLink, NavLinkProps } from "react-router-dom";
import { forwardRef } from "react";

export type LinkProps = MuiLinkProps & NavLinkProps;

export const Link = forwardRef<HTMLAnchorElement, LinkProps>((props, ref) => {
  return <MuiLink ref={ref} sx={{ lineHeight: 1 }} color="text.primary" {...props} component={RouterLink} />;
});

Link.displayName = "Link";
