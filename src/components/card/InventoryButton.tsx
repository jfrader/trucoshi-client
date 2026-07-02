import { Badge, IconButton, IconButtonProps } from "@mui/material";
import { Style } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useTrucoshi } from "../../trucoshi/hooks/useTrucoshi";

export const InventoryButton = (props: IconButtonProps) => {
  const [{ account, treasureStatus }] = useTrucoshi();

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
