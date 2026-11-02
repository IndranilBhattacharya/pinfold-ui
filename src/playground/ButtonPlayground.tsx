import * as React from 'react';
import { Button } from '@pinfold/react/button';
import { Spinner } from '@pinfold/react/spinner';
import { buttonMeta, spinnerMeta } from '@pinfold/core/meta';
import { inactiveButtonOptions } from '@pinfold/core';
import { changed, CodePanel, controlsOf, defaultsOf, ENV, EnvControls, Glyph, jsxAttr, OptionControls, reviveEnv, Stage, useUrlState, type Env } from './shared';

const TONES = ['primary', 'neutral', 'success', 'warning', 'danger', 'info'] as const;
const VARIANTS = ['solid', 'soft', 'outline', 'ghost', 'link'] as const;

/* ---------------------------------------------------------------- button */

const B_CONTROLS = controlsOf(buttonMeta);
const B_DEFAULTS = defaultsOf(B_CONTROLS);
type Icons = 'none' | 'start' | 'end' | 'both' | 'icon only';
interface ButtonState {
  label: string;
  icons: Icons;
  options: Record<string, unknown>;
  env: Env;
}
const B_INITIAL: ButtonState = { label: 'Save changes', icons: 'none', options: { ...B_DEFAULTS }, env: ENV };
const reviveButton = (s: any): ButtonState => ({
  label: typeof s.label === 'string' ? s.label : B_INITIAL.label,
  icons: ['none', 'start', 'end', 'both', 'icon only'].includes(s.icons) ? s.icons : 'none',
  options: { ...B_DEFAULTS, ...s.options },
  env: reviveEnv(s.env),
});

function buttonCode(s: ButtonState) {
  const opts = changed(s.options, B_DEFAULTS, inactiveButtonOptions(s.options)).map(([k, v]) => jsxAttr(k, v));
  const start = s.icons === 'start' || s.icons === 'both' || s.icons === 'icon only';
  const end = s.icons === 'end' || s.icons === 'both';
  if (start) opts.push('icon={<PlusIcon />}');
  if (end) opts.push('endIcon={<ArrowIcon />}');
  if (s.icons === 'icon only') opts.push('aria-label="Add"');
  const names = [start && 'PlusIcon', end && 'ArrowIcon'].filter(Boolean);
  const attrs = ['onClick={save}', ...opts].join(' ');
  return [
    "import { Button } from '@/components/ui/button';",
    ...(names.length ? [`import { ${names.join(', ')} } from './icons'; // any icon set`] : []),
    '',
    s.icons === 'icon only' ? `<Button ${attrs} />` : `<Button ${attrs}>${s.label}</Button>`,
  ].join('\n');
}

export function ButtonPlayground() {
  const [state, setState] = useUrlState('button', B_INITIAL, reviveButton);
  const { options, env, icons, label } = state;
  const [clicks, setClicks] = React.useState(0);
  const inactive = inactiveButtonOptions(options);
  const props = Object.fromEntries(changed(options, B_DEFAULTS, inactive));
  const start = icons === 'start' || icons === 'both' || icons === 'icon only';
  const end = icons === 'end' || icons === 'both';

  const setOption = (key: string, v: unknown) => setState((s) => ({ ...s, options: { ...s.options, [key]: v } }));
  const setEnv = <K extends keyof Env>(key: K, v: Env[K]) => setState((s) => ({ ...s, env: { ...s.env, [key]: v } }));

  return (
    <div className="dx-play">
      <div className="dx-play__editor">
        <label className="dx-label" htmlFor="btn-label">
          label <span className="dx-hint">children</span>
        </label>
        <input id="btn-label" className="dx-input" value={label} onChange={(e) => setState((s) => ({ ...s, label: e.target.value }))} />
        <label className="dx-opt" style={{ marginTop: '1rem' }}>
          <span>icons</span>
          <select className="dx-select" value={icons} onChange={(e) => setState((s) => ({ ...s, icons: e.target.value as Icons }))}>
            {['none', 'start', 'end', 'both', 'icon only'].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <OptionControls controls={B_CONTROLS} options={options} setOption={setOption} inactive={inactive} />
        <EnvControls env={env} setEnv={setEnv} provider />
        <button type="button" className="dx-btn" onClick={() => setState(B_INITIAL)}>
          Reset
        </button>
      </div>

      <div className="dx-play__preview">
        <Stage env={env}>
          <div className="dx-demo-col">
            <Button
              {...props}
              icon={start ? <Glyph name="plus" /> : undefined}
              endIcon={end ? <Glyph name="arrow" /> : undefined}
              aria-label={icons === 'icon only' ? 'Add' : undefined}
              onClick={() => setClicks((n) => n + 1)}
            >
              {icons === 'icon only' ? null : label}
            </Button>
            <p className="dx-hint" aria-live="polite">
              Clicked {clicks} {clicks === 1 ? 'time' : 'times'} (disabled and loading swallow clicks but stay focusable)
            </p>
          </div>
        </Stage>
        <CodePanel file="components/save-button" code={() => buttonCode(state)} actions={[{ label: 'Copy CLI command', copy: 'npx pinfold add button' }]} />

        <h3 className="dx-subhead">Every variant and tone</h3>
        <p className="dx-hint">Uses the size and radius above and the environment, so you can check contrast and inheritance at a glance.</p>
        <Stage env={env} align="start">
          <div className="dx-gallery">
            {VARIANTS.map((variant) => (
              <div key={variant} className="dx-gallery__row">
                {TONES.map((tone) => (
                  <Button key={tone} variant={variant} tone={tone} size={options.size as never} radius={options.radius as never}>
                    {tone}
                  </Button>
                ))}
              </div>
            ))}
            <div className="dx-gallery__row">
              <Button disabled>Disabled</Button>
              <Button loading loadingText="Saving">
                Save
              </Button>
              <Button variant="outline" icon={<Glyph name="plus" />} aria-label="Add" />
              <Button variant="ghost" href="#/button" endIcon={<Glyph name="arrow" />}>
                A link
              </Button>
              <Button tone="neutral" variant="soft">
                Inherits size
              </Button>
            </div>
          </div>
        </Stage>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- spinner */

const S_CONTROLS = controlsOf(spinnerMeta);
const S_DEFAULTS = defaultsOf(S_CONTROLS);
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
  const opts = changed(s.options, S_DEFAULTS).map(([k, v]) => jsxAttr(k, v));
  if (s.label !== 'Loading') opts.push(jsxAttr('label', s.label));
  return ["import { Spinner } from '@/components/ui/spinner';", '', `<Spinner${opts.length ? ' ' + opts.join(' ') : ''} />`].join('\n');
}

export function SpinnerPlayground() {
  const [state, setState] = useUrlState('spinner', S_INITIAL, reviveSpinner);
  const { options, env, label } = state;
  const props = Object.fromEntries(changed(options, S_DEFAULTS));
  const setOption = (key: string, v: unknown) => setState((s) => ({ ...s, options: { ...s.options, [key]: v } }));
  const setEnv = <K extends keyof Env>(key: K, v: Env[K]) => setState((s) => ({ ...s, env: { ...s.env, [key]: v } }));

  return (
    <div className="dx-play">
      <div className="dx-play__editor">
        <label className="dx-label" htmlFor="spn-label">
          label <span className="dx-hint">empty = decorative</span>
        </label>
        <input id="spn-label" className="dx-input" value={label} onChange={(e) => setState((s) => ({ ...s, label: e.target.value }))} />
        <OptionControls controls={S_CONTROLS} options={options} setOption={setOption} />
        <EnvControls env={env} setEnv={setEnv} provider />
        <button type="button" className="dx-btn" onClick={() => setState(S_INITIAL)}>
          Reset
        </button>
      </div>
      <div className="dx-play__preview">
        <Stage env={env}>
          <div className="dx-demo-col">
            <Spinner {...props} label={label} />
            <p className="dx-demo-text">
              <Spinner {...props} label="" /> Loading results… <span className="dx-hint">(decorative, next to text)</span>
            </p>
            <Button loading loadingText="Saving" size={options.size as never}>
              Save
            </Button>
          </div>
        </Stage>
        <CodePanel file="components/loading" code={() => spinnerCode(state)} actions={[{ label: 'Copy CLI command', copy: 'npx pinfold add spinner' }]} />
      </div>
    </div>
  );
}
