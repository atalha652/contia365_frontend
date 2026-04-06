import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Dev: set VITE_APP_API_URL= (empty) in .env so requests go to /api/* and are proxied below (same-origin, no CORS).
// Override proxy target with VITE_DEV_API_PROXY_TARGET if needed.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const devApiTarget =
    env.VITE_DEV_API_PROXY_TARGET ||
    'https://ai-invoice-automate-backend-njgp.onrender.com';

  return {
    plugins: [react()],
    base: '/', // ✅ MUST BE EXACTLY THIS
    build: {
      outDir: 'dist',
    },
    server: {
      proxy: {
        '/api': {
          target: devApiTarget,
          changeOrigin: true,
          secure: true,
        },
      },
    },
  };
});
