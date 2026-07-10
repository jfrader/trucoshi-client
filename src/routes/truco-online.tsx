import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "../components/layout/PageLayout";
import { TrucoOnline } from "../pages/SeoContentPages";
import { buildSeoHead, seoPages } from "../seo/seoConfig";

export const Route = createFileRoute("/truco-online")({
  head: () => buildSeoHead(seoPages.trucoOnline),
  component: () => (
    <PageLayout fullBleed hideSocketBackdrop>
      <TrucoOnline />
    </PageLayout>
  ),
});
