import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "../components/layout/PageLayout";
import { PlayerRanking } from "../pages/PlayerRanking";
import { buildSeoHead, seoPages } from "../seo/seoConfig";

export const Route = createFileRoute("/ranking")({
  head: () => buildSeoHead(seoPages.ranking),
  component: () => (
    <PageLayout>
      <PlayerRanking />
    </PageLayout>
  ),
});
