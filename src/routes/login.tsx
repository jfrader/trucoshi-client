import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "../components/layout/PageLayout";
import { Login } from "../pages/Login";
import { buildNoIndexSeo, buildSeoHead } from "../seo/seoConfig";

export const Route = createFileRoute("/login")({
  head: () => buildSeoHead(buildNoIndexSeo("Iniciar sesión")),
  component: () => (
    <PageLayout>
      <Login />
    </PageLayout>
  ),
});
