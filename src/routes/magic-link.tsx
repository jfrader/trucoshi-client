import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "../components/layout/PageLayout";
import { MagicLink } from "../pages/MagicLink";
import { buildNoIndexSeo, buildSeoHead } from "../seo/seoConfig";

export const Route = createFileRoute("/magic-link")({
  validateSearch: (search: Record<string, unknown>): { token?: string; next?: string } => ({
    token: typeof search.token === "string" ? search.token : undefined,
    next: typeof search.next === "string" ? search.next : undefined,
  }),
  head: () => buildSeoHead(buildNoIndexSeo("Ingresar con email")),
  component: () => (
    <PageLayout>
      <MagicLink />
    </PageLayout>
  ),
});
