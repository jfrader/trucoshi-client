import { Person } from "@mui/icons-material";
import { PageContainer } from "../shared/PageContainer";
import { Alert, Button, Card, CardContent, Divider, Stack, TextField } from "@mui/material";
import { ChangeEvent, useEffect, useState } from "react";
import { LoadingButton } from "../shared/LoadingButton";
import { useLogin } from "../api/hooks/useLogin";
import { useNavigate } from "react-router-dom";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";
import { TwitterButton } from "../shared/TwitterButton";

export const Login = () => {
  const navigate = useNavigate();
  const [{ account }] = useTrucoshi();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login, error, isPending } = useLogin();

  const onSubmit = () => login({ email, password }, { onSuccess: () => navigate("/") });

  const onChangeEmail = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const onChangePassword = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  useEffect(() => {
    if (account) {
      navigate("/");
    }
  }, [account, navigate]);

  return (
    <PageContainer title="Iniciar Sesion" icon={<Person fontSize="large" />}>
      <Card>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
          >
            <Stack px={2} pt={2} gap={4}>
              <TextField
                name="email"
                color="warning"
                label="Email"
                onChange={onChangeEmail}
                type="text"
                value={email}
                variant="outlined"
              />
              <TextField
                name="password"
                color="warning"
                label="Password"
                onChange={onChangePassword}
                type="password"
                value={password}
                variant="outlined"
              />
              <LoadingButton type="submit" isLoading={isPending} color="warning" variant="outlined">
                Iniciar Sesion
              </LoadingButton>
              <Divider />
              <TwitterButton />
              <Button onClick={() => navigate("/register")} color="success">
                Registrarse
              </Button>
              {error ? <Alert severity="error">{error.message}</Alert> : null}
            </Stack>
          </form>
        </CardContent>
      </Card>
    </PageContainer>
  );
};
