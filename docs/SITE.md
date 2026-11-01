# Site spec

Status: the playground is v2 (A8). Docs pages per component, guides and the CLI command builder are
**Planned** (they follow the library milestones, see `../pinfold/docs/ROADMAP.md`). Today the site
is one page: hero, playground, palette studio, the usage levels, variants, headless demo, the config
reference (generated from meta) and the accessibility list (generated from meta).

## Pages
| Page | Content |
|---|---|
| Home | The promise ("config in, accessible UI out"), a live `<Faq />` demo, install commands, a credit line. Roadmap note: **Vue and Angular support is coming in the future.** |
| Docs | For each component: usage (TS and JS tabs; client hook and server `define*`), a config table generated from meta, keyboard map, ARIA notes, the escape-hatch ladder, the accessibility report. Guides: global config, theming, SSR/RSC, Tailwind, AI agents, compatibility. |
| Playground (A8, `src/Playground.tsx`) | Edit the data as JSON. Component controls are generated from `accordionMeta` (props marked `control: true`): mode, collapsible, disabled, variant, size, tone, radius, indicator, indicator position, animate, dividers. Environment: style pack, light/dark, RTL, reduced motion, container width (shows the container queries). Raw sizes are never shown. State lives in the URL (`?play=`). Copy buttons for the code (TS or JS tab, only non-default options), the `npx pinfold` command, an AI prompt and the link. Open in StackBlitz (a Vite + React project that installs Pinfold from npm, so it works once the packages are published). |
| Palette and theme studio | Choose OKLCH hues per role, intensity, radius, style pack. See a live contrast report in light and dark mode. Export to CSS, Tailwind v4/v3 or DTCG tokens, or copy the matching `npx pinfold theme …` command. A share link (`npx pinfold theme --from <url>`). |
| CLI command builder | Build `init`, `add` and `theme` commands with checkboxes and copy the result |
| Registry and AI endpoints | `/r/<name>.json` and `/r/registry.json` (the shadcn registry), `/llms.txt`, `/llms-full.txt`, `/schema/<name>.json`. Served in development and emitted at build by the `pinfold:artifacts` Vite plugin, from the library's build output (generated from meta), never hand-written. |

## Rules
1. **The library is the source of truth.** Component APIs, meta, schema, registry JSON and
   `llms.txt` come from the library (from source in development, from the npm package in
   production). Never hand-copy an API table or default value into the site.
2. **The playground is for a quick feel.** It shows shape, variants, style pack, animation,
   behaviour, light/dark, RTL, reduced motion and container width. It **never** shows raw sizes
   (`dimensions`, width, height, padding). Controls are generated from `<name>.meta.ts`.
3. **Every code sample has a TS tab and a JS tab.**
4. **Vue and Angular** may be described as *coming in the future*. Never as available.
5. **Credit.** The footer carries "Created by Indranil Bhattacharya" and links to the MIT license.
6. The site follows the library's accessibility gate: it is keyboard-complete, passes axe, and
   handles reduced motion and forced colours.

## Hosting
**Vercel**, deploying `main` to `pinfold.indranildev.in` (pull requests get preview URLs). A static
build: no server is needed, because the registry and `llms.txt` are static files. Vercel clones only this
repo, so `scripts/vercel-build.sh` first clones the library's `main` into `.pinfold/` and builds
against it (`PINFOLD_PATH`). GitHub Actions (`ci.yml`) typechecks and builds every push.
If the site is down, the shadcn registry falls back to jsDelivr (`cdn.jsdelivr.net/npm/@pinfold/react/registry/<name>.json`).
