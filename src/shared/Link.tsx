import { Link as MuiLink, type LinkProps as MuiLinkProps } from "@mui/material";
import { createLink } from "@tanstack/react-router";
import { forwardRef, type ComponentProps } from "react";

const StyledMuiLink = forwardRef<HTMLAnchorElement, MuiLinkProps>((props, ref) => {
  return <MuiLink ref={ref} sx={{ lineHeight: 1, ...props.sx }} color="text.primary" {...props} />;
});

StyledMuiLink.displayName = "StyledMuiLink";

export const Link = createLink(StyledMuiLink);
export type LinkProps = ComponentProps<typeof Link>;
