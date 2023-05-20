import { LinkProps as MuiLinkProps, Link as MuiLink } from "@mui/material";
import { Link as RouterLink, NavLinkProps } from "react-router-dom";

export type LinkProps = MuiLinkProps & NavLinkProps;

export const Link = (props: LinkProps) => {
  return <MuiLink color="text.primary" {...props} component={RouterLink} />;
};
