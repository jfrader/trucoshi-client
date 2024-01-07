import { Stack, Typography } from "@mui/material";
import { Link, LinkProps } from "../../shared/Link";
import { SvgIconComponent } from "@mui/icons-material";

export const FooterLink = ({ Icon, ...props }: LinkProps & { Icon: SvgIconComponent }) => {
  return (
    <Typography display="block" variant="caption">
      <Stack direction="row" justifyContent="center" pl={3} spacing={2} flex="1">
        <Icon fontSize="small" />
        <Link
          target="_blank"
          sx={{ minWidth: "4.8em", textAlign: "left", ...(props.sx || {}) }}
          {...props}
        />
      </Stack>
    </Typography>
  );
};
