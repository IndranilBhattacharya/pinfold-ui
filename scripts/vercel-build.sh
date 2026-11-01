#!/usr/bin/env sh
# Vercel clones only this repo; the site builds from the library's source.
# Fetch the library's main branch next to it, then build.
set -e
rm -rf .pinfold
git clone --depth 1 https://github.com/IndranilBhattacharya/pinfold.git .pinfold
PINFOLD_PATH="$PWD/.pinfold" npx vite build
