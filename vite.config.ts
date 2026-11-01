import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

// Library location: the sibling checkout locally, or LUMAE_PATH (set by the
// Vercel build, which clones the library into .lumae/ first).
const LIB = process.env.LUMAE_PATH ?? resolve(__dirname, '../lumae');
const pkg = (p: string) => resolve(LIB, 'packages', p);

// Consumes the sibling library repo's *source* (../lumae) under the real public
// specifiers, so every snippet on the page is copy-pasteable and demos never
// hit a stale build. Exact-match regexes keep '@lumae/react' from swallowing
// '@lumae/react/accordion'.
export default defineConfig({
  plugins: [react()],
  resolve: {
    // The library source lives in ../lumae, which has its own node_modules.
    // Force one copy of React, or hooks break ("Invalid hook call").
    dedupe: ['react', 'react-dom'],
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
