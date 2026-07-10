import { createFileRoute } from "@tanstack/react-router";

const manifest = {
  name: "Trucoshi - Truco Online Gratis",
  short_name: "Trucoshi",
  start_url: "/",
  scope: "/",
  icons: [
    {
      src: "/web-app-manifest-192x192.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "maskable",
    },
    {
      src: "/web-app-manifest-512x512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable",
    },
  ],
  theme_color: "#15110f",
  background_color: "#15110f",
  display: "standalone",
};

export const Route = createFileRoute("/site.webmanifest")({
  server: {
    handlers: {
      GET: () =>
        Response.json(manifest, {
          headers: {
            "cache-control": "no-cache",
            "content-type": "application/manifest+json; charset=utf-8",
          },
        }),
    },
  },
});
