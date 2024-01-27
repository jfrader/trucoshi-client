import { Stack, Typography } from "@mui/material";
import { useTrucoshi } from "../../trucoshi/hooks/useTrucoshi";
import { GENERAL_LINKS } from "../../assets/links/links";
import { FooterLink } from "./FooterLink";

export const Footer = () => {
  const [{ version }] = useTrucoshi();
  return (
    <Stack
      flexGrow={1}
      alignItems="center"
      direction="column"
      justifyContent="end"
      spacing={1}
      pt={4}
    >
      {version ? (
        <Typography display="block" variant="caption">
          Version {version}
        </Typography>
      ) : null}
      <Stack alignContent="space-evenly" alignItems="center" direction="column" spacing={1}>
        {GENERAL_LINKS.map(({ label, to, Icon }) => {
          return (
            <FooterLink key={to} Icon={Icon} to={to}>
              {label}
            </FooterLink>
          );
        })}
      </Stack>
    </Stack>
  );
};
