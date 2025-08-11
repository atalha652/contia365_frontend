import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', // ✅ MUST BE EXACTLY THIS
  build: {
    outDir: 'dist'
  }
});
