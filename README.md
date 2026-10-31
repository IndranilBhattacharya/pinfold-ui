# lumae-site

The website for [Lumae](../lumae): documentation, the live playground, the palette and theme
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
so the site always runs on the library's current source. After the first npm publish, production
builds will use the published packages.

## Develop
```bash
npm install       # npm 10 or newer
npm run dev       # http://localhost:5180
npm run build
npm run typecheck
```
Status: the code still imports the working names `@knotui/*`. Milestone A1 renames them to
`@lumae/*` in both repos together.

## What lives here
See [docs/SITE.md](docs/SITE.md). Agents and contributors: read [AGENTS.md](AGENTS.md) first.
