import { Box, Button, CircularProgress, Menu, MenuItem } from "@mui/material";
import { ICard } from "trucoshi";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";
import { useState } from "react";
import { TrucoshiLogo } from "../shared/TrucoshiLogo";
import { GameCard } from "./GameCard";
import { Close } from "@mui/icons-material";

const xx = "xx" as ICard;

export const CardThemeToggle = () => {
  const [{ cardTheme, cardsReady }, { setCardTheme }] = useTrucoshi();

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
          minWidth: "3em",
          width: "3em",
          heigth: "3em",
          minHeight: "3em",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        size="small"
        color="success"
        id="card-theme-button"
        disabled={Boolean(cardTheme && !cardsReady)}
        aria-controls={anchorEl ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={anchorEl ? "true" : undefined}
        onClick={handleClick}
      >
        {cardTheme ? (
          !cardsReady ? (
            <CircularProgress size="1.1em" />
          ) : (
            <GameCard as={Box} width="1.1em" card={xx} />
          )
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
        MenuListProps={{
          "aria-labelledby": "card-theme-button",
        }}
      >
        <MenuItem onClick={() => setCardTheme("gnu")}>
          <GameCard
            request
            as={Box}
            sx={{ margin: "0 auto" }}
            theme="gnu"
            width="1.1em"
            card={xx}
          />
        </MenuItem>
        <MenuItem onClick={() => setCardTheme("classic")}>
          <GameCard
            request
            as={Box}
            sx={{ margin: "0 auto" }}
            theme="classic"
            width="1.1em"
            card={xx}
          />
        </MenuItem>
        <MenuItem onClick={() => setCardTheme("")}>
          <Close />
        </MenuItem>
      </Menu>
    </>
  );
};