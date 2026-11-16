import * as React from 'react';
import { ArrowRight, Check, CircleCheck, Contrast, Keyboard, Layers, MonitorSmartphone, MousePointerClick, ScanEye, ShieldCheck, Sparkles, Wand2, Zap } from 'lucide-react';
import { defineTabs } from '@pinfold/react/tabs';
import { defineAlert } from '@pinfold/react/alert';
import { defineCard } from '@pinfold/react/card';
import { defineButton } from '@pinfold/react/button';
import { version } from '@pinfold/core';
import { CodeBlock } from '../site/CodeBlock';
import { Brand, PageIcon, type BrandName } from '../site/icons';
import { docsHref } from '../site/router';
import { COMPONENTS } from '../site/nav';
import { Guide, P, Section } from './parts';
import { PrevNext } from './ComponentPage';

const PmTabs = defineTabs({ variant: 'underline', size: 'sm' });
const Note = defineAlert({ variant: 'soft', tone: 'info' });
const Tip = defineAlert({ variant: 'soft', tone: 'success' });
const Feature = defineCard({ variant: 'outline' });
const Go = defineButton({ variant: 'soft', size: 'sm' });

const SITE = 'https://pinfold.indranildev.in';

/** One command in every package manager, as tabs with each manager's mark. */
function PackageManagers({ npm, label = 'Package manager' }: { npm: string; label?: string }) {
  const managers: Array<[BrandName, string]> = [
    ['npm', npm],
    ['pnpm', npm.replace(/^npm install/, 'pnpm add').replace(/^npx /, 'pnpm dlx ')],
    ['yarn', npm.replace(/^npm install/, 'yarn add').replace(/^npx /, 'yarn dlx ')],
    ['bun', npm.replace(/^npm install/, 'bun add').replace(/^npx /, 'bunx ')],
  ];
  return (
    <PmTabs
      label={label}
      className="dx-pm"
      items={managers.map(([pm, cmd]) => ({ id: pm, label: pm, icon: <Brand name={pm} size={14} />, content: <CodeBlock code={cmd} language="bash" /> }))}
    />
  );
}

function Steps({ children }: { children: React.ReactNode }) {
  return <ol className="dx-steps">{children}</ol>;
}
function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <li className="dx-step">
      <h3 className="dx-step__title" id={`step-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
        {title}
      </h3>
      <div className="dx-step__body">{children}</div>
    </li>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="dx-feature-grid">{children}</div>;
}
function Point({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="dx-point">
      <span className="dx-point__icon">{icon}</span>
      <h3 className="dx-point__title">{title}</h3>
      <p className="dx-point__text">{children}</p>
    </div>
  );
}

/* ------------------------------------------------------------------------------------ introduction */

const INTRO_CODE = `import { defineTable } from '@pinfold/react/table';

export const Orders = defineTable({ sortable: true, filterable: true, toolbar: true });

export function Example() {
  return <Orders label="Orders" rows={orders} pageSize={25} />;
}`;

function Introduction() {
  return (
    <Guide title="Introduction" icon={<PageIcon name="introduction" size={26} />} lede="Pinfold is a React component library where every component is built from one typed config object. You describe what you want; Pinfold handles the markup, the keyboard, the ARIA, the motion and the styles.">
      <Section id="what" title="What it is">
        <P>{`${COMPONENTS.length} components, from a button to a data grid that scrolls a billion rows. Each one is a hook (\`useTable\`) and a preset (\`defineTable\`) that take the same config. A preset is defined once, outside your components, and used anywhere, Server Components included.`}</P>
        <CodeBlock code={INTRO_CODE} file="Orders" />
      </Section>
      <Section id="why" title="Why config">
        <Grid>
          <Point icon={<Zap size={18} />} title="Less to write">
            A twelve-row accordion is twelve lines of data, not sixty lines of nested markup. The code you keep is the code that is about your product.
          </Point>
          <Point icon={<ShieldCheck size={18} />} title="Correct by default">
            Roles, names, focus order and keyboard come from the component, so they are right everywhere and checked on every build.
          </Point>
          <Point icon={<Wand2 size={18} />} title="Never boxed in">
            Every part has a name: add a class, merge props, or render it with your own component. The headless hook gives you all the state with no markup.
          </Point>
          <Point icon={<Sparkles size={18} />} title="Easy for agents">
            A config is the cheapest thing for a model to write correctly. JSON Schema, llms.txt and an MCP server describe every option.
          </Point>
        </Grid>
      </Section>
      <Section id="forms" title="Preset or hook?">
        <P>{'Every component comes in two forms with the same config. Start with the preset: define it once, outside your components, and use it anywhere, in loops and in Server Components. Reach for the hook only in a client component that needs the controller. React hooks cannot run in Server Components, which is why the preset is the default.'}</P>
        <CodeBlock
          file="forms"
          code={`import { defineButton, useButton } from '@pinfold/react/button';

// The preset (default): defined once, used anywhere, Server Components included.
export const Save = defineButton({ tone: 'success' });
<Save label="Save" onClick={save} />

// The hook, in a client component: the same config, plus a controller.
function Editor() {
  const Publish = useButton({ label: 'Publish', onClick: publish });
  return <><Publish /><p>{Publish.loading ? 'Publishing…' : 'Ready'}</p></>;
}`}
        />
      </Section>
      <Section id="levels" title="Four levels, one config">
        <P>{'Start with the config. Reach further only when you need to; the config never changes shape.'}</P>
        <div className="dx-levels">
          {[
            ['Preset', 'defineButton({ variant, tone }) once, then <Danger label="Delete" /> anywhere.'],
            ['Hook', 'In a client component, useAccordion({ items }) also returns the controller: openAll(), value, focusItem().'],
            ['Parts', 'Rename, restyle or replace any part with classNames, slotProps or render.'],
            ['Headless', 'Prop getters with every ARIA attribute, for markup that is entirely yours.'],
          ].map(([t, d], i) => (
            <div key={t} className="dx-level">
              <span className="dx-level__n">{i + 1}</span>
              <strong>{t}</strong>
              <span>{d}</span>
            </div>
          ))}
        </div>
      </Section>
      <Section id="next" title="Next steps">
        <div className="dx-next">
          <Go label="Install Pinfold" href={docsHref('installation')} endIcon={<ArrowRight size={14} />} />
          <Go label="Pick your colours" href={docsHref('theming')} variant="outline" />
          <Go label="Set up your agent" href={docsHref('ai')} variant="outline" />
        </div>
      </Section>
      <PrevNext name="introduction" />
    </Guide>
  );
}

/* ------------------------------------------------------------------------------------ installation */

function Installation() {
  return (
    <Guide title="Installation" icon={<PageIcon name="installation" size={26} />} lede="Two packages and one stylesheet per component. The CLI does all of it for you, or you can do it by hand in under a minute.">
      <Section id="cli" title="With the CLI">
        <P>{'`init` detects Next.js, Vite, React Router, Remix, Gatsby or Astro, TypeScript or JavaScript, Tailwind and your package manager. It shows a diff before writing anything and never overwrites a file.'}</P>
        <PackageManagers npm="npx pinfold init" />
        <P>{'Then add components. Each one becomes a small file you own in `components/ui`, and the stylesheets it needs are imported for you.'}</P>
        <PackageManagers npm="npx pinfold add button table" label="Add components" />
      </Section>
      <Section id="manual" title="By hand">
        <Steps>
          <Step title="Install the packages">
            <PackageManagers npm="npm install @pinfold/react @pinfold/css" />
          </Step>
          <Step title="Import the styles once">
            <P>{'In your app entry (`app/layout.tsx`, `src/main.tsx`): the core, then each component you use. Styles live in a CSS cascade layer, so your own CSS and Tailwind utilities always win.'}</P>
            <CodeBlock language="ts" langToggle={false} title="app/layout.tsx" code={`import '@pinfold/css/core.css';\nimport '@pinfold/css/button.css';\nimport '@pinfold/css/table.css';`} />
          </Step>
          <Step title="Use a component">
            <CodeBlock file="Example" code={`import { defineButton } from '@pinfold/react/button';\n\nexport const Save = defineButton({ variant: 'solid', tone: 'primary' });\n\nexport function Example() {\n  return <Save label="Save changes" onClick={save} />;\n}`} />
          </Step>
          <Step title="Optional: a provider">
            <P>{'Wrap the app to set the colour mode, a style pack, a size or a tone for everything. Every option is optional.'}</P>
            <CodeBlock file="layout" code={`import { PinfoldProvider } from '@pinfold/react';\nimport '@pinfold/css/packs.css';\n\nexport default function Layout({ children }: { children: React.ReactNode }) {\n  return <PinfoldProvider theme="system" stylePack="glass">{children}</PinfoldProvider>;\n}`} />
          </Step>
        </Steps>
      </Section>
      <Section id="requirements" title="Requirements">
        <ul className="dx-list">
          <li>React 18 or 19, with or without Server Components.</li>
          <li>TypeScript 4.7 or newer for the types (JavaScript works too).</li>
          <li>Browsers from Baseline 2023: current Chrome, Edge, Firefox and Safari.</li>
          <li>No runtime dependencies besides React.</li>
        </ul>
      </Section>
      <PrevNext name="installation" />
    </Guide>
  );
}

/* ------------------------------------------------------------------------------------------- CLI */

function Cli() {
  const commands: Array<[string, string, string]> = [
    ['init', 'npx pinfold init', 'Set up a project: language, components folder, theme, CSS imports, provider and Tailwind. `--yes` accepts the defaults, `--components a,b|all` adds some, `--dir src/ui` picks the folder and remembers it.'],
    ['add', 'npx pinfold add table', 'Add components. Writes `components/ui/<name>.tsx` (or `.jsx`) and imports its stylesheet and those of every component it draws inside. An unknown name stops with a suggestion and writes nothing.'],
    ['theme', 'npx pinfold theme --primary "#4f46e5" --style glass --radius lg', 'Generate the theme CSS from your colours, in any CSS format, with a contrast check (`--check`). `--format tailwind|dtcg` for Tailwind v4 or design tokens.'],
    ['doctor', 'npx pinfold doctor', 'Check the setup: React version, CSS order, the provider, `use client` boundaries, browser targets and duplicate packages.'],
    ['mcp', 'npx pinfold mcp', 'Run the local MCP server for coding agents. See AI and MCP.'],
  ];
  return (
    <Guide title="CLI" icon={<PageIcon name="cli" size={26} />} lede="A small, careful CLI: it shows a diff before writing, never overwrites your files, and running a command twice changes nothing the second time.">
      {commands.map(([name, cmd, text]) => (
        <Section key={name} id={name} title={name}>
          <P>{text}</P>
          <CodeBlock code={cmd} language="bash" />
        </Section>
      ))}
      <Section id="safety" title="Safety rules">
        <ul className="dx-list dx-list--checks">
          {['Never overwrites a file: merges into it or writes a new one.', '`--dry-run` prints the diff only. `--yes` skips the prompts for CI.', 'Uses the package manager your lockfile names, and no other network.', 'Files you own (`components/ui/*`, `pinfold.config.*`) are created once and then left alone.'].map((t) => (
            <li key={t}>
              <Check size={15} aria-hidden="true" /> <span>{t.replace(/`/g, '')}</span>
            </li>
          ))}
        </ul>
      </Section>
      <PrevNext name="cli" />
    </Guide>
  );
}

/* ---------------------------------------------------------------------------------------- tailwind */

function Tailwind() {
  return (
    <Guide title="Tailwind CSS" icon={<PageIcon name="tailwind" size={26} />} lede="Pinfold and Tailwind share one palette, and your utilities always win without a plugin or !important.">
      <Section id="layers" title="Utilities just win">
        <P>{'Pinfold styles live in the `pinfold` cascade layer. Unlayered CSS beats layered CSS at any specificity, so a utility on any part overrides the library.'}</P>
        <CodeBlock file="Faq" code={`<Faq className="mt-8 max-w-2xl" classNames={{ trigger: 'px-6 text-base' }} />`} />
      </Section>
      <Section id="v4" title="Tailwind v4">
        <CodeBlock language="css" title="app.css" code={`@import "tailwindcss";\n@import "@pinfold/css/tailwind.css";`} />
      </Section>
      <Section id="v3" title="Tailwind v3">
        <CodeBlock language="js" langToggle={false} title="tailwind.config.js" code={`module.exports = {\n  presets: [require('@pinfold/css/tailwind')],\n};`} />
        <P>{'`bg-primary-600`, `text-content-muted`, `border-line`, `rounded-lg` and `shadow-md` all resolve to the same `--pinfold-*` variables, so `npx pinfold theme` moves both.'}</P>
      </Section>
      <PrevNext name="tailwind" />
    </Guide>
  );
}

/* ------------------------------------------------------------------------------------------ shadcn */

function Shadcn() {
  return (
    <Guide title="shadcn registry" icon={<Brand name="shadcn" size={26} />} lede="Every Pinfold component is in a shadcn registry. If your project uses shadcn, add Pinfold components with the command you already know.">
      <Section id="setup" title="Add the registry">
        <P>{'Name the registry once in `components.json`:'}</P>
        <CodeBlock language="json" title="components.json" code={`{\n  "registries": {\n    "@pinfold": "${SITE}/r/{name}.json"\n  }\n}`} />
      </Section>
      <Section id="add" title="Add components">
        <PackageManagers npm="npx shadcn@latest add @pinfold/table" />
        <P>{'It writes `components/ui/table.tsx`, installs `@pinfold/react` and `@pinfold/css`, and imports every stylesheet the component needs (a table also draws checkboxes, pages, menus and date pickers). The file is yours: change shared defaults in one place.'}</P>
        <Tip title="Without the registry entry" description={`npx shadcn@latest add ${SITE}/r/table.json works too.`} />
      </Section>
      <Section id="index" title="Everything in the registry">
        <P>{`The index lists all ${COMPONENTS.length} components: ${SITE}/r/registry.json. Each item is built from the component's metadata at release, so it always matches the published version.`}</P>
        <CodeBlock language="bash" code={`curl ${SITE}/r/registry.json`} />
      </Section>
      <Section id="variables" title="shadcn colours">
        <P>{'Already themed with shadcn variables? `@pinfold/css/shadcn.css` maps them onto Pinfold, so both follow the same theme.'}</P>
        <CodeBlock language="ts" langToggle={false} title="app/layout.tsx" code={`import '@pinfold/css/shadcn.css';`} />
      </Section>
      <PrevNext name="shadcn" />
    </Guide>
  );
}

/* ---------------------------------------------------------------------------------------------- AI */

function Ai() {
  const clients: Array<{ id: string; name: string; brand?: BrandName; file: string; code: string; language: string }> = [
    { id: 'claude', name: 'Claude Code', brand: 'claude', file: 'Terminal', code: 'claude mcp add pinfold -- npx -y pinfold mcp', language: 'bash' },
    { id: 'cursor', name: 'Cursor', brand: 'cursor', file: '.cursor/mcp.json', code: `{\n  "mcpServers": {\n    "pinfold": { "command": "npx", "args": ["-y", "pinfold", "mcp"] }\n  }\n}`, language: 'json' },
    { id: 'vscode', name: 'VS Code', file: '.vscode/mcp.json', code: `{\n  "servers": {\n    "pinfold": { "type": "stdio", "command": "npx", "args": ["-y", "pinfold", "mcp"] }\n  }\n}`, language: 'json' },
    { id: 'windsurf', name: 'Windsurf', brand: 'windsurf', file: '~/.codeium/windsurf/mcp_config.json', code: `{\n  "mcpServers": {\n    "pinfold": { "command": "npx", "args": ["-y", "pinfold", "mcp"] }\n  }\n}`, language: 'json' },
  ];
  const tools: Array<[string, string]> = [
    ['search_components', 'Find components from plain words: "date range", "file drop".'],
    ['list_components', 'Every component with its import path.'],
    ['get_component', 'The full reference: usage, every option with its default, parts, keyboard and ARIA.'],
    ['get_schema', 'The JSON Schema of a config, to generate or check one.'],
    ['validate_config', 'Check a config: unknown keys with a suggestion, wrong types, bad values.'],
    ['get_install_steps', 'The commands, and the exact stylesheets a component needs.'],
  ];
  return (
    <Guide title="AI and MCP" icon={<PageIcon name="ai" size={26} />} lede="Coding agents write better UI with Pinfold: a config is easy to get right, and the real API is one tool call away. Everything runs locally and matches the version you installed.">
      <Section id="mcp" title="MCP server">
        <P>{'`npx pinfold mcp` is a local Model Context Protocol server. It reads the metadata of the installed packages, so your agent never sees an option that does not exist. Nothing is hosted, and every tool only reads.'}</P>
        <PmTabs
          label="Client"
          items={clients.map((c) => ({ id: c.id, label: c.name, icon: c.brand ? <Brand name={c.brand} size={14} /> : undefined, content: <CodeBlock code={c.code} language={c.language} title={c.file} /> }))}
        />
      </Section>
      <Section id="tools" title="Tools">
        <div className="dx-tools">
          {tools.map(([name, text]) => (
            <div key={name} className="dx-tool">
              <code>{name}</code>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </Section>
      <Section id="llms" title="llms.txt and JSON Schema">
        <P>{`Plain-text docs for models: ${SITE}/llms.txt (an index) and ${SITE}/llms-full.txt (every option of every component). The same files ship inside @pinfold/react, matching the installed version. Each component also has a JSON Schema at /schema/<name>.json.`}</P>
        <CodeBlock language="bash" code={`curl ${SITE}/llms.txt\ncurl ${SITE}/schema/table.json`} />
      </Section>
      <Section id="prompt" title="A good first prompt">
        <CodeBlock language="text" langToggle={false} showPinfold={false} title="Prompt" code={`Use Pinfold (@pinfold/react) for UI. Call search_components to find the right component,\nget_component before writing code, and validate_config on every config you write.\nPrefer define<Name>() presets outside components.`} />
      </Section>
      <PrevNext name="ai" />
    </Guide>
  );
}

/* ----------------------------------------------------------------------------------- accessibility */

function AccessibilityGuide() {
  return (
    <Guide title="Accessibility" icon={<PageIcon name="accessibility" size={26} />} lede="Pinfold targets WCAG 2.2 AA. Not as a promise in a README: every build renders every component and fails if a check does.">
      <Section id="checked" title="Checked on every build">
        <Grid>
          <Point icon={<ScanEye size={18} />} title="axe, light and dark">
            Every component, in every style pack, in both colour modes, with zero violations allowed.
          </Point>
          <Point icon={<Keyboard size={18} />} title="Keyboard">
            Each widget follows its WAI-ARIA pattern: arrows, Home and End, typeahead, Escape, focus that returns where it came from.
          </Point>
          <Point icon={<Contrast size={18} />} title="Contrast">
            Text 4.5:1, controls and focus rings 3:1, measured in the browser, also for the colours you choose.
          </Point>
          <Point icon={<MonitorSmartphone size={18} />} title="Forced colours and motion">
            Windows high contrast keeps outlines; reduced motion stills every animation that is not essential.
          </Point>
          <Point icon={<MousePointerClick size={18} />} title="Target size">
            Controls are at least 24 by 24 pixels, the WCAG 2.2 minimum, also when small.
          </Point>
          <Point icon={<Layers size={18} />} title="Right to left">
            Layout, arrows and keyboard direction mirror for RTL languages.
          </Point>
        </Grid>
      </Section>
      <Section id="your-part" title="Your part">
        <ul className="dx-list dx-list--checks">
          {['Give every component its `label`: it is the accessible name, even when it is hidden.', 'Keep the heading order: components with a title take a `headingLevel`.', 'Test with a screen reader too; automated checks find about a third of problems.'].map((t) => (
            <li key={t}>
              <CircleCheck size={15} aria-hidden="true" /> <span>{t.replace(/`/g, '')}</span>
            </li>
          ))}
        </ul>
        <Note title="Every component page lists its roles, names and keys" description="See the Accessibility and Keyboard sections at the end of each component." />
      </Section>
      <PrevNext name="accessibility" />
    </Guide>
  );
}

export const GUIDE_PAGES: Record<string, () => React.ReactElement> = {
  introduction: Introduction,
  installation: Installation,
  cli: Cli,
  tailwind: Tailwind,
  shadcn: Shadcn,
  ai: Ai,
  accessibility: AccessibilityGuide,
};

export { Feature, version };
