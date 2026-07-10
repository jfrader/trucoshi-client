import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "../components/layout/PageLayout";
import { Help } from "../pages/Help";
import { buildSeoHead, helpSeoPage } from "../seo/seoConfig";

export const Route = createFileRoute("/help")({
  head: () => buildSeoHead(helpSeoPage),
  component: () => (
    <PageLayout fullBleed hideSocketBackdrop>
      <Help />
    </PageLayout>
  ),
});
