import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function htmlMetaByMode(mode: string): Plugin {
  const metaByMode: Record<string, { title: string; favicon: string }> = {
    main: { title: 'En cartelera - Casas', favicon: '/logo-en-cartelera.png' },
    alt: { title: 'En cartelera - Espacios', favicon: '/logo-en-cartelera-alt.png' },
  };
  const meta = metaByMode[mode];
  if (!meta) return { name: 'html-meta-by-mode' };

  return {
    name: 'html-meta-by-mode',
    transformIndexHtml(html) {
      return html
        .replace(/<title>.*?<\/title>/, `<title>${meta.title}</title>`)
        .replace(
          /<link rel="icon"[^>]*>/,
          `<link rel="icon" type="image/png" href="${meta.favicon}" />`,
        );
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), htmlMetaByMode(mode)],
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
}));
