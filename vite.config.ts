import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

// Library location: the sibling checkout locally, or PINFOLD_PATH (set by the
// Vercel build, which clones the library into .pinfold/ first).
const LIB = process.env.PINFOLD_PATH ?? resolve(import.meta.dirname, '../pinfold');
const pkg = (p: string) => resolve(LIB, 'packages', p);

/**
 * Registry and AI endpoints, served straight from the library's build output
 * (`npm run build` in the library generates them from component meta), never
 * hand-written: /r/<name>.json (shadcn registry), /schema/<name>.json,
 * /llms.txt and /llms-full.txt.
 */
function pinfoldArtifacts(): Plugin {
  const react = pkg('react');
  const routes = (): Record<string, string> => {
    const out: Record<string, string> = {};
    for (const [dir, prefix] of [['registry', 'r'], ['schema', 'schema']] as const) {
      const abs = join(react, dir);
      if (existsSync(abs)) for (const f of readdirSync(abs)) out[`${prefix}/${f}`] = join(abs, f);
    }
    for (const f of ['llms.txt', 'llms-full.txt']) if (existsSync(join(react, f))) out[f] = join(react, f);
    return out;
  };
  const missing = () => console.warn('[pinfold] registry and llms files not found: run `npm run build` in the library first.');
  return {
    name: 'pinfold:artifacts',
    configureServer(server) {
      if (!Object.keys(routes()).length) missing();
      server.middlewares.use((req, res, next) => {
        const file = routes()[(req.url ?? '').split('?')[0].replace(/^\//, '')];
        if (!file) return next();
        res.setHeader('Content-Type', file.endsWith('.json') ? 'application/json' : 'text/plain; charset=utf-8');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.end(readFileSync(file));
      });
    },
    generateBundle() {
      const all = routes();
      if (!Object.keys(all).length) missing();
      for (const [fileName, file] of Object.entries(all)) this.emitFile({ type: 'asset', fileName, source: readFileSync(file) });
    },
  };
}

// Consumes the sibling library repo's *source* (../pinfold) under the real public
// specifiers, so every snippet on the page is copy-pasteable and demos never
// hit a stale build. Exact-match regexes keep '@pinfold/react' from swallowing
// '@pinfold/react/accordion'.
export default defineConfig(({ mode }) => ({
  plugins: [react(), pinfoldArtifacts()],
  resolve: {
    // The library source lives in ../pinfold, which has its own node_modules.
    // Force one copy of React, or hooks break ("Invalid hook call").
    dedupe: ['react', 'react-dom'],
    alias: [
      { find: /^@pinfold\/css\/([a-z-]+)\.css$/, replacement: pkg('css/src/$1.css') },
      { find: /^@pinfold\/core\/palette$/, replacement: pkg('core/src/palette.ts') },
      { find: /^@pinfold\/core\/meta$/, replacement: pkg('core/src/meta.ts') },
      { find: /^@pinfold\/core$/, replacement: pkg('core/src/index.ts') },
      { find: /^@pinfold\/react$/, replacement: pkg('react/src/index.ts') },
      { find: /^@pinfold\/react\/([a-z-]+)$/, replacement: pkg('react/src/$1/index.ts') },
    ],
  },
  // The library reads process.env.NODE_ENV (dev-only validation); Vite replaces it.
  define: { 'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production' : 'development') },
  server: { port: 5180 },
}));
