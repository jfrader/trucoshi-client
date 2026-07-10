import { describe, expect, it } from "vitest";
import {
  buildAbsoluteUrl,
  buildHelpSeoPage,
  buildNoIndexSeo,
  buildSeoHead,
  seoPages,
} from "./seoConfig";

describe("seoConfig", () => {
  it("defines the canonical Spanish rules route", () => {
    expect(seoPages.spanishRules.canonicalPath).toBe("/reglas-del-truco");
    expect(seoPages.spanishRules.title).toBe("Reglas del Truco Argentino | Trucoshi");
  });

  it("builds absolute production URLs", () => {
    expect(buildAbsoluteUrl("/ranking")).toBe("https://trucoshi.com/ranking");
  });

  it("defines focused public SEO pages", () => {
    expect(seoPages.trucoOnline.canonicalPath).toBe("/truco-online");
    expect(seoPages.trucoArgentino.canonicalPath).toBe("/truco-argentino");
    expect(seoPages.rankingCartasTruco.canonicalPath).toBe("/ranking-cartas-truco");
  });

  it("keeps FAQ structured data on the visible truco online FAQ page", () => {
    expect(seoPages.trucoOnline.jsonLd?.some((entry) => entry["@type"] === "FAQPage")).toBe(true);
    expect(seoPages.trucoArgentino.jsonLd?.some((entry) => entry["@type"] === "FAQPage")).toBe(
      false,
    );
  });

  it("removes Bitcoin and Lightning from Help metadata when bets are disabled", () => {
    const helpSeo = buildHelpSeoPage(false);

    expect(helpSeo.description).not.toMatch(/bitcoin|lightning/i);
    expect(buildHelpSeoPage(true).description).toMatch(/bitcoin|lightning/i);
  });

  it("emits JSON-LD as TanStack head script children", () => {
    const scripts = buildSeoHead(seoPages.trucoOnline).scripts;

    expect(
      scripts.some(
        (script) =>
          script.type === "application/ld+json" && script.children.includes('"@type":"FAQPage"'),
      ),
    ).toBe(true);
    expect(
      scripts.some(
        (script) =>
          script.type === "application/ld+json" &&
          script.children.includes('"@type":"BreadcrumbList"'),
      ),
    ).toBe(true);
  });

  it("marks private route metadata as noindex", () => {
    const head = buildSeoHead(buildNoIndexSeo("Perfil"));

    expect(head.meta).toContainEqual({ name: "robots", content: "noindex,nofollow" });
    expect(head.links).not.toContainEqual(expect.objectContaining({ rel: "canonical" }));
    expect(head.meta).not.toContainEqual(expect.objectContaining({ property: "og:url" }));
  });
});
