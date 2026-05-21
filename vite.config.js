import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    },
    watch: {
      ignored: [
        "**/_archive_unused/**",
        "**/public/**",
        "**/*.txt",
        "**/*.cjs",
        "**/*.log",
        "**/upload_manifest*.json",
        "**/merged_*.json",
        "**/temp*.json",
        "**/android/**",
        "**/assets_backup/**",
        "**/backup*/**",
        "**/DIAMOND_BOX*/**",
        "**/GOLD_BOX*/**"
      ]
    },
    fs: {
      allow: [
        path.resolve(__dirname),
        path.resolve(__dirname, 'assets_backup')
      ]
    }
  },
  optimizeDeps: {
    entries: ['index.html'],
    exclude: ['android', 'assets_backup', 'backups', 'backup', 'DIAMOND_BOX_2', 'DIAMOND_BOX_4', 'DIAMOND_BOX_G1_2026_05_09', 'GOLD_BOX_G1_2026_05_08_1844']
  },
  json: {
    stringify: true
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 5000,
    assetsInlineLimit: 0,
    emptyOutDir: false
  }
})
