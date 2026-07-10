import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { PageLayout } from "../components/layout/PageLayout";
import { Rulebook } from "../pages/Rulebook";
import { buildSeoHead, seoPages } from "../seo/seoConfig";

export const Route = createFileRoute("/help_/rules/$lang")({
  beforeLoad: ({ params }) => {
    if (params.lang === "es") {
      throw redirect({ to: "/reglas-del-truco", statusCode: 301 });
    }

    if (params.lang !== "en") {
      throw notFound();
    }
  },
  head: () => buildSeoHead(seoPages.englishRules),
  component: () => (
    <PageLayout fullBleed hideSocketBackdrop>
      <Rulebook language="en" />
    </PageLayout>
  ),
});
