import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import viteTsconfigPaths from "vite-tsconfig-paths";
import { writeFile } from "fs/promises";
import { resolve } from "path";
import packageJson from "./package.json";

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
  plugins: [react(), viteTsconfigPaths(), versionPlugin()],
  resolve: {
    alias: [
      { find: /^trucoshi$/, replacement: resolve(process.cwd(), "../trucoshi/dist/types.js") },
      {
        find: /^trucoshi\/dist\/lib(.*)$/,
        replacement: resolve(process.cwd(), "../trucoshi/dist/lib$1"),
      },
      {
        find: /^trucoshi\/prisma\/client$/,
        replacement: resolve(process.cwd(), "../trucoshi/prisma/client/index.js"),
      },
    ],
  },
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
    sourcemap: true,
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
