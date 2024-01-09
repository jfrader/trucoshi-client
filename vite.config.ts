import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteTsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), viteTsconfigPaths()],
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
});
