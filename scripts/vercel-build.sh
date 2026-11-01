#!/usr/bin/env sh
# Vercel clones only this repo; the site builds from the library's source.
# Fetch the library's main branch next to it, build it (that generates the
# registry, schema and llms files the site serves), then build the site.
set -e
rm -rf .pinfold
git clone --depth 1 https://github.com/IndranilBhattacharya/pinfold.git .pinfold
(cd .pinfold && npm ci --no-audit --no-fund && npm run build)
PINFOLD_PATH="$PWD/.pinfold" npx vite build
