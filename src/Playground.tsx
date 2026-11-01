import * as React from 'react';
import { PinfoldProvider } from '@pinfold/react';
import { useAccordion } from '@pinfold/react/accordion';
import type { AccordionConfig, AccordionItemConfig } from '@pinfold/react/accordion';
import { accordionMeta, type PropMeta } from '@pinfold/core/meta';
import {
  accordionRowsJoined,
  inactiveAccordionOptions,
  type AccordionAppearanceInput,
  type AccordionVariantName,
  type PinfoldStylePack,
} from '@pinfold/core';

/**
 * Playground v2. The controls come from `accordionMeta` (props marked
 * `control: true`), so they can never drift from the library. Quick-look only:
 * shape, behaviour and environment, never raw sizes. Everything lives in the
 * URL (`?play=`), so a link reproduces the exact state.
 */

const START_ITEMS: AccordionItemConfig[] = [
  { id: 'plan', title: 'Choose a plan', description: 'Monthly or yearly, cancel anytime', badge: 'Step 1', content: 'Yearly saves two months. Both plans include every component.' },
  { id: 'theme', title: 'Pick your palette', badge: 'Step 2', content: 'npx pinfold theme --primary emerald --radius lg' },
  { id: 'ship', title: 'Ship it', content: 'One import, one config object, done.' },
];

const CONTROLS = Object.entries(accordionMeta.props).filter(([, p]) => p.control) as Array<[string, PropMeta]>;
const DEFAULTS = Object.fromEntries(CONTROLS.map(([k, p]) => [k, p.default])) as Record<string, unknown>;
const PACKS: PinfoldStylePack[] = ['default', 'glass', 'material', 'noise', 'brutalist'];

interface Env {
  stylePack: PinfoldStylePack;
  theme: 'light' | 'dark';
  rtl: boolean;
  reducedMotion: boolean;
  width: number;
  /**
   * Demo icons. JSON can carry a string icon per row (an emoji, or an icon-font name with
   * `classNames.icon`); React icons are nodes, so the playground supplies sample ones.
   */
  icons: 'none' | 'every row' | 'per row';
}
interface State {
  source: string;
  options: Record<string, unknown>;
  env: Env;
}

const INITIAL: State = {
  source: JSON.stringify(START_ITEMS, null, 2),
  // The library defaults, untouched: what you see first is what `useAccordion({ items })` renders.
  options: { ...DEFAULTS },
  env: { stylePack: 'default', theme: 'dark', rtl: false, reducedMotion: false, width: 100, icons: 'none' },
};

/** Sample line icons (plain inline SVG, like any icon set you would pass in). */
const GLYPHS: Record<string, React.ReactNode> = {
  sparkle: <path d="M8 2.5 9.4 6.6 13.5 8 9.4 9.4 8 13.5 6.6 9.4 2.5 8 6.6 6.6Z" />,
  card: <><rect x="2" y="4" width="12" height="8.5" rx="1.5" /><path d="M2 7h12" /></>,
  palette: <><path d="M8 2.5a5.5 5.5 0 1 0 0 11c.9 0 1.2-.6 1.2-1.2 0-.9-.6-1.1-.6-1.8 0-.6.5-1 1.1-1H11a2.5 2.5 0 0 0 2.5-2.5C13.5 4.6 11 2.5 8 2.5Z" /><circle cx="5.5" cy="7" r=".6" fill="currentColor" /><circle cx="8" cy="5.2" r=".6" fill="currentColor" /></>,
  send: <path d="M13.5 2.5 2.5 7l4.5 2 2 4.5Zm0 0L7 9" />,
};
function Glyph({ name }: { name: keyof typeof GLYPHS }) {
  return (
    <svg viewBox="0 0 16 16" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {GLYPHS[name]}
    </svg>
  );
}
const PER_ROW = ['card', 'palette', 'send'] as const;

/* ------------------------------------------------------------- URL state */

const encode = (s: State) => btoa(unescape(encodeURIComponent(JSON.stringify(s)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
function decode(raw: string | null): State | null {
  if (!raw) return null;
  try {
    const s = JSON.parse(decodeURIComponent(escape(atob(raw.replace(/-/g, '+').replace(/_/g, '/')))));
    const env = { ...INITIAL.env, ...s.env };
    // Links from before the icons select stored a boolean.
    if (!['none', 'every row', 'per row'].includes(env.icons)) env.icons = env.icons === true ? 'every row' : 'none';
    return { source: String(s.source), options: { ...DEFAULTS, ...s.options }, env };
  } catch {
    return null;
  }
}

function useUrlState(): [State, React.Dispatch<React.SetStateAction<State>>] {
  const [state, setState] = React.useState<State>(() => decode(new URLSearchParams(location.search).get('play')) ?? INITIAL);
  React.useEffect(() => {
    const url = new URL(location.href);
    url.searchParams.set('play', encode(state));
    history.replaceState(history.state, '', url);
  }, [state]);
  return [state, setState];
}

/* ---------------------------------------------------------------- output */

/** The `auto` choice, with what it resolves to right now. */
function autoLabel(key: string, meta: PropMeta, options: Record<string, unknown>) {
  if (key === 'gap') return `auto (${accordionRowsJoined(options.variant as AccordionVariantName) ? 'none' : 'sm'})`;
  return key === 'itemRadius' ? 'auto (= radius)' : key === 'radius' ? 'auto (theme)' : `auto${meta.auto ? ` (${meta.auto})` : ''}`;
}

/** Options the rest of the config makes invisible (the library's own rule), with the reason. */
const inactiveFor = (options: Record<string, unknown>) => inactiveAccordionOptions(options as AccordionAppearanceInput);

/** Only what differs from the library defaults and has a visible effect, the way a developer would write it. */
function changedOptions(options: Record<string, unknown>) {
  const inactive = inactiveFor(options);
  return Object.entries(options).filter(([k, v]) => v !== DEFAULTS[k] && !(k in inactive));
}

const literal = (v: unknown) => (typeof v === 'string' ? `'${v}'` : String(v));

function providerProps(env: Env) {
  const props = [
    env.stylePack !== 'default' && `stylePack="${env.stylePack}"`,
    env.rtl && 'dir="rtl"',
  ].filter(Boolean);
  return props.length ? props.join(' ') : null;
}

function code(items: unknown, options: Record<string, unknown>, env: Env, lang: 'ts' | 'js') {
  const opts = changedOptions(options).map(([k, v]) => `    ${k}: ${literal(v)},`);
  if (env.icons === 'every row') opts.push('    icon: <SparkleIcon />, // every row; a row\'s own icon wins');
  if (env.icons === 'per row') opts.push('    // per row: items[i].icon = <CardIcon />, or a string such as "🚀" in JSON');
  const data = JSON.stringify(items, null, 2);
  const provider = providerProps(env);
  const lines = [
    lang === 'ts'
      ? "import { useAccordion, type AccordionItemConfig } from '@/components/ui/accordion';"
      : "import { useAccordion } from '@/components/ui/accordion';",
    '',
    lang === 'ts'
      ? `const items: AccordionItemConfig[] = ${data};`
      : `/** @type {import('@pinfold/react/accordion').AccordionItemConfig[]} */\nconst items = ${data};`,
    '',
    'export function Faq() {',
    '  const Faq = useAccordion({',
    '    items,',
    ...opts,
    '  });',
    '  return <Faq />;',
    '}',
  ];
  if (provider) lines.push('', `// Style pack / direction: wrap the app once, e.g. <PinfoldProvider ${provider}>`);
  return lines.join('\n');
}

function command(env: Env) {
  return ['npx pinfold add accordion', env.stylePack !== 'default' ? `npx pinfold theme --style ${env.stylePack}` : null].filter(Boolean).join(' && ');
}

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

/* ------------------------------------------------------------- component */

export function Playground() {
  const [state, setState] = useUrlState();
  const { source, options, env } = state;
  const [tab, setTab] = React.useState<'ts' | 'js'>('ts');
  const [copied, setCopied] = React.useState<string | null>(null);

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
      env.icons === 'every row'
        ? <Glyph name="sparkle" />
        : env.icons === 'per row'
          ? (s) => <Glyph name={PER_ROW[s.index % PER_ROW.length]} /> // a row's own icon still wins
          : undefined,
    // The hook reads context where it is called (here, outside the preview provider), so direction is passed in.
    dir: env.rtl ? 'rtl' : 'ltr',
    value,
    onValueChange: setValue,
  });

  const setOption = (key: string, v: unknown) => setState((s) => ({ ...s, options: { ...s.options, [key]: v } }));
  const setEnv = <K extends keyof Env>(key: K, v: Env[K]) => setState((s) => ({ ...s, env: { ...s.env, [key]: v } }));
  const copy = async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      setCopied('Copy failed: select the text instead');
    }
  };

  const items = parsed.items ?? [];
  const snippet = code(items, options, env, tab);
  const inactive = inactiveFor(options);

  return (
    <div className="dx-play">
      <div className="dx-play__editor">
        <label className="dx-label" htmlFor="cfg">
          items <span className="dx-hint">JSON, the only required option</span>
        </label>
        <textarea
          id="cfg"
          className={`dx-textarea${parsed.error ? ' is-invalid' : ''}`}
          spellCheck={false}
          rows={14}
          value={source}
          onChange={(e) => setState((s) => ({ ...s, source: e.target.value }))}
          aria-describedby={parsed.error ? 'cfg-error' : undefined}
          aria-invalid={!!parsed.error}
        />
        {parsed.error ? (
          <p className="dx-error" id="cfg-error" role="alert">
            {parsed.error}
          </p>
        ) : null}

        <fieldset className="dx-fieldset">
          <legend className="dx-label">Component</legend>
          <div className="dx-opts">
            {CONTROLS.map(([key, meta]) =>
              meta.type === 'boolean' ? (
                <label key={key} className="dx-opt dx-opt--check" title={inactive[key] ?? meta.description} aria-disabled={key in inactive}>
                  <input type="checkbox" checked={!!options[key]} disabled={key in inactive} onChange={(e) => setOption(key, e.target.checked)} />
                  <span>{key}</span>
                </label>
              ) : (
                <label key={key} className="dx-opt" title={inactive[key] ?? meta.description} aria-disabled={key in inactive}>
                  <span>{key}</span>
                  <select
                    className="dx-select"
                    disabled={key in inactive}
                    value={options[key] === undefined ? '' : String(options[key])}
                    onChange={(e) => setOption(key, e.target.value === '' ? undefined : e.target.value)}
                  >
                    {/* No library default means "inherit the theme": offer that instead of a fixed value. */}
                    {meta.default === undefined ? <option value="">{autoLabel(key, meta, options)}</option> : null}
                    {meta.values!.map((v) => (
                      <option key={String(v)} value={String(v)}>
                        {String(v)}
                      </option>
                    ))}
                  </select>
                </label>
              ),
            )}
          </div>
          {Object.keys(inactive).length ? (
            <ul className="dx-hint dx-inactive">
              {Object.entries(inactive).map(([k, why]) => (
                <li key={k}>
                  <b>{k}</b>: {why.replace(/`/g, '')}
                </li>
              ))}
            </ul>
          ) : null}
        </fieldset>

        <fieldset className="dx-fieldset">
          <legend className="dx-label">Environment</legend>
          <div className="dx-opts">
            <label className="dx-opt">
              <span>style pack</span>
              <select className="dx-select" value={env.stylePack} onChange={(e) => setEnv('stylePack', e.target.value as PinfoldStylePack)}>
                {PACKS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>
            <label className="dx-opt">
              <span>colour mode</span>
              <select className="dx-select" value={env.theme} onChange={(e) => setEnv('theme', e.target.value as Env['theme'])}>
                <option>light</option>
                <option>dark</option>
              </select>
            </label>
            <label className="dx-opt dx-opt--check">
              <input type="checkbox" checked={env.rtl} onChange={(e) => setEnv('rtl', e.target.checked)} />
              <span>right-to-left</span>
            </label>
            <label className="dx-opt dx-opt--check">
              <input type="checkbox" checked={env.reducedMotion} onChange={(e) => setEnv('reducedMotion', e.target.checked)} />
              <span>reduced motion</span>
            </label>
            <label className="dx-opt" title="A row's own icon (e.g. &quot;icon&quot;: &quot;🚀&quot; in the JSON) always wins.">
              <span>icons</span>
              <select className="dx-select" value={env.icons} onChange={(e) => setEnv('icons', e.target.value as Env['icons'])}>
                <option>none</option>
                <option>every row</option>
                <option>per row</option>
              </select>
            </label>
            <label className="dx-opt dx-opt--wide">
              <span>
                container width <b>{env.width}%</b>
              </span>
              <input type="range" min={30} max={100} value={env.width} onChange={(e) => setEnv('width', Number(e.target.value))} />
            </label>
          </div>
        </fieldset>

        <button type="button" className="dx-btn" onClick={() => setState(INITIAL)}>
          Reset
        </button>
      </div>

      <div className="dx-play__preview">
        <PinfoldProvider theme={env.theme} stylePack={env.stylePack} dir={env.rtl ? 'rtl' : 'ltr'} disableAnimation={env.reducedMotion} className="dx-stage dx-stage--live">
          <div className="dx-stage__frame" style={{ width: `${env.width}%` }}>
            {parsed.items ? <Faq /> : <p className="dx-error">Fix the JSON to see the preview.</p>}
          </div>
        </PinfoldProvider>

        <div className="dx-tabs" role="tablist" aria-label="Code language">
          {(['ts', 'js'] as const).map((lang) => (
            <button key={lang} type="button" role="tab" aria-selected={tab === lang} className="dx-tab" onClick={() => setTab(lang)}>
              {lang === 'ts' ? 'TypeScript' : 'JavaScript'}
            </button>
          ))}
        </div>
        <div className="dx-code dx-code--accent">
          <span className="dx-code__label">components/faq.{tab}x</span>
          <pre>
            <code>{snippet}</code>
          </pre>
        </div>

        <div className="dx-actions">
          <button type="button" className="dx-btn" onClick={() => copy('Code copied', snippet)}>
            Copy code
          </button>
          <button type="button" className="dx-btn" onClick={() => copy('Command copied', command(env))}>
            Copy CLI command
          </button>
          <button type="button" className="dx-btn" onClick={() => copy('Prompt copied', prompt(items, options, env))}>
            Copy AI prompt
          </button>
          <button type="button" className="dx-btn" onClick={() => copy('Link copied', location.href)}>
            Copy link
          </button>
          <button type="button" className="dx-btn" title="Opens a Vite + React project that installs Pinfold from npm" onClick={() => openStackBlitz(items, options, env)}>
            Open in StackBlitz
          </button>
          <span className="dx-hint" role="status" aria-live="polite">
            {copied}
          </span>
        </div>
        <p className="dx-hint">
          <code>{command(env)}</code>
        </p>
      </div>
    </div>
  );
}
