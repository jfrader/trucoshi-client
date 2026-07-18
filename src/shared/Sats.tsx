import { Stack, Typography, TypographyProps } from "@mui/material";
import { CurrencyBitcoin as SatoshiIcon } from "@mui/icons-material";

export const Sats = ({
  children,
  amount,
  ...props
}: { amount?: number; children?: number } & TypographyProps) => {
  return (
    <Typography component="span" fontSize="inherit" variant="inherit" {...props}>
      <Stack component="span" direction="row" justifyContent="center">
        <SatoshiIcon fontSize="inherit" /> <span>{amount !== undefined ? amount : children}</span>
      </Stack>
    </Typography>
  );
};
