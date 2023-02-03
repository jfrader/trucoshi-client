import { LinkProps, Link as MuiLink } from "@mui/material";
import { Link as RouterLink, NavLinkProps } from "react-router-dom";

export const Link = (props: LinkProps & NavLinkProps) => {
  return <MuiLink color="text.primary" {...props} component={RouterLink} />;
};
