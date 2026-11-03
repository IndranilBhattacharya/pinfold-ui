import * as React from 'react';
import { useSeparator, type SeparatorConfig } from '@pinfold/react/separator';
import { useKbd, type KbdConfig } from '@pinfold/react/kbd';
import { useSkeleton, type SkeletonConfig } from '@pinfold/react/skeleton';
import { Badge, useBadge, type BadgeConfig } from '@pinfold/react/badge';
import { badgeMeta, kbdMeta, separatorMeta, skeletonMeta, type ComponentMeta } from '@pinfold/core/meta';
import { inactiveBadgeOptions, inactiveSeparatorOptions, inactiveSkeletonOptions } from '@pinfold/core';
import { appSetup, changed, CodePanel, controlsOf, defaultsOf, ENV, EnvControls, literal, OptionControls, reviveEnv, Stage, useUrlState, type Env } from './shared';

/**
 * Playgrounds for Separator, Kbd, Skeleton and Badge. Same recipe as every page: meta-driven controls,
 * a preview rendered inside the stage's provider, and generated code that defines a preset once
 * and uses it in one line.
 */

interface State {
  text: string;
  options: Record<string, unknown>;
  env: Env;
}

/** The code a developer writes: a preset of what differs from the defaults, then a one-line use. */
function presetCode(meta: ComponentMeta, presetName: string, preset: Array<[string, unknown]>, use: string[], env: Env, wrap?: (line: string) => string[]) {
  const P = meta.displayName;
  const body = preset.length ? [`export const ${presetName} = define${P}({`, ...preset.map(([k, v]) => `  ${k}: ${literal(v)},`), '});'] : [`export const ${presetName} = define${P}();`];
  const line = `<${presetName}${use.length ? ' ' + use.join(' ') : ''} />`;
  return [
    `import { define${P} } from '@/components/ui/${meta.name}';`,
    '',
    '// Define once, outside components.',
    ...body,
    '',
    '// Use anywhere in one line.',
    'export function Example() {',
    ...(wrap ? wrap(line) : [`  return ${line};`]),
    '}',
    ...appSetup(env),
  ].join('\n');
}

function usePage(meta: ComponentMeta, text: string, inherit: string[] = []) {
  const controls = controlsOf(meta);
  const defaults = { ...defaultsOf(controls), ...Object.fromEntries(inherit.map((k) => [k, undefined])) };
  const initial: State = { text, options: { ...defaults }, env: ENV };
  const [state, setState] = useUrlState(meta.name, initial, (s: any): State => ({ text: typeof s.text === 'string' ? s.text : text, options: { ...defaults, ...s.options }, env: reviveEnv(s.env) }));
  const setOption = (key: string, v: unknown) => setState((s) => ({ ...s, options: { ...s.options, [key]: v } }));
  const setEnv = <K extends keyof Env>(key: K, v: Env[K]) => setState((s) => ({ ...s, env: { ...s.env, [key]: v } }));
  return { controls, defaults, state, setState, setOption, setEnv, reset: () => setState(initial) };
}

const autoFromEnv = (env: Env) => (key: string, meta: { default?: unknown }) => `unset (${env[key as 'size'] || meta.default})`;

/* ------------------------------------------------------------- separator */

function SeparatorPreview({ config }: { config: SeparatorConfig }) {
  const Rule = useSeparator(config);
  const vertical = config.orientation === 'vertical';
  return vertical ? (
    <div className="dx-demo-row">
      <span>Edit</span>
      <Rule />
      <span>Share</span>
      <Rule />
      <span>Delete</span>
    </div>
  ) : (
    <div className="dx-demo-stack">
      <p>Sign in with your email and password.</p>
      <Rule />
      <p>Continue with a passkey.</p>
    </div>
  );
}

export function SeparatorPlayground() {
  const page = usePage(separatorMeta, 'or');
  const { state, setState, controls, defaults } = page;
  const label = state.text || undefined;
  const inactive = inactiveSeparatorOptions({ ...state.options, label });
  const config = { ...(Object.fromEntries(changed(state.options, defaults, inactive)) as SeparatorConfig), label };
  const preset = [...(label ? [['label', label] as [string, unknown]] : []), ...changed(state.options, defaults, inactive)];
  return (
    <div className="dx-play">
      <div className="dx-play__editor">
        <label className="dx-label" htmlFor="sep-label">
          label <span className="dx-hint">empty: a plain line</span>
        </label>
        <input id="sep-label" className="dx-input" value={state.text} onChange={(e) => setState((s) => ({ ...s, text: e.target.value }))} />
        <OptionControls controls={controls} options={state.options} setOption={page.setOption} inactive={inactive} />
        <EnvControls env={state.env} setEnv={page.setEnv} motion={false} />
        <button type="button" className="dx-btn" onClick={page.reset}>
          Reset
        </button>
      </div>
      <div className="dx-play__preview">
        <Stage env={state.env}>
          <SeparatorPreview config={config} />
        </Stage>
        <CodePanel file="components/divider" code={() => presetCode(separatorMeta, 'Divider', preset, [], state.env)} actions={[{ label: 'Copy CLI command', copy: 'npx pinfold add separator' }]} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- kbd */

const APPLE = typeof navigator !== 'undefined' && /mac|iphone|ipad/i.test(navigator.platform);
const parseKeys = (text: string) => text.split(/[\s,+]+/).map((k) => k.trim()).filter(Boolean);

function KbdPreview({ config }: { config: KbdConfig }) {
  const Keys = useKbd(config);
  return (
    <div className="dx-demo-stack dx-demo-center">
      <Keys />
      <p className="dx-demo-text">
        Press <Keys /> to open the command menu.
      </p>
    </div>
  );
}

export function KbdPlayground() {
  const page = usePage(kbdMeta, 'mod, k', ['size']);
  const { state, setState, controls, defaults } = page;
  const keys = parseKeys(state.text);
  const config = { ...(Object.fromEntries(changed(state.options, defaults)) as Partial<KbdConfig>), keys };
  return (
    <div className="dx-play">
      <div className="dx-play__editor">
        <label className="dx-label" htmlFor="kbd-keys">
          keys <span className="dx-hint">comma separated; mod = ⌘ on Apple, Ctrl elsewhere</span>
        </label>
        <input id="kbd-keys" className="dx-input" value={state.text} onChange={(e) => setState((s) => ({ ...s, text: e.target.value }))} />
        <OptionControls
          controls={controls}
          options={state.options}
          setOption={page.setOption}
          inherit={['size']}
          autoLabel={autoFromEnv(state.env)}
          valueLabel={(key, value) => (key === 'display' && value === 'auto' ? `auto (${APPLE ? 'symbols' : 'text'} on this device)` : undefined)}
        />
        <EnvControls env={state.env} setEnv={page.setEnv} provider={['size']} motion={false} />
        <button type="button" className="dx-btn" onClick={page.reset}>
          Reset
        </button>
      </div>
      <div className="dx-play__preview">
        <Stage env={state.env}>
          <KbdPreview config={config} />
        </Stage>
        <p className="dx-hint dx-resolved">Shown for this device ({APPLE ? 'Apple: symbols' : 'not Apple: words'}). Set display to compare.</p>
        <CodePanel
          file="components/shortcut"
          code={() => presetCode(kbdMeta, 'Shortcut', changed(state.options, defaults), [`keys={${JSON.stringify(keys).replace(/"/g, "'")}}`], state.env)}
          actions={[{ label: 'Copy CLI command', copy: 'npx pinfold add kbd' }]}
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- skeleton */

function SkeletonPreview({ config }: { config: SkeletonConfig }) {
  const Avatar = useSkeleton({ ...config, variant: 'circle', lines: undefined, content: <span className="dx-avatar">IB</span> });
  const Main = useSkeleton({ ...config, content: <p className="dx-demo-text">Indranil builds Pinfold: config in, accessible UI out. Every component takes one object.</p> });
  return (
    <div className="dx-demo-card">
      <Avatar />
      <div className="dx-demo-grow">
        <Main />
      </div>
    </div>
  );
}

export function SkeletonPlayground() {
  const page = usePage(skeletonMeta, '3', ['size']);
  const { state, setState, controls, defaults } = page;
  const lines = Math.max(1, Math.min(8, Number(state.text) || 1));
  const inactive = inactiveSkeletonOptions(state.options);
  const config = { ...(Object.fromEntries(changed(state.options, defaults, inactive)) as SkeletonConfig), lines: 'lines' in inactive ? undefined : lines };
  const preset = [...changed(state.options, defaults, { ...inactive, loading: '' }), ...(!('lines' in inactive) && lines !== 1 ? [['lines', lines] as [string, unknown]] : [])];
  return (
    <div className="dx-play">
      <div className="dx-play__editor">
        <label className="dx-label" htmlFor="skel-lines">
          lines <span className="dx-hint">text skeletons</span>
        </label>
        <input id="skel-lines" className="dx-input" type="number" min={1} max={8} value={state.text} disabled={'lines' in inactive} onChange={(e) => setState((s) => ({ ...s, text: e.target.value }))} />
        <OptionControls controls={controls} options={state.options} setOption={page.setOption} inactive={inactive} inherit={['size']} autoLabel={autoFromEnv(state.env)} />
        <EnvControls env={state.env} setEnv={page.setEnv} provider={['size']} />
        <button type="button" className="dx-btn" onClick={page.reset}>
          Reset
        </button>
      </div>
      <div className="dx-play__preview">
        <Stage env={state.env}>
          <SkeletonPreview config={config} />
        </Stage>
        <CodePanel
          file="components/profile"
          code={() => presetCode(skeletonMeta, 'Bio', preset, ['loading={!user}', 'content={<p>{user?.bio}</p>}'], state.env)}
          actions={[{ label: 'Copy CLI command', copy: 'npx pinfold add skeleton' }]}
        />
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- badge */

const TONES = ['primary', 'neutral', 'success', 'warning', 'danger', 'info'] as const;
const ANCHOR = ["    <span style={{ position: 'relative', display: 'inline-flex' }}>", '      <Avatar />'];

function BadgePreview({ config }: { config: BadgeConfig }) {
  const Main = useBadge(config);
  const placed = config.placement != null && config.placement !== 'inline';
  return (
    <div className="dx-demo-stack dx-demo-center">
      {placed ? (
        <span className="dx-avatar dx-anchor">
          IB
          <Main />
        </span>
      ) : (
        <p className="dx-demo-text">
          Release notes <Main />
        </p>
      )}
      <div className="dx-gallery__row">
        {TONES.map((tone) => (
          <Badge key={tone} {...config} placement="inline" tone={tone} label={config.dot || config.count != null ? `${tone} status` : tone} />
        ))}
      </div>
    </div>
  );
}

export function BadgePlayground() {
  const page = usePage(badgeMeta, 'New', ['size', 'tone']);
  const { state, setState, controls, defaults } = page;
  const { count: countText = '', ...options } = state.options as Record<string, unknown> & { count?: string };
  const count = countText === '' ? undefined : Number(countText);
  const label = state.text || undefined;
  const inactive = inactiveBadgeOptions({ ...options, count });
  const set = changed(options, defaults, inactive);
  const config = { ...(Object.fromEntries(set) as BadgeConfig), label, count };
  const kind = options.dot ? 'dot' : count != null ? 'count' : 'label';
  // A label badge takes its text at the use site; a count or a dot keeps its meaning in the preset.
  const preset = [...(kind !== 'label' && label ? [['label', label] as [string, unknown]] : []), ...set];
  const use = kind === 'count' ? ['count={unread}'] : kind === 'label' && label ? [`label=${JSON.stringify(label)}`] : [];
  const placed = options.placement != null && options.placement !== 'inline';
  return (
    <div className="dx-play">
      <div className="dx-play__editor">
        <label className="dx-label" htmlFor="badge-label">
          label <span className="dx-hint">{kind === 'label' ? 'the text' : 'read after the number or dot, not shown'}</span>
        </label>
        <input id="badge-label" className="dx-input" value={state.text} onChange={(e) => setState((s) => ({ ...s, text: e.target.value }))} />
        <label className="dx-label" htmlFor="badge-count">
          count <span className="dx-hint">empty: a label badge</span>
        </label>
        <input id="badge-count" className="dx-input" type="number" min={0} value={countText} disabled={!!options.dot} onChange={(e) => page.setOption('count', e.target.value)} />
        <OptionControls controls={controls} options={options} setOption={page.setOption} inactive={inactive} inherit={['size', 'tone']} autoLabel={autoFromEnv(state.env)} />
        <EnvControls env={state.env} setEnv={page.setEnv} provider motion={false} />
        <button type="button" className="dx-btn" onClick={page.reset}>
          Reset
        </button>
      </div>
      <div className="dx-play__preview">
        <Stage env={state.env}>
          <BadgePreview config={config} />
        </Stage>
        <CodePanel
          file="components/status"
          code={() =>
            presetCode(badgeMeta, kind === 'count' ? 'Unread' : kind === 'dot' ? 'Online' : 'Status', preset, use, state.env, placed ? (line) => ['  return (', ...ANCHOR, `      ${line}`, '    </span>', '  );'] : undefined)
          }
          actions={[{ label: 'Copy CLI command', copy: 'npx pinfold add badge' }]}
        />
      </div>
    </div>
  );
}
