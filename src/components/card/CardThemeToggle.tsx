import { Button, Menu, MenuItem } from "@mui/material";
import { useTrucoshi } from "../../trucoshi/hooks/useTrucoshi";
import { useState } from "react";
import { TrucoshiLogo } from "../../shared/TrucoshiLogo";
import { GameCard } from "./GameCard";
import { EmojiSymbols } from "@mui/icons-material";
import { BURNT_CARD } from "trucoshi";

export const CardThemeToggle = () => {
  const [{ cardTheme }, { setCardTheme }] = useTrucoshi();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        sx={{
          minWidth: "2.5em",
          width: "2.5em",
          heigth: "3em",
          minHeight: "3em",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        size="small"
        color="success"
        title="Cartas"
        id="card-theme-button"
        aria-controls={anchorEl ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={anchorEl ? "true" : undefined}
        onClick={handleClick}
      >
        {cardTheme ? (
          <GameCard disableButton width="1.1em" card={BURNT_CARD} />
        ) : (
          <TrucoshiLogo style={{ marginBottom: "0.4em" }} />
        )}
      </Button>
      <Menu
        id="card-theme-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        keepMounted
        disableScrollLock
        MenuListProps={{
          "aria-labelledby": "card-theme-button",
        }}
      >
        <MenuItem title="Default" onClick={() => setCardTheme("default")}>
          <GameCard
            request
            disableButton
            sx={{ margin: "0 auto" }}
            theme="default"
            width="1.1em"
            card={BURNT_CARD}
          />
        </MenuItem>
        {/* <MenuItem title="Argento" onClick={() => setCardTheme("argento")}>
          <GameCard
            request
            
            disableButton
            sx={{ margin: "0 auto" }}
            theme="argento"
            width="1.1em"
            card={BURNT_CARD}
          />
        </MenuItem> */}
        <MenuItem title="GNU" onClick={() => setCardTheme("gnu")}>
          <GameCard
            request
            disableButton
            sx={{ margin: "0 auto" }}
            theme="gnu"
            width="1.1em"
            card={BURNT_CARD}
          />
        </MenuItem>
        <MenuItem title="Criollo" onClick={() => setCardTheme("criollo")}>
          <GameCard
            request
            disableButton
            sx={{ margin: "0 auto" }}
            theme="criollo"
            width="1.1em"
            card={BURNT_CARD}
          />
        </MenuItem>
        {/* <MenuItem title="Trucoshi (BETA)" onClick={() => setCardTheme("trucoshi")}>
          <GameCard
            request
            
            disableButton
            sx={{ margin: "0 auto" }}
            theme="default"
            width="1.1em"
            card={BURNT_CARD}
          />
        </MenuItem> */}
        <MenuItem title="Emojis" onClick={() => setCardTheme("")}>
          <EmojiSymbols />
        </MenuItem>
      </Menu>
    </>
  );
};
