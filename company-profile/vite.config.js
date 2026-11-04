import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Plugin otomatis mengarahkan request gambar .png / .jpg / .jpeg ke file .webp yang ada di folder public/
// Dilengkapi dengan validasi canonical path containment untuk mencegah Path Traversal (SEC-012)
function publicWebpFallbackPlugin() {
  const publicDir = path.resolve(__dirname, 'public')
  return {
    name: 'public-webp-fallback',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (!req.url) return next()
        const [pathname, query] = req.url.split('?')
        let decodedPath = ''
        try {
          decodedPath = decodeURIComponent(pathname)
        } catch {
          return next()
        }
        // Tolak null bytes dan karakter kontrol
        if (decodedPath.includes('\0')) return next()

        if (/\.(png|jpe?g)$/i.test(decodedPath)) {
          // Canonical path resolution & containment check (SEC-012)
          const normalizedRelative = path.normalize(decodedPath).replace(/^(\.\.[\/\\])+/, '')
          const exactFile = path.resolve(publicDir, '.' + normalizedRelative)
          const relCheck = path.relative(publicDir, exactFile)

          // Jika resolved path berada di luar direktori public, tolak traversal
          if (relCheck.startsWith('..') || path.isAbsolute(relCheck)) {
            return next()
          }

          if (!fs.existsSync(exactFile)) {
            const webpRelative = normalizedRelative.replace(/\.(png|jpe?g)$/i, '.webp')
            const webpFile = path.resolve(publicDir, '.' + webpRelative)
            const webpRelCheck = path.relative(publicDir, webpFile)

            if (!webpRelCheck.startsWith('..') && !path.isAbsolute(webpRelCheck) && fs.existsSync(webpFile)) {
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
    fs: {
      strict: true,
      allow: [__dirname],
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Nonaktifkan sourcemap di lingkungan produksi untuk mencegah exposure source code (SEC-013)
    sourcemap: false,
  },
})