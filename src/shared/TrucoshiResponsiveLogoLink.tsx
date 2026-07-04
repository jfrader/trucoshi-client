import { Typography } from "@mui/material";
import { Link } from "./Link";
import { TrucoshiText } from "./TrucoshiText";
import { TrucoshiLogo } from "./TrucoshiLogo";

export const TrucoshiResponsiveLogoLink = ({ size = 26 }: { size?: string | number }) => {
  return (
    <Link to="/" lineHeight={4}>
      <Typography maxWidth={size} display={{ xs: "none", sm: "block" }} height={size} variant="h6">
        <TrucoshiText height={size} />
      </Typography>
      <Typography display={{ xs: "block", sm: "none" }} height={size} variant="h6">
        <TrucoshiLogo height={size} width={size} />
      </Typography>
    </Link>
  );
};
