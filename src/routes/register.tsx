import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "../components/layout/PageLayout";
import { Register } from "../pages/Register";
import { buildNoIndexSeo, buildSeoHead } from "../seo/seoConfig";

export const Route = createFileRoute("/register")({
  validateSearch: (search: Record<string, unknown>): { name?: string } => ({
    name: typeof search.name === "string" ? search.name : undefined,
  }),
  head: () => buildSeoHead(buildNoIndexSeo("Registrarse")),
  component: () => (
    <PageLayout>
      <Register />
    </PageLayout>
  ),
});
