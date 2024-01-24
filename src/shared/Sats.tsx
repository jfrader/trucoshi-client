import { Stack, Typography, TypographyProps } from "@mui/material";
import { SatoshiIcon } from "../assets/icons/SatoshiIcon";

export const Sats = ({
  children,
  amount,
  ...props
}: { amount?: number; children?: number } & TypographyProps) => {
  return (
    <Typography component="span" {...props}>
      <Stack component="span" direction="row" justifyContent="center">
        <SatoshiIcon /> {amount !== undefined ? amount : children}
      </Stack>
    </Typography>
  );
};
