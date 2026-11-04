import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Plugin otomatis mengarahkan request gambar .png / .jpg / .jpeg ke file .webp yang ada di folder public/
function publicWebpFallbackPlugin() {
  return {
    name: 'public-webp-fallback',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (!req.url) return next()
        const [pathname, query] = req.url.split('?')
        const decodedPath = decodeURIComponent(pathname)
        if (/\.(png|jpe?g)$/i.test(decodedPath)) {
          const exactFile = path.join(__dirname, 'public', decodedPath)
          if (!fs.existsSync(exactFile)) {
            const webpRelative = decodedPath.replace(/\.(png|jpe?g)$/i, '.webp')
            const webpFile = path.join(__dirname, 'public', webpRelative)
            if (fs.existsSync(webpFile)) {
              req.url = encodeURI(webpRelative) + (query ? `?${query}` : '')
            }
          }
        }
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), publicWebpFallbackPlugin()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
    },
  },
})