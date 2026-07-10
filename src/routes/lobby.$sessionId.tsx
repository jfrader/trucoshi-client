import { createFileRoute } from "@tanstack/react-router";
import { Lobby } from "../pages/Lobby";
import { buildNoIndexSeo, buildSeoHead } from "../seo/seoConfig";

export const Route = createFileRoute("/lobby/$sessionId")({
  head: () => buildSeoHead(buildNoIndexSeo("Lobby de Truco")),
  component: Lobby,
});
