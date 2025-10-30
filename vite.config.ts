import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['duitama-favicon.png', 'robots.txt', 'duitama-favicon.png'],
      manifest: {
        name: 'DUITAMA',
        short_name: 'DUITAMA',
        description: 'Digital Unified Information of Transaction and Management Accounting',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        start_url: '/',
        display: 'standalone',
        icons: [
          { src: 'duitama-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'duitama-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
})
