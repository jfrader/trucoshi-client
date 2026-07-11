import { createFileRoute } from "@tanstack/react-router";
import { Match } from "../pages/Match";
import { buildNoIndexSeo, buildSeoHead } from "../seo/seoConfig";

export const Route = createFileRoute("/match/$sessionId")({
  head: () => buildSeoHead(buildNoIndexSeo("Partida (1v1)")),
  component: Match,
});
