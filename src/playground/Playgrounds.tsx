import * as React from 'react';
import type { ComponentMeta } from '@pinfold/core/meta';
import { alertMeta, avatarMeta, badgeMeta, cardMeta, checkboxMeta, dialogMeta, inputMeta, kbdMeta, menuMeta, popoverMeta, progressMeta, radioMeta, separatorMeta, skeletonMeta, switchMeta, toastMeta, tooltipMeta, toggleMeta, toolbarMeta, sliderMeta, numberMeta, otpMeta, tabsMeta, breadcrumbMeta, paginationMeta, stepperMeta } from '@pinfold/core/meta';
import { inactiveAlertOptions, inactiveAvatarOptions, inactiveBadgeOptions, inactiveCardOptions, inactiveCheckboxOptions, inactiveDialogOptions, inactiveInputOptions, inactiveMenuOptions, inactivePopoverOptions, inactiveProgressOptions, inactiveSeparatorOptions, inactiveSkeletonOptions, inactiveToggleOptions, inactiveSliderOptions, inactiveNumberOptions, inactiveOtpOptions, inactiveTabsOptions, inactiveBreadcrumbOptions, inactivePaginationOptions, inactiveStepperOptions, inactiveToolbarOptions } from '@pinfold/core';
import { defineSeparator } from '@pinfold/react/separator';
import { defineKbd, Kbd } from '@pinfold/react/kbd';
import { defineSkeleton } from '@pinfold/react/skeleton';
import { defineBadge } from '@pinfold/react/badge';
import { defineAlert } from '@pinfold/react/alert';
import { Avatar, defineAvatar } from '@pinfold/react/avatar';
import { defineCard } from '@pinfold/react/card';
import { defineProgress } from '@pinfold/react/progress';
import { defineTooltip } from '@pinfold/react/tooltip';
import { definePopover } from '@pinfold/react/popover';
import { defineDialog } from '@pinfold/react/dialog';
import { defineMenu, type MenuItem } from '@pinfold/react/menu';
import { defineToast, type ToastPlacement } from '@pinfold/react/toast';
import { defineInput } from '@pinfold/react/input';
import { defineCheckbox } from '@pinfold/react/checkbox';
import { defineRadio } from '@pinfold/react/radio';
import { defineSwitch } from '@pinfold/react/switch';
import { defineToggle } from '@pinfold/react/toggle';
import { defineToolbar } from '@pinfold/react/toolbar';
import { defineTabs } from '@pinfold/react/tabs';
import { Badge } from '@pinfold/react/badge';
import { defineBreadcrumb } from '@pinfold/react/breadcrumb';
import { definePagination } from '@pinfold/react/pagination';
import { defineStepper } from '@pinfold/react/stepper';
import { defineSlider } from '@pinfold/react/slider';
import { defineNumberField } from '@pinfold/react/number';
import { defineOtp } from '@pinfold/react/otp';
import { Button, useButton } from '@pinfold/react/button';
import { changed, CodePanel, controlsOf, defaultsOf, ENV, EnvControls, OptionControls, reviveEnv, Stage, useUrlState, type Env } from './shared';
import { exampleCode, Live, src, type ExampleNode, type ExampleSpec } from './example';
import { LANDSCAPE, PEOPLE } from './people';

/**
 * Every component page, on one recipe. Controls come from the component's metadata; a spec says what
 * the page shows, and both the preview and the code panel are produced from that spec (see
 * example.tsx). Demo inputs (a title, an icon toggle) live under `_` keys and never become options.
 */

/* ---------------------------------------------------------------- the page */

interface State {
  options: Record<string, unknown>;
  env: Env;
}

function usePage(meta: ComponentMeta, inherit: string[] = [], demo: Record<string, unknown> = {}) {
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
type PageApi = ReturnType<typeof usePage>;

const autoFromEnv = (env: Env) => (key: string, meta: { default?: unknown }) => `unset (${env[key as 'size'] || meta.default})`;

function Text({ page, name, label, hint, multiline }: { page: PageApi; name: string; label: string; hint?: string; multiline?: boolean }) {
  const id = `demo-${name}`;
  const value = String(page.inputs[name] ?? '');
  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => page.setOption(name, e.target.value);
  return (
    <div className="dx-field">
      <label className="dx-label" htmlFor={id}>
        {label} {hint ? <span className="dx-hint">{hint}</span> : null}
      </label>
      {multiline ? <textarea id={id} className="dx-input" rows={3} value={value} onChange={onChange} /> : <input id={id} className="dx-input" value={value} onChange={onChange} />}
    </div>
  );
}

function Toggle({ page, name, label, disabled }: { page: PageApi; name: string; label: string; disabled?: boolean }) {
  return (
    <label className="dx-opt dx-opt--check">
      <input type="checkbox" checked={!!page.inputs[name]} disabled={disabled} onChange={(e) => page.setOption(name, e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

function Choice({ page, name, label, options }: { page: PageApi; name: string; label: string; options: Array<[string, string]> }) {
  return (
    <label className="dx-opt">
      <span>{label}</span>
      <select className="dx-select" value={String(page.inputs[name] ?? '')} onChange={(e) => page.setOption(name, e.target.value)}>
        {options.map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
    </label>
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
}

function Page({ meta, page, define, spec, inactive, inherit = [], provider = false, motion = false, align = 'center', demo, note, file, frame, autoLabel, valueLabel }: PageProps) {
  const live = <Live define={define} spec={spec} meta={meta} />;
  return (
    <div className="dx-play">
      <div className="dx-play__editor">
        {demo}
        <OptionControls controls={page.controls} options={page.options} setOption={page.setOption} inactive={inactive} inherit={inherit} autoLabel={autoLabel ?? autoFromEnv(page.env)} valueLabel={valueLabel} />
        <EnvControls env={page.env} setEnv={page.setEnv} provider={provider} motion={motion} />
        <button type="button" className="dx-btn" onClick={page.reset}>
          Reset
        </button>
      </div>
      <div className="dx-play__preview">
        <Stage env={page.env} align={align}>
          {frame ? frame(live) : align === 'center' ? <div className="dx-center">{live}</div> : live}
        </Stage>
        {note ? <div className="dx-hint dx-resolved">{note}</div> : null}
        <CodePanel file={file} code={() => exampleCode(meta, spec, page.env)} actions={[{ label: 'Copy CLI command', copy: `npx pinfold add ${meta.name}` }]} />
      </div>
    </div>
  );
}

const flex = (direction: 'row' | 'column', gap = 12, extra: React.CSSProperties = {}): Record<string, unknown> => ({ style: src({ display: 'flex', flexDirection: direction, gap, alignItems: direction === 'row' ? 'center' : undefined, flexWrap: direction === 'row' ? 'wrap' : undefined, inlineSize: '100%', ...extra }, `{ display: 'flex', flexDirection: '${direction}', gap: ${gap}${direction === 'row' ? ", alignItems: 'center', flexWrap: 'wrap'" : ''} }`) });
const ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="M16.5 16.5 21 21" />
  </svg>
);
const BELL = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 9a6 6 0 1 1 12 0c0 6 2 7 2 8H4c0-1 2-2 2-8zM10 21a2 2 0 0 0 4 0" />
  </svg>
);

const SPEAKER_LOW = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M11 5 6 9H3v6h3l5 4V5zM15.5 9.5a3.5 3.5 0 0 1 0 5" />
  </svg>
);
const SPEAKER_HIGH = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M11 5 6 9H3v6h3l5 4V5zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
  </svg>
);

/* ------------------------------------------------------------- separator */

export function SeparatorPlayground() {
  const page = usePage(separatorMeta, [], { _label: 'or' });
  const label = String(page.inputs._label ?? '') || undefined;
  const inactive = inactiveSeparatorOptions({ ...page.options, label });
  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));
  const vertical = page.options.orientation === 'vertical';
  const spec: ExampleSpec = {
    name: 'Divider',
    preset: { ...set, label: 'label' in inactive ? undefined : label },
    tree: vertical
      ? [{ tag: 'div', props: flex('row', 8, { blockSize: 32 }), children: ['Edit', { use: {} }, 'Share', { use: {} }, 'Delete'] }]
      : [{ tag: 'div', props: flex('column', 8), children: ['Sign in with your email and password.', { use: {} }, 'Continue with a passkey.'] }],
  };
  return <Page meta={separatorMeta} page={page} define={defineSeparator} spec={spec} inactive={inactive} file="components/divider" demo={<Text page={page} name="_label" label="label" hint="empty: a plain line" />} />;
}

/* ------------------------------------------------------------------- kbd */

const APPLE = typeof navigator !== 'undefined' && /mac|iphone|ipad/i.test(navigator.platform);

export function KbdPlayground() {
  const page = usePage(kbdMeta, ['size'], { _keys: 'mod, k' });
  const keys = String(page.inputs._keys ?? '').split(/[\s,+]+/).filter(Boolean);
  const spec: ExampleSpec = { name: 'Shortcut', preset: Object.fromEntries(changed(page.options, page.defaults)), tree: [{ tag: 'div', props: flex('row', 8), children: ['Press', { use: { keys } }, 'to open the command menu.'] }] };
  return (
    <Page
      meta={kbdMeta}
      page={page}
      define={defineKbd}
      spec={spec}
      inherit={['size']}
      provider={['size']}
      file="components/shortcut"
      valueLabel={(key, value) => (key === 'display' && value === 'auto' ? `auto (${APPLE ? 'symbols' : 'text'} on this device)` : undefined)}
      note={`Shown for this device (${APPLE ? 'Apple: symbols' : 'not Apple: words'}). Set display to compare.`}
      demo={<Text page={page} name="_keys" label="keys" hint="comma separated; mod = ⌘ on Apple, Ctrl elsewhere" />}
    />
  );
}

/* -------------------------------------------------------------- skeleton */

export function SkeletonPlayground() {
  const page = usePage(skeletonMeta, ['size'], { _lines: '3', _layout: 'shape' });
  const layout = String(page.inputs._layout);
  const composed = layout !== 'shape';
  const items = layout === 'profile' ? [{ variant: 'circle' }, { lines: 2 }] : layout === 'card' ? [{ variant: 'rect', dimensions: { height: 120 } }, { lines: 2 }, { direction: 'row', items: [{ variant: 'circle', size: 'sm' }, { lines: 1 }] }] : undefined;
  const inactive = inactiveSkeletonOptions({ ...page.options, items });
  const lines = Math.max(1, Math.min(8, Number(page.inputs._lines) || 1));
  const set = Object.fromEntries(changed({ ...page.options, loading: undefined }, page.defaults, inactive));
  const done = page.options.loading === false;
  const content = src(<p className="dx-demo-text">Ada Lovelace wrote the first program.</p>, '<p>{user.bio}</p>');
  const spec: ExampleSpec = {
    name: composed ? 'ProfileSkeleton' : 'Placeholder',
    preset: {
      ...set,
      lines: 'lines' in inactive || lines === 1 ? undefined : lines,
      items,
      direction: layout === 'profile' ? 'row' : set.direction,
    },
    tree: [{ use: done ? { loading: false, content } : {} }],
  };
  return (
    <Page
      meta={skeletonMeta}
      page={page}
      define={defineSkeleton}
      spec={spec}
      inactive={inactive}
      inherit={['size']}
      provider={['size']}
      motion
      align="start"
      file="components/placeholder"
      note="A layout is one config: nest shapes in `items`, and one band of light crosses all of them."
      demo={
        <>
          <div className="dx-opts">
            <Choice page={page} name="_layout" label="layout" options={[['shape', 'one shape'], ['profile', 'profile row (items)'], ['card', 'card (nested items)']]} />
          </div>
          {'lines' in inactive ? null : <Text page={page} name="_lines" label="lines" hint="text shapes" />}
        </>
      }
    />
  );
}

/* ----------------------------------------------------------------- badge */

const TONES = ['primary', 'neutral', 'success', 'warning', 'danger', 'info'];

export function BadgePlayground() {
  const page = usePage(badgeMeta, ['size', 'tone'], { _label: 'New', _count: '', _srLabel: '', _anchor: 'none', _tones: false });
  const label = String(page.inputs._label ?? '') || undefined;
  const count = page.inputs._count === '' || page.inputs._count == null ? undefined : Number(page.inputs._count);
  const srLabel = String(page.inputs._srLabel ?? '') || undefined;
  const which = String(page.inputs._anchor);
  const anchor = which === 'avatar' ? src(<Avatar name={PEOPLE[0].name} src={PEOPLE[0].photo} size="lg" />, `<Avatar name="${PEOPLE[0].name}" src="${PEOPLE[0].file}" size="lg" />`) : which === 'button' ? src(<Button label="Notifications" icon={BELL} iconOnly variant="outline" />, '<Button label="Notifications" icon={<BellIcon />} iconOnly variant="outline" />') : undefined;
  const inactive = inactiveBadgeOptions({ ...page.options, label, count, anchor });
  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));
  const use = { label, count, srLabel, anchor };
  const spec: ExampleSpec = {
    name: 'Status',
    preset: set,
    tree: page.inputs._tones ? [{ tag: 'div', props: flex('row', 8), children: TONES.map((tone) => ({ use: { ...use, label: label && tone[0].toUpperCase() + tone.slice(1), tone } })) }] : [{ use }],
    imports: [...(which === 'avatar' ? ["import { Avatar } from '@pinfold/react/avatar';"] : []), ...(which === 'button' ? ["import { Button } from '@pinfold/react/button';"] : [])],
  };
  return (
    <Page
      meta={badgeMeta}
      page={page}
      define={defineBadge}
      spec={spec}
      inactive={inactive}
      inherit={['size', 'tone']}
      provider
      file="components/status"
      demo={
        <>
          <Text page={page} name="_label" label="label" hint="always shown" />
          <Text page={page} name="_count" label="count" hint="a number; shown after the label" />
          <Text page={page} name="_srLabel" label="srLabel" hint="read, not shown: unread messages" />
          <div className="dx-opts">
            <Choice page={page} name="_anchor" label="anchor" options={[['none', 'none (in the text flow)'], ['avatar', 'an avatar'], ['button', 'a button']]} />
            <Toggle page={page} name="_tones" label="every tone" />
          </div>
        </>
      }
    />
  );
}

/* ----------------------------------------------------------------- alert */

const SPOKEN: Record<string, string> = {
  off: 'Screen readers read it when they reach it, like any text. Right for a message on the page from the start.',
  polite: 'role="status": when it appears, a screen reader announces it at the next pause.',
  assertive: 'role="alert": when it appears, a screen reader interrupts to announce it.',
};

export function AlertPlayground() {
  const page = usePage(alertMeta, [], { _title: 'Payment failed', _description: 'Your card was declined. Try another card or contact your bank.', _actions: true, _shown: 0 });
  const inactive = inactiveAlertOptions(page.options);
  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));
  const spec: ExampleSpec = {
    name: 'Notice',
    preset: set,
    tree: [{ use: { title: page.inputs._title, description: page.inputs._description, actions: page.inputs._actions ? [{ label: 'Retry', onClick: src(() => {}, 'retry') }, { label: 'Use another card', onClick: src(() => {}, 'change') }] : undefined } }],
  };
  return (
    <Page
      meta={alertMeta}
      page={page}
      define={defineAlert}
      spec={spec}
      inactive={inactive}
      align="start"
      file="components/notice"
      note={
        <>
          {SPOKEN[String(page.options.live)]}
          {page.options.dismissible ? (
            <>
              {' '}
              <button type="button" className="dx-btn" onClick={() => page.setOption('_shown', Number(page.inputs._shown) + 1)}>
                Show it again
              </button>
            </>
          ) : null}
        </>
      }
      frame={(live) => <React.Fragment key={String(page.inputs._shown)}>{live}</React.Fragment>}
      demo={
        <>
          <Text page={page} name="_title" label="title" />
          <Text page={page} name="_description" label="description" multiline />
          <div className="dx-opts">
            <Toggle page={page} name="_actions" label="actions" />
          </div>
        </>
      }
    />
  );
}

/* ---------------------------------------------------------------- avatar */

export function AvatarPlayground() {
  const page = usePage(avatarMeta, ['size'], { _kind: 'one', _photo: true, _name: PEOPLE[0].name, _max: '4' });
  const group = page.inputs._kind === 'group';
  const photo = !!page.inputs._photo;
  const inactive = inactiveAvatarOptions({ items: group ? [] : undefined, src: photo || undefined });
  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));
  const name = String(page.inputs._name ?? '') || undefined;
  const person = PEOPLE.find((p) => p.name === name);
  const picture = photo ? src(person?.photo ?? PEOPLE[0].photo, `'${person?.file ?? PEOPLE[0].file}'`) : undefined;
  const items = PEOPLE.map((p, i) => ({ name: p.name, src: photo ? src(p.photo, `'${p.file}'`) : undefined, status: i === 0 ? set.status ?? 'online' : undefined }));
  const spec: ExampleSpec = group
    ? { name: 'Team', preset: { ...set, max: Number(page.inputs._max) || 4, label: 'Project members' }, tree: [{ use: { items } }] }
    : { name: 'Person', preset: set, tree: [{ use: { name, src: picture, status: set.status } }] };
  return (
    <Page
      meta={avatarMeta}
      page={page}
      define={defineAvatar}
      spec={{ ...spec, preset: Object.fromEntries(Object.entries(spec.preset).filter(([k]) => k !== 'status')) }}
      inactive={inactive}
      inherit={['size']}
      provider={['size']}
      file="components/people"
      note={group ? 'Hover or tab to a face: its tooltip has the name. "+N" lists who is hidden. Photos: Unsplash.' : 'Turn off the photo to see the initials: a person keeps one colour everywhere. Photos: Unsplash.'}
      autoLabel={(key, meta) => (key === 'status' ? 'none' : key === 'tooltip' ? 'auto' : autoFromEnv(page.env)(key, meta))}
      demo={
        <>
          <div className="dx-opts">
            <Choice page={page} name="_kind" label="show" options={[['one', 'one person'], ['group', 'a group (items)']]} />
            <Toggle page={page} name="_photo" label="photo" />
          </div>
          {group ? <Text page={page} name="_max" label="max" hint="faces before +N" /> : <Text page={page} name="_name" label="name" hint="initials, colour and the accessible name" />}
        </>
      }
    />
  );
}

/* ------------------------------------------------------------------ card */

export function CardPlayground() {
  const page = usePage(cardMeta, [], { _title: 'Pro plan', _description: 'Everything in Free, plus shared workspaces and priority support.', _image: true, _link: false });
  const image = !!page.inputs._image;
  const link = !!page.inputs._link;
  const options = { ...page.options, headingLevel: page.options.headingLevel === undefined ? undefined : Number(page.options.headingLevel) };
  const inactive = inactiveCardOptions({ ...options, image: image || undefined, href: link ? '#/card' : undefined, title: page.inputs._title });
  const set = Object.fromEntries(changed(options, page.defaults, inactive));
  const spec: ExampleSpec = {
    name: 'Plan',
    preset: set,
    tree: [
      {
        use: {
          title: page.inputs._title,
          description: page.inputs._description,
          content: src(<b>$29 per month</b>, '<b>$29 per month</b>'),
          image: image ? { src: src(LANDSCAPE, "'/pro.png'"), alt: '' } : undefined,
          href: link ? '#/card' : undefined,
          actions: link ? undefined : [{ label: 'Upgrade', onClick: src(() => {}, 'upgrade') }, { label: 'Compare plans', onClick: src(() => {}, 'compare') }],
        },
      },
    ],
  };
  return (
    <Page
      meta={cardMeta}
      page={page}
      define={defineCard}
      spec={spec}
      inactive={inactive}
      align="start"
      file="components/plan"
      demo={
        <>
          <Text page={page} name="_title" label="title" hint="a real heading; with a link, the link text" />
          <Text page={page} name="_description" label="description" multiline />
          <div className="dx-opts">
            <Toggle page={page} name="_image" label="image" />
            <Toggle page={page} name="_link" label="whole card is a link" />
          </div>
        </>
      }
    />
  );
}

/* -------------------------------------------------------------- progress */

export function ProgressPlayground() {
  const page = usePage(progressMeta, ['size', 'tone'], { _label: 'Uploading report.pdf', _value: 64, _busy: false });
  const busy = !!page.inputs._busy && page.options.kind !== 'meter';
  const value = busy ? undefined : Number(page.inputs._value ?? 64);
  const inactive = inactiveProgressOptions({ ...page.options, value });
  const spec: ExampleSpec = { name: 'Upload', preset: Object.fromEntries(changed(page.options, page.defaults, inactive)), tree: [{ use: { label: page.inputs._label, value } }] };
  return (
    <Page
      meta={progressMeta}
      page={page}
      define={defineProgress}
      spec={spec}
      inactive={inactive}
      inherit={['size', 'tone']}
      provider
      motion={busy}
      file="components/upload"
      demo={
        <>
          <Text page={page} name="_label" label="label" hint="the accessible name" />
          <div className="dx-field">
            <label className="dx-label" htmlFor="demo-value">
              value <span className="dx-hint">{busy ? 'indeterminate' : `${value} of 100`}</span>
            </label>
            <input id="demo-value" type="range" min={0} max={100} value={value ?? 0} disabled={busy} onChange={(e) => page.setOption('_value', Number(e.target.value))} />
          </div>
          <div className="dx-opts">
            <Toggle page={page} name="_busy" label="indeterminate (no value)" disabled={page.options.kind === 'meter'} />
          </div>
        </>
      }
    />
  );
}

/* -------------------------------------------------------------- overlays */

const KEEP_NOTE = 'Kept open here so its options show (not in the code). Turn off "keep open" to use it for real.';
const Keep = ({ page }: { page: PageApi }) => (
  <div className="dx-opts">
    <Toggle page={page} name="_keep" label="keep open in this preview" />
  </div>
);

export function TooltipPlayground() {
  const page = usePage(tooltipMeta, [], { _content: 'Copies the link to this page', _keep: true });
  const spec: ExampleSpec = {
    name: 'Hint',
    preset: Object.fromEntries(changed(page.options, page.defaults)),
    tree: [{ use: { content: page.inputs._content, trigger: { label: 'Share', variant: 'outline' } } }],
    previewOnly: page.inputs._keep ? { open: true } : undefined,
  };
  return <Page meta={tooltipMeta} page={page} define={defineTooltip} spec={spec} motion file="components/hint" frame={(live) => <div className="dx-overlay-demo">{live}</div>} note={page.inputs._keep ? KEEP_NOTE : 'Hover or tab to it. Escape closes it; the pointer can move onto it without it closing.'} demo={<><Text page={page} name="_content" label="content" hint="the hint" /><Keep page={page} /></>} />;
}

export function PopoverPlayground() {
  const page = usePage(popoverMeta, [], { _title: 'Share this page', _keep: true });
  const inactive = inactivePopoverOptions(page.options);
  const spec: ExampleSpec = {
    name: 'Share',
    preset: Object.fromEntries(changed(page.options, page.defaults, inactive)),
    tree: [{ use: { title: page.inputs._title, description: 'Anyone with the link can view it.', actions: [{ label: 'Copy link', onClick: src(() => {}, 'copy') }, { label: 'Close' }], trigger: { label: 'Share', variant: 'outline' } } }],
    previewOnly: page.inputs._keep ? { open: true } : undefined,
  };
  return <Page meta={popoverMeta} page={page} define={definePopover} spec={spec} inactive={inactive} motion file="components/share" frame={(live) => <div className="dx-overlay-demo">{live}</div>} note={page.inputs._keep ? KEEP_NOTE : undefined} demo={<><Text page={page} name="_title" label="title" hint="the panel's accessible name" /><Keep page={page} /></>} />;
}

export function DialogPlayground() {
  const page = usePage(dialogMeta, [], { _title: 'Delete this project?', _keep: true });
  const inactive = inactiveDialogOptions(page.options);
  const keep = !!page.inputs._keep;
  const spec: ExampleSpec = {
    name: 'Confirm',
    preset: Object.fromEntries(changed(page.options, page.defaults, inactive)),
    tree: [{ use: { title: page.inputs._title, description: 'It will be removed for everyone. This cannot be undone.', trigger: { label: 'Delete project', tone: 'danger', variant: 'soft' }, actions: [{ label: 'Cancel' }, { label: 'Delete', tone: 'danger', onClick: src(() => {}, 'remove') }] } }],
    previewOnly: keep ? { open: true, modal: false, className: 'dx-dialog-inline' } : undefined,
  };
  return <Page meta={dialogMeta} page={page} define={defineDialog} spec={spec} inactive={inactive} motion align="start" file="components/confirm" frame={(live) => (keep ? <div className="dx-dialog-box">{live}</div> : live)} note={keep ? 'Drawn in place here so its options show (not in the code). Turn off "keep open" to open the real modal: focus stays inside, Escape closes it.' : undefined} demo={<><Text page={page} name="_title" label="title" hint="a real heading, and the accessible name" /><Keep page={page} /></>} />;
}

export function MenuPlayground() {
  const page = usePage(menuMeta, ['size'], { _keep: true, _wrap: true, _sort: 'name' });
  const inactive = inactiveMenuOptions(page.options);
  const context = page.options.mode === 'context';
  const items: MenuItem[] = [
    { label: 'Edit', shortcut: 'E', onSelect: src(() => {}, 'edit') as never },
    { label: 'Duplicate', shortcut: 'D', onSelect: src(() => {}, 'duplicate') as never },
    { label: 'Archive', disabled: true },
    { type: 'separator' },
    { type: 'checkbox', label: 'Wrap lines', checked: !!page.inputs._wrap, onSelect: src(() => page.setOption('_wrap', !page.inputs._wrap), 'toggleWrap') as never },
    { type: 'group', label: 'Sort by', items: [{ type: 'radio', label: 'Name', checked: page.inputs._sort === 'name', onSelect: src(() => page.setOption('_sort', 'name'), 'sortByName') as never }, { type: 'radio', label: 'Date', checked: page.inputs._sort === 'date', onSelect: src(() => page.setOption('_sort', 'date'), 'sortByDate') as never }] },
    { type: 'separator' },
    { label: 'Delete', tone: 'danger', onSelect: src(() => {}, 'remove') as never },
  ];
  const spec: ExampleSpec = {
    name: 'RowActions',
    preset: Object.fromEntries(changed(page.options, page.defaults, inactive)),
    tree: [{ use: { label: context ? 'Row actions' : undefined, items, trigger: context ? src(<div className="dx-menu-area" tabIndex={0}>Right-click here</div>, '<div tabIndex={0}>Right-click here</div>') : { label: 'Actions' } } }],
    previewOnly: page.inputs._keep ? { open: true } : undefined,
  };
  return <Page meta={menuMeta} page={page} define={defineMenu} spec={spec} inactive={inactive} inherit={['size']} provider={['size']} motion align="start" file="components/row-actions" frame={(live) => <div className="dx-overlay-demo dx-overlay-demo--tall">{live}</div>} note={page.inputs._keep ? KEEP_NOTE : 'Try the arrow keys, Home and End, and typing a letter.'} demo={<Keep page={page} />} />;
}

const Toasts = defineToast();
/** Three that stay, so the pile and its options show. The code panel prints the same calls. */
const SAMPLES = [
  { id: 'invite', title: 'Invitation sent', description: 'Amara will get an email.', tone: 'info' as const, duration: 0 },
  { id: 'upload', title: 'Upload complete', description: 'report.pdf is ready to share.', tone: 'neutral' as const, duration: 0 },
  { id: 'saved', title: 'Saved', description: 'Your changes are live.', tone: 'success' as const, duration: 0 },
];
const sampleCode = SAMPLES.map((t) => `Toasts.show({ id: '${t.id}', title: '${t.title}', description: '${t.description}', tone: '${t.tone}', duration: 0 });`);

function ToastRegion(props: { placement?: ToastPlacement; stack?: boolean; visible?: number }) {
  React.useEffect(() => {
    for (const t of SAMPLES) Toasts.show(t);
    return () => Toasts.clear();
  }, []);
  return <Toasts {...props} />;
}

let burst = 0;

export function ToastPlayground() {
  const page = usePage(toastMeta, [], { _visible: '3' });
  const visible = Number(page.inputs._visible) || 3;
  const set = { ...Object.fromEntries(changed(page.options, page.defaults)), visible: visible === 3 ? undefined : visible };
  const Many = useButton({
    label: 'Show four more',
    variant: 'outline',
    onClick: () => {
      for (let i = 1; i <= 4; i++) void Toasts.show({ title: `Report ${++burst} exported`, description: 'Saved to Downloads.', tone: 'neutral' });
    },
  });
  const Error_ = useButton({ label: 'Show an error', variant: 'soft', tone: 'danger', onClick: () => void Toasts.show({ title: 'Upload failed', description: 'The file is too large.', tone: 'danger', action: { label: 'Retry' } }) });
  const Saved = useButton({ label: 'Show a toast', variant: 'soft', tone: 'success', onClick: () => void Toasts.show({ title: 'Saved', tone: 'success' }) });
  const spec: ExampleSpec = {
    name: 'Toasts',
    preset: set,
    tree: [{ use: {} }],
    after: ['// Anywhere, also outside React.', ...sampleCode],
  };
  return (
    <div className="dx-play">
      <div className="dx-play__editor">
        <Text page={page} name="_visible" label="visible" hint="shown when fanned out; more scroll" />
        <OptionControls controls={page.controls} options={page.options} setOption={page.setOption} />
        <EnvControls env={page.env} setEnv={page.setEnv} />
        <button type="button" className="dx-btn" onClick={page.reset}>
          Reset
        </button>
      </div>
      <div className="dx-play__preview">
        <Stage env={page.env}>
          <p className="dx-demo-text">Toasts appear in the corner set by placement. Hover or tab into the pile to fan it out. The three samples stay so the options show.</p>
          <ToastRegion placement={page.options.placement as ToastPlacement} stack={page.options.stack as boolean} visible={visible} />
        </Stage>
        <div className="dx-gallery__row dx-resolved">
          <Saved />
          <Error_ />
          <Many />
          <span className="dx-hint">Hovering pauses every timer. Errors and toasts with an action stay until dismissed.</span>
        </div>
        <CodePanel file="components/toasts" code={() => exampleCode(toastMeta, spec, page.env)} actions={[{ label: 'Copy CLI command', copy: 'npx pinfold add toast' }]} />
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- forms */

const SUBMIT: ExampleNode = { element: <Button label="Submit" type="submit" size="sm" />, code: '<Button label="Submit" type="submit" size="sm" />' };
const RESET: ExampleNode = { element: <Button label="Reset" type="reset" size="sm" variant="ghost" />, code: '<Button label="Reset" type="reset" size="sm" variant="ghost" />' };
const BUTTON_IMPORT = "import { Button } from '@pinfold/react/button';";

/** The control alone, or in a real form: native validation and reset, with no state of ours. */
function formTree(page: PageApi, use: Record<string, unknown>): Pick<ExampleSpec, 'tree' | 'imports'> {
  if (!page.inputs._form) return { tree: [{ use }] };
  const onSubmit = src((event: React.FormEvent) => event.preventDefault(), 'save');
  return {
    tree: [{ tag: 'form', props: { onSubmit, ...flex('column', 16) }, children: [{ use }, { tag: 'div', props: flex('row', 8), children: [SUBMIT, RESET] }] }],
    imports: [BUTTON_IMPORT],
  };
}
const FORM_NOTE = 'Submit it empty: the browser\'s own message shows in the error slot, and the first invalid field takes focus.';
const InForm = ({ page }: { page: PageApi }) => <Toggle page={page} name="_form" label="in a form" />;

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

/* ---------------------------------------------------------------- toggle */

const svg = (d: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);
const LIST_ICON = svg('M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01');
const BOARD_ICON = svg('M3 4h7v16H3zM14 4h7v10h-7z');
const CAL_ICON = svg('M4 5h16v16H4zM4 10h16M9 3v4M15 3v4');
const PIN_ICON = svg('M12 17v5M9 3h6l-1 6 3 3H7l3-3z');
const UNDO_ICON = svg('M9 14 4 9l5-5M4 9h11a5 5 0 0 1 0 10h-3');
const REDO_ICON = svg('m15 14 5-5-5-5M20 9H9a5 5 0 0 0 0 10h3');
const BOLD_ICON = svg('M7 4h6a4 4 0 0 1 0 8H7zM7 12h7a4 4 0 0 1 0 8H7z');
const ITALIC_ICON = svg('M19 4h-9M14 20H5M15 4 9 20');

export function TogglePlayground() {
  const page = usePage(toggleMeta, ['size', 'tone'], { _kind: 'group', _icons: false });
  const group = page.inputs._kind === 'group';
  const icons = !!page.inputs._icons;
  const views = [
    { value: 'list', label: 'List', icon: icons ? src(LIST_ICON, '<ListIcon />') : undefined },
    { value: 'board', label: 'Board', icon: icons ? src(BOARD_ICON, '<BoardIcon />') : undefined },
    { value: 'calendar', label: 'Calendar', icon: icons ? src(CAL_ICON, '<CalendarIcon />') : undefined },
  ];
  const inactive = inactiveToggleOptions({ items: group ? views : undefined, selection: page.options.selection as string });
  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));
  const spec: ExampleSpec = group
    ? { name: 'View', preset: set, tree: [{ use: { label: 'View', items: views, defaultValue: ['list'], onChange: src(() => {}, 'setView') } }] }
    : { name: 'Pin', preset: set, tree: [{ use: { label: 'Pin', icon: icons ? src(PIN_ICON, '<PinIcon />') : undefined, defaultPressed: true, onChange: src(() => {}, 'setPinned') } }] };
  return (
    <Page
      meta={toggleMeta}
      page={page}
      define={defineToggle}
      spec={spec}
      inactive={inactive}
      inherit={['size', 'tone']}
      provider
      file={group ? 'components/view' : 'components/pin'}
      note={group ? 'Arrow keys move along the group; in a single selection they select as they go.' : undefined}
      demo={
        <div className="dx-opts">
          <Choice page={page} name="_kind" label="show" options={[['group', 'a group (items)'], ['one', 'one toggle']]} />
          <Toggle page={page} name="_icons" label="icons" />
        </div>
      }
    />
  );
}

/* --------------------------------------------------------------- toolbar */

export function ToolbarPlayground() {
  const page = usePage(toolbarMeta, ['size'], { _icons: false });
  const icons = !!page.inputs._icons;
  const selection = (page.options.selection as string) ?? 'none';
  const inactive = inactiveToolbarOptions({ selection });
  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));
  const items = selection !== 'none'
    ? icons
      ? [
          { label: 'Bold', value: 'bold', icon: src(BOLD_ICON, '<BoldIcon />'), iconOnly: true },
          { label: 'Italic', value: 'italic', icon: src(ITALIC_ICON, '<ItalicIcon />'), iconOnly: true },
        ]
      : [
          { label: 'Day', value: 'day' },
          { label: 'Week', value: 'week' },
          { label: 'Month', value: 'month' },
        ]
    : icons
    ? [
        { label: 'Undo', icon: src(UNDO_ICON, '<UndoIcon />'), iconOnly: true, onClick: src(() => {}, 'undo') },
        { label: 'Redo', icon: src(REDO_ICON, '<RedoIcon />'), iconOnly: true, onClick: src(() => {}, 'redo') },
        { label: 'Bold', icon: src(BOLD_ICON, '<BoldIcon />'), iconOnly: true, onClick: src(() => {}, 'bold') },
        { label: 'Italic', icon: src(ITALIC_ICON, '<ItalicIcon />'), iconOnly: true, onClick: src(() => {}, 'italic') },
      ]
    : [
        { label: 'Previous', onClick: src(() => {}, 'previous') },
        { label: 'Today', onClick: src(() => {}, 'today') },
        { label: 'Next', onClick: src(() => {}, 'next') },
      ];
  const picked = selection === 'none' ? undefined : { defaultValue: icons ? ['bold'] : ['week'], onChange: src(() => {}, icons ? 'setStyles' : 'setView') };
  const name = selection === 'none' ? (icons ? 'Editor' : 'Pager') : icons ? 'Format' : 'Range';
  const spec: ExampleSpec = { name, preset: set, tree: [{ use: { label: selection === 'none' ? (icons ? 'Text formatting' : 'Pages') : icons ? 'Text style' : 'Calendar range', items, ...picked } }] };
  return (
    <Page
      meta={toolbarMeta}
      page={page}
      define={defineToolbar}
      spec={spec}
      inactive={inactive}
      inherit={['size']}
      provider={['size']}
      file={icons ? 'components/editor' : 'components/pager'}
      note="One tab stop: arrow keys, Home and End move between the buttons."
      demo={
        <div className="dx-opts">
          <Toggle page={page} name="_icons" label="icon buttons" />
        </div>
      }
    />
  );
}

/* ---------------------------------------------------------------- slider */

export function SliderPlayground() {
  const page = usePage(sliderMeta, ['size', 'tone'], { _range: false, _marks: false, _icons: false });
  const range = !!page.inputs._range;
  // Steps of 5 (volume) and 25 (price): few enough for `showSteps` to draw.
  const scale = range ? { max: 500, step: 25 } : { step: 5 };
  const marks = page.inputs._marks ? (range ? [0, 100, 250, 500] : [0, 25, 50, 75, 100]).map((value) => ({ value, label: range ? `$${value}` : `${value}` })) : undefined;
  const inactive = inactiveSliderOptions({ defaultValue: range ? [20, 80] : [40], showValue: page.options.showValue as string, marks, snapToMarks: page.options.snapToMarks as boolean, ...scale });
  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));
  if ('step' in inactive) delete (scale as { step?: number }).step;
  const ends = page.inputs._icons ? { startContent: src(SPEAKER_LOW, '<VolumeLowIcon />'), endContent: src(SPEAKER_HIGH, '<VolumeHighIcon />') } : {};
  const spec: ExampleSpec = range
    ? { name: 'Price', preset: { ...set, ...scale, minGap: 25, formatValue: 'formatValue' in inactive ? undefined : src((v: number) => `$${v}`, '(v) => `$${v}`') }, tree: [{ use: { label: 'Price', name: 'price', defaultValue: [100, 350], marks, ...ends } }] }
    : { name: 'Volume', preset: { ...set, ...scale }, tree: [{ use: { label: 'Volume', defaultValue: [40], marks, ...ends, onChangeEnd: src(() => {}, 'save') } }] };
  return (
    <Page
      meta={sliderMeta}
      page={page}
      define={defineSlider}
      spec={spec}
      inactive={inactive}
      inherit={['size', 'tone']}
      provider
      align="start"
      file={range ? 'components/price' : 'components/volume'}
      frame={(live) => <div className="dx-demo-fields">{live}</div>}
      demo={
        <div className="dx-opts">
          <Toggle page={page} name="_range" label="a range (two thumbs)" />
          <Toggle page={page} name="_marks" label="marks" />
          <Toggle page={page} name="_icons" label="icons either side" />
        </div>
      }
    />
  );
}

/* ---------------------------------------------------------- number field */

export function NumberPlayground() {
  const page = usePage(numberMeta, ['size'], { _unit: false, _form: false });
  const inactive = inactiveNumberOptions(page.options);
  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));
  const spec: ExampleSpec = {
    name: 'Quantity',
    preset: { ...set, min: 0, max: 20 },
    ...formTree(page, { label: 'Quantity', name: 'qty', defaultValue: 2, endContent: page.inputs._unit ? src('kg', "'kg'") : undefined, description: 'Up to 20.' }),
  };
  return (
    <Page
      meta={numberMeta}
      page={page}
      define={defineNumberField}
      spec={spec}
      inactive={inactive}
      inherit={['size']}
      provider={['size']}
      align="start"
      file="components/quantity"
      note={page.inputs._form ? FORM_NOTE : 'Hold − or + to repeat; arrow keys step from the keyboard.'}
      frame={(live) => <div className="dx-demo-fields">{live}</div>}
      demo={
        <div className="dx-opts">
          <Toggle page={page} name="_unit" label="a unit (endContent)" />
          <InForm page={page} />
        </div>
      }
    />
  );
}

/* --------------------------------------------------------- one-time code */

export function OtpPlayground() {
  const page = usePage(otpMeta, ['size'], { _groups: true, _value: '12', _form: false });
  const groups = page.inputs._groups ? [3, 3] : undefined;
  const inactive = inactiveOtpOptions({ groups });
  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));
  const spec: ExampleSpec = {
    name: 'Code',
    preset: { ...set, groups },
    ...formTree(page, { label: 'Verification code', name: 'code', defaultValue: String(page.inputs._value ?? '') || undefined, description: 'We sent it to your phone.', onComplete: src(() => {}, 'verify') }),
  };
  return (
    <Page
      meta={otpMeta}
      page={page}
      define={defineOtp}
      spec={spec}
      inactive={inactive}
      inherit={['size']}
      provider={['size']}
      align="start"
      file="components/code"
      note={page.inputs._form ? FORM_NOTE : 'Type, paste a code, or let the phone fill it from an SMS: it is one native field.'}
      frame={(live) => <div className="dx-demo-fields">{live}</div>}
      demo={
        <>
          <Text page={page} name="_value" label="defaultValue" hint="digits" />
          <div className="dx-opts">
            <Toggle page={page} name="_groups" label="two groups of 3" />
            <InForm page={page} />
          </div>
        </>
      }
    />
  );
}

/* ------------------------------------------------------------------ tabs */

const TAB_ICON = (d: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);
const USER_ICON = TAB_ICON('M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10z');
const CARD_ICON = TAB_ICON('M3 6h18v12H3zM3 10h18');
const TEAM_ICON = TAB_ICON('M16 21a5 5 0 0 0-10 0M11 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM21 21a4 4 0 0 0-4-4M17 4a4 4 0 0 1 0 8');
const BELL_SMALL = TAB_ICON('M6 9a6 6 0 1 1 12 0c0 6 2 7 2 8H4c0-1 2-2 2-8zM10 21a2 2 0 0 0 4 0');

export function TabsPlayground() {
  const page = usePage(tabsMeta, ['size', 'tone'], { _icons: false, _disabled: false });
  const icons = !!page.inputs._icons;
  const inactive = inactiveTabsOptions(page.options);
  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));
  const panel = (text: string, name: string) => src(<p>{text}</p>, `<${name} />`);
  const count = src(<Badge count={3} label="new" />, '<Badge count={3} label="new" />');
  const items = [
    { id: 'profile', label: 'Profile', icon: icons ? src(USER_ICON, '<UserIcon />') : undefined, content: panel('Name, photo and how others see you.', 'ProfileForm') },
    { id: 'billing', label: 'Billing', icon: icons ? src(CARD_ICON, '<CardIcon />') : undefined, content: panel('Your plan, invoices and payment method.', 'BillingForm') },
    { id: 'team', label: 'Team', icon: icons ? src(TEAM_ICON, '<TeamIcon />') : undefined, disabled: page.inputs._disabled ? true : undefined, content: panel('Invite people and set their roles.', 'TeamForm') },
    { id: 'alerts', label: 'Notifications', icon: icons ? src(BELL_SMALL, '<BellIcon />') : undefined, endContent: icons ? count : undefined, content: panel('What we email you about, and how often.', 'AlertsForm') },
  ];
  const spec: ExampleSpec = { name: 'Settings', preset: set, tree: [{ use: { label: 'Account settings', items } }] };
  if (icons) spec.imports = ["import { Badge } from '@pinfold/react/badge';"];
  return (
    <Page
      meta={tabsMeta}
      page={page}
      define={defineTabs}
      spec={spec}
      inactive={inactive}
      inherit={['size', 'tone']}
      provider
      align="start"
      file="components/settings"
      note="Arrow keys move between tabs and wrap; a disabled tab is on the way but never selected."
      demo={
        <div className="dx-opts">
          <Toggle page={page} name="_icons" label="icons and a count" />
          <Toggle page={page} name="_disabled" label="a disabled tab" />
        </div>
      }
    />
  );
}

/* ------------------------------------------------------------ breadcrumb */

export function BreadcrumbPlayground() {
  const page = usePage(breadcrumbMeta, ['size'], { _collapse: false, _icons: false });
  const maxItems = page.inputs._collapse ? 3 : undefined;
  const inactive = inactiveBreadcrumbOptions({ maxItems });
  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));
  const home = page.inputs._icons ? src(HOME_ICON, '<HomeIcon />') : undefined;
  const items = [
    { label: 'Home', href: '/', icon: home },
    { label: 'Projects', href: '/projects' },
    { label: 'Pinfold', href: '/projects/pinfold' },
    { label: 'Documentation', href: '/projects/pinfold/docs' },
    { label: 'Settings' },
  ];
  const spec: ExampleSpec = { name: 'Trail', preset: { ...set, maxItems }, tree: [{ use: { items } }] };
  return (
    <Page
      meta={breadcrumbMeta}
      page={page}
      define={defineBreadcrumb}
      spec={spec}
      inactive={inactive}
      inherit={['size']}
      provider={['size']}
      file="components/trail"
      note="The last crumb is the current page. Collapsed crumbs come back with the … button, and focus lands on the first one."
      demo={
        <div className="dx-opts">
          <Toggle page={page} name="_collapse" label="collapse the middle (maxItems: 3)" />
          <Toggle page={page} name="_icons" label="a home icon" />
        </div>
      }
    />
  );
}
const HOME_ICON = TAB_ICON('M3 11 12 4l9 7M5 10v10h14V10');

/* ------------------------------------------------------------ pagination */

export function PaginationPlayground() {
  const page = usePage(paginationMeta, ['size', 'tone'], { _links: false });
  const inactive = inactivePaginationOptions(page.options);
  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));
  const use: Record<string, unknown> = { count: 20, defaultPage: 6 };
  if (page.inputs._links) use.getHref = src((p: number) => `#/pagination?page=${p}`, '(p) => `/blog?page=${p}`');
  else use.onChange = src(() => {}, 'setPage');
  const spec: ExampleSpec = { name: 'Pages', preset: set, tree: [{ use }] };
  return (
    <Page
      meta={paginationMeta}
      page={page}
      define={definePagination}
      spec={spec}
      inactive={inactive}
      inherit={['size', 'tone']}
      provider
      file="components/pages"
      note="The row keeps its length on every page, so nothing moves under the pointer."
      demo={
        <div className="dx-opts">
          <Toggle page={page} name="_links" label="real links (getHref)" />
        </div>
      }
    />
  );
}

/* --------------------------------------------------------------- stepper */

export function StepperPlayground() {
  const page = usePage(stepperMeta, ['size', 'tone'], { _step: '1', _back: true });
  const inactive = inactiveStepperOptions(page.options);
  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));
  const items = [
    { label: 'Cart', description: '3 items' },
    { label: 'Shipping', description: 'Address and speed' },
    { label: 'Payment' },
    { label: 'Review' },
  ];
  const use: Record<string, unknown> = { value: Number(page.inputs._step), items };
  if (page.inputs._back) use.onChange = src((step: number) => page.setOption('_step', String(step)), 'setStep');
  const spec: ExampleSpec = { name: 'Checkout', preset: set, tree: [{ use }] };
  return (
    <Page
      meta={stepperMeta}
      page={page}
      define={defineStepper}
      spec={spec}
      inactive={inactive}
      inherit={['size', 'tone']}
      provider
      align="start"
      file="components/checkout"
      note="Steps already done are buttons that go back (with onChange); steps not reached never are."
      demo={
        <div className="dx-opts">
          <Choice page={page} name="_step" label="current step" options={[['0', '0'], ['1', '1'], ['2', '2'], ['3', '3'], ['4', '4 (all done)']]} />
          <Toggle page={page} name="_back" label="done steps go back (onChange)" />
        </div>
      }
    />
  );
}
