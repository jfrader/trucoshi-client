import { createFileRoute } from "@tanstack/react-router";
import { MainLayout } from "../components/layout/MainLayout";
import { Home } from "../pages/Home";
import { buildSeoHead, seoPages } from "../seo/seoConfig";

export const Route = createFileRoute("/")({
  head: () => buildSeoHead(seoPages.home),
  component: () => (
    <MainLayout>
      <Home />
    </MainLayout>
  ),
});
