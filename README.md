# lumae-site

The website for [Lumae](https://github.com/IndranilBhattacharya/lumae): documentation, the live playground, the palette and theme
studio, and the CLI command builder. It will be served at **lumae.indranildev.in**.

Created by Indranil Bhattacharya · MIT

## Layout on disk
Both repos must be siblings:
```
UiFramework/
  lumae/        the library (published to npm)
  lumae-site/   this repo
```
In development, `vite.config.ts` aliases the library's package names to `../lumae/packages/*/src`,
so the site always runs on the library's current source.

## Deploy
**Vercel** builds `main` (and a preview for every pull request) using `vercel.json`. Vercel clones only
this repo, so `scripts/vercel-build.sh` first clones the library into `.lumae/`. Details: [docs/SITE.md](docs/SITE.md).

## Develop
```bash
npm install       # npm 10 or newer
npm run dev       # http://localhost:5180
npm run build
npm run typecheck
```

## What lives here
See [docs/SITE.md](docs/SITE.md). Agents and contributors: read [AGENTS.md](AGENTS.md) first.
