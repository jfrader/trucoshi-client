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
import { GITHUB_LINK_FRAN, HELP_LINKS } from "../assets/links/links";
import { PageContainer } from "../shared/PageContainer";

export const Help = () => {
  return (
    <PageContainer title="Ayuda" icon={<HelpOutlined fontSize="large" />}>
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
          <Typography pt={4} display="block" variant="caption">
            Made with ❤️ by{" "}
            <Link target="_blank" to={GITHUB_LINK_FRAN.to}>
              Fran
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </PageContainer>
  );
};
