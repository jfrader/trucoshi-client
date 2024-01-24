import { Box, Container, ContainerProps, Stack, Typography } from "@mui/material";
import { PropsWithChildren, ReactNode } from "react";

export const PageLayout = ({
  title,
  children,
  icon = null,
  ...props
}: PropsWithChildren<{ title: string; icon?: ReactNode } & ContainerProps>) => {
  return (
    <Container maxWidth="sm" {...props}>
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
