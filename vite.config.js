import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mockWpJson from './vite-plugin-mock-wp.js';

export default defineConfig({
  plugins: [react(), mockWpJson()],
  server: {
    port: 5173,
    strictPort: true,
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
});
