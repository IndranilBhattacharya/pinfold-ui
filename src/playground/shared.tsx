import * as React from 'react';
import { reflow } from './example';
import { PinfoldProvider } from '@pinfold/react';
import { defineSelect } from '@pinfold/react/select';
import { defineSwitch } from '@pinfold/react/switch';
import { defineSlider } from '@pinfold/react/slider';
import { defineTabs } from '@pinfold/react/tabs';
import { defineButton } from '@pinfold/react/button';
import type { ComponentMeta, PropMeta } from '@pinfold/core/meta';
import type { PinfoldSize, PinfoldStylePack, PinfoldTone } from '@pinfold/core';

/**
 * Pieces every component playground shares. Controls come from the component's
 * meta (props marked `control: true`), so they cannot drift from the library.
 * State lives in the URL (`?<component>=`), so a link reproduces it.
 */

export const PACKS: PinfoldStylePack[] = ['default', 'glass', 'material', 'noise', 'brutalist'];

export interface Env {
  stylePack: PinfoldStylePack;
  /** Empty: follow the site's light/dark toggle. */
  theme: '' | 'light' | 'dark';
  rtl: boolean;
  reducedMotion: boolean;
  width: number;
  /** Provider size / tone around the preview: what a component uses when its config and the global defaults leave them unset. */
  size: PinfoldSize | '';
  tone: PinfoldTone | '';
}

/** The site's own colour mode, set by the toggle in the header. */
export const SiteMode = React.createContext<'light' | 'dark'>('dark');

export const ENV: Env = { stylePack: 'default', theme: '', rtl: false, reducedMotion: false, width: 100, size: '', tone: '' };

export const controlsOf = (meta: ComponentMeta) => Object.entries(meta.props).filter(([, p]) => p.control) as Array<[string, PropMeta]>;
export const defaultsOf = (controls: Array<[string, PropMeta]>) => Object.fromEntries(controls.map(([k, p]) => [k, p.default])) as Record<string, unknown>;

/** Options that differ from the library defaults and have a visible effect: what a developer would write. */
export function changed(options: Record<string, unknown>, defaults: Record<string, unknown>, inactive: Record<string, string> = {}) {
  return Object.entries(options).filter(([k, v]) => v !== defaults[k] && v !== undefined && !(k in inactive));
}

const encode = (s: unknown) => btoa(unescape(encodeURIComponent(JSON.stringify(s)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
function decode(raw: string | null): any {
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(escape(atob(raw.replace(/-/g, '+').replace(/_/g, '/')))));
  } catch {
    return null;
  }
}

/** Playground state in the URL under `key`; `revive` merges a stored value over the initial one. */
export function useUrlState<S>(key: string, initial: S, revive: (stored: any) => S): [S, React.Dispatch<React.SetStateAction<S>>] {
  const [state, setState] = React.useState<S>(() => {
    const stored = decode(new URLSearchParams(location.search).get(key));
    return stored ? revive(stored) : initial;
  });
  React.useEffect(() => {
    const url = new URL(location.href);
    url.searchParams.set(key, encode(state));
    history.replaceState(history.state, '', url);
  }, [key, state]);
  return [state, setState];
}

export const reviveEnv = (env: unknown): Env => ({ ...ENV, ...(env as object) });
/** A select hands back text; an enum of numbers (`months`, `headingLevel`) wants the number back. */
const typed = (meta: PropMeta, text: string): unknown => meta.values?.find((v) => String(v) === text) ?? text;
const SILENT_HINT = 'No visual change: these set what assistive tech or the keyboard does.';

/* The playground's own controls are Pinfold components: presets defined once, used as one-liners. */
const Pick = defineSelect({ size: 'sm', dimensions: { width: '100%' } });
const Flag = defineSwitch({ size: 'sm' });
const Width = defineSlider({ size: 'sm', min: 30, max: 100, showValue: 'label' });
const Lang = defineTabs({ variant: 'pills', size: 'sm' });
const Tool = defineButton({ variant: 'soft', tone: 'neutral', size: 'sm' });

/** One option as a select: `''` stands for "unset", shown with what it resolves to. */
function Choice({ label, value, values, unset, disabled, title, onChange }: { label: string; value: string; values: ReadonlyArray<{ value: string; label: string }>; unset?: string; disabled?: boolean; title?: string; onChange: (value: string) => void }) {
  // A select reads an empty value as "nothing chosen": "unset" is a real row with a value of its own.
  const UNSET = '(unset)';
  const items = [...(unset !== undefined ? [{ value: UNSET, label: unset }] : []), ...values];
  return (
    <div className="dx-opt" title={title}>
      <Pick label={label} items={items} value={value === '' ? UNSET : value} disabled={disabled} onChange={(next) => onChange(!next || next === UNSET ? '' : next)} />
    </div>
  );
}

/** The meta-driven option controls, with the inactive ones disabled and explained. */
export function OptionControls({
  controls,
  options,
  setOption,
  inactive = {},
  inherit = [],
  autoLabel = (_key, meta) => `auto${meta.auto ? ` (${meta.auto})` : ''}`,
  valueLabel,
}: {
  controls: Array<[string, PropMeta]>;
  options: Record<string, unknown>;
  setOption: (key: string, value: unknown) => void;
  inactive?: Record<string, string>;
  /** Options that may stay unset so the global defaults and the provider decide (precedence). */
  inherit?: string[];
  autoLabel?: (key: string, meta: PropMeta) => string;
  /** A clearer label for a value, e.g. what `auto` resolves to right now. */
  valueLabel?: (key: string, value: string | number) => string | undefined;
}) {
  // Only explain controls shown here; the rest still reach the dev warning.
  const shown = Object.entries(inactive).filter(([k]) => controls.some(([c]) => c === k));
  const visual = controls.filter(([, meta]) => !meta.silent);
  const silent = controls.filter(([, meta]) => meta.silent);
  const control = ([key, meta]: [string, PropMeta], explain: boolean) =>
    meta.type === 'boolean' ? (
      <div key={key} className="dx-opt dx-opt--check" title={(explain && inactive[key]) || meta.description}>
        <Flag label={key} checked={!!options[key]} disabled={explain && key in inactive} onChange={(on) => setOption(key, on)} />
      </div>
    ) : (
      <Choice
        key={key}
        label={key}
        title={(explain && inactive[key]) || meta.description}
        disabled={explain && key in inactive}
        value={options[key] === undefined ? '' : String(options[key])}
        // No library default means "inherit": offer that instead of a fixed value.
        unset={meta.default === undefined || inherit.includes(key) ? autoLabel(key, meta) : undefined}
        values={meta.values!.map((v) => ({ value: String(v), label: valueLabel?.(key, v) ?? String(v) }))}
        onChange={(text) => setOption(key, text === '' ? undefined : typed(meta, text))}
      />
    );
  return (
    <fieldset className="dx-fieldset">
      <legend className="dx-label">Component</legend>
      <div className="dx-opts">{visual.map((entry) => control(entry, true))}</div>
      {silent.length ? (
        <div className="dx-opts dx-silent" title={SILENT_HINT}>
          {silent.map((entry) => control(entry, false))}
          <span className="dx-hint">{SILENT_HINT}</span>
        </div>
      ) : null}
      {shown.length ? (
        <ul className="dx-hint dx-inactive">
          {shown.map(([k, why]) => (
            <li key={k}>
              <b>{k}</b>: {why.replace(/`/g, '')}
            </li>
          ))}
        </ul>
      ) : null}
    </fieldset>
  );
}

/** Style pack, colour mode, direction, motion, width, and optionally the provider size and tone. */
export function EnvControls({
  env,
  setEnv,
  provider: providerProp = false,
  motion = true,
  children,
}: {
  env: Env;
  setEnv: <K extends keyof Env>(key: K, value: Env[K]) => void;
  /** `false` for components with nothing that moves: the reduced-motion control would do nothing. */
  motion?: boolean;
  /** Which provider settings the component follows: `true` for size and tone. */
  provider?: boolean | ReadonlyArray<'size' | 'tone'>;
  children?: React.ReactNode;
}) {
  const site = React.useContext(SiteMode);
  const follows = providerProp === true ? ['size', 'tone'] : providerProp || [];
  const same = (list: readonly string[]) => list.map((v) => ({ value: v, label: v }));
  return (
    <fieldset className="dx-fieldset">
      <legend className="dx-label">Environment</legend>
      <div className="dx-opts">
        <Choice label="style pack" value={env.stylePack} values={same(PACKS)} onChange={(v) => setEnv('stylePack', v as PinfoldStylePack)} />
        <Choice label="colour mode" value={env.theme} unset={`follow the site (${site})`} values={same(['light', 'dark'])} onChange={(v) => setEnv('theme', v as Env['theme'])} />
        {follows.includes('size') ? (
          <Choice label="provider size" title="PinfoldProvider size: what an unset size inherits" value={env.size} unset="md (default)" values={same(['sm', 'lg'])} onChange={(v) => setEnv('size', v as Env['size'])} />
        ) : null}
        {follows.includes('tone') ? (
          <Choice label="provider tone" title="PinfoldProvider tone: what an unset tone inherits" value={env.tone} unset="primary (default)" values={same(['neutral', 'success', 'warning', 'danger', 'info'])} onChange={(v) => setEnv('tone', v as Env['tone'])} />
        ) : null}
        <div className="dx-opt dx-opt--check">
          <Flag label="right-to-left" checked={env.rtl} onChange={(on) => setEnv('rtl', on)} />
        </div>
        {motion ? (
          <div className="dx-opt dx-opt--check">
            <Flag label="reduced motion" checked={env.reducedMotion} onChange={(on) => setEnv('reducedMotion', on)} />
          </div>
        ) : null}
        {children}
        <div className="dx-opt dx-opt--wide">
          <Width label="container width (%)" value={[env.width]} onChange={([n]) => setEnv('width', n)} />
        </div>
      </div>
    </fieldset>
  );
}

/** The live preview, inside its own provider so the environment applies. */
export function Stage({ env, children, align = 'center' }: { env: Env; children: React.ReactNode; align?: 'center' | 'start' }) {
  const site = React.useContext(SiteMode);
  return (
    <PinfoldProvider
      theme={env.theme || site}
      stylePack={env.stylePack}
      dir={env.rtl ? 'rtl' : 'ltr'}
      disableAnimation={env.reducedMotion}
      size={env.size || undefined}
      tone={env.tone || undefined}
      className={`dx-stage dx-stage--live${align === 'start' ? ' dx-stage--start' : ''}`}
    >
      <div className="dx-stage__frame" style={{ width: `${env.width}%` }}>
        {children}
      </div>
    </PinfoldProvider>
  );
}

export interface CodeAction {
  label: string;
  /** Text to copy, or an action to run. */
  copy?: string;
  run?: () => void;
  title?: string;
}

/** Generated code (TypeScript / JavaScript) and the copy actions. */
export function CodePanel({ file, code, actions, note }: { file: string; code: (lang: 'ts' | 'js') => string; actions: CodeAction[]; note?: React.ReactNode }) {
  const [lang, setLang] = React.useState<'ts' | 'js'>('ts');
  const [status, setStatus] = React.useState<string | null>(null);
  const snippet = reflow(code(lang));
  const copy = async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setStatus(`${label} copied`);
      setTimeout(() => setStatus(null), 1500);
    } catch {
      setStatus('Copy failed: select the text instead');
    }
  };
  return (
    <>
      <Lang label="Code language" items={[{ id: 'ts', label: 'TypeScript' }, { id: 'js', label: 'JavaScript' }]} value={lang} onChange={(id) => setLang(id as 'ts' | 'js')} />
      <div className="dx-code dx-code--accent">
        <span className="dx-code__label">
          {file}.{lang}x
        </span>
        <pre>
          <code>{snippet}</code>
        </pre>
      </div>
      <div className="dx-actions">
        <Tool label="Copy code" tone="primary" onClick={() => copy('Code', snippet)} />
        {actions.map((a) => (
          <Tool key={a.label} label={a.label} title={a.title} onClick={() => (a.run ? a.run() : copy(a.label.replace(/^Copy /, ''), a.copy ?? ''))} />
        ))}
        <Tool label="Copy link" onClick={() => copy('Link', location.href)} />
        <span className="dx-hint" role="status" aria-live="polite">
          {status}
        </span>
      </div>
      {note}
    </>
  );
}

/** A value the way a developer writes it in a config object. */
export const literal = (v: unknown) => (typeof v === 'string' ? `'${v.replace(/'/g, "\\'")}'` : JSON.stringify(v));

/** A JSX attribute the way a developer writes it. */
export function jsxAttr(key: string, value: unknown): string {
  if (value === true) return key;
  if (typeof value === 'string') return `${key}="${value}"`;
  return `${key}={${JSON.stringify(value)}}`;
}

/** Sample line icons (plain inline SVG, like any icon set you would pass in). */
const GLYPHS = {
  sparkle: <path d="M8 2.5 9.4 6.6 13.5 8 9.4 9.4 8 13.5 6.6 9.4 2.5 8 6.6 6.6Z" />,
  card: (
    <>
      <rect x="2" y="4" width="12" height="8.5" rx="1.5" />
      <path d="M2 7h12" />
    </>
  ),
  palette: (
    <>
      <path d="M8 2.5a5.5 5.5 0 1 0 0 11c.9 0 1.2-.6 1.2-1.2 0-.9-.6-1.1-.6-1.8 0-.6.5-1 1.1-1H11a2.5 2.5 0 0 0 2.5-2.5C13.5 4.6 11 2.5 8 2.5Z" />
      <circle cx="5.5" cy="7" r=".6" fill="currentColor" />
      <circle cx="8" cy="5.2" r=".6" fill="currentColor" />
    </>
  ),
  send: <path d="M13.5 2.5 2.5 7l4.5 2 2 4.5Zm0 0L7 9" />,
  plus: <path d="M8 3v10M3 8h10" />,
  arrow: <path d="M3 8h10M9 4l4 4-4 4" />,
};
export type GlyphName = keyof typeof GLYPHS;
export function Glyph({ name }: { name: GlyphName }) {
  return (
    <svg viewBox="0 0 16 16" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {GLYPHS[name]}
    </svg>
  );
}

/**
 * The app-wide setup the preview assumes (provider size, tone, style pack, direction), as the
 * code a developer adds once. Empty when the environment is at its defaults.
 */
/** `requires`: the components it renders inside itself, whose stylesheets it needs too (meta.requires). */
export function appSetup(env: Env, component?: string, requires: readonly string[] = []): string[] {
  const props = [
    env.theme && `theme="${env.theme}"`,
    env.size && `size="${env.size}"`,
    env.tone && `tone="${env.tone}"`,
    env.stylePack !== 'default' && `stylePack="${env.stylePack}"`,
    env.rtl && 'dir="rtl"',
  ].filter(Boolean) as string[];
  const styles = component ? ['', '// ---- once for the whole app ----', "import '@pinfold/css/core.css';", ...requires.map((r) => `import '@pinfold/css/${r}.css';`), `import '@pinfold/css/${component}.css';`] : [];
  if (!props.length) return styles;
  const config = props.map((p) => p.replace(/^(\w+)="(.*)"$/, "$1: '$2'")).join(', ');
  return [
    ...(component ? styles : ['', '// ---- once for the whole app, e.g. app/layout.tsx ----']),
    '// Unset size and tone in the presets above fall back to these.',
    ...(env.stylePack !== 'default' ? ["import '@pinfold/css/packs.css'; // style packs"] : []),
    `<PinfoldProvider ${props.join(' ')}>{children}</PinfoldProvider>`,
    `// or: defineConfig({ ${config} }), then <PinfoldProvider config={config}>`,
  ];
}
