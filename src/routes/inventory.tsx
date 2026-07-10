import { createFileRoute } from "@tanstack/react-router";
import { InventoryPage } from "../components/inventory/InventoryPage";
import { PageLayout } from "../components/layout/PageLayout";
import { buildNoIndexSeo, buildSeoHead } from "../seo/seoConfig";

export const Route = createFileRoute("/inventory")({
  head: () => buildSeoHead(buildNoIndexSeo("Inventario")),
  component: () => (
    <PageLayout>
      <InventoryPage />
    </PageLayout>
  ),
});
