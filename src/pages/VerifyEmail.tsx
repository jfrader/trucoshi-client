import { Person } from "@mui/icons-material";
import { PageContainer } from "../shared/PageContainer";
import { Alert, Card, CardContent, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { LoadingButton } from "../shared/LoadingButton";
import { useVerifyEmail } from "../api/hooks/useVerifyEmail";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useTrucoshi } from "../trucoshi/hooks/useTrucoshi";

export const VerifyEmail = () => {
  const navigate = useNavigate();
  const search = useSearch({ from: "/verify-email" });
  const [{ account }] = useTrucoshi();
  const [formErrors, setErrors] = useState<Error[]>([]);
  const token = search.token || "";

  const { verifyEmail, error, isPending } = useVerifyEmail();

  useEffect(() => {
    if (account) {
      void navigate({ to: "/" });
    }
  }, [account, navigate]);

  useEffect(() => {
    if (!token) {
      setErrors((current) => [...current, new Error("No se proporcionó un token válido")]);
    } else {
      verifyEmail({ token }, { onSuccess: () => void navigate({ to: "/login" }) });
    }
  }, [token, verifyEmail, navigate]);

  return (
    <PageContainer title="Verificar Email" icon={<Person fontSize="large" />}>
      <Card>
        <CardContent>
          <Stack px={2} pt={2} gap={4}>
            <LoadingButton isLoading={isPending} color="warning" variant="outlined" disabled>
              {isPending ? "Verificando..." : "Verificación Completada"}
            </LoadingButton>
            {([...formErrors, error].filter(Boolean) as Error[]).map((err) => (
              <Alert key={err.message} severity="error">
                {err.message}
              </Alert>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </PageContainer>
  );
};
