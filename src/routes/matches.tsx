import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "../components/layout/PageLayout";
import { SearchMatches } from "../pages/SearchMatches";
import { buildNoIndexSeo, buildSeoHead } from "../seo/seoConfig";

export const Route = createFileRoute("/matches")({
  head: () => buildSeoHead(buildNoIndexSeo("Partidas")),
  component: () => (
    <PageLayout>
      <SearchMatches />
    </PageLayout>
  ),
});
