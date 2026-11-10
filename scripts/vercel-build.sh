#!/usr/bin/env sh
# Vercel clones only this repo; the site builds from the library's source.
# Fetch the library's main branch next to it, build only what the site reads
# from dist (core meta, for the artifact script), generate the registry,
# schema and llms files, then build the site.
# ponytail: skips the full @pinfold/react build; its parallel DTS passes OOM
# the 8 GB build machine and the site aliases react/css to source anyway.
set -e
rm -rf .pinfold
git clone --depth 1 https://github.com/IndranilBhattacharya/pinfold.git .pinfold
(cd .pinfold && npm ci --no-audit --no-fund && npm run build -w @pinfold/core && node scripts/generate-artifacts.mjs)
PINFOLD_PATH="$PWD/.pinfold" npx vite build
