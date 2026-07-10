import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "../components/layout/PageLayout";
import { TrucoArgentino } from "../pages/SeoContentPages";
import { buildSeoHead, seoPages } from "../seo/seoConfig";

export const Route = createFileRoute("/truco-argentino")({
  head: () => buildSeoHead(seoPages.trucoArgentino),
  component: () => (
    <PageLayout fullBleed hideSocketBackdrop>
      <TrucoArgentino />
    </PageLayout>
  ),
});
