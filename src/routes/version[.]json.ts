import { createFileRoute } from "@tanstack/react-router";
import packageJson from "../../package.json";

export const Route = createFileRoute("/version.json")({
  server: {
    handlers: {
      GET: () =>
        Response.json(
          { version: packageJson.version },
          { headers: { "cache-control": "no-store" } },
        ),
    },
  },
});
