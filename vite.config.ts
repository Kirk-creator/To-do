import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages project site: https://kirk-creator.github.io/To-do/
const base = '/To-do/'

export default defineConfig({
  base,
  plugins: [
    react(),
    {
      name: 'strip-pages-boot-on-build',
      transformIndexHtml(html) {
        return html.replace(
          /<!--\s*\n?\s*GitHub Pages currently serves[\s\S]*?<\/script>\n?/,
          '',
        )
      },
    },
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Daily Checklist',
        short_name: 'Checklist',
        description: 'Daily recurring and one-time to-dos with confetti',
        theme_color: '#1a3a2f',
        background_color: '#0f1f1a',
        display: 'standalone',
        orientation: 'portrait',
        start_url: base,
        scope: base,
        icons: [
          {
            src: 'pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  build: {
    // Stable names so the source index.html can boot these on GitHub Pages
    // when Pages is still set to "Deploy from branch" → main.
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/app.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: (info) =>
          info.name?.endsWith('.css') ? 'assets/app.css' : 'assets/[name][extname]',
      },
    },
  },
})
