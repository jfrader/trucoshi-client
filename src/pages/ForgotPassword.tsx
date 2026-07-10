import { Person } from "@mui/icons-material";
import { PageContainer } from "../shared/PageContainer";
import { Alert, Button, Card, CardContent, Stack, TextField } from "@mui/material";
import { ChangeEvent, useEffect, useState } from "react";
import { LoadingButton } from "../shared/LoadingButton";
import { useForgotPassword } from "../api/hooks/useForgotPassword";
import { useNavigate } from "@tanstack/react-router";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const [{ account }] = useTrucoshi();
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);

  const { requestPasswordReset, error, isPending } = useForgotPassword();

  useEffect(() => {
    if (account) {
      void navigate({ to: "/" });
    }
  }, [account, navigate]);

  const onSubmit = () => {
    requestPasswordReset(
      { email },
      {
        onSuccess: () => {
          setSuccess(true);
        },
      },
    );
  };

  const onChangeEmail = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  return (
    <PageContainer title="Restablecer Contraseña" icon={<Person fontSize="large" />}>
      <Card>
        <CardContent>
          {success ? (
            <Stack px={2} pt={2} gap={4}>
              <Alert severity="success">
                Se ha enviado un email con instrucciones para restablecer tu contraseña. Revisa tu
                bandeja de entrada o spam.
              </Alert>
              <Button onClick={() => void navigate({ to: "/login" })} color="success">
                Volver al Inicio de Sesión
              </Button>
            </Stack>
          ) : (
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
                  type="email"
                  value={email}
                  variant="outlined"
                />
                <LoadingButton
                  type="submit"
                  isLoading={isPending}
                  color="warning"
                  variant="outlined"
                >
                  Enviar Email de Restablecimiento
                </LoadingButton>
                <Button onClick={() => void navigate({ to: "/login" })} color="success">
                  Volver al Inicio de Sesión
                </Button>
                {error ? <Alert severity="error">{error.message}</Alert> : null}
              </Stack>
            </form>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
};
