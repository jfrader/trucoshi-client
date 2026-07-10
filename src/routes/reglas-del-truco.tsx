import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "../components/layout/PageLayout";
import { Rulebook } from "../pages/Rulebook";
import { buildSeoHead, seoPages } from "../seo/seoConfig";

export const Route = createFileRoute("/reglas-del-truco")({
  head: () => buildSeoHead(seoPages.spanishRules),
  component: () => (
    <PageLayout fullBleed hideSocketBackdrop>
      <Rulebook language="es" />
    </PageLayout>
  ),
});
