import { createFileRoute } from "@tanstack/react-router";
import { MainLayout } from "../components/layout/MainLayout";
import { Home } from "../pages/Home";
import { buildSeoHead, seoPages } from "../seo/seoConfig";
import { CRITICAL_CARD_IMAGE_SOURCES } from "../trucoshi/cards/criticalCardAssets";

export const Route = createFileRoute("/")({
  head: () => {
    const head = buildSeoHead(seoPages.home);

    return {
      ...head,
      links: [
        ...head.links,
        ...CRITICAL_CARD_IMAGE_SOURCES.map((href) => ({
          rel: "preload",
          as: "image",
          href,
          fetchPriority: "high" as const,
        })),
      ],
    };
  },
  component: () => (
    <MainLayout>
      <Home />
    </MainLayout>
  ),
});
