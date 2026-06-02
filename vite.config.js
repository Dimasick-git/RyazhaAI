import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function warnMissingApiUrl() {
  return {
    name: 'warn-missing-api-url',
    buildStart() {
      if (!process.env.VITE_API_URL) {
        console.warn('[WARNING] VITE_API_URL is not set — production AI calls will fail')
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), warnMissingApiUrl()],
  base: '/RyazhaAI/',
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist'
  }
})
