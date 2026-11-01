# pinfold-ui

The website for [Pinfold](https://github.com/IndranilBhattacharya/pinfold): documentation, the live playground, the palette and theme
studio, and the CLI command builder. It will be served at **pinfold.indranildev.in**.

Created by Indranil Bhattacharya · MIT

## Layout on disk
Both repos must be siblings:
```
UiFramework/
  pinfold/        the library (published to npm)
  pinfold-ui/   this repo
```
In development, `vite.config.ts` aliases the library's package names to `../pinfold/packages/*/src`,
so the site always runs on the library's current source.

## Deploy
**Vercel** builds `main` (and a preview for every pull request) using `vercel.json`. Vercel clones only
this repo, so `scripts/vercel-build.sh` first clones the library into `.pinfold/`. Details: [docs/SITE.md](docs/SITE.md).

## Develop
```bash
npm install       # npm 10 or newer
npm run dev       # http://localhost:5180
npm run build
npm run typecheck
```

## What lives here
See [docs/SITE.md](docs/SITE.md). The library repo is the source of truth for every API.
