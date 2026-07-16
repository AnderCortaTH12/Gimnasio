import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt', // avisamos al usuario cuando hay actualización
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name: 'FORJA',
        short_name: 'FORJA',
        description: 'App personal de seguimiento de gimnasio',
        start_url: '/',
        display: 'standalone',
        theme_color: '#0B0B0F',
        background_color: '#0B0B0F',
        orientation: 'portrait',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Precachea todo el bundle estático (HTML, JS, CSS, iconos).
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        // SPA: cualquier navegación offline cae en index.html.
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            // Fuente Inter de Google Fonts (CSS).
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-stylesheets' },
          },
          {
            // Ficheros de la fuente (woff2).
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // GIFs de ejercicios (GitHub raw): cache-first, se cachean al verlos.
            urlPattern: /^https:\/\/raw\.githubusercontent\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'exercise-gifs',
              expiration: { maxEntries: 400, maxAgeSeconds: 60 * 60 * 24 * 90 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: {
        // Permite probar el SW también en `npm run dev`.
        enabled: false,
      },
    }),
  ],
})
