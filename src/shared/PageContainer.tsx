import { ChevronLeft } from "@mui/icons-material";
import { Box, Button, Container, ContainerProps, Slide, Stack, Typography } from "@mui/material";
import { PropsWithChildren, ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const PageContainer = ({
  title = "",
  children,
  icon = null,
  ...props
}: PropsWithChildren<{ title?: string; icon?: ReactNode } & ContainerProps>) => {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <Container maxWidth="sm" {...props}>
      <Box pt={4} position="relative" maxWidth="95vw">
        <Stack alignItems="center" spacing={1}>
          <Typography
            sx={{ display: "flex", alignItems: "center", gap: 2 }}
            textTransform="uppercase"
            variant="h6"
          >
            <Button
              onClick={() => (location.key === "default" ? navigate("/") : navigate(-1))}
              color="inherit"
              startIcon={<ChevronLeft />}
              sx={{ position: "absolute", left: 0 }}
              size="small"
            >
              Atras
            </Button>
            {title}
          </Typography>
          {icon}
        </Stack>

        <Slide in direction="right">
          <Box pt={4}>{children}</Box>
        </Slide>
      </Box>
    </Container>
  );
};
