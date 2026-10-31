import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

const pkg = (p: string) => resolve(__dirname, '../lumae/packages', p);

// Consumes the sibling library repo's *source* (../lumae) under the real public
// specifiers, so every snippet on the page is copy-pasteable and demos never
// hit a stale build. Exact-match regexes keep '@lumae/react' from swallowing
// '@lumae/react/accordion'.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^@lumae\/css\/([a-z-]+)\.css$/, replacement: pkg('css/src/$1.css') },
      { find: /^@lumae\/core\/palette$/, replacement: pkg('core/src/palette.ts') },
      { find: /^@lumae\/core$/, replacement: pkg('core/src/index.ts') },
      { find: /^@lumae\/react$/, replacement: pkg('react/src/index.ts') },
      { find: /^@lumae\/react\/([a-z-]+)$/, replacement: pkg('react/src/$1/index.ts') },
    ],
  },
  server: { port: 5180 },
});
