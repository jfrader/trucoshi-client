import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "../components/layout/PageLayout";
import { ResetPassword } from "../pages/ResetPassword";
import { buildNoIndexSeo, buildSeoHead } from "../seo/seoConfig";

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>): { token?: string } => ({
    token: typeof search.token === "string" ? search.token : undefined,
  }),
  head: () => buildSeoHead(buildNoIndexSeo("Restablecer contraseña")),
  component: () => (
    <PageLayout>
      <ResetPassword />
    </PageLayout>
  ),
});
