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
} from "@mui/material";
import { ChangeEvent, useEffect, useState } from "react";
import { LoadingButton } from "../shared/LoadingButton";
import { useRegister } from "../api/hooks/useRegister";
import { useNavigate, useSearchParams } from "react-router-dom";
import { TwitterButton } from "../shared/TwitterButton";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";

export const Register = () => {
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const [{ account }] = useTrucoshi();

  const [hydrated, setHydrated] = useState(false);
  const [name, setName] = useState(search.get("name") || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [formErrors, setErrors] = useState<Error[]>([]);

  const { register, error, isPending } = useRegister();

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (account) {
      navigate("/");
    }
  }, [account, navigate]);

  const onSubmit = () => register({ name, email, password }, { onSuccess: () => navigate("/") });

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

  return (
    <PageContainer title="Registrarse" icon={<Person fontSize="large" />}>
      <Card>
        <CardContent>
          <form
            onSubmit={(e) => {
              setErrors([]);
              if (password !== password2) {
                setErrors((current) => [...current, new Error("Las passwords no son iguales!")]);
              }
              e.preventDefault();
              onSubmit();
            }}
          >
            <Stack gap={4} px={2} pt={2}>
              <TextField
                name="name"
                color="warning"
                label="Name"
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
              />
              <TextField
                name="email"
                color="warning"
                label="Email"
                autoComplete="off"
                inputRef={(node) => {
                  if (!hydrated && node && search.get("name")) {
                    node.focus();
                  }
                }}
                onChange={onChangeEmail}
                type="text"
                value={email}
                variant="outlined"
              />
              <TextField
                name="password"
                color="warning"
                label="Password"
                autoComplete="new-password"
                onChange={onChangePassword}
                type="password"
                value={password}
                variant="outlined"
              />
              <TextField
                name="password2"
                color="warning"
                label="Repetir Password"
                autoComplete="new-password2"
                onChange={onChangePassword2}
                type="password"
                value={password2}
                variant="outlined"
              />
              <LoadingButton type="submit" isLoading={isPending} color="warning" variant="outlined">
                Registrarse
              </LoadingButton>
              <Divider />
              <TwitterButton />
              <Button onClick={() => navigate("/login")} color="success">
                Iniciar Sesion
              </Button>
              {[...formErrors, error].filter(Boolean).map((error) => (
                <Alert key={error?.message} severity="error">
                  {error?.message}
                </Alert>
              ))}
            </Stack>
          </form>
        </CardContent>
      </Card>
    </PageContainer>
  );
};
