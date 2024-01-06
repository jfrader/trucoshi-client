import { HelpOutlined } from "@mui/icons-material";
import {
  Card,
  CardContent,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { Link } from "../shared/Link";
import { HELP_LINKS } from "../assets/links/links";
import { PageLayout } from "../shared/PageLayout";

export const Help = () => {
  return (
    <PageLayout title="Ayuda" icon={<HelpOutlined fontSize="large" />}>
      <Card>
        <CardContent>
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
        </CardContent>
      </Card>
    </PageLayout>
  );
};
