import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

// Library location: the sibling checkout locally, or PINFOLD_PATH (set by the
// Vercel build, which clones the library into .pinfold/ first).
const LIB = process.env.PINFOLD_PATH ?? resolve(__dirname, '../pinfold');
const pkg = (p: string) => resolve(LIB, 'packages', p);

// Consumes the sibling library repo's *source* (../pinfold) under the real public
// specifiers, so every snippet on the page is copy-pasteable and demos never
// hit a stale build. Exact-match regexes keep '@pinfold/react' from swallowing
// '@pinfold/react/accordion'.
export default defineConfig({
  plugins: [react()],
  resolve: {
    // The library source lives in ../pinfold, which has its own node_modules.
    // Force one copy of React, or hooks break ("Invalid hook call").
    dedupe: ['react', 'react-dom'],
    alias: [
      { find: /^@pinfold\/css\/([a-z-]+)\.css$/, replacement: pkg('css/src/$1.css') },
      { find: /^@pinfold\/core\/palette$/, replacement: pkg('core/src/palette.ts') },
      { find: /^@pinfold\/core$/, replacement: pkg('core/src/index.ts') },
      { find: /^@pinfold\/react$/, replacement: pkg('react/src/index.ts') },
      { find: /^@pinfold\/react\/([a-z-]+)$/, replacement: pkg('react/src/$1/index.ts') },
    ],
  },
  server: { port: 5180 },
});
