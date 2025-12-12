import { defineConfig, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { visualizer } from 'rollup-plugin-visualizer'
import manifest from './public/manifest.json'

const rootDir = fileURLToPath(new URL('.', import.meta.url))
const viewportEntry = resolve(rootDir, 'src/content/viewport.ts')
const indexHtmlEntry = resolve(rootDir, 'index.html')
const VIEWPORT_CHUNK_NAME = 'viewport'

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest }),
    process.env.ANALYZE === '1' &&
      (visualizer({
        filename: 'dist/stats.html',
        open: false,
        gzipSize: true,
      }) as unknown as PluginOption),
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: indexHtmlEntry,
        [VIEWPORT_CHUNK_NAME]: viewportEntry
      },
      output: {
        entryFileNames: (chunk) => (chunk.name === VIEWPORT_CHUNK_NAME ? 'content/viewport.js' : 'assets/[name]-[hash].js'),
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  }
})
