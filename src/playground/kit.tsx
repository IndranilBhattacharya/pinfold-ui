import * as React from 'react';
import { type ComponentMeta } from '@pinfold/core/meta';
import { CodePanel, controlsOf, defaultsOf, ENV, EnvControls, Flag, Note, OptionControls, Pick, reviveEnv, Stage, TextField, Tool, useUrlState, type Env } from './shared';
import { exampleCode, Live, src, type ExampleSpec } from './example';
import { IN_PREVIEW } from './preview-mode';

/**
 * Shared parts of every component page: page state (URL), the demo inputs, and the page layout
 * (controls, live preview, code). Each component's page lives in src/examples/<name>.tsx.
 */

/* ---------------------------------------------------------------- the page */

interface State {
  options: Record<string, unknown>;
  env: Env;
}

export function usePage(meta: ComponentMeta, inherit: string[] = [], demo: Record<string, unknown> = {}) {
  const controls = controlsOf(meta);
  const defaults = { ...defaultsOf(controls), ...Object.fromEntries(inherit.map((k) => [k, undefined])) };
  const initial: State = { options: { ...defaults, ...demo }, env: ENV };
  const [state, setState] = useUrlState(meta.name, initial, (s: any): State => ({ options: { ...initial.options, ...s.options }, env: reviveEnv(s.env) }));
  const setOption = (key: string, v: unknown) => setState((s) => ({ ...s, options: { ...s.options, [key]: v } }));
  const setEnv = <K extends keyof Env>(key: K, v: Env[K]) => setState((s) => ({ ...s, env: { ...s.env, [key]: v } }));
  const options = Object.fromEntries(Object.entries(state.options).filter(([k]) => !k.startsWith('_')));
  const inputs = state.options;
  return { controls, defaults, options, inputs, env: state.env, setOption, setEnv, reset: () => setState(initial) };
}
export type PageApi = ReturnType<typeof usePage>;

export const autoFromEnv = (env: Env) => (key: string, meta: { default?: unknown; auto?: string }) => `unset (${env[key as 'size'] || (meta.default ?? meta.auto)})`;

export function Text({ page, name, label, hint, multiline }: { page: PageApi; name: string; label: string; hint?: string; multiline?: boolean }) {
  return (
    <div className="dx-field">
      <TextField label={label} description={hint} multiline={multiline} rows={multiline ? 3 : undefined} value={String(page.inputs[name] ?? '')} onChange={(value) => page.setOption(name, value)} />
    </div>
  );
}

export function Toggle({ page, name, label, disabled, checked }: { page: PageApi; name: string; label: string; disabled?: boolean; checked?: boolean }) {
  return (
    <div className="dx-opt dx-opt--check">
      <Flag label={label} checked={checked ?? !!page.inputs[name]} disabled={disabled} onChange={(on) => page.setOption(name, on)} />
    </div>
  );
}

export function Choice({ page, name, label, options }: { page: PageApi; name: string; label: string; options: Array<[string, string]> }) {
  return (
    <div className="dx-opt">
      <Pick label={label} items={options.map(([value, text]) => ({ value, label: text }))} value={String(page.inputs[name] ?? '')} onChange={(next) => next && page.setOption(name, next)} />
    </div>
  );
}

interface PageProps {
  meta: ComponentMeta;
  page: PageApi;
  define: (preset: any) => React.ElementType;
  spec: ExampleSpec;
  inactive?: Record<string, string>;
  inherit?: string[];
  provider?: boolean | ReadonlyArray<'size' | 'tone'>;
  motion?: boolean;
  align?: 'center' | 'start';
  /** The page's own inputs: what a developer passes as data. */
  demo?: React.ReactNode;
  /** Under the preview: what the preview cannot show. */
  note?: React.ReactNode;
  file: string;
  /** Wrap the live preview in site chrome that is not part of the example. */
  frame?: (preview: React.ReactNode) => React.ReactNode;
  autoLabel?: (key: string, meta: { default?: unknown; auto?: string }) => string;
  valueLabel?: (key: string, value: string | number) => string | undefined;
  /** The preview takes the full width, with the controls under it: for components that are a layout (a shell, a bar, a grid). */
  wide?: boolean;
}

export function Page({ meta, page, define, spec: given, inactive, inherit = [], provider = false, motion = false, align = 'center', demo: ownDemo, note, file, frame, autoLabel, valueLabel, wide = false }: PageProps) {
  // An overlay opens as the page loads (unless switched off): the option is real and in the code.
  const opens = given.openOnLoad !== undefined && page.inputs._open !== false;
  const spec = opens ? withDefaultOpen(given, given.openOnLoad!) : given;
  const demo =
    given.openOnLoad !== undefined ? (
      <>
        {ownDemo}
        <Toggle page={page} name="_open" label="Open on load (defaultOpen)" checked={page.inputs._open !== false} />
      </>
    ) : (
      ownDemo
    );
  const live = <Live define={define} spec={spec} meta={meta} />;
  // In a preview frame the page is only its preview: no controls, no code.
  if (IN_PREVIEW) {
    return (
      <Stage env={page.env} align={align}>
        {frame ? frame(live) : align === 'center' ? <div className="dx-center">{live}</div> : live}
      </Stage>
    );
  }
  return (
    <div className={wide ? 'dx-play dx-play--wide' : 'dx-play'}>
      <div className="dx-play__editor">
        {demo}
        <OptionControls controls={page.controls} options={page.options} setOption={page.setOption} inactive={inactive} inherit={inherit} autoLabel={autoLabel ?? autoFromEnv(page.env)} valueLabel={valueLabel} />
        <EnvControls env={page.env} setEnv={page.setEnv} provider={provider} motion={motion} />
        <Tool label="Reset" onClick={page.reset} />
      </div>
      <div className="dx-play__preview">
        <Stage env={page.env} setEnv={page.setEnv} align={align}>
          {frame ? frame(live) : align === 'center' ? <div className="dx-center">{live}</div> : live}
        </Stage>
        {note ? <div className="dx-note"><Note description={note} /></div> : null}
        <CodePanel file={file} code={() => exampleCode(meta, spec, page.env)} actions={[{ label: 'Copy CLI command', copy: `npx pinfold add ${meta.name}` }]} />
      </div>
    </div>
  );
}

export const flex = (direction: 'row' | 'column', gap = 12, extra: React.CSSProperties = {}): Record<string, unknown> => ({ style: src({ display: 'flex', flexDirection: direction, gap, alignItems: direction === 'row' ? 'center' : undefined, flexWrap: direction === 'row' ? 'wrap' : undefined, inlineSize: '100%', ...extra }, `{ display: 'flex', flexDirection: '${direction}', gap: ${gap}${direction === 'row' ? ", alignItems: 'center', flexWrap: 'wrap'" : ''} }`) });
export const ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="M16.5 16.5 21 21" />
  </svg>
);
export const BELL = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 9a6 6 0 1 1 12 0c0 6 2 7 2 8H4c0-1 2-2 2-8zM10 21a2 2 0 0 0 4 0" />
  </svg>
);

export const SPEAKER_LOW = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M11 5 6 9H3v6h3l5 4V5zM15.5 9.5a3.5 3.5 0 0 1 0 5" />
  </svg>
);
export const SPEAKER_HIGH = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M11 5 6 9H3v6h3l5 4V5zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
  </svg>
);

// From NewPlaygrounds.tsx
/**
 * The tree view, file upload and tour pages. Each demo is a small working app: the line under the
 * preview reports what the component's events said last, so the interaction is visible.
 */

export const wait = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(t);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });

/** The example with `defaultOpen` on its component (the first node that uses the preset). */
function withDefaultOpen(spec: ExampleSpec, value: true | string): ExampleSpec {
  let done = false;
  const tree = spec.tree.map((node) => {
    if (done || typeof node === 'string' || !('use' in node)) return node;
    done = true;
    return { ...node, use: { ...node.use, defaultOpen: value } };
  });
  return { ...spec, tree };
}
