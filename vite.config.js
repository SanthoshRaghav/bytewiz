import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// Multi-page static site. Each marketing page is its own HTML entry point.
export default defineConfig({
  root: '.',
  appType: 'mpa',
  build: {
    target: 'es2019',
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        home: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        ai: resolve(__dirname, 'ai-solutions.html'),
        it: resolve(__dirname, 'it-services.html'),
        contact: resolve(__dirname, 'contact.html'),
      },
    },
  },
});
