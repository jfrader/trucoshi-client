import { Badge, IconButton, IconButtonProps } from "@mui/material";
import { Style } from "@mui/icons-material";
import { Link } from "@tanstack/react-router";
import type { MouseEvent } from "react";
import { useTrucoshi } from "../../trucoshi/hooks/useTrucoshi";

export const InventoryButton = ({ onClick, ...props }: IconButtonProps<"a">) => {
  const [{ account, treasureStatus }, { inspectCard }] = useTrucoshi();

  if (!account) {
    return null;
  }

  const unopenedCount = treasureStatus.unopenedChests.length;

  return (
    <IconButton
      aria-label="Inventario"
      component={Link}
      to="/inventory"
      title="Inventario"
      color="warning"
      {...props}
      onClick={(e: MouseEvent<HTMLAnchorElement>) => {
        inspectCard(null);
        onClick?.(e);
      }}
    >
      <Badge
        color="error"
        invisible={!unopenedCount}
        badgeContent={String(unopenedCount)}
        data-testid="inventory-button-badge"
      >
        <Style />
      </Badge>
    </IconButton>
  );
};
