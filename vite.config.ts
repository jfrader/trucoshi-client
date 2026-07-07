import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import viteTsconfigPaths from "vite-tsconfig-paths";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { existsSync } from "fs";
import { writeFile } from "fs/promises";
import { resolve } from "path";
import packageJson from "./package.json";

const SENTRY_ORG = "trucoshi";
const SENTRY_PROJECT = "trucoshi-client";
const SENTRY_RELEASE = `${packageJson.name}@${packageJson.version}`;
const hasSentryAuthConfig =
  Boolean(process.env.SENTRY_AUTH_TOKEN) || existsSync(resolve(process.cwd(), ".env.sentry-build-plugin"));

const versionPlugin = () => ({
  name: "vite-plugin-version",
  async writeBundle() {
    try {
      const version = packageJson.version.toString() || "1.0.0";
      const versionData = { version };
      const distPath = resolve(process.cwd(), "dist", "version.json");
      await writeFile(distPath, JSON.stringify(versionData, null, 2), "utf-8");
      console.log(`Successfully wrote version.json with version ${version}`);
    } catch (error) {
      console.error("Failed to write version.json:", error);
    }
  },
});

export default defineConfig({
  plugins: [
    react(),
    viteTsconfigPaths(),
    versionPlugin(),
    sentryVitePlugin({
      org: SENTRY_ORG,
      project: SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      disable: !hasSentryAuthConfig,
      release: {
        name: SENTRY_RELEASE,
      },
      sourcemaps: {
        filesToDeleteAfterUpload: ["./dist/**/*.map"],
      },
    }),
  ],
  server: {
    open: true,
    host: "localhost",
    port: 2991,
  },
  optimizeDeps: {
    include: ["lightning-accounts", "react-qr-code", "trucoshi"],
  },
  build: {
    commonjsOptions: {
      include: [/lightning-accounts/, /node_modules/],
    },
    sourcemap: "hidden",
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
});
