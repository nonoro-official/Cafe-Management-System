import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Served under /admin/ by the nginx reverse proxy in production so the
  // customer kiosk can own the root path. Harmless in dev (Vite still serves
  // at the dev port).
  base: '/admin/',
  plugins: [react()],
  server: {
    port: 5174,
    open: false,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
