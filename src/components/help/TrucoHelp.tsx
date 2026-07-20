import { List, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { HELP_LINKS } from "../../assets/links/links";
import { CardRanking } from "./CardRanking";
import { Link } from "../../shared/Link";

export const TrucoHelp = () => {
  return (
    <>
      <List>
        {HELP_LINKS.map(({ to, label, Icon }) => {
          return (
            <ListItemButton component={Link} target="_blank" to={to} key={to}>
              <ListItemIcon>
                <Icon />
              </ListItemIcon>
              <ListItemText>
                <Typography>{label}</Typography>
              </ListItemText>
            </ListItemButton>
          );
        })}
      </List>
      <CardRanking />
    </>
  );
};
