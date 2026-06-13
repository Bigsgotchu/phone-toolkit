import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  base: "./",
  root: process.cwd(),
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(process.cwd(), "src"),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    outDir: resolve(process.cwd(), "dist/renderer"),
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(process.cwd(), "index.html"),
    },
  },
});
