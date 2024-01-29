import { AlternateEmail, Check, Close, Twitter, VideogameAsset } from "@mui/icons-material";
import { PageContainer } from "../shared/PageContainer";
import {
  Card,
  CardContent,
  CircularProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemSecondaryAction,
  ListItemText,
  Stack,
  Tab,
  TextField,
} from "@mui/material";
import { SyntheticEvent, useContext, useEffect, useState } from "react";
import { useMe } from "../api/hooks/useMe";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { EClientEvent, IAccountDetails } from "trucoshi";
import { TrucoshiContext } from "../trucoshi/context";
import { useToast } from "../hooks/useToast";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import dayjs from "dayjs";
import numeral from "numeral";
import { useTwitterPopup } from "../hooks/useTwitterPopup";
import { UserAvatar } from "../shared/UserAvatar";
import { useUpdateProfile } from "../api/hooks/useUpdateProfile";
import { IconButton } from "@mui/material";
import { NotFound } from "./NotFound";

export const Profile = () => {
  const navigate = useNavigate();
  const context = useContext(TrucoshiContext);
  const toast = useToast();

  const [search] = useSearchParams();

  const { pathname } = useLocation();
  const { accountId } = useParams<{ accountId: string }>();

  const { open } = useTwitterPopup();
  const { me, isPending } = useMe();
  const { updateProfile, isPending: isPendingUpdateProfile } = useUpdateProfile();

  const [profile, setProfile] = useState<IAccountDetails | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [password, setPassword] = useState<string | null>(null);
  const [password2, setPassword2] = useState<string | null>(null);

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

    if (!accountId && me) {
      navigate(`/profile/${me.id}`, { replace: true });
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
            setProfile(null);
          }
          if (success) {
            setProfile({ account, matches, stats });
          }
        }
      );
    }
  }, [accountId, context.socket, context.state.isConnected, me?.id, toast]);

  if (isLoading) {
    return <PageContainer icon={<CircularProgress />}></PageContainer>;
  }

  if (!profile?.account) {
    return <NotFound />;
  }

  const isMyProfile = Number(accountId) === me?.id;

  const wins = profile.stats?.win || 0;
  const loss = profile.stats?.loss || 0;

  const openEditEmail = () => setEmail(profile.account?.email || "");

  return (
    <PageContainer
      title={profile.account.name}
      icon={<UserAvatar size="large" account={profile.account} />}
    >
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
                  {isMyProfile ? (
                    <>
                      {profile.account.email && email === null ? (
                        <ListItemButton onClick={openEditEmail} divider>
                          <ListItemText primary="Email" secondary={profile.account.email} />
                          <ListItemSecondaryAction>
                            <AlternateEmail />
                          </ListItemSecondaryAction>
                        </ListItemButton>
                      ) : (
                        <>
                          {email === null ? (
                            <ListItemButton divider onClick={openEditEmail}>
                              <ListItemText secondary="Agrega un email y un password">
                                Email
                              </ListItemText>
                              <ListItemSecondaryAction>
                                <AlternateEmail />
                              </ListItemSecondaryAction>
                            </ListItemButton>
                          ) : (
                            <ListItem divider>
                              <form
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  if (!profile.account?.email && (!password || !password2)) {
                                    setPassword("");
                                    setPassword2("");
                                    return;
                                  }
                                  if (profile.account?.email === email) {
                                    return;
                                  }
                                  updateProfile(
                                    { email, password: password !== null ? password : undefined },
                                    {
                                      onSuccess() {
                                        if (email) {
                                          toast.success("Tu email fue actualizado!");
                                        }
                                        if (password) {
                                          toast.success("Tu password fue actualizada!");
                                        }
                                        setEmail(null);
                                        setPassword(null);
                                        setPassword2(null);
                                      },
                                      onError(e) {
                                        toast.error(e.message);
                                        setPassword(null);
                                        setPassword2(null);
                                      },
                                    }
                                  );
                                }}
                              >
                                {password === null ? (
                                  <Stack py={1} direction="row" alignItems="center" gap={1}>
                                    <IconButton
                                      title="Cancelar"
                                      onClick={() => setEmail(null)}
                                      color="error"
                                      size="small"
                                    >
                                      <Close fontSize="small" />
                                    </IconButton>
                                    <TextField
                                      name="email"
                                      value={email}
                                      size="small"
                                      label="Escribe tu email"
                                      fullWidth
                                      disabled={isPendingUpdateProfile}
                                      onChange={(e) => setEmail(e.target.value)}
                                    />
                                    <IconButton
                                      title="Aceptar"
                                      type="submit"
                                      size="small"
                                      disabled={
                                        isPendingUpdateProfile || profile.account.email === email
                                      }
                                    >
                                      <Check fontSize="small" />
                                    </IconButton>
                                  </Stack>
                                ) : (
                                  <Stack py={1} direction="row" alignItems="center" gap={1}>
                                    <TextField
                                      name="password"
                                      value={password}
                                      size="small"
                                      label="Escribe tu nuevo password"
                                      fullWidth
                                      disabled={isPendingUpdateProfile}
                                      onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <TextField
                                      name="password2"
                                      value={password2}
                                      size="small"
                                      label="Repite el password"
                                      fullWidth
                                      disabled={isPendingUpdateProfile}
                                      onChange={(e) => setPassword2(e.target.value)}
                                    />
                                    <IconButton
                                      title="Aceptar"
                                      type="submit"
                                      size="small"
                                      disabled={isPendingUpdateProfile || password !== password2}
                                    >
                                      <Check fontSize="small" />
                                    </IconButton>
                                  </Stack>
                                )}
                              </form>
                            </ListItem>
                          )}
                        </>
                      )}
                      {profile.account.twitter ? (
                        <ListItem divider>
                          <ListItemText primary="Twitter" secondary={profile.account.twitter} />
                          <ListItemSecondaryAction>
                            <Twitter />
                          </ListItemSecondaryAction>
                        </ListItem>
                      ) : (
                        <ListItemButton onClick={open}>
                          <ListItemText secondary="Autoriza tu cuenta para iniciar sesion con Twitter">
                            Conectar Twitter
                          </ListItemText>
                          <ListItemSecondaryAction>
                            <Twitter />
                          </ListItemSecondaryAction>
                        </ListItemButton>
                      )}
                    </>
                  ) : null}
                  <ListItem divider>
                    <ListItemText
                      primary="Ratio de Victoria"
                      secondary={numeral(wins / (wins + loss)).format("0.0")}
                    />
                  </ListItem>
                  {isMyProfile ? (
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
    </PageContainer>
  );
};
