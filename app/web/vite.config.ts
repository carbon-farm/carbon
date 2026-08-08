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
      manifest: {
        name: 'AgriAI Platform / అగ్రిఏఐ ప్లాట్‌ఫారమ్',
        short_name: 'AgriAI',
        description: 'Digital Agriculture Knowledge & Advisory Platform / డిజిటల్ వ్యవసాయ జ్ఞాన మరియు సలహా వేదిక',
        theme_color: '#2F6D4F',
        background_color: '#EFF1E6',
        display: 'standalone',
        start_url: '/',
        icons: [],
      },
    }),
  ],
  server: {
    port: 7001,
  },
});
