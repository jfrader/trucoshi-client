import { School } from "@mui/icons-material";
import { List, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HELP_LINKS } from "../../assets/links/links";
import { CardRanking } from "./CardRanking";
import { Link } from "../../shared/Link";
import { useMatch as useTrucoshiMatch } from "../../trucoshi/hooks/useMatch";

export const TrucoHelp = () => {
  const navigate = useNavigate();
  const [, { createTutorialMatch }] = useTrucoshiMatch();
  const [isTutorialLoading, setTutorialLoading] = useState(false);

  const handleTutorialClick = () => {
    setTutorialLoading(true);
    createTutorialMatch((error, match) => {
      setTutorialLoading(false);
      if (error || !match) {
        return;
      }
      navigate(`/match/${match.matchSessionId}`);
    });
  };

  return (
    <>
      <List>
        {HELP_LINKS.map(({ to, label, Icon }) => {
          const external = to.startsWith("http");
          return (
            <ListItemButton
              component={Link}
              target={external ? "_blank" : undefined}
              to={to}
              key={to}
            >
              <ListItemIcon>
                <Icon />
              </ListItemIcon>
              <ListItemText>
                <Typography>{label}</Typography>
              </ListItemText>
            </ListItemButton>
          );
        })}

        <ListItemButton disabled={isTutorialLoading} onClick={handleTutorialClick}>
          <ListItemIcon>
            <School />
          </ListItemIcon>
          <ListItemText>
            <Typography>Jugar Tutorial</Typography>
          </ListItemText>
        </ListItemButton>
      </List>
      <CardRanking title="Ranking de las Cartas" />
    </>
  );
};
