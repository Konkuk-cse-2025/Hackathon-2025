import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    proxy: {
      "/auth": { target: "http://localhost:3000", changeOrigin: true },
      "/mailboxes": { target: "http://localhost:3000", changeOrigin: true },
      "/letters": { target: "http://localhost:3000", changeOrigin: true },
    },
  },
});
