import * as React from 'react';
import { useAccordion } from '@pinfold/react/accordion';
import type { AccordionConfig, AccordionItemConfig } from '@pinfold/react/accordion';
import { accordionMeta, type PropMeta } from '@pinfold/core/meta';
import { accordionRowsJoined, inactiveAccordionOptions, type AccordionAppearanceInput, type AccordionVariantName } from '@pinfold/core';
import { changed, CodePanel, controlsOf, defaultsOf, ENV, EnvControls, Glyph, OptionControls, Pick, reviveEnv, Stage, TextField, Tool, useUrlState, appSetup, type Env } from './shared';

const START_ITEMS: AccordionItemConfig[] = [
  { id: 'plan', title: 'Choose a plan', description: 'Monthly or yearly, cancel anytime', badge: 'Step 1', content: 'Yearly saves two months. Both plans include every component.' },
  { id: 'theme', title: 'Pick your palette', badge: 'Step 2', content: 'npx pinfold theme --primary emerald --radius lg' },
  { id: 'ship', title: 'Ship it', content: 'One import, one config object, done.' },
];

const CONTROLS = controlsOf(accordionMeta);
const DEFAULTS = defaultsOf(CONTROLS);
const PER_ROW = ['card', 'palette', 'send'] as const;

/**
 * Demo icons. JSON can carry a string icon per row (an emoji, or an icon-font name with
 * `classNames.icon`); React icons are nodes, so the playground supplies sample ones.
 */
type Icons = 'none' | 'every row' | 'per row';
interface State {
  source: string;
  options: Record<string, unknown>;
  env: Env;
  icons: Icons;
}

const INITIAL: State = {
  source: JSON.stringify(START_ITEMS, null, 2),
  // The library defaults, untouched: what you see first is what `useAccordion({ items })` renders.
  options: { ...DEFAULTS },
  env: ENV,
  icons: 'none',
};

const revive = (s: any): State => ({
  source: String(s.source ?? INITIAL.source),
  options: { ...DEFAULTS, ...s.options },
  env: reviveEnv(s.env),
  icons: ['none', 'every row', 'per row'].includes(s.icons) ? s.icons : 'none',
});

/** The `auto` choice, with what it resolves to right now. */
function autoLabel(options: Record<string, unknown>) {
  return (key: string, meta: PropMeta) => {
    if (key === 'gap') return `auto (${accordionRowsJoined(options.variant as AccordionVariantName) ? 'none' : 'sm'})`;
    return key === 'itemRadius' ? 'auto (= radius)' : key === 'radius' ? 'theme radius (md by default)' : `auto${meta.auto ? ` (${meta.auto})` : ''}`;
  };
}

const inactiveFor = (options: Record<string, unknown>) => inactiveAccordionOptions(options as AccordionAppearanceInput);
const changedOptions = (options: Record<string, unknown>) => changed(options, DEFAULTS, inactiveFor(options));
const literal = (v: unknown) => (typeof v === 'string' ? `'${v}'` : String(v));

function code(items: unknown, options: Record<string, unknown>, env: Env, icons: Icons, lang: 'ts' | 'js') {
  const opts = changedOptions(options).map(([k, v]) => `  ${k}: ${literal(v)},`);
  if (icons === 'every row') opts.push('  icon: <SparkleIcon />,');
  // Per row, each row without its own icon gets the sample one, written as real JSX in the row.
  const rows = (Array.isArray(items) ? items : []) as Array<Record<string, unknown>>;
  const iconOf = (i: number) => `${PER_ROW[i % PER_ROW.length][0].toUpperCase()}${PER_ROW[i % PER_ROW.length].slice(1)}Icon`;
  const withIcons = icons === 'per row' ? rows.map((row, i) => (row.icon == null ? { ...row, icon: `__ICON_${i}__` } : row)) : rows;
  const data = JSON.stringify(withIcons, null, 2).replace(/"__ICON_(\d+)__"/g, (_, i) => `<${iconOf(Number(i))} />`);
  const names =
    icons === 'every row' ? ['SparkleIcon'] : icons === 'per row' ? [...new Set(withIcons.flatMap((row, i) => (row.icon === `__ICON_${i}__` ? [iconOf(i)] : [])))] : [];
  const lines = [
    lang === 'ts'
      ? "import { defineAccordion, type AccordionItemConfig } from '@/components/ui/accordion';"
      : "import { defineAccordion } from '@/components/ui/accordion';",
    ...(names.length ? [`import { ${names.join(', ')} } from './icons'; // any icon set: lucide, heroicons, your own SVGs`] : []),
    '',
    lang === 'ts' ? `const items: AccordionItemConfig[] = ${data};` : `/** @type {import('@pinfold/react/accordion').AccordionItemConfig[]} */\nconst items = ${data};`,
    '',
    '// Define once, outside components: the look. Use it for every FAQ on the site.',
    opts.length ? 'export const Faq = defineAccordion({' : 'export const Faq = defineAccordion({});',
    ...(opts.length ? [...opts, '});'] : []),
    '',
    '// Use anywhere: <Faq items={items} />, or in a loop over categories.',
    'export function Questions() {',
    '  return <Faq items={items} />;',
    '}',
    '',
    '// Need the controller (Faq.openAll(), Faq.toggle(id))? useAccordion({ ...Faq.config, items }).',
  ];
  lines.push(...appSetup(env));
  return lines.join('\n');
}

const command = (env: Env) => ['npx pinfold add accordion', env.stylePack !== 'default' ? `npx pinfold theme --style ${env.stylePack}` : null].filter(Boolean).join(' && ');

function prompt(items: unknown, options: Record<string, unknown>, env: Env) {
  const config = { items, ...Object.fromEntries(changedOptions(options)) };
  return [
    'Use the Pinfold React UI library (API reference: https://pinfold.indranildev.in/llms.txt).',
    "Build an FAQ with `useAccordion` from '@pinfold/react/accordion' in a client component (or `defineAccordion` in a Server Component), with this config:",
    '```json',
    JSON.stringify(config, null, 2),
    '```',
    env.stylePack !== 'default' ? `Wrap the app in <PinfoldProvider stylePack="${env.stylePack}"> and import '@pinfold/css/packs.css'.` : '',
    "Import '@pinfold/css/core.css' and '@pinfold/css/accordion.css' once in the app entry.",
  ]
    .filter(Boolean)
    .join('\n');
}

/** POST a small Vite + React project to StackBlitz (needs the packages on npm). */
function openStackBlitz(items: unknown, options: Record<string, unknown>, env: Env) {
  const files: Record<string, string> = {
    'package.json': JSON.stringify(
      {
        name: 'pinfold-playground',
        private: true,
        type: 'module',
        scripts: { dev: 'vite' },
        dependencies: { '@pinfold/react': 'latest', '@pinfold/css': 'latest', react: '^19', 'react-dom': '^19' },
        devDependencies: { vite: '^7', '@vitejs/plugin-react': '^5' },
      },
      null,
      2,
    ),
    'vite.config.js': "import react from '@vitejs/plugin-react';\nexport default { plugins: [react()] };\n",
    'index.html': '<!doctype html><html><body><div id="root" style="max-width:40rem;margin:3rem auto"></div><script type="module" src="/src/main.jsx"></script></body></html>\n',
    'src/main.jsx': [
      "import { createRoot } from 'react-dom/client';",
      "import { PinfoldProvider } from '@pinfold/react';",
      "import { useAccordion } from '@pinfold/react/accordion';",
      "import '@pinfold/css/core.css';",
      "import '@pinfold/css/accordion.css';",
      "import '@pinfold/css/packs.css';",
      '',
      `const config = ${JSON.stringify({ items, ...Object.fromEntries(changedOptions(options)) }, null, 2)};`,
      '',
      'function App() {',
      '  const Faq = useAccordion(config);',
      '  return <Faq />;',
      '}',
      '',
      `createRoot(document.getElementById('root')).render(<PinfoldProvider theme="${env.theme}" stylePack="${env.stylePack}" dir="${env.rtl ? 'rtl' : 'ltr'}"><App /></PinfoldProvider>);`,
      '',
    ].join('\n'),
  };
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = 'https://stackblitz.com/run?file=src/main.jsx';
  form.target = '_blank';
  const field = (name: string, value: string) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
  };
  field('project[title]', 'Pinfold accordion');
  field('project[template]', 'node');
  for (const [path, content] of Object.entries(files)) field(`project[files][${path}]`, content);
  document.body.appendChild(form);
  form.submit();
  form.remove();
}

export function AccordionPlayground() {
  const [state, setState] = useUrlState('accordion', INITIAL, revive);
  const { source, options, env, icons } = state;

  const parsed = React.useMemo(() => {
    try {
      const items = JSON.parse(source);
      if (!Array.isArray(items)) throw new Error('`items` must be an array of rows.');
      return { items: items as AccordionItemConfig[], error: null as string | null };
    } catch (e) {
      return { items: null, error: (e as Error).message };
    }
  }, [source]);

  const [value, setValue] = React.useState<string[]>(['plan']);
  const Faq = useAccordion({
    // Only what differs from the defaults, exactly as the generated code below.
    ...(Object.fromEntries(changedOptions(options)) as Partial<AccordionConfig>),
    items: parsed.items ?? [],
    animate: env.reducedMotion ? false : (options.animate as boolean),
    icon:
      icons === 'every row' ? <Glyph name="sparkle" /> : icons === 'per row' ? (s) => <Glyph name={PER_ROW[s.index % PER_ROW.length]} /> : undefined, // a row's own icon still wins
    // The hook reads context where it is called (outside the preview provider), so direction is passed in.
    dir: env.rtl ? 'rtl' : 'ltr',
    value,
    onValueChange: setValue,
  });

  const setOption = (key: string, v: unknown) => setState((s) => ({ ...s, options: { ...s.options, [key]: v } }));
  const setEnv = <K extends keyof Env>(key: K, v: Env[K]) => setState((s) => ({ ...s, env: { ...s.env, [key]: v } }));
  const items = parsed.items ?? [];

  return (
    <div className="dx-play">
      <div className="dx-play__editor">
        <TextField
          label="items"
          description="JSON, the only required option"
          multiline
          rows={14}
          className="dx-code-input"
          value={source}
          error={parsed.error || undefined}
          onChange={(next) => setState((s) => ({ ...s, source: next }))}
        />

        <OptionControls controls={CONTROLS} options={options} setOption={setOption} inactive={inactiveFor(options)} autoLabel={autoLabel(options)} />

        <EnvControls env={env} setEnv={setEnv}>
          <div className="dx-opt" title='A row&apos;s own icon (e.g. "icon": "🚀" in the JSON) always wins.'>
            <Pick label="icons" items={['none', 'every row', 'per row']} value={icons} onChange={(next) => next && setState((s) => ({ ...s, icons: next as Icons }))} />
          </div>
        </EnvControls>

        <Tool label="Reset" onClick={() => setState(INITIAL)} />
      </div>

      <div className="dx-play__preview">
        <Stage env={env}>{parsed.items ? <Faq /> : <p className="dx-error">Fix the JSON to see the preview.</p>}</Stage>
        <CodePanel
          file="components/questions"
          code={(lang) => code(items, options, env, icons, lang)}
          actions={[
            { label: 'Copy CLI command', copy: command(env) },
            { label: 'Copy AI prompt', copy: prompt(items, options, env) },
            { label: 'Open in StackBlitz', title: 'Opens a Vite + React project that installs Pinfold from npm', run: () => openStackBlitz(items, options, env) },
          ]}
          note={
            <p className="dx-hint">
              <code>{command(env)}</code>
            </p>
          }
        />
      </div>
    </div>
  );
}
