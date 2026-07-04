import { Typography } from "@mui/material";
import { Link } from "./Link";
import { TrucoshiText } from "./TrucoshiText";
import { TrucoshiLogo } from "./TrucoshiLogo";

export const TrucoshiResponsiveLogoLink = ({
  width,
  height,
}: {
  width?: string | number;
  height?: string | number;
}) => {
  return (
    <Link to="/" lineHeight={4}>
      <Typography
        maxWidth={width}
        display={{ xs: "none", sm: "block" }}
        height={height || 26}
        width={width || 80}
        variant="h6"
      >
        <TrucoshiText height={height || 26} width={width || 80} />
      </Typography>
      <Typography
        display={{ xs: "block", sm: "none" }}
        height={height || 30}
        width={width || 30}
        variant="h6"
      >
        <TrucoshiLogo height={height || 30} width={width || 30} />
      </Typography>
    </Link>
  );
};
