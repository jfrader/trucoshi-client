import { sentryVitePlugin } from "@sentry/vite-plugin";
import viteReact from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";
import packageJson from "./package.json";

const SENTRY_ORG = "trucoshi";
const SENTRY_PROJECT = "trucoshi-client";
const SENTRY_RELEASE = `${packageJson.name}@${packageJson.version}`;

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const shouldUploadSourcemaps =
    command === "build" &&
    mode === "production" &&
    Boolean(process.env.SENTRY_AUTH_TOKEN) &&
    process.env.SENTRY_DISABLE_UPLOAD !== "true";

  return {
    define:
      mode === "test"
        ? undefined
        : {
            "import.meta.env.VITE_APP_NAME": JSON.stringify(
              env.VITE_APP_NAME || packageJson.name,
            ),
            "import.meta.env.VITE_APP_VERSION": JSON.stringify(
              env.VITE_APP_VERSION || packageJson.version,
            ),
          },
    plugins: [
      tanstackStart(),
      viteReact(),
      ...(shouldUploadSourcemaps
        ? [
            sentryVitePlugin({
              org: SENTRY_ORG,
              project: SENTRY_PROJECT,
              authToken: process.env.SENTRY_AUTH_TOKEN,
              release: { name: SENTRY_RELEASE },
              sourcemaps: { filesToDeleteAfterUpload: ["./dist/**/*.map"] },
            }),
          ]
        : []),
    ],
    server: {
      host: "localhost",
      port: 2991,
    },
    resolve: {
      tsconfigPaths: true,
    },
    optimizeDeps: {
      include: ["lightning-accounts"],
    },
    // MUI follows the official TanStack Start example. Vite normalizes the
    // extensionless ESM in trucoshi, while Node loads the generated CJS API
    // client directly (including when both packages are locally Yarn-linked).
    ssr: {
      external: ["lightning-accounts"],
      noExternal: ["@mui/*", "trucoshi"],
    },
    build: {
      chunkSizeWarningLimit: 850,
      commonjsOptions: {
        include: [/lightning-accounts/, /node_modules/],
      },
      sourcemap: "hidden",
    },
    test: {
      environment: "jsdom",
      execArgv: ["--no-experimental-webstorage"],
      globals: true,
      setupFiles: ["./src/test/setup.ts"],
      css: true,
      clearMocks: true,
      restoreMocks: true,
      coverage: {
        provider: "v8",
        reporter: ["text", "html"],
        include: [
          "src/components/game/**/*.tsx",
          "src/pages/Lobby.tsx",
          "src/pages/Match.tsx",
        ],
      },
    },
  };
});
