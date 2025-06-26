import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';

const API_BASE_URL = 'https://localhost:7111/api/';
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    'import.meta.env.API_BASE_URL': JSON.stringify(API_BASE_URL),
  }, 
  server: {
    port: 5173,
  }
})
