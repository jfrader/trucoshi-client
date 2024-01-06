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
  const [, { logout }] = useTrucoshi();
  const { me, isPending } = useMe();

  useEffect(() => {
    if (!me && !isPending) {
      navigate("/login");
    }
  });

  if (!me) {
    return null;
  }

  return (
    <PageLayout title="Profile" icon={<Person fontSize="large" />}>
      <Card>
        <CardContent>
          <Stack direction="row" gap={4}>
            <List dense sx={{ flexGrow: 1 }}>
              <ListItem divider>
                <ListItemText primary="Nombre" secondary={me.data.name} />
              </ListItem>
              <ListItem divider>
                <ListItemText primary="Email" secondary={me.data.email} />
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
