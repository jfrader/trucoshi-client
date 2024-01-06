import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteTsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  base: "",
  plugins: [react(), viteTsconfigPaths()],
  server: {
    open: true,
    host: "localhost",
    port: 2991,
  },
  optimizeDeps: {
    exclude: ["trucoshi"],
  },
  build: {
    commonjsOptions: {
      include: [/trucoshi/, /node_modules/],
    },
    rollupOptions: {
      preserveEntrySignatures: "strict",
    },
  },
});
