import { IconButton, Stack } from "@mui/material";
import { Link } from "../../shared/Link";
import { UserAvatar } from "../../shared/UserAvatar";
import { useTrucoshi } from "../../trucoshi/hooks/useTrucoshi";
import { Box } from "@mui/material";
import { Login } from "@mui/icons-material";

export const ProfileIconButton = ({ textNameSm = false }: { textNameSm?: boolean }) => {
  const [{ account }] = useTrucoshi();

  return account ? (
    <Link to="/profile">
      <Stack direction="row" fontSize="small" gap={1} alignItems="center">
        <UserAvatar size="small" account={account} />
        <Box display={textNameSm ? { xs: "none", sm: "inline" } : "none"}>{account.name}</Box>
      </Stack>
    </Link>
  ) : (
    <IconButton component={Link} title="Iniciar Sesion" to="/login">
      <Login fontSize="small" />
    </IconButton>
  );
};
