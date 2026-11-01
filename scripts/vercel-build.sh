#!/usr/bin/env sh
# Vercel clones only this repo; the site builds from the library's source.
# Fetch the library's main branch next to it, then build.
set -e
rm -rf .lumae
git clone --depth 1 https://github.com/IndranilBhattacharya/lumae.git .lumae
LUMAE_PATH="$PWD/.lumae" npx vite build
