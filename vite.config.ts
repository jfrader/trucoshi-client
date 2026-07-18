import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import viteTsconfigPaths from "vite-tsconfig-paths";
import { loadEnv } from "vite";
import { copyFile, writeFile } from "fs/promises";
import { resolve } from "path";
import packageJson from "./package.json";
import { createAdmissionStatusReader, writeAdmissionResponse } from "./server/admission.mjs";

const releaseMetadataPlugin = () => ({
  name: "trucoshi-release-metadata",
  async writeBundle() {
    const releaseFiles = [
      ["LICENSE", "LICENSE"],
      ["ASSET_NOTICES.md", "ASSET_NOTICES.md"],
      ["THIRD_PARTY_NOTICES.md", "THIRD_PARTY_NOTICES.md"],
    ] as const;
    const version = packageJson.version.toString();
    const distDirectory = resolve(process.cwd(), "dist");

    await writeFile(
      resolve(distDirectory, "version.json"),
      JSON.stringify({ version }, null, 2),
      "utf-8",
    );

    for (const [source, destination] of releaseFiles) {
      await copyFile(resolve(process.cwd(), source), resolve(distDirectory, destination));
    }

    console.log(`Wrote release metadata for version ${version}`);
  },
});

const admissionDevPlugin = (config: { serverUrl?: string; statusToken?: string }) => {
  const readAdmissionStatus = createAdmissionStatusReader();

  return {
    name: "trucoshi-admission-dev-proxy",
    configureServer(server: {
      middlewares: {
        use(
          handler: (
            request: { method?: string; url?: string },
            response: {
              writeHead(status: number, headers: Record<string, string | number>): void;
              end(body?: string): void;
            },
            next: () => void,
          ) => void,
        ): void;
      };
    }) {
      server.middlewares.use(async (request, response, next) => {
        const pathname = request.url?.split("?", 1)[0];
        if (pathname !== "/admission.json") {
          next();
          return;
        }

        const method = request.method || "GET";
        if (method !== "GET" && method !== "HEAD") {
          response.writeHead(405, { Allow: "GET, HEAD", "Cache-Control": "no-store" });
          response.end();
          return;
        }

        writeAdmissionResponse(response, await readAdmissionStatus(config), method);
      });
    },
  };
};

export default defineConfig(({ mode }) => {
  const serverEnvironment = loadEnv(mode, process.cwd(), "");
  const clientVersion =
    process.env.VITE_APP_VERSION ||
    serverEnvironment.VITE_APP_VERSION ||
    packageJson.version.toString();
  const admissionConfig = {
    serverUrl: process.env.TRUCOSHI_SERVER_URL || serverEnvironment.TRUCOSHI_SERVER_URL,
    statusToken:
      process.env.TRUCOSHI_OPS_STATUS_TOKEN || serverEnvironment.TRUCOSHI_OPS_STATUS_TOKEN,
  };

  return {
    define: {
      "import.meta.env.VITE_APP_VERSION": JSON.stringify(clientVersion),
    },
    plugins: [
      admissionDevPlugin(admissionConfig),
      react(),
      viteTsconfigPaths(),
      releaseMetadataPlugin(),
    ],
    server: {
      open: true,
      host: "localhost",
      port: 2991,
    },
    resolve: {
      preserveSymlinks: true,
    },
    optimizeDeps: {
      include: ["lightning-accounts", "react-qr-code", "trucoshi"],
    },
    build: {
      commonjsOptions: {
        include: [/lightning-accounts/, /node_modules/],
      },
      sourcemap: false,
    },
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: ["./src/test/setup.ts"],
      css: true,
      clearMocks: true,
      restoreMocks: true,
      coverage: {
        provider: "v8",
        reporter: ["text", "html"],
        include: ["src/components/game/**/*.tsx", "src/pages/Lobby.tsx", "src/pages/Match.tsx"],
      },
    },
  };
});
