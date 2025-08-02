import { Person } from "@mui/icons-material";
import { PageContainer } from "../shared/PageContainer";
import { Alert, Card, CardContent, Stack, TextField } from "@mui/material";
import { ChangeEvent, useEffect, useState } from "react";
import { LoadingButton } from "../shared/LoadingButton";
import { useResetPassword } from "../api/hooks/useResetPassword";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";

export const ResetPassword = () => {
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const [{ account }] = useTrucoshi();

  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [formErrors, setErrors] = useState<Error[]>([]);
  const token = search.get("token") || "";

  const { resetPassword, error, isPending } = useResetPassword();

  useEffect(() => {
    if (account) {
      navigate("/");
    }
  }, [account, navigate]);

  useEffect(() => {
    if (!token) {
      setErrors((current) => [...current, new Error("No se proporcionó un token válido")]);
    }
  }, [token]);

  const onSubmit = () => {
    setErrors([]);
    if (password !== password2) {
      return setErrors((current) => [...current, new Error("Las contraseñas no coinciden")]);
    }
    resetPassword({ token, password }, { onSuccess: () => navigate("/login") });
  };

  const onChangePassword = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const onChangePassword2 = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword2(event.target.value);
  };

  return (
    <PageContainer title="Restablecer Contraseña" icon={<Person fontSize="large" />}>
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
                name="password"
                color="warning"
                label="Nueva Contraseña"
                autoComplete="new-password"
                onChange={onChangePassword}
                type="password"
                value={password}
                variant="outlined"
              />
              <TextField
                name="password2"
                color="warning"
                label="Repetir Contraseña"
                autoComplete="new-password2"
                onChange={onChangePassword2}
                type="password"
                value={password2}
                variant="outlined"
              />
              <LoadingButton
                type="submit"
                isLoading={isPending}
                color="warning"
                variant="outlined"
                disabled={!token}
              >
                Restablecer Contraseña
              </LoadingButton>
              {([...formErrors, error].filter(Boolean) as Error[]).map((err) => (
                <Alert key={err.message} severity="error">
                  {err.message}
                </Alert>
              ))}
            </Stack>
          </form>
        </CardContent>
      </Card>
    </PageContainer>
  );
};
