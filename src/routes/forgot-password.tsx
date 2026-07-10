import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "../components/layout/PageLayout";
import { ForgotPassword } from "../pages/ForgotPassword";
import { buildNoIndexSeo, buildSeoHead } from "../seo/seoConfig";

export const Route = createFileRoute("/forgot-password")({
  head: () => buildSeoHead(buildNoIndexSeo("Restablecer contraseña")),
  component: () => (
    <PageLayout>
      <ForgotPassword />
    </PageLayout>
  ),
});
