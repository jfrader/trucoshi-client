import { ChevronLeft } from "@mui/icons-material";
import { Box, Button, Container, ContainerProps, Slide, Stack, Typography } from "@mui/material";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { PropsWithChildren, ReactNode } from "react";

export const PageContainer = ({
  title = "",
  children,
  icon = null,
  action = null,
  ...props
}: PropsWithChildren<
  { title?: string; icon?: ReactNode; action?: ReactNode } & ContainerProps
>) => {
  const navigate = useNavigate();
  const router = useRouter();
  return (
    <Container maxWidth="md" {...props}>
      <Box pt={4} position="relative" maxWidth="95vw">
        <Stack alignItems="center" spacing={1}>
          <Box
            position="relative"
            display="flex"
            alignItems="center"
            justifyContent="center"
            minHeight={32}
            width="100%"
          >
            <Button
              onClick={() => {
                if (router.history.canGoBack()) {
                  router.history.back();
                  return;
                }

                void navigate({ to: "/" });
              }}
              color="inherit"
              startIcon={<ChevronLeft />}
              sx={{ position: "absolute", left: 0 }}
              size="small"
            >
              Atras
            </Button>
            <Typography
              component={title ? "h1" : "div"}
              px={8}
              textAlign="center"
              textTransform="uppercase"
              variant="h6"
            >
              {title}
            </Typography>
            <Box position="absolute" right={0}>
              {action}
            </Box>
          </Box>
          {icon}
        </Stack>
        <Slide in direction="right">
          <Box pt={4}>{children}</Box>
        </Slide>
      </Box>
    </Container>
  );
};
