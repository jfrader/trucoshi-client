import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { createRootRoute, HeadContent, Scripts, useLocation } from "@tanstack/react-router";
import { AppProvider } from "../AppProvider";
import { Layout } from "../components/layout/Layout";
import { NotFound } from "../pages/NotFound";
import "../index.css";
import "../App.css";

const RootDocument = () => {
  const { pathname } = useLocation();
  const emotionCache = createCache({ key: "css" });

  return (
    <html lang={pathname === "/help/rules/en" ? "en" : "es-AR"}>
      <head>
        <HeadContent />
      </head>
      <body>
        <CacheProvider value={emotionCache}>
          <AppProvider>
            <Layout />
          </AppProvider>
        </CacheProvider>
        <Scripts />
      </body>
    </html>
  );
};

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { title: "Trucoshi" },
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#15110f" },
      { name: "robots", content: "noindex,nofollow" },
    ],
    links: [
      { rel: "icon", href: "/favicon.ico" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
    ],
  }),
  component: RootDocument,
  notFoundComponent: NotFound,
});
