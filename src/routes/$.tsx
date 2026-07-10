import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageLayout } from "../components/layout/PageLayout";
import { NotFound } from "../pages/NotFound";
import { buildNoIndexSeo, buildSeoHead } from "../seo/seoConfig";

export const Route = createFileRoute("/$")({
  head: () => buildSeoHead(buildNoIndexSeo("Página no encontrada")),
  loader: () => notFound({ throw: true }),
  notFoundComponent: () => (
    <PageLayout>
      <NotFound />
    </PageLayout>
  ),
});
