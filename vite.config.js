import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mockWpJson from './vite-plugin-mock-wp.js';

// Built assets are referenced relative to the document so the same build
// works at any sub-path (e.g. /amiga/ under devilbox) without having to
// recompile per host.
export default defineConfig({
  base: './',
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
