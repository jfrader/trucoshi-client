import { Button, Divider, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import { AutoAwesome, EmojiSymbols, Style } from "@mui/icons-material";
import { useState } from "react";
import { useTrucoshi } from "../../trucoshi/hooks/useTrucoshi";
import { CardDisplayMode } from "../../trucoshi/cards/cardSkinResolver";
import { Link } from "react-router-dom";
import { FlipGameCard } from "./GameCard";

const DISPLAY_MODE_OPTIONS: Array<{
  value: CardDisplayMode;
  label: string;
  title: string;
  icon: typeof AutoAwesome;
}> = [
  { value: "skins", label: "Skins", title: "Ver skins", icon: AutoAwesome },
  { value: "default", label: "Cartas default", title: "Ver cartas default", icon: Style },
  { value: "emoji", label: "Emoji", title: "Ver emoji", icon: EmojiSymbols },
];

export const CardDisplayModeToggle = () => {
  const [{ account, cardDisplayMode }, { setCardDisplayMode }] = useTrucoshi();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const selected =
    DISPLAY_MODE_OPTIONS.find((option) => option.value === cardDisplayMode) ||
    DISPLAY_MODE_OPTIONS[0];

  return (
    <>
      <Button
        sx={{
          minWidth: "2.5em",
          width: "2.5em",
          minHeight: "3em",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        size="small"
        color="success"
        title={selected.title}
        id="card-display-mode-button"
        aria-controls={anchorEl ? "card-display-mode-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={anchorEl ? "true" : undefined}
        onClick={(event) => setAnchorEl(event.currentTarget)}
      >
        <FlipGameCard disableButton flip={!anchorEl} card="1e" width="1.4em" />
      </Button>
      <Menu
        id="card-display-mode-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        keepMounted
        disableScrollLock
        MenuListProps={{
          "aria-labelledby": "card-display-mode-button",
        }}
      >
        {DISPLAY_MODE_OPTIONS.map((option) => {
          const Icon = option.icon;

          return (
            <MenuItem
              key={option.value}
              selected={option.value === cardDisplayMode}
              onClick={() => {
                setCardDisplayMode(option.value);
              }}
            >
              <ListItemIcon>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{option.label}</ListItemText>
            </MenuItem>
          );
        })}
        {account ? (
          <>
            <Divider />
            <MenuItem component={Link} to="/inventory" onClick={() => setAnchorEl(null)}>
              <ListItemIcon>
                <Style fontSize="small" />
              </ListItemIcon>
              <ListItemText>Ver tus Skins</ListItemText>
            </MenuItem>
          </>
        ) : null}
      </Menu>
    </>
  );
};
