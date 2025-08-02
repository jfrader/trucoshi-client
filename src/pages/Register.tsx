import { Person } from "@mui/icons-material";
import { PageContainer } from "../shared/PageContainer";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { ChangeEvent, useEffect, useState } from "react";
import { LoadingButton } from "../shared/LoadingButton";
import { useRegister } from "../api/hooks/useRegister";
import { useRegisterWithSeed } from "../api/hooks/useRegisterWithSeed";
import { useNavigate, useSearchParams } from "react-router-dom";
import { TwitterButton } from "../shared/TwitterButton";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";
import { useQueryClient } from "@tanstack/react-query";
import { SeedDisplay } from "../components/other/SeedDisplay";

export const Register = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const [{ account }] = useTrucoshi();

  const [hydrated, setHydrated] = useState(false);
  const [registerType, setRegisterType] = useState<"seed" | "email">("seed");
  const [name, setName] = useState(search.get("name") || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [formErrors, setErrors] = useState<Error[]>([]);
  const [seedPhrase, setSeedPhrase] = useState<string | null>(null);

  const { register, isPending: isRegisterPending } = useRegister();
  const { registerWithSeed, isPending: isSeedPending } = useRegisterWithSeed();

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (account) {
      navigate("/");
    }
  }, [account, navigate]);

  const validateEmailPassword = () => {
    if (!email || !password || !password2) {
      return new Error("Email y ambas contraseñas son requeridas");
    }
    if (password !== password2) {
      return new Error("Las contraseñas no coinciden");
    }
    if (password.length < 8) {
      return new Error("La contraseña debe tener al menos 8 caracteres");
    }
    return null;
  };

  const onSubmit = () => {
    setErrors([]);
    setSeedPhrase(null);
    if (registerType === "seed") {
      if (!name) {
        setErrors([new Error("El nombre es requerido")]);
        return;
      }
      registerWithSeed(
        { name },
        {
          onSuccess: ({ seedPhrase }) => {
            setSeedPhrase(seedPhrase || null);
            setErrors([new Error("Anota y guarda tu frase semilla, no se puede recuperar")]);
          },
          onError: (e) => setErrors([e]),
        }
      );
    } else {
      const error = validateEmailPassword();
      if (error) {
        setErrors([error]);
        return;
      }
      register(
        { name, email, password },
        {
          onSuccess: () => navigate("/"),
          onError: (e) => setErrors([e]),
        }
      );
    }
  };

  const onConfirmSeed = () => {
    queryClient.resetQueries({ queryKey: ["me"] });
    setSeedPhrase(null);
    setErrors([]);
    navigate("/login");
  };

  const onChangeName = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const onChangeEmail = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const onChangePassword = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const onChangePassword2 = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword2(event.target.value);
  };

  const handleRegisterTypeChange = (
    _: React.MouseEvent<HTMLElement>,
    newRegisterType: "seed" | "email"
  ) => {
    if (newRegisterType) {
      setRegisterType(newRegisterType);
      setErrors([]);
      setSeedPhrase(null);
      setName(search.get("name") || "");
      setEmail("");
      setPassword("");
      setPassword2("");
    }
  };

  return (
    <PageContainer title="Registrarse" icon={<Person fontSize="large" />}>
      <Card>
        <CardContent>
          {seedPhrase ? (
            <SeedDisplay seedPhrase={seedPhrase} errors={formErrors} onConfirm={onConfirmSeed} />
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
              }}
            >
              <Stack gap={4} px={2} pt={2}>
                <ToggleButtonGroup
                  color="warning"
                  value={registerType}
                  exclusive
                  onChange={handleRegisterTypeChange}
                  fullWidth
                >
                  <ToggleButton value="seed">Frase de Semilla</ToggleButton>
                  <ToggleButton value="email">Email</ToggleButton>
                </ToggleButtonGroup>
                <TextField
                  name="name"
                  color="warning"
                  label="Nombre"
                  onChange={onChangeName}
                  autoComplete="off"
                  inputRef={(node) => {
                    if (!hydrated && node && !search.get("name")) {
                      node.focus();
                    }
                  }}
                  type="text"
                  value={name}
                  variant="outlined"
                  error={!!name && name.length > 16}
                  helperText={name && name.length > 16 ? "Máximo 16 caracteres" : ""}
                />
                {registerType === "email" && (
                  <>
                    <TextField
                      name="email"
                      color="warning"
                      label="Email"
                      autoComplete="email"
                      onChange={onChangeEmail}
                      type="email"
                      value={email}
                      variant="outlined"
                      error={!!email && email.length < 3}
                      helperText={email && email.length < 3 ? "Email inválido" : ""}
                    />
                    <TextField
                      name="password"
                      color="warning"
                      label="Contraseña"
                      autoComplete="new-password"
                      onChange={onChangePassword}
                      type="password"
                      value={password}
                      variant="outlined"
                      error={password !== password2 && password2 !== ""}
                      helperText={
                        password !== password2 && password2 !== ""
                          ? "Las contraseñas no coinciden"
                          : ""
                      }
                    />
                    <TextField
                      name="password2"
                      color="warning"
                      label="Repetir Contraseña"
                      autoComplete="new-password"
                      onChange={onChangePassword2}
                      type="password"
                      value={password2}
                      variant="outlined"
                    />
                  </>
                )}
                <LoadingButton
                  type="submit"
                  isLoading={isRegisterPending || isSeedPending}
                  color="warning"
                  variant="outlined"
                  disabled={!!seedPhrase}
                >
                  Registrarse
                </LoadingButton>
                {formErrors.filter(Boolean).map((error) => (
                  <Alert
                    key={error?.message}
                    severity={error?.message.includes("Anota y guarda") ? "warning" : "error"}
                    sx={{ fontSize: "1.1rem", fontWeight: "medium" }}
                  >
                    {error?.message}
                  </Alert>
                ))}
                <Divider />
                <TwitterButton />
                <Button onClick={() => navigate("/login")} color="success">
                  Iniciar Sesión
                </Button>
              </Stack>
            </form>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
};
