# Site spec

Status: the current app (`src/App.tsx`, `Playground.tsx`, `PaletteStudio.tsx`) is the pre-A8 version.
Items marked **Planned** arrive with the library milestones (see `../lumae/docs/ROADMAP.md`).

## Pages
| Page | Content |
|---|---|
| Home | The promise ("config in, accessible UI out"), a live `<Faq />` demo, install commands, a credit line. Roadmap note: **Vue and Angular support is coming in the future.** |
| Docs | For each component: usage (TS and JS tabs; client hook and server `define*`), a config table generated from meta, keyboard map, ARIA notes, the escape-hatch ladder, the accessibility report. Guides: global config, theming, SSR/RSC, Tailwind, AI agents, compatibility. |
| Playground (Planned, A8) | Pick a component, edit its data as JSON, and adjust **quick-look controls only**: variant, indicator, size, tone, radius, mode and behaviour toggles, animation, style pack, light/dark, RTL, reduced motion, and a container-width slider to show responsiveness. Raw sizes are never shown. State lives in the URL. Copy buttons for the code (TS or JS), the `npx lumae` command and an AI prompt. Export to StackBlitz. |
| Palette and theme studio | Choose OKLCH hues per role, intensity, radius, style pack. See a live contrast report in light and dark mode. Export to CSS, Tailwind v4/v3 or DTCG tokens, or copy the matching `npx lumae theme …` command. A share link (`npx lumae theme --from <url>`). |
| CLI command builder | Build `init`, `add` and `theme` commands with checkboxes and copy the result |
| Registry and AI endpoints (Planned, A7) | `/r/<name>.json` (the shadcn registry), `/llms.txt`, `/llms-full.txt`, `/schema/<name>.json`. All are taken from the published npm package, never hand-written. |

## Rules
- Every API table, default and code sample comes from the library's meta and schema.
- The site meets the library's accessibility gate (keyboard, axe, reduced motion, forced colours).
- Footer: "Created by Indranil Bhattacharya" · MIT · GitHub links to both repos.

## Hosting
A static build deployed to `lumae.indranildev.in`. No server is needed: registry and `llms.txt` are static files.
If the site is down, the shadcn registry falls back to jsDelivr (`cdn.jsdelivr.net/npm/@lumae/react/registry/<name>.json`).
