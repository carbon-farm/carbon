import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Charter Constraint C2/C3: low-literacy, low-bandwidth farmer flows —
// PWA-first per 16-Appendix/Timeline-Technology-Security.md's stack choice,
// so the app is installable and can cache a farmer's in-progress work later
// (Case Draft persistence is Stage 2, once Case Management exists).
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'favicon-32.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Organic Carbon Farming / ఆర్గానిక్ కార్బన్ ఫార్మింగ్',
        short_name: 'Carbon Farming',
        description: 'Organic Carbon Farming / ఆర్గానిక్ కార్బన్ ఫార్మింగ్',
        theme_color: '#2F6D4F',
        background_color: '#EFF1E6',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        lang: 'te',
        categories: ['agriculture', 'shopping', 'education'],
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          // Full-bleed artwork with the leaf inside the safe zone, so Android can crop it round or square.
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'Marketplace / మార్కెట్‌ప్లేస్', url: '/marketplace', icons: [{ src: '/icon-192.png', sizes: '192x192' }] },
          { name: 'Help / సహాయం', url: '/help', icons: [{ src: '/icon-192.png', sizes: '192x192' }] },
        ],
      },
    }),
  ],
  server: {
    port: 7001,
  },
  build: {
    rollupOptions: {
      output: {
        // Libraries change rarely; keeping them in their own files lets a phone reuse them from its
        // cache when only the app's own code changes.
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          qr: ['react-qr-code'],
        },
      },
    },
  },
});
