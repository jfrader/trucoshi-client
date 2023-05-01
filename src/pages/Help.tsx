import { HelpOutlined } from "@mui/icons-material";
import {
  Box,
  Container,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { Link } from "../components/Link";
import { HELP_LINKS } from "../links/links";

export const Help = () => {
  return (
    <Container maxWidth="sm">
      <Box pt={4}>
        <Stack alignItems="center" spacing={1}>
          <Typography textTransform="uppercase" variant="subtitle1">
            Ayuda
          </Typography>
          <HelpOutlined fontSize="large" />
        </Stack>

        <Box pt={4}>
          <List>
            {HELP_LINKS.map(({ to, label, Icon }) => {
              return (
                <ListItemButton key={to}>
                  <ListItemIcon>
                    <Icon />
                  </ListItemIcon>
                  <ListItemText>
                    <Link target="_blank" to={to}>
                      <Typography>{label}</Typography>
                    </Link>
                  </ListItemText>
                </ListItemButton>
              );
            })}
          </List>
        </Box>
      </Box>
    </Container>
  );
};
