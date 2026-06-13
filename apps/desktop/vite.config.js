const { defineConfig } = require("vite");
const react = require("@vitejs/plugin-react");
const { resolve } = require("path");

module.exports = defineConfig({
  root: __dirname,
  plugins: [react()],
  build: {
    outDir: resolve(__dirname, "dist/renderer"),
    emptyOutDir: false,
  },
});
