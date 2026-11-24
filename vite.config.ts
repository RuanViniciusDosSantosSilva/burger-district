import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: { alias: { '@': resolve(__dirname, 'src') } },
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        studio: resolve(__dirname, 'studio.html'),
      },
      output: {
        manualChunks: {
          three: ['three'],
          motion: ['framer-motion', 'gsap'],
        },
      },
    },
  },
});
