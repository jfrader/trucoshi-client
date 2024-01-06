import { Box, Container, Typography } from "@mui/material";
import { Link } from "../shared/Link";

export const NotFound = () => {
  return (
    <Container>
      <Box pt={8}>
        <Typography variant="h1">404</Typography>
        <Link to="/">Al Inicio</Link>
      </Box>
    </Container>
  );
};
