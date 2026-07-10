import {
  AlternateEmail,
  Close,
  EmojiEvents,
  SmartToy,
  Style,
  VideogameAsset,
  VpnKey,
  X,
} from "@mui/icons-material";
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
  Alert,
  Button,
} from "@mui/material";
import { SyntheticEvent, useContext, useEffect, useState } from "react";
import { useMe } from "../api/hooks/useMe";
import { useLocation, useNavigate, useParams } from "@tanstack/react-router";
import { EClientEvent, IAccountDetails } from "trucoshi";
import { TrucoshiContext } from "../trucoshi/trucoshi.context";
import { useToast } from "../hooks/useToast";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import dayjs from "dayjs";
import { UserAvatar } from "../shared/UserAvatar";
import { useUpdateProfile } from "../api/hooks/useUpdateProfile";
import { useSetSeed } from "../api/hooks/useSetSeed";
import { IconButton } from "@mui/material";
import { NotFound } from "./NotFound";
import { PlayerRatioListItemText } from "../components/other/PlayerRatioListItemText";
import SatoshiIcon from "../assets/icons/SatoshiIcon";
import { SeedDisplay } from "../components/other/SeedDisplay";
import { useConfirmationModal } from "../hooks/useConfirmationModal";
import { ConfirmationModal } from "../shared/ConfirmationModal";
import { useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/apiClient";

const getSeedModalConfig = (
  title: string,
  hasSeed: boolean | undefined,
  acceptLabel: string,
  onConfirm: () => void,
) => ({
  title,
  body: hasSeed
    ? "¿Estás seguro de querer regenerar una nueva frase de semilla? Esto reemplazará la anterior, así que anotala y guardala bien, ya que quien la tenga puede iniciar sesión."
    : "Vas a generar una frase de semilla para login. Asegurate de guardarla en un lugar seguro, ya que quien la tenga puede iniciar sesión.",
  acceptLabel,
  onConfirm,
});

export const Profile = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const context = useContext(TrucoshiContext);
  const toast = useToast();

  const { searchStr } = useLocation();
  const search = new URLSearchParams(searchStr);
  const params = useParams({ strict: false });
  const accountId = "accountId" in params ? params.accountId : undefined;
  const { me, isPending } = useMe();
  const { updateProfile, isPending: isPendingUpdateProfile } = useUpdateProfile();
  const { setSeed, isPending: isPendingSetSeed } = useSetSeed();

  const [profile, setProfile] = useState<IAccountDetails | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [editEmail, setEditEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [editPassword, setEditPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [seedPhrase, setSeedPhrase] = useState<string | null>(null);

  const modal = useConfirmationModal();

  const handleChange = (_event: SyntheticEvent, newValue: string) => {
    if (accountId) {
      void navigate({
        to: "/profile/$accountId",
        params: { accountId },
        search: { t: newValue },
        replace: true,
      });
      return;
    }

    void navigate({ to: "/profile", search: { t: newValue }, replace: true });
  };

  if (!context) {
    throw new Error("useTrucoshiState must be used inside TrucoshiProvider");
  }

  useEffect(() => {
    if (!accountId && !me && !isPending && !isLoading) {
      void navigate({ to: "/login" });
    }

    if (!accountId && me) {
      void navigate({
        to: "/profile/$accountId",
        params: { accountId: String(me.id) },
        replace: true,
      });
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
        },
      );
    }
  }, [accountId, context.socket, context.state.isConnected, me?.id, toast]);

  if (isLoading) {
    return <PageContainer icon={<CircularProgress />} />;
  }

  if (!profile?.account) {
    return <NotFound />;
  }

  const isMyProfile = Number(accountId) === me?.id;
  const meHasPassword = Boolean(
    (me as (typeof me & { hasPassword?: boolean }) | null)?.hasPassword,
  );

  const win = profile.stats?.win || 0;
  const loss = profile.stats?.loss || 0;

  const validatePassword = () => {
    if (!password || !password2) {
      return "Ambas contraseñas son requeridas";
    }
    if (password !== password2) {
      return "Las contraseñas no coinciden";
    }
    if (password.length < 8) {
      return "La contraseña debe tener al menos 8 caracteres";
    }
    return "";
  };

  const validateNewPassword = () => {
    if (!newPassword || !newPassword2) {
      return "Ambas contraseñas son requeridas";
    }
    if (newPassword !== newPassword2) {
      return "Las contraseñas no coinciden";
    }
    if (newPassword.length < 8) {
      return "La contraseña debe tener al menos 8 caracteres";
    }
    return "";
  };

  const handleSubmitEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors([]);

    if (!me) {
      return;
    }

    if (!email) {
      setFormErrors(["Email es requerido"]);
      return;
    }

    const emailChanged = email.trim() !== (me.email || "");
    const needsNewPassword = !me.email || (!!me.email && !meHasPassword && emailChanged);
    const needsCurrentPassword = !!me.email && meHasPassword;

    if (needsNewPassword && !newPassword) {
      setFormErrors(["Debes establecer una contraseña para cambiar el email"]);
      return;
    }

    const newPasswordError = needsNewPassword ? validateNewPassword() : "";
    if (newPasswordError) {
      setFormErrors([newPasswordError]);
      return;
    }

    if (needsCurrentPassword && !currentPassword) {
      setFormErrors(["La contraseña actual es requerida"]);
      return;
    }

    updateProfile(
      {
        email: email.trim(),
        password: needsNewPassword ? newPassword.trim() : undefined,
        currentPassword: needsCurrentPassword ? currentPassword.trim() : undefined,
      },
      {
        onSuccess: () => {
          toast.success("Tu Email fue actualizado!");
          setEditEmail(false);
          setEmail(me.email || "");
          setNewPassword("");
          setNewPassword2("");
          setCurrentPassword("");
        },
        onError: (e) => setFormErrors([e.message]),
      },
    );
  };

  const handleSubmitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors([]);

    if (!me) {
      return;
    }

    const error = validatePassword();
    if (error) {
      setFormErrors([error]);
      return;
    }

    if (!me.email) {
      setFormErrors(["Debes establecer un email antes de cambiar la contraseña"]);
      return;
    }

    if (meHasPassword && !currentPassword) {
      setFormErrors(["La contraseña actual es requerida"]);
      return;
    }

    updateProfile(
      {
        password: password.trim(),
        currentPassword: meHasPassword ? currentPassword.trim() : undefined,
      },
      {
        onSuccess: () => {
          queryClient.resetQueries({ queryKey: ["me"] });
          toast.success("Tu contraseña fue actualizada!");
          setEditPassword(false);
          setPassword("");
          setPassword2("");
          setCurrentPassword("");
        },
        onError: (e) => setFormErrors([e.message]),
      },
    );
  };

  const handleSetSeed = () => {
    setFormErrors([]);
    modal.onOpen(
      getSeedModalConfig(
        "Confirmar Generación de Frase de Semilla",
        me?.hasSeed,
        "Sí, Generar",
        () => {
          setSeed(undefined, {
            onSuccess: ({ seedPhrase }) => {
              queryClient.resetQueries({ queryKey: ["me"] });
              setSeedPhrase(seedPhrase || null);
              setFormErrors(["Anota y guarda tu nueva frase de semilla, no se volverá a mostrar"]);
              modal.onClose();
            },
            onError: (e) => setFormErrors([e.message]),
          });
        },
      ),
    );
  };

  const handleConfirmSeed = () => {
    setSeedPhrase(null);
    setFormErrors([]);
  };

  const handleRegenerateSeed = () => {
    setFormErrors([]);
    // Check if user has at least one alternative login method
    if (!me?.email && !me?.twitter) {
      modal.onOpen({
        title: "Regeneración no disponible",
        body: "Necesitas al menos un método de login más para poder regenerar tu semilla.",
        acceptLabel: "Entendido",
        onConfirm: () => modal.onClose(),
      });
      return;
    }
    modal.onOpen(
      getSeedModalConfig(
        "Confirmar Regeneración de Frase de Semilla",
        true,
        "Sí, Regenerar",
        () => {
          setSeed(undefined, {
            onSuccess: ({ seedPhrase }) => {
              queryClient.resetQueries({ queryKey: ["me"] });
              setSeedPhrase(seedPhrase || null); // Set the new seed phrase
              setFormErrors(["Anota y guarda tu nueva frase de semilla, no se volverá a mostrar"]);
              modal.onClose();
            },
            onError: (e) => setFormErrors([e.message]),
          });
        },
      ),
    );
  };

  return (
    <PageContainer
      title={profile.account.name}
      icon={<UserAvatar status size="large" account={profile.account} />}
    >
      <Card>
        <CardContent>
          {isLoading ? (
            <CircularProgress />
          ) : (
            <TabContext value={search.get("t") || "1"}>
              <TabList textColor="inherit" onChange={handleChange} aria-label="Tabs del perfil">
                <Tab label="Información" value="1" />
                <Tab label="Historial" value="2" />
              </TabList>
              <TabPanel sx={{ px: 0 }} value="1">
                <List dense sx={{ flexGrow: 1 }}>
                  <ListItem divider>
                    <ListItemText primary="Nombre" secondary={profile.account.name} />
                  </ListItem>
                  {isMyProfile ? (
                    <ListItemButton onClick={() => void navigate({ to: "/inventory" })} divider>
                      <ListItemText
                        primary="Inventario"
                        secondary="Arma el mazo que ven los demas"
                      />
                      <ListItemSecondaryAction>
                        <Style />
                      </ListItemSecondaryAction>
                    </ListItemButton>
                  ) : null}
                  {isMyProfile ? (
                    <>
                      {seedPhrase ? (
                        <ListItem>
                          <SeedDisplay
                            seedPhrase={seedPhrase}
                            errors={formErrors}
                            onConfirm={handleConfirmSeed}
                          />
                        </ListItem>
                      ) : me?.hasSeed ? (
                        <ListItemButton onClick={handleRegenerateSeed} divider>
                          <ListItemText
                            primary="Frase de Semilla"
                            secondary="Cambia tu frase secreta de login por una nueva"
                          />
                          <ListItemSecondaryAction>
                            <VpnKey />
                          </ListItemSecondaryAction>
                        </ListItemButton>
                      ) : (
                        <ListItemButton onClick={handleSetSeed} divider disabled={isPendingSetSeed}>
                          <ListItemText
                            primary="Frase de Semilla"
                            secondary="Generar frase de semilla"
                          />
                          <ListItemSecondaryAction>
                            <VpnKey />
                          </ListItemSecondaryAction>
                        </ListItemButton>
                      )}
                      {me.email && !editEmail ? (
                        <ListItemButton onClick={() => setEditEmail(true)} divider>
                          <ListItemText primary="Email" secondary={me.email} />
                          <ListItemSecondaryAction>
                            <AlternateEmail />
                          </ListItemSecondaryAction>
                        </ListItemButton>
                      ) : !me.email && !editEmail ? (
                        <ListItemButton onClick={() => setEditEmail(true)} divider>
                          <ListItemText
                            primary="Email"
                            secondary="Establecer un email para tu cuenta"
                          />
                          <ListItemSecondaryAction>
                            <AlternateEmail />
                          </ListItemSecondaryAction>
                        </ListItemButton>
                      ) : (
                        <ListItem divider>
                          <form style={{ width: "100%" }} onSubmit={handleSubmitEmail}>
                            <Stack py={1} direction="column" gap={1} width="100%">
                              <Stack direction="row" alignItems="center" gap={1}>
                                <IconButton
                                  title="Cancelar"
                                  onClick={() => {
                                    setEditEmail(false);
                                    setEmail(me.email || "");
                                    setNewPassword("");
                                    setNewPassword2("");
                                    setCurrentPassword("");
                                    setFormErrors([]);
                                  }}
                                  color="error"
                                  size="small"
                                >
                                  <Close fontSize="small" />
                                </IconButton>
                                <TextField
                                  name="email"
                                  type="email"
                                  value={email}
                                  size="small"
                                  label="Nuevo Email"
                                  fullWidth
                                  disabled={isPendingUpdateProfile}
                                  onChange={(e) => setEmail(e.target.value)}
                                />
                              </Stack>
                              {(!me.email ||
                                (!!me.email &&
                                  !meHasPassword &&
                                  email.trim() !== (me.email || ""))) && (
                                <>
                                  <TextField
                                    name="newPassword"
                                    type="password"
                                    value={newPassword}
                                    size="small"
                                    label="Nueva Contraseña"
                                    fullWidth
                                    disabled={isPendingUpdateProfile}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    error={newPassword !== newPassword2 && newPassword2 !== ""}
                                    helperText={
                                      newPassword !== newPassword2 && newPassword2 !== ""
                                        ? "Las contraseñas no coinciden"
                                        : ""
                                    }
                                  />
                                  <TextField
                                    name="newPassword2"
                                    type="password"
                                    value={newPassword2}
                                    size="small"
                                    label="Repite la Contraseña"
                                    fullWidth
                                    disabled={isPendingUpdateProfile}
                                    onChange={(e) => setNewPassword2(e.target.value)}
                                  />
                                </>
                              )}
                              {me.email && meHasPassword && (
                                <TextField
                                  name="currentPassword"
                                  type="password"
                                  value={currentPassword}
                                  size="small"
                                  label="Contraseña Actual"
                                  fullWidth
                                  disabled={isPendingUpdateProfile}
                                  onChange={(e) => setCurrentPassword(e.target.value)}
                                />
                              )}
                              <Button
                                type="submit"
                                color="success"
                                variant="contained"
                                size="small"
                                disabled={Boolean(
                                  isPendingUpdateProfile ||
                                  !email ||
                                  ((!me.email ||
                                    (!!me.email &&
                                      !meHasPassword &&
                                      email.trim() !== (me.email || ""))) &&
                                    !!validateNewPassword()) ||
                                  (me.email && meHasPassword && !currentPassword),
                                )}
                                sx={{ alignSelf: "flex-end", mt: 1 }}
                              >
                                Guardar
                              </Button>
                            </Stack>
                          </form>
                        </ListItem>
                      )}
                      {me.email && !editPassword ? (
                        <ListItemButton onClick={() => setEditPassword(true)} divider>
                          <ListItemText
                            primary="Contraseña"
                            secondary={meHasPassword ? "••••••••" : "Agregar contraseña"}
                          />
                          <ListItemSecondaryAction>
                            <VpnKey />
                          </ListItemSecondaryAction>
                        </ListItemButton>
                      ) : editPassword ? (
                        <ListItem divider>
                          <form style={{ width: "100%" }} onSubmit={handleSubmitPassword}>
                            <Stack py={1} direction="row" alignItems="center" gap={1} width="100%">
                              <IconButton
                                title="Cancelar"
                                onClick={() => {
                                  setEditPassword(false);
                                  setPassword("");
                                  setPassword2("");
                                  setCurrentPassword("");
                                  setFormErrors([]);
                                }}
                                color="error"
                                size="small"
                              >
                                <Close fontSize="small" />
                              </IconButton>
                              <TextField
                                name="password"
                                type="password"
                                value={password}
                                size="small"
                                label="Nueva Contraseña"
                                fullWidth
                                disabled={isPendingUpdateProfile}
                                onChange={(e) => setPassword(e.target.value)}
                                error={password !== password2 && password2 !== ""}
                                helperText={
                                  password !== password2 && password2 !== ""
                                    ? "Las contraseñas no coinciden"
                                    : ""
                                }
                              />
                              <TextField
                                name="password2"
                                type="password"
                                value={password2}
                                size="small"
                                label="Repite la Contraseña"
                                fullWidth
                                disabled={isPendingUpdateProfile}
                                onChange={(e) => setPassword2(e.target.value)}
                              />
                              {meHasPassword ? (
                                <TextField
                                  name="currentPassword"
                                  type="password"
                                  value={currentPassword}
                                  size="small"
                                  label="Contraseña Actual"
                                  fullWidth
                                  disabled={isPendingUpdateProfile}
                                  onChange={(e) => setCurrentPassword(e.target.value)}
                                />
                              ) : null}
                              <Button
                                type="submit"
                                color="success"
                                variant="contained"
                                size="large"
                                disabled={
                                  isPendingUpdateProfile ||
                                  !!validatePassword() ||
                                  (meHasPassword && !currentPassword)
                                }
                                sx={{ flexShrink: 0 }}
                              >
                                Guardar
                              </Button>
                            </Stack>
                          </form>
                        </ListItem>
                      ) : null}
                      {me.twitter ? (
                        <ListItem divider>
                          <ListItemText primary="Login con X.com" secondary={me.twitter} />
                          <ListItemSecondaryAction>
                            <X />
                          </ListItemSecondaryAction>
                        </ListItem>
                      ) : (
                        <ListItemButton
                          component="a"
                          href={apiClient.instance.defaults.baseURL + "/auth/twitter"}
                          divider
                        >
                          <ListItemText secondary="Autoriza tu cuenta para iniciar sesión con X">
                            Conectar X.com
                          </ListItemText>
                          <ListItemSecondaryAction>
                            <X />
                          </ListItemSecondaryAction>
                        </ListItemButton>
                      )}
                    </>
                  ) : null}
                  <ListItem divider>
                    <PlayerRatioListItemText win={win} loss={loss} />
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
                  {formErrors
                    .filter((error) => !seedPhrase || !error?.includes("Anota y guarda"))
                    .map((error) => (
                      <ListItem key={error}>
                        <Alert
                          severity={error.includes("Anota y guarda") ? "warning" : "error"}
                          sx={{ width: "100%" }}
                        >
                          {error}
                        </Alert>
                      </ListItem>
                    ))}
                </List>
              </TabPanel>
              <TabPanel sx={{ px: 0 }} value="2">
                <List dense sx={{ flexGrow: 1 }}>
                  {profile.matches.map((match) => {
                    const isWinner =
                      match.winnerIdx ===
                      match.players.find((p) => p.accountId === profile.account?.id)?.teamIdx;
                    return (
                      <ListItemButton
                        key={match.id}
                        divider
                        onClick={() =>
                          void navigate({
                            to: "/history/$matchId",
                            params: { matchId: String(match.id) },
                          })
                        }
                      >
                        <ListItemText
                          secondary={`${dayjs(match.createdAt).format("DD/MM/YYYY")}`}
                          primary={match.sessionId}
                        />
                        <ListItemSecondaryAction>
                          {(match.bet?.satsPerPlayer || 0) > 0 &&
                          (isMyProfile || match.players.find((p) => p.accountId === me?.id)) ? (
                            <span title="Partida con Sats">
                              <SatoshiIcon color={isWinner ? "success" : "error"} sx={{ mr: 2 }} />
                            </span>
                          ) : null}
                          {match.players.find((p) => p.bot) ? (
                            <span title="Partida con Bots">
                              <SmartToy color="info" fontSize="small" sx={{ mr: 2 }} />
                            </span>
                          ) : null}
                          {isWinner ? (
                            <span title="Jugador gano esta partida">
                              <EmojiEvents color="warning" />
                            </span>
                          ) : (
                            <VideogameAsset />
                          )}
                        </ListItemSecondaryAction>
                      </ListItemButton>
                    );
                  })}
                </List>
              </TabPanel>
            </TabContext>
          )}
        </CardContent>
      </Card>
      <ConfirmationModal {...modal} />
    </PageContainer>
  );
};
