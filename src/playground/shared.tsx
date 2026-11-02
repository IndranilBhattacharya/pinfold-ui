import * as React from 'react';
import { PinfoldProvider } from '@pinfold/react';
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
  theme: 'light' | 'dark';
  rtl: boolean;
  reducedMotion: boolean;
  width: number;
  /** Provider size / tone around the preview: atoms inherit them when their own is unset (D-23). */
  size: PinfoldSize | '';
  tone: PinfoldTone | '';
}

export const ENV: Env = { stylePack: 'default', theme: 'dark', rtl: false, reducedMotion: false, width: 100, size: '', tone: '' };

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

/** The meta-driven option controls, with the inactive ones disabled and explained. */
export function OptionControls({
  controls,
  options,
  setOption,
  inactive = {},
  autoLabel = (_key, meta) => `auto${meta.auto ? ` (${meta.auto})` : ''}`,
}: {
  controls: Array<[string, PropMeta]>;
  options: Record<string, unknown>;
  setOption: (key: string, value: unknown) => void;
  inactive?: Record<string, string>;
  autoLabel?: (key: string, meta: PropMeta) => string;
}) {
  return (
    <fieldset className="dx-fieldset">
      <legend className="dx-label">Component</legend>
      <div className="dx-opts">
        {controls.map(([key, meta]) =>
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
                {/* No library default means "inherit": offer that instead of a fixed value. */}
                {meta.default === undefined ? <option value="">{autoLabel(key, meta)}</option> : null}
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
  );
}

/** Style pack, colour mode, direction, motion, width, and (for atoms) the provider size and tone. */
export function EnvControls({
  env,
  setEnv,
  provider = false,
  children,
}: {
  env: Env;
  setEnv: <K extends keyof Env>(key: K, value: Env[K]) => void;
  provider?: boolean;
  children?: React.ReactNode;
}) {
  return (
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
        {provider ? (
          <>
            <label className="dx-opt" title="PinfoldProvider size: what an unset size inherits">
              <span>provider size</span>
              <select className="dx-select" value={env.size} onChange={(e) => setEnv('size', e.target.value as Env['size'])}>
                <option value="">md (default)</option>
                <option>sm</option>
                <option>lg</option>
              </select>
            </label>
            <label className="dx-opt" title="PinfoldProvider tone: what an unset tone inherits">
              <span>provider tone</span>
              <select className="dx-select" value={env.tone} onChange={(e) => setEnv('tone', e.target.value as Env['tone'])}>
                <option value="">primary (default)</option>
                {['neutral', 'success', 'warning', 'danger', 'info'].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
          </>
        ) : null}
        <label className="dx-opt dx-opt--check">
          <input type="checkbox" checked={env.rtl} onChange={(e) => setEnv('rtl', e.target.checked)} />
          <span>right-to-left</span>
        </label>
        <label className="dx-opt dx-opt--check">
          <input type="checkbox" checked={env.reducedMotion} onChange={(e) => setEnv('reducedMotion', e.target.checked)} />
          <span>reduced motion</span>
        </label>
        {children}
        <label className="dx-opt dx-opt--wide">
          <span>
            container width <b>{env.width}%</b>
          </span>
          <input type="range" min={30} max={100} value={env.width} onChange={(e) => setEnv('width', Number(e.target.value))} />
        </label>
      </div>
    </fieldset>
  );
}

/** The live preview, inside its own provider so the environment applies. */
export function Stage({ env, children, align = 'center' }: { env: Env; children: React.ReactNode; align?: 'center' | 'start' }) {
  return (
    <PinfoldProvider
      theme={env.theme}
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
  const snippet = code(lang);
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
      <div className="dx-tabs" role="tablist" aria-label="Code language">
        {(['ts', 'js'] as const).map((l) => (
          <button key={l} type="button" role="tab" aria-selected={lang === l} className="dx-tab" onClick={() => setLang(l)}>
            {l === 'ts' ? 'TypeScript' : 'JavaScript'}
          </button>
        ))}
      </div>
      <div className="dx-code dx-code--accent">
        <span className="dx-code__label">
          {file}.{lang}x
        </span>
        <pre>
          <code>{snippet}</code>
        </pre>
      </div>
      <div className="dx-actions">
        <button type="button" className="dx-btn" onClick={() => copy('Code', snippet)}>
          Copy code
        </button>
        {actions.map((a) => (
          <button key={a.label} type="button" className="dx-btn" title={a.title} onClick={() => (a.run ? a.run() : copy(a.label.replace(/^Copy /, ''), a.copy ?? ''))}>
            {a.label}
          </button>
        ))}
        <button type="button" className="dx-btn" onClick={() => copy('Link', location.href)}>
          Copy link
        </button>
        <span className="dx-hint" role="status" aria-live="polite">
          {status}
        </span>
      </div>
      {note}
    </>
  );
}

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
