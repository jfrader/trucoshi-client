import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "../components/layout/PageLayout";
import { RankingCartasTruco } from "../pages/SeoContentPages";
import { buildSeoHead, seoPages } from "../seo/seoConfig";

export const Route = createFileRoute("/ranking-cartas-truco")({
  head: () => buildSeoHead(seoPages.rankingCartasTruco),
  component: () => (
    <PageLayout fullBleed hideSocketBackdrop>
      <RankingCartasTruco />
    </PageLayout>
  ),
});
