import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const configFile = fileURLToPath(import.meta.url)
const appRoot = dirname(configFile)

export default defineConfig({
  root: appRoot,
  plugins: [react()],
  build: {
    outDir: resolve(appRoot, 'dist/renderer'),
    emptyOutDir: false,
  },
})