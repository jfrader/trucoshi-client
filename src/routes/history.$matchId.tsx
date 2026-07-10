import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "../components/layout/PageLayout";
import { MatchDetails } from "../pages/MatchDetails";
import { buildNoIndexSeo, buildSeoHead } from "../seo/seoConfig";

export const Route = createFileRoute("/history/$matchId")({
  validateSearch: (search: Record<string, unknown>): { t?: string } => ({
    t: typeof search.t === "string" ? search.t : undefined,
  }),
  head: () => buildSeoHead(buildNoIndexSeo("Resumen de partida")),
  component: () => (
    <PageLayout>
      <MatchDetails />
    </PageLayout>
  ),
});
