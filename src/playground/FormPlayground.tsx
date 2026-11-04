import * as React from 'react';
import { useInput, type InputConfig } from '@pinfold/react/input';
import { useCheckbox, type CheckboxConfig } from '@pinfold/react/checkbox';
import { useRadio, type RadioConfig } from '@pinfold/react/radio';
import { useSwitch, type SwitchConfig } from '@pinfold/react/switch';
import { useButton } from '@pinfold/react/button';
import { checkboxMeta, inputMeta, radioMeta, switchMeta } from '@pinfold/core/meta';
import { inactiveCheckboxOptions, inactiveInputOptions } from '@pinfold/core';
import { changed, CodePanel, EnvControls, OptionControls, Stage } from './shared';
import { autoFromEnv, presetCode, usePage } from './DisplayPlayground';
import { Check, TextField } from './SurfacePlayground';

/**
 * Playgrounds for the form controls. Same recipe as every page; demo-only toggles are stored under
 * `_` keys and never reach the preset. A real form under each preview shows native validation and reset.
 */

const demo = (options: Record<string, unknown>) => Object.fromEntries(Object.entries(options).filter(([k]) => !k.startsWith('_')));
const SEARCH = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="M16.5 16.5 21 21" />
  </svg>
);
const CHOICES = [
  { value: 'free', label: 'Free', description: 'For trying it out' },
  { value: 'pro', label: 'Pro', description: 'For growing teams' },
  { value: 'scale', label: 'Scale', description: 'For large companies', disabled: true },
];

/** Native validation and reset, with no state of ours: try submitting it empty. */
function DemoForm({ children }: { children: React.ReactNode }) {
  const [sent, setSent] = React.useState('');
  const Submit = useButton({ label: 'Submit', type: 'submit', size: 'sm' });
  const Reset = useButton({ label: 'Reset', type: 'reset', size: 'sm', variant: 'ghost' });
  return (
    <form
      className="dx-demo-form"
      onSubmit={(event) => {
        event.preventDefault();
        setSent(new URLSearchParams(new FormData(event.currentTarget) as unknown as Record<string, string>).toString() || '(nothing)');
      }}
      onReset={() => setSent('')}
    >
      {children}
      <div className="dx-gallery__row">
        <Submit />
        <Reset />
      </div>
      {sent ? <p className="dx-hint">Submitted: {sent}</p> : null}
    </form>
  );
}

/* ----------------------------------------------------------------- input */

function InputPreview({ config }: { config: InputConfig }) {
  const Main = useInput(config);
  const Required = useInput({ label: 'Work email', type: 'email', name: 'email', required: true, autoComplete: 'email', description: 'Submit it empty to see the validation.' });
  return (
    <div className="dx-demo-fields">
      <Main />
      <DemoForm>
        <Required />
      </DemoForm>
    </div>
  );
}

export function InputPlayground() {
  const page = usePage(inputMeta, 'Full name', ['size']);
  const { state, setState, controls, defaults } = page;
  const options = demo(state.options);
  const description = (state.options._description as string | undefined) ?? 'As it appears on your ID.';
  const error = (state.options._error as string | undefined) ?? '';
  const icon = !!state.options._icon;
  const inactive = inactiveInputOptions(options);
  const set = changed(options, defaults, inactive);
  const config: InputConfig = { ...(Object.fromEntries(set) as Partial<InputConfig>), label: state.text, description: description || undefined, error: error || undefined, defaultValue: 'Ada Lovelace', startContent: icon ? SEARCH : undefined };
  const use = [`label=${JSON.stringify(state.text)}`, 'name="name"', ...(description ? [`description=${JSON.stringify(description)}`] : []), ...(error ? [`error=${JSON.stringify(error)}`] : []), ...(icon ? ['startContent={<SearchIcon />}'] : [])];
  return (
    <div className="dx-play">
      <div className="dx-play__editor">
        <TextField id="input-label" label="label" hint="the name" value={state.text} onChange={(v) => setState((s) => ({ ...s, text: v }))} />
        <TextField id="input-description" label="description" hint="help text" value={description} onChange={(v) => page.setOption('_description', v)} />
        <TextField id="input-error" label="error" hint="marks it invalid" value={error} onChange={(v) => page.setOption('_error', v)} />
        <div className="dx-opts">
          <Check id="input-icon" label="start icon" checked={icon} onChange={(v) => page.setOption('_icon', v)} />
        </div>
        <OptionControls controls={controls} options={options} setOption={page.setOption} inactive={inactive} inherit={['size']} autoLabel={autoFromEnv(state.env)} />
        <EnvControls env={state.env} setEnv={page.setEnv} provider={['size']} />
        <button type="button" className="dx-btn" onClick={page.reset}>
          Reset
        </button>
      </div>
      <div className="dx-play__preview">
        <Stage env={state.env} align="start">
          <InputPreview key={String(options.multiline)} config={config} />
        </Stage>
        <CodePanel file="components/name-field" code={() => presetCode(inputMeta, 'NameField', set, use, state.env)} actions={[{ label: 'Copy CLI command', copy: 'npx pinfold add input' }]} />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- checkbox */

function CheckboxPreview({ config }: { config: CheckboxConfig }) {
  const Main = useCheckbox(config);
  const Sample = useCheckbox({ size: config.size, tone: config.tone, label: 'Always checked here', defaultChecked: true, name: 'sample' });
  const Required = useCheckbox({ label: 'I accept the terms', name: 'terms', required: true });
  return (
    <div className="dx-demo-fields">
      <Main />
      <Sample />
      <DemoForm>
        <Required />
      </DemoForm>
    </div>
  );
}

export function CheckboxPlayground() {
  const page = usePage(checkboxMeta, 'Send me product news', ['size', 'tone']);
  const { state, setState, controls, defaults } = page;
  const options = demo(state.options);
  const group = !!state.options._group;
  const items = group ? CHOICES : undefined;
  const inactive = inactiveCheckboxOptions({ items });
  const set = changed(options, defaults, inactive);
  const config: CheckboxConfig = { ...(Object.fromEntries(set) as Partial<CheckboxConfig>), label: state.text, items, description: 'You can change this later.', defaultValue: group ? ['pro'] : undefined };
  const use = [`label=${JSON.stringify(state.text)}`, 'name="news"', 'description="You can change this later."', ...(group ? ["items={[{ value: 'free', label: 'Free' }, { value: 'pro', label: 'Pro' }]}", "defaultValue={['pro']}"] : [])];
  return (
    <div className="dx-play">
      <div className="dx-play__editor">
        <TextField id="checkbox-label" label="label" hint={group ? 'names the group' : 'the name'} value={state.text} onChange={(v) => setState((s) => ({ ...s, text: v }))} />
        <div className="dx-opts">
          <Check id="checkbox-group" label="a group, from items" checked={group} onChange={(v) => page.setOption('_group', v)} />
        </div>
        <OptionControls controls={controls} options={options} setOption={page.setOption} inactive={inactive} inherit={['size', 'tone']} autoLabel={autoFromEnv(state.env)} />
        <EnvControls env={state.env} setEnv={page.setEnv} provider />
        <button type="button" className="dx-btn" onClick={page.reset}>
          Reset
        </button>
      </div>
      <div className="dx-play__preview">
        <Stage env={state.env} align="start">
          <CheckboxPreview key={`${group}-${String(options.defaultChecked)}`} config={config} />
        </Stage>
        <CodePanel file="components/news" code={() => presetCode(checkboxMeta, 'News', set, use, state.env)} actions={[{ label: 'Copy CLI command', copy: 'npx pinfold add checkbox' }]} />
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- radio */

function RadioPreview({ config }: { config: RadioConfig }) {
  const Main = useRadio(config);
  const Required = useRadio({ label: 'Pick a plan', name: 'plan', required: true, orientation: 'horizontal', items: CHOICES.slice(0, 2).map(({ value, label }) => ({ value, label })) });
  return (
    <div className="dx-demo-fields">
      <Main />
      <DemoForm>
        <Required />
      </DemoForm>
    </div>
  );
}

export function RadioPlayground() {
  const page = usePage(radioMeta, 'Plan', ['size', 'tone']);
  const { state, setState, controls, defaults } = page;
  const options = demo(state.options);
  const set = changed(options, defaults);
  const config: RadioConfig = { ...(Object.fromEntries(set) as Partial<RadioConfig>), label: state.text, items: CHOICES, defaultValue: 'pro', description: 'Arrow keys move between them.' };
  const use = [`label=${JSON.stringify(state.text)}`, 'name="plan"', 'defaultValue="pro"', "items={[{ value: 'free', label: 'Free', description: 'For trying it out' }, { value: 'pro', label: 'Pro', description: 'For growing teams' }]}"];
  return (
    <div className="dx-play">
      <div className="dx-play__editor">
        <TextField id="radio-label" label="label" hint="names the group" value={state.text} onChange={(v) => setState((s) => ({ ...s, text: v }))} />
        <OptionControls controls={controls} options={options} setOption={page.setOption} inherit={['size', 'tone']} autoLabel={autoFromEnv(state.env)} />
        <EnvControls env={state.env} setEnv={page.setEnv} provider />
        <button type="button" className="dx-btn" onClick={page.reset}>
          Reset
        </button>
      </div>
      <div className="dx-play__preview">
        <Stage env={state.env} align="start">
          <RadioPreview config={config} />
        </Stage>
        <CodePanel file="components/plan" code={() => presetCode(radioMeta, 'Plan', set, use, state.env)} actions={[{ label: 'Copy CLI command', copy: 'npx pinfold add radio' }]} />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- switch */

function SwitchPreview({ config }: { config: SwitchConfig }) {
  const Main = useSwitch(config);
  const Sample = useSwitch({ size: config.size, tone: config.tone, label: 'Always on here', defaultChecked: true });
  return (
    <div className="dx-demo-fields">
      <Main />
      <Sample />
    </div>
  );
}

export function SwitchPlayground() {
  const page = usePage(switchMeta, 'Email alerts', ['size', 'tone']);
  const { state, setState, controls, defaults } = page;
  const options = demo(state.options);
  const set = changed(options, defaults);
  const config: SwitchConfig = { ...(Object.fromEntries(set) as Partial<SwitchConfig>), label: state.text, description: 'At most one a day.' };
  const use = [`label=${JSON.stringify(state.text)}`, 'name="alerts"', 'description="At most one a day."', 'onChange={save}'];
  return (
    <div className="dx-play">
      <div className="dx-play__editor">
        <TextField id="switch-label" label="label" hint="the name" value={state.text} onChange={(v) => setState((s) => ({ ...s, text: v }))} />
        <OptionControls controls={controls} options={options} setOption={page.setOption} inherit={['size', 'tone']} autoLabel={autoFromEnv(state.env)} />
        <EnvControls env={state.env} setEnv={page.setEnv} provider />
        <button type="button" className="dx-btn" onClick={page.reset}>
          Reset
        </button>
      </div>
      <div className="dx-play__preview">
        <Stage env={state.env} align="start">
          <SwitchPreview key={String(options.defaultChecked)} config={config} />
        </Stage>
        <CodePanel file="components/alerts" code={() => presetCode(switchMeta, 'Alerts', set, use, state.env)} actions={[{ label: 'Copy CLI command', copy: 'npx pinfold add switch' }]} />
      </div>
    </div>
  );
}
