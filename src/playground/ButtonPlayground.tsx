import * as React from 'react';
import { useButton, type ButtonConfig } from '@pinfold/react/button';
import { Spinner, useSpinner, type SpinnerConfig } from '@pinfold/react/spinner';
import { buttonMeta, spinnerMeta } from '@pinfold/core/meta';
import { inactiveButtonOptions } from '@pinfold/core';
import { changed, CodePanel, controlsOf, defaultsOf, ENV, EnvControls, Glyph, literal, OptionControls, reviveEnv, Stage, useUrlState, appSetup, type Env } from './shared';

const TONES = ['primary', 'neutral', 'success', 'warning', 'danger', 'info'] as const;
const VARIANTS = ['solid', 'soft', 'outline', 'ghost', 'link'] as const;
/** Unset by default, so precedence decides: `defaults.<name>`, then the provider, then the library default. */
const INHERIT = ['size', 'tone'];

/** Where a resolved value came from: the same order the hook applies. */
function source(key: string, options: Record<string, unknown>, env: Env, libraryDefault: unknown) {
  if (options[key] !== undefined) return `${options[key]} ← config`;
  const fromProvider = env[key as 'size' | 'tone'];
  if (fromProvider) return `${fromProvider} ← provider`;
  return `${libraryDefault} ← library default`;
}

/* ---------------------------------------------------------------- button */

const B_CONTROLS = controlsOf(buttonMeta);
const B_DEFAULTS = { ...defaultsOf(B_CONTROLS), size: undefined, tone: undefined };
type Icons = 'none' | 'start' | 'end' | 'both';
interface ButtonState {
  label: string;
  loadingText: string;
  icons: Icons;
  /** The demo's `onClick` returns a promise, so the button shows its loading state by itself. */
  asyncClick: boolean;
  options: Record<string, unknown>;
  env: Env;
}
const B_INITIAL: ButtonState = { label: 'Save changes', loadingText: '', icons: 'none', asyncClick: false, options: { ...B_DEFAULTS }, env: ENV };
const reviveButton = (s: any): ButtonState => ({
  label: typeof s.label === 'string' ? s.label : B_INITIAL.label,
  loadingText: typeof s.loadingText === 'string' ? s.loadingText : '',
  icons: ['none', 'start', 'end', 'both'].includes(s.icons) ? s.icons : 'none',
  asyncClick: !!s.asyncClick,
  options: { ...B_DEFAULTS, ...s.options },
  env: reviveEnv(s.env),
});

const hasStart = (s: ButtonState) => s.icons === 'start' || s.icons === 'both' || s.options.iconOnly === true;
const hasEnd = (s: ButtonState) => s.icons === 'end' || s.icons === 'both';

function buttonCode(s: ButtonState) {
  const inactive = inactiveButtonOptions({ ...s.options, loadingText: s.loadingText || undefined });
  // The look goes in the preset (defined once); instance data goes where it is used.
  const preset: Array<[string, string]> = changed(s.options, B_DEFAULTS, inactive).map(([k, v]) => [k, literal(v)]);
  if (hasStart(s)) preset.push(['icon', '<PlusIcon />']);
  if (hasEnd(s) && !('endIcon' in inactive)) preset.push(['endIcon', '<ArrowIcon />']);
  const use = [`label=${JSON.stringify(s.label)}`];
  if (s.loadingText) use.push(`loadingText=${JSON.stringify(s.loadingText)}`);
  use.push(s.asyncClick ? 'onClick={async () => { await save(); }}' : 'onClick={save}');
  const icons = [hasStart(s) && 'PlusIcon', hasEnd(s) && !('endIcon' in inactive) && 'ArrowIcon'].filter(Boolean);
  return [
    "import { defineButton } from '@/components/ui/button';",
    ...(icons.length ? [`import { ${icons.join(', ')} } from './icons'; // any icon set`] : []),
    '',
    '// Define once, outside components: the look.',
    preset.length ? 'export const SaveButton = defineButton({' : 'export const SaveButton = defineButton({});',
    ...(preset.length ? [...preset.map(([k, v]) => `  ${k}: ${v},`), '});'] : []),
    '',
    '// Use anywhere in one line: loops, conditions, Server Components (no functions there).',
    'export function Actions() {',
    ...(s.asyncClick ? ['  // An onClick that returns a promise shows the loading state until it settles.'] : []),
    `  return <SaveButton ${use.join(' ')} />;`,
    '}',
    ...appSetup(s.env),
  ].join('\n');
}

/** Rendered inside the stage's provider, so the provider size and tone really apply. */
function ButtonPreview({ state, onClicked }: { state: ButtonState; onClicked: () => void }) {
  const { options } = state;
  const inactive = inactiveButtonOptions(options);
  const Save = useButton({
    ...(Object.fromEntries(changed(options, B_DEFAULTS, inactive)) as Partial<ButtonConfig>),
    label: state.label || 'Button',
    loadingText: state.loadingText || undefined,
    icon: hasStart(state) ? <Glyph name="plus" /> : undefined,
    endIcon: hasEnd(state) ? <Glyph name="arrow" /> : undefined,
    onClick: () => {
      onClicked();
      if (state.asyncClick) return new Promise((resolve) => setTimeout(resolve, 1500));
    },
  });
  return <Save />;
}

function Gallery({ options }: { options: Record<string, unknown> }) {
  const shared = { size: options.size, radius: options.radius } as Partial<ButtonConfig>;
  return (
    <div className="dx-gallery">
      {VARIANTS.map((variant) => (
        <div key={variant} className="dx-gallery__row">
          {TONES.map((tone) => (
            <GalleryButton key={tone} {...shared} radius={variant === 'link' ? undefined : shared.radius} variant={variant} tone={tone} label={tone} />
          ))}
        </div>
      ))}
      <div className="dx-gallery__row">
        <GalleryButton {...shared} label="Disabled" disabled />
        <GalleryButton {...shared} label="Save" loading loadingText="Saving…" />
        <GalleryButton {...shared} label="Save" variant="soft" loading />
        <GalleryButton {...shared} label="Add" icon={<Glyph name="plus" />} iconOnly variant="outline" />
        <GalleryButton {...shared} label="A link" href="#/button" variant="ghost" endIcon={<Glyph name="arrow" />} />
      </div>
    </div>
  );
}
function GalleryButton(config: ButtonConfig) {
  const B = useButton(config);
  return <B />;
}

export function ButtonPlayground() {
  const [state, setState] = useUrlState('button', B_INITIAL, reviveButton);
  const { options, env } = state;
  const [clicks, setClicks] = React.useState(0);
  const inactive = inactiveButtonOptions({ ...options, loadingText: state.loadingText || undefined });

  const setOption = (key: string, v: unknown) => setState((s) => ({ ...s, options: { ...s.options, [key]: v } }));
  const setEnv = <K extends keyof Env>(key: K, v: Env[K]) => setState((s) => ({ ...s, env: { ...s.env, [key]: v } }));

  return (
    <div className="dx-play">
      <div className="dx-play__editor">
        <label className="dx-label" htmlFor="btn-label">
          label <span className="dx-hint">required; the accessible name when iconOnly</span>
        </label>
        <input id="btn-label" className="dx-input" value={state.label} onChange={(e) => setState((s) => ({ ...s, label: e.target.value }))} />
        <div className="dx-opts">
          <label className="dx-opt">
            <span>icons</span>
            <select className="dx-select" value={state.icons} onChange={(e) => setState((s) => ({ ...s, icons: e.target.value as Icons }))}>
              {['none', 'start', 'end', 'both'].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <label className="dx-opt">
            <span>loadingText</span>
            <input className="dx-input" placeholder="e.g. Saving…" value={state.loadingText} onChange={(e) => setState((s) => ({ ...s, loadingText: e.target.value }))} />
          </label>
          <label className="dx-opt dx-opt--check" title="onClick returns a promise: the button shows its loading state by itself">
            <input type="checkbox" checked={state.asyncClick} onChange={(e) => setState((s) => ({ ...s, asyncClick: e.target.checked }))} />
            <span>async onClick (1.5 s)</span>
          </label>
        </div>
        <OptionControls
          controls={B_CONTROLS}
          options={options}
          setOption={setOption}
          inactive={inactive}
          inherit={INHERIT}
          autoLabel={(key, meta) => `unset (${env[key as 'size' | 'tone'] || meta.default})`}
        />
        <EnvControls env={env} setEnv={setEnv} provider />
        <button type="button" className="dx-btn" onClick={() => setState(B_INITIAL)}>
          Reset
        </button>
      </div>

      <div className="dx-play__preview">
        <Stage env={env}>
          <div className="dx-demo-col">
            <ButtonPreview state={state} onClicked={() => setClicks((n) => n + 1)} />
            <p className="dx-hint" aria-live="polite">
              Clicked {clicks} {clicks === 1 ? 'time' : 'times'}. Disabled and loading swallow clicks but stay focusable.
            </p>
          </div>
        </Stage>
        <p className="dx-hint dx-resolved">
          Resolved: size {source('size', options, env, buttonMeta.props.size.default)} · tone {source('tone', options, env, buttonMeta.props.tone.default)}. Precedence:
          config, then <code>defaults.button</code>, then the provider, then the library default.
        </p>
        <CodePanel file="components/save-button" code={() => buttonCode(state)} actions={[{ label: 'Copy CLI command', copy: 'npx pinfold add button' }]} />

        <h3 className="dx-subhead">Every variant and tone</h3>
        <p className="dx-hint">Uses the size and radius above and the environment, so you can check contrast at a glance.</p>
        <Stage env={env} align="start">
          <Gallery options={options} />
        </Stage>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- spinner */

const S_CONTROLS = controlsOf(spinnerMeta);
const S_DEFAULTS = { ...defaultsOf(S_CONTROLS), size: undefined, tone: undefined };
interface SpinnerState {
  label: string;
  options: Record<string, unknown>;
  env: Env;
}
const S_INITIAL: SpinnerState = { label: 'Loading', options: { ...S_DEFAULTS }, env: ENV };
const reviveSpinner = (s: any): SpinnerState => ({
  label: typeof s.label === 'string' ? s.label : 'Loading',
  options: { ...S_DEFAULTS, ...s.options },
  env: reviveEnv(s.env),
});

function spinnerCode(s: SpinnerState) {
  const preset: Array<[string, string]> = changed(s.options, S_DEFAULTS).map(([k, v]) => [k, literal(v)]);
  if (s.label !== 'Loading') preset.unshift(['label', literal(s.label)]);
  return [
    "import { defineSpinner } from '@/components/ui/spinner';",
    '',
    '// Define once, outside components.',
    preset.length ? 'export const Loading = defineSpinner({' : 'export const Loading = defineSpinner();',
    ...(preset.length ? [...preset.map(([k, v]) => `  ${k}: ${v},`), '});'] : []),
    '',
    '// Use anywhere.',
    'export function Results() {',
    '  return <Loading />;',
    '}',
    ...appSetup(s.env),
  ].join('\n');
}

const SPINNER_VARIANTS = ['ring', 'arc', 'dots', 'bars', 'pulse', 'orbit'] as const;

function SpinnerGallery({ options, onPick }: { options: Record<string, unknown>; onPick: (variant: string) => void }) {
  return (
    <div className="dx-gallery__row dx-spinner-gallery">
      {SPINNER_VARIANTS.map((variant) => (
        <button key={variant} type="button" className="dx-spinner-pick" aria-pressed={options.variant === variant} onClick={() => onPick(variant)}>
          <Spinner variant={variant} size={options.size as never} tone={options.tone as never} label={`${variant} spinner`} />
          <span>{variant}</span>
        </button>
      ))}
    </div>
  );
}

function SpinnerPreview({ state }: { state: SpinnerState }) {
  const config = Object.fromEntries(changed(state.options, S_DEFAULTS)) as SpinnerConfig;
  const Main = useSpinner({ ...config, label: state.label });
  const Inline = useSpinner({ ...config, label: '', tone: 'current' });
  const Save = useButton({ label: 'Save', loading: true, loadingText: 'Saving…', size: config.size });
  return (
    <div className="dx-demo-col">
      <Main />
      <p className="dx-demo-text">
        <Inline /> Loading results… <span className="dx-hint">(decorative, tone: current)</span>
      </p>
      <Save />
    </div>
  );
}

export function SpinnerPlayground() {
  const [state, setState] = useUrlState('spinner', S_INITIAL, reviveSpinner);
  const { options, env } = state;
  const setOption = (key: string, v: unknown) => setState((s) => ({ ...s, options: { ...s.options, [key]: v } }));
  const setEnv = <K extends keyof Env>(key: K, v: Env[K]) => setState((s) => ({ ...s, env: { ...s.env, [key]: v } }));

  return (
    <div className="dx-play">
      <div className="dx-play__editor">
        <label className="dx-label" htmlFor="spn-label">
          label <span className="dx-hint">empty = decorative</span>
        </label>
        <input id="spn-label" className="dx-input" value={state.label} onChange={(e) => setState((s) => ({ ...s, label: e.target.value }))} />
        <OptionControls
          controls={S_CONTROLS}
          options={options}
          setOption={setOption}
          inherit={INHERIT}
          autoLabel={(key, meta) => `unset (${env[key as 'size' | 'tone'] || meta.default})`}
        />
        <EnvControls env={env} setEnv={setEnv} provider />
        <button type="button" className="dx-btn" onClick={() => setState(S_INITIAL)}>
          Reset
        </button>
      </div>
      <div className="dx-play__preview">
        <Stage env={env}>
          <SpinnerPreview state={state} />
        </Stage>
        <p className="dx-hint dx-resolved">
          Resolved: size {source('size', options, env, spinnerMeta.props.size.default)} · tone {source('tone', options, env, spinnerMeta.props.tone.default)}.
        </p>
        <CodePanel file="components/loading" code={() => spinnerCode(state)} actions={[{ label: 'Copy CLI command', copy: 'npx pinfold add spinner' }]} />

        <h3 className="dx-subhead">Every animation</h3>
        <p className="dx-hint">In the size, tone and environment above. Click one to use it.</p>
        <Stage env={env} align="start">
          <SpinnerGallery options={options} onPick={(variant) => setOption('variant', variant)} />
        </Stage>
      </div>
    </div>
  );
}
