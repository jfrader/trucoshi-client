import { Person, VideogameAsset } from "@mui/icons-material";
import { PageLayout } from "../shared/PageLayout";
import {
  Card,
  CardContent,
  CircularProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemSecondaryAction,
  ListItemText,
  Tab,
} from "@mui/material";
import { SyntheticEvent, useContext, useEffect, useState } from "react";
import { useMe } from "../api/hooks/useMe";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { EClientEvent, IAccountDetails } from "trucoshi";
import { TrucoshiContext } from "../trucoshi/context";
import { useToast } from "../hooks/useToast";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import * as dayjs from "dayjs";

export const Profile = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const context = useContext(TrucoshiContext);
  const toast = useToast();
  const { accountId } = useParams<{ accountId: string }>();
  const [search] = useSearchParams();
  const { me, isPending } = useMe();

  const [profile, setProfile] = useState<IAccountDetails | null>(null);
  const [isLoading, setLoading] = useState(true);

  const handleChange = (_event: SyntheticEvent, newValue: string) => {
    navigate(pathname + "?t=" + newValue);
  };

  if (!context) {
    throw new Error("useTrucoshiState must be used inside TrucoshiProvider");
  }

  useEffect(() => {
    if (!accountId && !me && !isPending && !isLoading) {
      navigate("/login");
    }
  }, [accountId, isLoading, isPending, me, navigate]);

  useEffect(() => {
    const id = accountId || me?.id;
    if (context.state.isConnected && id) {
      setLoading(true);
      context.socket.emit(
        EClientEvent.FETCH_ACCOUNT_DETAILS,
        Number(id),
        ({ account, matches, stats, error, success }) => {
          setLoading(false);
          if (error) {
            toast.error(error.message);
          }
          if (success) {
            setProfile({ account, matches, stats });
          }
        }
      );
    }
  }, [accountId, context.socket, context.state.isConnected, me?.id, toast]);

  if (!profile?.account) {
    return null;
  }

  const kda = String(Math.round((profile.stats?.win || 0) / (profile.stats?.loss || 1)));

  return (
    <PageLayout title="Perfil" icon={<Person fontSize="large" />}>
      <Card>
        <CardContent>
          {isLoading ? (
            <CircularProgress />
          ) : (
            <TabContext value={search.get("t") || "1"}>
              <TabList textColor="inherit" onChange={handleChange} aria-label="Tabs del perfil">
                <Tab label="Informacion" value="1" />
                <Tab label="Historial" value="2" />
              </TabList>
              <TabPanel sx={{ px: 0 }} value="1">
                <List dense sx={{ flexGrow: 1 }}>
                  <ListItem divider>
                    <ListItemText primary="Nombre" secondary={profile.account.name} />
                  </ListItem>
                  <ListItem divider>
                    <ListItemText primary="Email" secondary={profile.account.email} />
                  </ListItem>
                  <ListItem divider>
                    <ListItemText primary="Ratio de Victoria" secondary={kda} />
                  </ListItem>
                  {!accountId || Number(accountId) === me?.id ? (
                    <>
                      <ListItem divider>
                        <ListItemText
                          primary="Sats apostados"
                          secondary={profile.stats?.satsBet || 0}
                        />
                      </ListItem>
                      <ListItem divider>
                        <ListItemText
                          primary="Sats ganados"
                          secondary={profile.stats?.satsWon || 0}
                        />
                      </ListItem>
                      <ListItem divider>
                        <ListItemText
                          primary="Sats perdidos"
                          secondary={profile.stats?.satsLost || 0}
                        />
                      </ListItem>
                    </>
                  ) : null}
                </List>
              </TabPanel>
              <TabPanel sx={{ px: 0 }} value="2">
                <List dense sx={{ flexGrow: 1 }}>
                  {profile.matches.map((match) => (
                    <ListItemButton
                      key={match.id}
                      divider
                      onClick={() => navigate(`/history/${match.id}`)}
                    >
                      <ListItemText
                        secondary={dayjs(match.createdAt).format("DD/MM/YYYY")}
                        primary={match.sessionId}
                      />
                      <ListItemSecondaryAction>
                        <VideogameAsset />
                      </ListItemSecondaryAction>
                    </ListItemButton>
                  ))}
                </List>
              </TabPanel>
            </TabContext>
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
};
