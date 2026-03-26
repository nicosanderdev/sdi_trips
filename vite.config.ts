import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@core': path.resolve(__dirname, 'src/core'),
      '@ui': path.resolve(__dirname, 'src/ui/components'),
      '@app-main': path.resolve(__dirname, 'src/app-main'),
      '@app-alt': path.resolve(__dirname, 'src/app-alt'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, 'index.html'),
        appMain: path.resolve(__dirname, 'index-app-main.html'),
        appAlt: path.resolve(__dirname, 'index-app-alt.html'),
      },
    },
  },
});
