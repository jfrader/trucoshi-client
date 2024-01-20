import { Logout, Person } from "@mui/icons-material";
import { PageLayout } from "../shared/PageLayout";
import {
  Card,
  CardContent,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
} from "@mui/material";
import { useEffect } from "react";
import { useMe } from "../api/hooks/useMe";
import { useNavigate } from "react-router-dom";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";

export const Profile = () => {
  const navigate = useNavigate();
  const [{ account }, { logout }] = useTrucoshi();
  const { isPending } = useMe();

  useEffect(() => {
    if (!account && !isPending) {
      navigate("/login");
    }
  });

  if (!account) {
    return null;
  }

  return (
    <PageLayout title="Perfil" icon={<Person fontSize="large" />}>
      <Card>
        <CardContent>
          <Stack direction="row" gap={4}>
            <List dense sx={{ flexGrow: 1 }}>
              <ListItem divider>
                <ListItemText primary="Nombre" secondary={account.name} />
              </ListItem>
              <ListItem divider>
                <ListItemText primary="Email" secondary={account.email} />
              </ListItem>
              <ListItemButton divider onClick={() => logout()}>
                <ListItemText primary="Cerrar Sesion" />
                <ListItemIcon>
                  <Logout />
                </ListItemIcon>
              </ListItemButton>
            </List>
          </Stack>
        </CardContent>
      </Card>
    </PageLayout>
  );
};
