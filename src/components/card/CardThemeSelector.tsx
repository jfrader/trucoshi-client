import { Check } from "@mui/icons-material";
import { Button, ListItemIcon, Menu, MenuItem, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { BURNT_CARD } from "trucoshi";
import {
  CARD_THEMES,
  CardTheme,
} from "../../trucoshi/cardThemes";
import { useTrucoshi } from "../../trucoshi/hooks/useTrucoshi";
import { GameCard } from "./GameCard";

const CARD_THEME_LABELS: Record<CardTheme, string> = {
  default: "Default",
  gnu: "GNU",
  emoji: "Emoji",
};

export const CardThemeSelector = () => {
  const [{ cardTheme }, { setCardTheme }] = useTrucoshi();
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
  const isOpen = Boolean(anchorElement);

  const closeMenu = () => setAnchorElement(null);
  const selectTheme = (theme: CardTheme) => {
    setCardTheme(theme);
    closeMenu();
  };

  return (
    <>
      <Button
        id="card-theme-selector-button"
        size="small"
        color="inherit"
        aria-label={`Mazo de cartas: ${CARD_THEME_LABELS[cardTheme]}`}
        aria-controls={isOpen ? "card-theme-selector-menu" : undefined}
        aria-haspopup="menu"
        aria-expanded={isOpen ? "true" : undefined}
        onClick={(event) => setAnchorElement(event.currentTarget)}
        sx={{ minWidth: 38, px: { xs: 0.5, sm: 0.75 } }}
      >
        <Stack direction="row" spacing={0.75} alignItems="center">
          <GameCard
            card={BURNT_CARD}
            theme={cardTheme}
            disableButton
            width="1.05rem"
            aria-hidden="true"
          />
          <Typography
            component="span"
            variant="caption"
            sx={{ display: { xs: "none", sm: "inline" } }}
          >
            {CARD_THEME_LABELS[cardTheme]}
          </Typography>
        </Stack>
      </Button>
      <Menu
        id="card-theme-selector-menu"
        anchorEl={anchorElement}
        open={isOpen}
        onClose={closeMenu}
        keepMounted
        disableScrollLock
        MenuListProps={{ "aria-labelledby": "card-theme-selector-button" }}
      >
        {CARD_THEMES.map((theme) => (
          <MenuItem
            key={theme}
            selected={theme === cardTheme}
            aria-label={CARD_THEME_LABELS[theme]}
            onClick={() => selectTheme(theme)}
          >
            <ListItemIcon sx={{ minWidth: 32 }}>
              <Check
                fontSize="small"
                aria-hidden="true"
                sx={{ visibility: theme === cardTheme ? "visible" : "hidden" }}
              />
            </ListItemIcon>
            <GameCard
              card={BURNT_CARD}
              theme={theme}
              disableButton
              width="1.05rem"
              aria-hidden="true"
            />
            <Typography component="span" sx={{ ml: 1.5 }}>
              {CARD_THEME_LABELS[theme]}
            </Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
