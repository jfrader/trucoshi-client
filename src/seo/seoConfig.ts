import type { DetailedHTMLProps, LinkHTMLAttributes, MetaHTMLAttributes } from "react";
import seoPagesData from "./seoPages.json";
import { ENABLE_BETS_AND_DEPOSITS } from "../config/features";
import { TRUCO_ONLINE_FAQS } from "../content/seo/trucoOnline";

export type SeoAlternate = {
  hrefLang: string;
  path: string;
};

export type JsonLd = Record<string, unknown>;

export type SeoConfig = {
  canonicalPath?: string;
  title: string;
  description: string;
  locale?: string;
  robots?: string;
  ogImage?: string;
  twitterImage?: string;
  alternates?: SeoAlternate[];
  jsonLd?: JsonLd[];
};

export type RouterHeadConfig = {
  meta: DetailedHTMLProps<MetaHTMLAttributes<HTMLMetaElement>, HTMLMetaElement>[];
  links: DetailedHTMLProps<LinkHTMLAttributes<HTMLLinkElement>, HTMLLinkElement>[];
  scripts: Array<{
    type: "application/ld+json";
    children: string;
  }>;
};

export type SeoPageKey = keyof typeof seoPagesData.pages;

export const siteSeo = {
  siteUrl: seoPagesData.siteUrl,
  siteName: seoPagesData.siteName,
  defaultOgImage: seoPagesData.defaultOgImage,
  defaultTwitterImage: seoPagesData.defaultTwitterImage,
};

const baseSeoPages = seoPagesData.pages as Record<SeoPageKey, SeoConfig>;

const trucoOnlineFaqJsonLd: JsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: TRUCO_ONLINE_FAQS.map(({ question, answer }) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: {
      "@type": "Answer",
      text: answer,
    },
  })),
};

export const seoPages: Record<SeoPageKey, SeoConfig> = {
  ...baseSeoPages,
  trucoOnline: {
    ...baseSeoPages.trucoOnline,
    jsonLd: [...(baseSeoPages.trucoOnline.jsonLd ?? []), trucoOnlineFaqJsonLd],
  },
};

export const buildHelpSeoPage = (enableBetsAndDeposits: boolean): SeoConfig =>
  enableBetsAndDeposits
    ? {
        ...seoPages.help,
        description:
          "Ayuda de Trucoshi para jugar Truco online, aprender las reglas, consultar el ranking de cartas y entender Bitcoin Lightning en la app.",
      }
    : seoPages.help;

export const helpSeoPage = buildHelpSeoPage(ENABLE_BETS_AND_DEPOSITS);

export const buildAbsoluteUrl = (path = "/") => new URL(path, siteSeo.siteUrl).toString();

export const buildNoIndexSeo = (title: string): SeoConfig => ({
  title: `${title} | Trucoshi`,
  description: "Página privada de Trucoshi.",
  robots: "noindex,nofollow",
});

const buildDocumentTitle = (title: string) => {
  const pageTitle = title.split("|")[0]?.trim() || siteSeo.siteName;

  return pageTitle === siteSeo.siteName ? siteSeo.siteName : `${siteSeo.siteName} | ${pageTitle}`;
};

export const buildSeoHead = (config: SeoConfig): RouterHeadConfig => {
  const canonicalUrl = config.canonicalPath ? buildAbsoluteUrl(config.canonicalPath) : undefined;
  const ogImageUrl = buildAbsoluteUrl(config.ogImage ?? siteSeo.defaultOgImage);
  const twitterImageUrl = buildAbsoluteUrl(config.twitterImage ?? siteSeo.defaultTwitterImage);
  const robots = config.robots ?? "index,follow";
  const documentTitle = buildDocumentTitle(config.title);

  return {
    meta: [
      { title: documentTitle },
      { name: "description", content: config.description },
      { name: "robots", content: robots },
      { property: "og:site_name", content: siteSeo.siteName },
      { property: "og:type", content: "website" },
      { property: "og:title", content: config.title },
      { property: "og:description", content: config.description },
      ...(canonicalUrl ? [{ property: "og:url", content: canonicalUrl }] : []),
      { property: "og:image", content: ogImageUrl },
      { property: "og:image:alt", content: config.title },
      { property: "og:locale", content: config.locale ?? "es_AR" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: config.title },
      { name: "twitter:description", content: config.description },
      { name: "twitter:image", content: twitterImageUrl },
      { name: "twitter:image:alt", content: config.title },
    ],
    links: [
      ...(canonicalUrl ? [{ rel: "canonical", href: canonicalUrl }] : []),
      ...(config.alternates ?? []).map((alternate) => ({
        rel: "alternate",
        hrefLang: alternate.hrefLang,
        href: buildAbsoluteUrl(alternate.path),
      })),
    ],
    scripts: (config.jsonLd ?? []).map((entry) => ({
      type: "application/ld+json",
      children: JSON.stringify(entry).replace(/</g, "\\u003c"),
    })),
  };
};
