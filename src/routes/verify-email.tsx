import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "../components/layout/PageLayout";
import { VerifyEmail } from "../pages/VerifyEmail";
import { buildNoIndexSeo, buildSeoHead } from "../seo/seoConfig";

export const Route = createFileRoute("/verify-email")({
  validateSearch: (search: Record<string, unknown>): { token?: string } => ({
    token: typeof search.token === "string" ? search.token : undefined,
  }),
  head: () => buildSeoHead(buildNoIndexSeo("Verificar email")),
  component: () => (
    <PageLayout>
      <VerifyEmail />
    </PageLayout>
  ),
});
