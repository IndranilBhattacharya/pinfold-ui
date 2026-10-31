import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

const pkg = (...p: string[]) => resolve(__dirname, '../lumae/packages', ...p);

// Consumes the sibling library repo's *source* (../lumae) under the real public specifiers, so
// every snippet on the page is copy-pasteable and demos never hit a stale build.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@lumae/core/reset.css', replacement: pkg('core/src/styles/reset.css') },
      { find: '@lumae/core/styles.css', replacement: pkg('core/src/styles/tokens.css') },
      { find: '@lumae/accordion/styles.css', replacement: pkg('accordion/src/accordion.css') },
      { find: '@lumae/core/palette', replacement: pkg('core/src/palette.ts') },
      { find: '@lumae/core', replacement: pkg('core/src/index.ts') },
      { find: '@lumae/accordion', replacement: pkg('accordion/src/index.ts') },
    ],
  },
  server: { port: 5180 },
});
