import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/profile': 'http://localhost:8787',
      '/products': 'http://localhost:8787',
      '/plan': 'http://localhost:8787',
      '/portfolio': 'http://localhost:8787',
      '/orders': 'http://localhost:8787',
      '/agent': 'http://localhost:8787',
      '/audit': 'http://localhost:8787',
      '/sandbox': 'http://localhost:8787',
      '/health': 'http://localhost:8787'
    }
  }
});
