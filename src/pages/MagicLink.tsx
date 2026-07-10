import { Person } from "@mui/icons-material";
import { Alert, Card, CardContent, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useConsumeMagicLink } from "../api/hooks/useConsumeMagicLink";
import { LoadingButton } from "../shared/LoadingButton";
import { PageContainer } from "../shared/PageContainer";

export const MagicLink = () => {
  const navigate = useNavigate();
  const search = useSearch({ from: "/magic-link" });
  const [formErrors, setErrors] = useState<Error[]>([]);
  const token = search.token || "";
  const next = search.next;
  const { consumeMagicLink, error, isPending } = useConsumeMagicLink();

  useEffect(() => {
    if (!token) {
      setErrors((current) => [...current, new Error("No se proporcionó un token válido")]);
      return;
    }

    consumeMagicLink(
      { token },
      {
        onSuccess: (response) => {
          const userId = response.data.user?.id;
          if (next === "profile" && userId) {
            void navigate({
              to: "/profile/$accountId",
              params: { accountId: String(userId) },
            });
            return;
          }

          void navigate({ to: "/" });
        },
        onError: (e) => setErrors([e]),
      },
    );
  }, [consumeMagicLink, navigate, next, token]);

  return (
    <PageContainer title="Ingresar con Email" icon={<Person fontSize="large" />}>
      <Card>
        <CardContent>
          <Stack px={2} pt={2} gap={4}>
            <LoadingButton isLoading={isPending} color="warning" variant="outlined" disabled>
              {isPending ? "Ingresando..." : "Link procesado"}
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
