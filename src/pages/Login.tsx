import { Person, VpnKey } from "@mui/icons-material";
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
import { useLogin } from "../api/hooks/useLogin";
import { useSeedLogin } from "../api/hooks/useSeedLogin";
import { useNavigate } from "react-router-dom";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";
import { TwitterButton } from "../shared/TwitterButton";
import { useQueryClient } from "@tanstack/react-query";

export const Login = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [{ account }] = useTrucoshi();

  const [loginType, setLoginType] = useState<"seed" | "email">("seed");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [seedPhrase, setSeedPhrase] = useState("");
  const [formErrors, setErrors] = useState<Error[]>([]);

  const { login, isPending: isEmailPending } = useLogin();
  const { seedLogin, isPending: isSeedPending } = useSeedLogin();

  useEffect(() => {
    if (account) {
      navigate("/");
    }
  }, [account, navigate]);

  const validateSeed = () => {
    if (!seedPhrase.trim()) {
      return new Error("La frase de semilla es requerida");
    }
    const words = seedPhrase.trim().split(/\s+/);
    if (words.length !== 5) {
      return new Error("La frase de semilla debe tener exactamente 5 palabras");
    }
    return null;
  };

  const validateEmailPassword = () => {
    if (!email || !password) {
      return new Error("Email y contraseña son requeridos");
    }
    return null;
  };

  const onSubmit = () => {
    setErrors([]);
    if (loginType === "seed") {
      const error = validateSeed();
      if (error) {
        setErrors([error]);
        return;
      }
      seedLogin(
        { seedPhrase: seedPhrase.trim() },
        {
          onSuccess: () => {
            queryClient.resetQueries({ queryKey: ["me"] });
            navigate("/");
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
      login(
        { email: email.trim(), password: password.trim() },
        {
          onSuccess: () => {
            queryClient.resetQueries({ queryKey: ["me"] });
            navigate("/");
          },
          onError: (e) => setErrors([e]),
        }
      );
    }
  };

  const onChangeEmail = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const onChangePassword = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const onChangeSeedPhrase = (event: ChangeEvent<HTMLInputElement>) => {
    setSeedPhrase(event.target.value);
  };

  const handleLoginTypeChange = (
    _: React.MouseEvent<HTMLElement>,
    newLoginType: "seed" | "email"
  ) => {
    if (newLoginType) {
      setLoginType(newLoginType);
      setErrors([]);
      setEmail("");
      setPassword("");
      setSeedPhrase("");
    }
  };

  return (
    <PageContainer title="Iniciar Sesión" icon={<Person fontSize="large" />}>
      <Card>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
          >
            <Stack px={2} pt={2} gap={4}>
              <ToggleButtonGroup
                color="warning"
                value={loginType}
                exclusive
                onChange={handleLoginTypeChange}
                fullWidth
              >
                <ToggleButton value="seed">
                  <VpnKey sx={{ mr: 1 }} /> Frase de Semilla
                </ToggleButton>
                <ToggleButton value="email">
                  <Person sx={{ mr: 1 }} /> Email
                </ToggleButton>
              </ToggleButtonGroup>
              {loginType === "email" ? (
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
                    autoComplete="current-password"
                    onChange={onChangePassword}
                    type="password"
                    value={password}
                    variant="outlined"
                  />
                </>
              ) : (
                <TextField
                  name="seedPhrase"
                  color="warning"
                  label="Frase de Semilla"
                  autoComplete="current-password"
                  onChange={onChangeSeedPhrase}
                  value={seedPhrase}
                  variant="outlined"
                  error={!!seedPhrase && !!validateSeed()}
                  helperText={
                    (seedPhrase && validateSeed()?.message) ||
                    "Inicia sesion con tu frase semilla: ej. 'bici auto casa rancho palacio'"
                  }
                />
              )}
              <LoadingButton
                type="submit"
                isLoading={isEmailPending || isSeedPending}
                color="warning"
                variant="outlined"
              >
                Iniciar Sesión
              </LoadingButton>
              {loginType === "email" && (
                <Button onClick={() => navigate("/forgot-password")} color="info">
                  ¿Olvidaste tu contraseña?
                </Button>
              )}
              {formErrors.filter(Boolean).map((error) => (
                <Alert key={error?.message} severity="error">
                  {error?.message}
                </Alert>
              ))}
              <Divider />
              <TwitterButton />
              <Button onClick={() => navigate("/register")} color="success">
                Registrarse
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </PageContainer>
  );
};
