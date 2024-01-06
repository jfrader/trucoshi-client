import { Box, Container, Stack, Typography } from "@mui/material";
import { PropsWithChildren, ReactNode } from "react";

export const PageLayout = ({
  title,
  children,
  icon = null,
}: PropsWithChildren<{ title: string; icon?: ReactNode }>) => {
  return (
    <Container maxWidth="sm">
      <Box pt={4}>
        <Stack alignItems="center" spacing={1}>
          <Typography textTransform="uppercase" variant="subtitle1">
            {title}
          </Typography>
          {icon}
        </Stack>

        <Box pt={4}>{children}</Box>
      </Box>
    </Container>
  );
};
