import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "../components/layout/PageLayout";
import { Admin } from "../pages/Admin";
import { buildNoIndexSeo, buildSeoHead } from "../seo/seoConfig";

export const Route = createFileRoute("/admin")({
  head: () => buildSeoHead(buildNoIndexSeo("Admin")),
  component: () => (
    <PageLayout>
      <Admin />
    </PageLayout>
  ),
});
