import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '/product-images': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '/server/src/data/product-images': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
});
