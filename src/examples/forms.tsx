import * as React from 'react';
import { checkboxMeta, inputMeta, radioMeta, switchMeta } from '@pinfold/core/meta';
import { inactiveCheckboxOptions, inactiveInputOptions } from '@pinfold/core';
import { Kbd } from '@pinfold/react/kbd';
import { defineInput } from '@pinfold/react/input';
import { defineCheckbox } from '@pinfold/react/checkbox';
import { defineRadio } from '@pinfold/react/radio';
import { defineSwitch } from '@pinfold/react/switch';
import { Button } from '@pinfold/react/button';
import { changed, Pick } from '../playground/shared';
import { src, type ExampleNode, type ExampleSpec } from '../playground/example';
import { Choice, ICON, Page, PageApi, Text, Toggle, flex, usePage } from '../playground/kit';

/** The forms page. */

const SUBMIT: ExampleNode = { element: <Button label="Submit" type="submit" size="sm" />, code: '<Button label="Submit" type="submit" size="sm" />' };
const RESET: ExampleNode = { element: <Button label="Reset" type="reset" size="sm" variant="ghost" />, code: '<Button label="Reset" type="reset" size="sm" variant="ghost" />' };
const BUTTON_IMPORT = "import { Button } from '@pinfold/react/button';";

/** The control alone, or in a real form: native validation and reset, with no state of ours. */
export function formTree(page: PageApi, use: Record<string, unknown>): Pick<ExampleSpec, 'tree' | 'imports'> {
  if (!page.inputs._form) return { tree: [{ use }] };
  const onSubmit = src((event: React.FormEvent) => event.preventDefault(), 'save');
  return {
    tree: [{ tag: 'form', props: { onSubmit, ...flex('column', 16) }, children: [{ use }, { tag: 'div', props: flex('row', 8), children: [SUBMIT, RESET] }] }],
    imports: [BUTTON_IMPORT],
  };
}
export const FORM_NOTE = 'Submit it empty: the browser\'s own message shows in the error slot, and the first invalid field takes focus.';
export const InForm = ({ page }: { page: PageApi }) => <Toggle page={page} name="_form" label="in a form" />;

export function InputPlayground() {
  const page = usePage(inputMeta, ['size'], { _label: 'Full name', _description: 'As it appears on your ID.', _error: '', _value: 'Emma Larsen', _start: 'none', _end: 'none', _icons: false, _form: false });
  const inactive = inactiveInputOptions(page.options);
  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));
  const spec: ExampleSpec = {
    name: 'NameField',
    preset: set,
    ...formTree(page, {
      label: page.inputs._label,
      name: 'name',
      description: page.inputs._description,
      error: page.inputs._error,
      defaultValue: page.inputs._value,
      startContent: SIDE[String(page.inputs._start)],
      endContent: SIDE[String(page.inputs._end)],
      clearIcon: page.inputs._icons && !('clearIcon' in inactive) ? src(CLEAR_ICON, '<CircleXIcon />') : undefined,
      resizeIcon: page.inputs._icons && !('resizeIcon' in inactive) ? src(GRIP_ICON, '<GripIcon />') : undefined,
    }),
  };
  if (page.inputs._start === 'kbd' || page.inputs._end === 'kbd') spec.imports = [...(spec.imports ?? []), "import { Kbd } from '@pinfold/react/kbd';"];
  return (
    <Page
      meta={inputMeta}
      page={page}
      define={defineInput}
      spec={spec}
      inactive={inactive}
      inherit={['size']}
      provider={['size']}
      align="start"
      file="components/name-field"
      note={page.inputs._form ? FORM_NOTE : undefined}
      frame={(live) => <div className="dx-demo-fields">{live}</div>}
      demo={
        <>
          <Text page={page} name="_label" label="label" hint="the name" />
          <Text page={page} name="_description" label="description" hint="help text" />
          <Text page={page} name="_error" label="error" hint="marks it invalid" />
          <Text page={page} name="_value" label="defaultValue" />
          <div className="dx-opts">
            <Choice page={page} name="_start" label="startContent" options={SIDE_OPTIONS} />
            <Choice page={page} name="_end" label="endContent" options={SIDE_OPTIONS} />
            <Toggle page={page} name="_icons" label="own clear and resize icons" />
            <InForm page={page} />
          </div>
        </>
      }
    />
  );
}

const AT = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
  </svg>
);
const CLEAR_ICON = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm3.7 12.3a1 1 0 0 1-1.4 1.4L12 13.4l-2.3 2.3a1 1 0 0 1-1.4-1.4l2.3-2.3-2.3-2.3a1 1 0 0 1 1.4-1.4l2.3 2.3 2.3-2.3a1 1 0 0 1 1.4 1.4L13.4 12z" />
  </svg>
);
const GRIP_ICON = (
  <svg viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
    <circle cx="9.5" cy="9.5" r="1.1" />
    <circle cx="5.5" cy="9.5" r="1.1" />
    <circle cx="9.5" cy="5.5" r="1.1" />
  </svg>
);
const SIDE: Record<string, unknown> = {
  none: undefined,
  icon: src(ICON, '<SearchIcon />'),
  at: src(AT, '<AtSignIcon />'),
  url: src('https://', "'https://'"),
  unit: src('kg', "'kg'"),
  kbd: src(<Kbd keys={['mod', 'k']} size="sm" />, "<Kbd keys={['mod', 'k']} size=\"sm\" />"),
};
const SIDE_OPTIONS: Array<[string, string]> = [['none', 'none'], ['icon', 'an icon'], ['at', 'another icon'], ['url', "text: 'https://'"], ['unit', "a unit: 'kg'"], ['kbd', 'a shortcut']];

const CHOICES = [
  { value: 'free', label: 'Free', description: 'For trying it out' },
  { value: 'pro', label: 'Pro', description: 'For growing teams' },
  { value: 'scale', label: 'Scale', description: 'For large companies', disabled: true },
];

export function CheckboxPlayground() {
  const page = usePage(checkboxMeta, ['size', 'tone'], { _label: 'Send me product news', _description: 'You can change this later.', _checked: true, _group: false, _form: false });
  const group = !!page.inputs._group;
  const inactive = inactiveCheckboxOptions({ items: group ? CHOICES : undefined });
  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));
  const spec: ExampleSpec = {
    name: 'News',
    preset: set,
    ...formTree(page, {
      label: page.inputs._label,
      name: 'news',
      description: page.inputs._description,
      ...(group ? { items: CHOICES, defaultValue: page.inputs._checked ? ['pro'] : undefined } : { defaultChecked: page.inputs._checked ? true : undefined }),
    }),
  };
  return (
    <Page
      meta={checkboxMeta}
      page={page}
      define={defineCheckbox}
      spec={spec}
      inactive={inactive}
      inherit={['size', 'tone']}
      provider
      align="start"
      file="components/news"
      note={page.inputs._form ? FORM_NOTE : undefined}
      frame={(live) => <div className="dx-demo-fields">{live}</div>}
      demo={
        <>
          <Text page={page} name="_label" label="label" hint={group ? 'names the group' : 'the name'} />
          <Text page={page} name="_description" label="description" />
          <div className="dx-opts">
            <Toggle page={page} name="_checked" label={group ? 'one row checked' : 'checked'} />
            <Toggle page={page} name="_group" label="a group (items)" />
            <InForm page={page} />
          </div>
        </>
      }
    />
  );
}

export function RadioPlayground() {
  const page = usePage(radioMeta, ['size', 'tone'], { _label: 'Plan', _description: 'Arrow keys move between them.', _form: false, _selected: true });
  const set = Object.fromEntries(changed(page.options, page.defaults));
  const spec: ExampleSpec = {
    name: 'Plan',
    preset: set,
    ...formTree(page, { label: page.inputs._label, name: 'plan', description: page.inputs._description, items: CHOICES, defaultValue: page.inputs._selected ? 'pro' : undefined }),
  };
  return (
    <Page
      meta={radioMeta}
      page={page}
      define={defineRadio}
      spec={spec}
      inherit={['size', 'tone']}
      provider
      align="start"
      file="components/plan"
      note={page.inputs._form ? FORM_NOTE : undefined}
      frame={(live) => <div className="dx-demo-fields">{live}</div>}
      demo={
        <>
          <Text page={page} name="_label" label="label" hint="names the group" />
          <Text page={page} name="_description" label="description" />
          <div className="dx-opts">
            <Toggle page={page} name="_selected" label="one selected" />
            <InForm page={page} />
          </div>
        </>
      }
    />
  );
}

export function SwitchPlayground() {
  const page = usePage(switchMeta, ['size', 'tone'], { _label: 'Email alerts', _description: 'At most one a day.', _checked: true, _all: false, _form: false });
  const all = !!page.inputs._all;
  const set = Object.fromEntries(changed(page.options, page.defaults, all ? { variant: 'each switch sets its own' } : {}));
  const one = { label: page.inputs._label, name: 'alerts', description: page.inputs._description, defaultChecked: page.inputs._checked ? true : undefined, onChange: src(() => {}, 'save') };
  const spec: ExampleSpec = all
    ? {
        name: 'Alerts',
        preset: set,
        tree: [{ tag: 'div', props: flex('column', 14), children: (switchMeta.props.variant.values as string[]).map((variant) => ({ use: { ...one, label: `${variant[0].toUpperCase()}${variant.slice(1)}`, name: variant, description: undefined, variant } })) }],
      }
    : { name: 'Alerts', preset: set, ...formTree(page, one) };
  return (
    <Page
      meta={switchMeta}
      page={page}
      define={defineSwitch}
      spec={spec}
      inactive={all ? { variant: 'every variant is shown; each switch sets its own.' } : undefined}
      inherit={['size', 'tone']}
      provider
      align="start"
      file="components/alerts"
      note={page.inputs._form ? FORM_NOTE : undefined}
      frame={(live) => <div className="dx-demo-fields">{live}</div>}
      demo={
        <>
          <Text page={page} name="_label" label="label" hint="the name" />
          <Text page={page} name="_description" label="description" />
          <div className="dx-opts">
            <Toggle page={page} name="_checked" label="on" />
            <Toggle page={page} name="_all" label="every variant" />
            {all ? null : <InForm page={page} />}
          </div>
        </>
      }
    />
  );
}
