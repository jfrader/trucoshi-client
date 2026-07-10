import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "../components/layout/PageLayout";
import { Profile } from "../pages/Profile";
import { buildNoIndexSeo, buildSeoHead } from "../seo/seoConfig";

export const Route = createFileRoute("/profile_/$accountId")({
  validateSearch: (search: Record<string, unknown>): { t?: string } => ({
    t: typeof search.t === "string" ? search.t : undefined,
  }),
  head: () => buildSeoHead(buildNoIndexSeo("Perfil")),
  component: () => (
    <PageLayout>
      <Profile />
    </PageLayout>
  ),
});
