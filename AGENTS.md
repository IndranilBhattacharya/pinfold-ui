# AGENTS.md: pinfold-ui

Binding rules for AI agents and contributors working on the Pinfold website.
Product rules live in the library repo: read `../pinfold/AGENTS.md` and `../pinfold/docs/DECISIONS.md` first.

## What this repo is
The public site at `pinfold.indranildev.in`: docs, playground, palette and theme studio,
CLI command builder, and hosting for the registry and `llms.txt`. Spec: [docs/SITE.md](docs/SITE.md).

## Rules
1. **The library is the source of truth.** Component APIs, meta, schema, registry JSON and
   `llms.txt` come from the library (from source in development, from the npm package in
   production). Never hand-copy an API table or default value into the site.
2. **The playground is for a quick feel.** It shows shape, variants, style pack, animation,
   behaviour, light/dark, RTL, reduced motion and container width. It **never** shows raw sizes
   (`dimensions`, width, height, padding). Controls are generated from `<name>.meta.ts` (A8).
3. **Every code sample has a TS tab and a JS tab.**
4. **Vue and Angular** may be described as *coming in the future*. Never as available.
5. **Credit.** The footer carries "Created by Indranil Bhattacharya" and links to the MIT license.
6. The site follows the library's accessibility gate: it is keyboard-complete, passes axe, and
   handles reduced motion and forced colours.
7. Never deploy, push, or change DNS unless the owner asks.

## Development
Vite aliases resolve `@pinfold/*` to `../pinfold/packages/*/src`, so the
site always runs on the library's current source. Both repos must sit side by side.
