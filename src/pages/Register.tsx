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
import { useMagicLinkRegister } from "../api/hooks/useMagicLinkRegister";
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
  const [registerType, setRegisterType] = useState<"email" | "seed">("email");
  const [name, setName] = useState(search.get("name") || "");
  const [email, setEmail] = useState("");
  const [formErrors, setErrors] = useState<Error[]>([]);
  const [seedPhrase, setSeedPhrase] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const { registerWithMagicLink, isPending: isRegisterPending } = useMagicLinkRegister();
  const { registerWithSeed, isPending: isSeedPending } = useRegisterWithSeed();

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (account) {
      navigate("/");
    }
  }, [account, navigate]);

  const validateEmailRegistration = () => {
    if (!name) {
      return new Error("El nombre es requerido");
    }
    if (!email) {
      return new Error("Email es requerido");
    }
    return null;
  };

  const onSubmit = () => {
    setErrors([]);
    setSeedPhrase(null);
    setMagicLinkSent(false);
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
      const error = validateEmailRegistration();
      if (error) {
        setErrors([error]);
        return;
      }
      registerWithMagicLink(
        { name: name.trim(), email: email.trim() },
        {
          onSuccess: () => setMagicLinkSent(true),
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

  const handleRegisterTypeChange = (
    _: React.MouseEvent<HTMLElement>,
    newRegisterType: "email" | "seed"
  ) => {
    if (newRegisterType) {
      setRegisterType(newRegisterType);
      setErrors([]);
      setSeedPhrase(null);
      setMagicLinkSent(false);
      setName(search.get("name") || "");
      setEmail("");
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
                  <ToggleButton value="email">Email</ToggleButton>
                  <ToggleButton value="seed">Frase de Semilla</ToggleButton>
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
                {registerType === "email" ? (
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
                ) : null}
                <LoadingButton
                  type="submit"
                  isLoading={isRegisterPending || isSeedPending}
                  color="warning"
                  variant="outlined"
                  disabled={!!seedPhrase}
                >
                  Registrarse
                </LoadingButton>
                {magicLinkSent ? (
                  <Alert severity="success">
                    Te enviamos un link para ingresar. Revisa tu bandeja de entrada o spam.
                  </Alert>
                ) : null}
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
