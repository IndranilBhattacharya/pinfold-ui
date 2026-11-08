import * as React from 'react';
import type { ComponentMeta } from '@pinfold/core/meta';
import { alertMeta, avatarMeta, badgeMeta, cardMeta, checkboxMeta, dialogMeta, inputMeta, kbdMeta, menuMeta, popoverMeta, progressMeta, radioMeta, separatorMeta, skeletonMeta, switchMeta, toastMeta, tooltipMeta, toggleMeta, toolbarMeta, sliderMeta, numberMeta, otpMeta, tabsMeta, breadcrumbMeta, paginationMeta, stepperMeta, selectMeta, comboboxMeta, tagsMeta, commandMeta, calendarMeta, datepickerMeta, tableMeta, ratingMeta, timelineMeta, emptyMeta, carouselMeta, resizableMeta } from '@pinfold/core/meta';
import { inactiveAlertOptions, inactiveAvatarOptions, inactiveBadgeOptions, inactiveCardOptions, inactiveCheckboxOptions, inactiveDialogOptions, inactiveInputOptions, inactiveMenuOptions, inactivePopoverOptions, inactiveProgressOptions, inactiveSeparatorOptions, inactiveSkeletonOptions, inactiveToggleOptions, inactiveSliderOptions, inactiveNumberOptions, inactiveOtpOptions, inactiveTabsOptions, inactiveBreadcrumbOptions, inactivePaginationOptions, inactiveStepperOptions, inactiveToolbarOptions, inactiveSelectOptions, inactiveComboboxOptions, inactiveTagsOptions, inactiveCommandOptions, inactiveCalendarOptions, inactiveDatePickerOptions, inactiveTableOptions, inactiveRatingOptions, inactiveTimelineOptions, inactiveEmptyOptions, inactiveCarouselOptions, inactiveResizableOptions } from '@pinfold/core';
import { defineSeparator } from '@pinfold/react/separator';
import { defineKbd, Kbd } from '@pinfold/react/kbd';
import { defineSkeleton } from '@pinfold/react/skeleton';
import { defineBadge } from '@pinfold/react/badge';
import { defineAlert } from '@pinfold/react/alert';
import { Avatar, defineAvatar } from '@pinfold/react/avatar';
import { Card, defineCard } from '@pinfold/react/card';
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
import { defineSelect } from '@pinfold/react/select';
import { defineCombobox } from '@pinfold/react/combobox';
import { defineTags } from '@pinfold/react/tags';
import { defineCommand } from '@pinfold/react/command';
import { defineCalendar } from '@pinfold/react/calendar';
import { defineDatePicker } from '@pinfold/react/datepicker';
import { defineTable } from '@pinfold/react/table';
import { defineRating } from '@pinfold/react/rating';
import { defineTimeline } from '@pinfold/react/timeline';
import { defineEmpty } from '@pinfold/react/empty';
import { defineCarousel } from '@pinfold/react/carousel';
import { defineResizable } from '@pinfold/react/resizable';
import { defineSlider } from '@pinfold/react/slider';
import { defineNumberField } from '@pinfold/react/number';
import { defineOtp } from '@pinfold/react/otp';
import { Button, useButton } from '@pinfold/react/button';
import { Input } from '@pinfold/react/input';
import { Switch } from '@pinfold/react/switch';
import { Radio } from '@pinfold/react/radio';
import { Progress } from '@pinfold/react/progress';
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
const FILE_ICON = TAB_ICON('M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5');
const HOME_ICON = TAB_ICON('M3 11 12 4l9 7M5 10v10h14V10');
const FOLDER_ICON = TAB_ICON('M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z');

function ProfilePanel() {
  return (
    <div className="dx-panel">
      <Input label="Name" defaultValue="Maya Chen" />
      <Input label="Email" type="email" defaultValue="maya@example.com" description="Where we send receipts." />
      <div><Button label="Save profile" size="sm" /></div>
    </div>
  );
}
function BillingPanel() {
  return (
    <div className="dx-panel">
      <p className="dx-panel__lead">Team plan · $48 a month · renews on 1 December</p>
      <Progress value={72} label="Seats used: 18 of 25" />
      <div className="dx-panel__row">
        <Button label="Change plan" size="sm" variant="soft" />
        <Button label="Invoices" size="sm" variant="ghost" />
      </div>
    </div>
  );
}
function TeamPanel() {
  return (
    <ul className="dx-panel dx-people">
      {PEOPLE.slice(0, 4).map((p, i) => (
        <li key={p.name}>
          <Avatar name={p.name} src={p.photo} size="sm" />
          <span>{p.name}</span>
          <span className="dx-hint">{['Owner', 'Admin', 'Editor', 'Viewer'][i]}</span>
        </li>
      ))}
    </ul>
  );
}
function AlertsPanel() {
  return (
    <div className="dx-panel">
      <Switch label="Comments on my work" defaultChecked />
      <Switch label="Weekly summary" description="Every Monday, 9 am." defaultChecked />
      <Switch label="Product news" />
    </div>
  );
}

const SOURCE: Record<string, string> = {
  'index.tsx': "import { createRoot } from 'react-dom/client';\nimport { App } from './App';\n\ncreateRoot(document.getElementById('root')!).render(<App />);",
  'App.tsx': "export function App() {\n  return <Settings label=\"Settings\" items={items} />;\n}",
  'theme.css': ':root {\n  --pinfold-radius-scale: 1.25;\n}',
};
const START_FILES = ['index.tsx', 'App.tsx', 'theme.css'];

/** Editor tabs: open files that close and add, in the demo's own state. */
function EditorTabs({ Preset, props }: { Preset: React.ElementType; props: Record<string, any> }) {
  const [files, setFiles] = React.useState(START_FILES);
  const [open, setOpen] = React.useState('App.tsx');
  const items = files.map((name) => ({ id: name, label: name, icon: FILE_ICON, content: <pre className="dx-file">{SOURCE[name] ?? '// A new, empty file'}</pre> }));
  const add = () => {
    let n = 1;
    while (files.includes(`untitled-${n}.ts`)) n++;
    setFiles((f) => [...f, `untitled-${n}.ts`]);
    setOpen(`untitled-${n}.ts`);
  };
  return <Preset {...props} items={items} value={open} onChange={setOpen} onClose={(id: string) => setFiles((f) => f.filter((x) => x !== id))} onAdd={add} />;
}

const VIEWS = ['Board', 'List', 'Timeline'] as const;
const TASKS = ['Design review', 'Ship 0.14', 'Docs pass', 'Fix focus ring', 'Pack audit', 'Release notes'];
function ViewOf({ name }: { name: string }) {
  if (name === 'Board')
    return (
      <div className="dx-board">
        {['To do', 'Doing', 'Done'].map((col, c) => (
          <div key={col}>
            <strong>{col}</strong>
            {TASKS.filter((_, i) => i % 3 === c).map((t) => <span key={t}>{t}</span>)}
          </div>
        ))}
      </div>
    );
  if (name === 'List') return <ol className="dx-tasks">{TASKS.map((t) => <li key={t}>{t}</li>)}</ol>;
  return (
    <ol className="dx-timeline">
      {TASKS.slice(0, 4).map((t, i) => (
        <li key={t} style={{ marginInlineStart: `${i * 12}%`, inlineSize: '40%' }}>{t}</li>
      ))}
    </ol>
  );
}
/** Views: string tabs, controlled, and the content they pick rendered beside them. */
function ViewTabs({ Preset, props }: { Preset: React.ElementType; props: Record<string, any> }) {
  const [view, setView] = React.useState<string>('Board');
  return (
    <div className="dx-stack">
      <Preset {...props} value={view} onChange={setView} />
      <ViewOf name={view} />
    </div>
  );
}

export function TabsPlayground() {
  const page = usePage(tabsMeta, ['size', 'tone'], { _demo: 'settings', _icons: true, _disabled: false });
  const demo = String(page.inputs._demo);
  const icons = !!page.inputs._icons;
  const inactive = inactiveTabsOptions({ ...page.options, onAdd: demo === 'editor' || undefined, onClose: demo === 'editor' || undefined });
  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));
  const count = src(<Badge count={3} label="new" />, '<Badge count={3} label="new" />');
  let spec: ExampleSpec;
  if (demo === 'editor') {
    const items = START_FILES.map((name) => ({ id: name, label: name }));
    spec = {
      name: 'FileTabs',
      preset: set,
      body: [
        "const [files, setFiles] = useState(['index.tsx', 'App.tsx', 'theme.css']);",
        "const [open, setOpen] = useState('App.tsx');",
        'const items = files.map((name) => ({ id: name, label: name, icon: <FileIcon />, content: <Editor file={name} /> }));',
      ],
      tree: [
        {
          app: EditorTabs,
          use: {
            label: 'Open files',
            items: src(items, 'items'),
            value: src('App.tsx', 'open'),
            onChange: src(() => {}, 'setOpen'),
            onClose: src(() => {}, '(id) => setFiles((f) => f.filter((name) => name !== id))'),
            onAdd: src(() => {}, '() => setFiles((f) => [...f, `untitled-${f.length}.ts`])'),
          },
          code: ['$TAG'],
        },
      ],
    };
  } else if (demo === 'views') {
    spec = {
      name: 'ViewTabs',
      preset: set,
      body: ["const [view, setView] = useState('Board');"],
      tree: [{ app: ViewTabs, use: { label: 'View', items: [...VIEWS], value: src('Board', 'view'), onChange: src(() => {}, 'setView') }, code: ['$TAG', '<ViewOf name={view} />'] }],
    };
  } else {
    const items = [
      { id: 'profile', label: 'Profile', icon: icons ? src(USER_ICON, '<UserIcon />') : undefined, content: src(<ProfilePanel />, '<ProfilePanel />') },
      { id: 'billing', label: 'Billing', icon: icons ? src(CARD_ICON, '<CardIcon />') : undefined, content: src(<BillingPanel />, '<BillingPanel />') },
      { id: 'team', label: 'Team', icon: icons ? src(TEAM_ICON, '<TeamIcon />') : undefined, disabled: page.inputs._disabled ? true : undefined, content: src(<TeamPanel />, '<TeamPanel />') },
      { id: 'alerts', label: 'Notifications', icon: icons ? src(BELL_SMALL, '<BellIcon />') : undefined, endContent: icons ? count : undefined, content: src(<AlertsPanel />, '<AlertsPanel />') },
    ];
    spec = {
      name: 'Settings',
      preset: set,
      tree: [{ use: { label: 'Account settings', items } }],
      after: ['// ProfilePanel, BillingPanel…: your own components. Each renders only while its tab is selected', '// (keepMounted keeps them, and their state, when hidden).'],
    };
    if (icons) spec.imports = ["import { Badge } from '@pinfold/react/badge';"];
  }
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
      note={
        demo === 'editor'
          ? 'Close with the × or Delete; the neighbour takes over and keeps focus. + adds a file. Your state owns the list.'
          : demo === 'views'
            ? 'Strings are tabs: items={["Board", "List", "Timeline"]}. The selected id drives whatever you render.'
            : 'Arrow keys move between tabs and wrap; a disabled tab is on the way but never selected. Each panel is a real component.'
      }
      demo={
        <>
          <Choice page={page} name="_demo" label="example" options={[['settings', 'settings with panels'], ['editor', 'editor: close and add'], ['views', 'views from strings']]} />
          {demo === 'settings' ? (
            <div className="dx-opts">
              <Toggle page={page} name="_icons" label="icons and a count" />
              <Toggle page={page} name="_disabled" label="a disabled tab" />
            </div>
          ) : null}
        </>
      }
    />
  );
}

/* ------------------------------------------------------------ breadcrumb */

type Tree = { [name: string]: Tree };
const FOLDERS: Tree = {
  projects: { pinfold: { docs: { guides: {}, reference: {} }, src: { components: {}, tokens: {} }, tests: {} }, atlas: { docs: {}, src: {} }, nova: { designs: {} } },
  team: { design: {}, research: {} },
  archive: { 2024: {}, 2025: {} },
};
const segmentsOf = (path: string) => path.split('/').filter(Boolean);
const folderAt = (segments: string[]) => segments.reduce<Tree | undefined>((node, s) => node?.[s], FOLDERS) ?? {};
const readable = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** The crumbs of a path, each with the other folders at its level as a menu. */
function crumbsFor(path: string, icon: boolean) {
  const all = segmentsOf(path);
  return [
    { label: 'Home', href: '/', icon: icon ? HOME_ICON : undefined },
    ...all.map((segment, i) => {
      const href = '/' + all.slice(0, i + 1).join('/');
      const siblings = Object.keys(folderAt(all.slice(0, i))).filter((s) => s !== segment);
      return { label: readable(segment), href, menu: siblings.length ? siblings.map((s) => ({ label: readable(s), href: '/' + [...all.slice(0, i), s].join('/') })) : undefined };
    }),
  ];
}

/** A folder browser: the trail and the folder it points at share one path. */
function FolderBrowser({ Preset, props }: { Preset: React.ElementType; props: Record<string, any> }) {
  const [path, setPath] = React.useState('/projects/pinfold/docs/guides');
  const children = Object.keys(folderAt(segmentsOf(path)));
  const trail = props.path !== undefined ? { path, items: undefined } : { items: crumbsFor(path, !!props._icon) };
  const { _icon, ...rest } = props;
  return (
    <div className="dx-stack">
      <Preset {...rest} {...trail} onNavigate={(href: string) => setPath(href)} />
      <div className="dx-folder" aria-label="Folder contents">
        {children.length ? (
          children.map((name) => (
            <button key={name} type="button" className="dx-folder__item" onClick={() => setPath(`${path === '/' ? '' : path}/${name}`)}>
              {FOLDER_ICON}
              {readable(name)}
            </button>
          ))
        ) : (
          <span className="dx-hint">This folder is empty. Use the trail to go back up.</span>
        )}
      </div>
    </div>
  );
}

export function BreadcrumbPlayground() {
  const page = usePage(breadcrumbMeta, ['size', 'tone'], { _source: 'items', _collapse: false, _icons: true });
  const fromPath = page.inputs._source === 'path';
  const maxItems = page.inputs._collapse ? 3 : undefined;
  const inactive = inactiveBreadcrumbOptions({ maxItems, variant: page.options.variant as string, ...(fromPath ? { path: '/' } : { items: [] }) });
  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));
  const start = '/projects/pinfold/docs/guides';
  const use: Record<string, unknown> = fromPath
    ? { path: src(start, 'path'), onNavigate: src(() => {}, 'setPath') }
    : { items: src(crumbsFor(start, !!page.inputs._icons), 'crumbs'), onNavigate: src(() => {}, 'setPath'), _icon: src(!!page.inputs._icons, '') };
  const spec: ExampleSpec = {
    name: 'Trail',
    preset: { ...set, maxItems },
    body: fromPath
      ? ["const [path, setPath] = useState('/projects/pinfold/docs/guides'); // or your router's pathname"]
      : [
          "const [path, setPath] = useState('/projects/pinfold/docs/guides');",
          "const segments = path.split('/').filter(Boolean);",
          'const crumbs = [',
          `  { label: 'Home', href: '/'${page.inputs._icons ? ', icon: <HomeIcon />' : ''} },`,
          '  ...segments.map((segment, i) => ({',
          '    label: titleCase(segment),',
          "    href: '/' + segments.slice(0, i + 1).join('/'),",
          '    menu: otherFolders(segments.slice(0, i), segment), // [{ label, href }]: the pages next to this one',
          '  })),',
          '];',
        ],
    tree: [{ app: FolderBrowser, use, code: ['$TAG', '<FolderView path={path} onOpen={setPath} />'] }],
  };
  return (
    <Page
      meta={breadcrumbMeta}
      page={page}
      define={defineBreadcrumb}
      spec={spec}
      inactive={inactive}
      inherit={['size', 'tone']}
      provider={['size']}
      align="start"
      file="components/trail"
      note={
        fromPath
          ? 'path={pathname} builds the trail: one crumb per segment, made readable. Clicks go to onNavigate (or the provider\'s navigate), so the page never reloads.'
          : 'Each crumb opens the folders next to it (▾). The last crumb is the current page. Clicks go to onNavigate, so the page never reloads.'
      }
      demo={
        <>
          <Choice page={page} name="_source" label="crumbs from" options={[['items', 'items, with menus of the other folders'], ['path', 'a URL path (path)']]} />
          <div className="dx-opts">
            <Toggle page={page} name="_collapse" label="collapse the middle (maxItems: 3)" />
            {fromPath ? null : <Toggle page={page} name="_icons" label="a home icon" />}
          </div>
        </>
      }
    />
  );
}

/* ------------------------------------------------------------ pagination */

const CUSTOMERS = ['Northwind', 'Globex', 'Initech', 'Umbrella', 'Hooli', 'Vandelay', 'Stark', 'Wayne', 'Acme', 'Soylent', 'Tyrell'];
const STATUSES = [
  ['Paid', 'success'],
  ['Pending', 'warning'],
  ['Overdue', 'danger'],
] as const;
const INVOICES = Array.from({ length: 137 }, (_, i) => ({
  id: `INV-${String(2041 + i)}`,
  customer: CUSTOMERS[(i * 7) % CUSTOMERS.length],
  amount: ((i * 7919) % 4800) + 120,
  status: STATUSES[(i * 5) % 7 === 0 ? 2 : (i * 3) % 4 === 0 ? 1 : 0],
}));
type Invoice = (typeof INVOICES)[number];

function InvoiceTable({ rows, busy }: { rows: readonly Invoice[]; busy?: boolean }) {
  return (
    <div className="dx-table-wrap" aria-busy={busy || undefined} style={{ opacity: busy ? 0.55 : 1, transition: 'opacity 150ms' }}>
      <table className="dx-table dx-table--data">
        <thead>
          <tr>
            <th>Invoice</th>
            <th>Customer</th>
            <th>Status</th>
            <th style={{ textAlign: 'end' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td><code>{r.id}</code></td>
              <td>{r.customer}</td>
              <td><Badge label={r.status[0]} tone={r.status[1]} size="sm" /></td>
              <td style={{ textAlign: 'end' }}>${r.amount.toLocaleString('en-US')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Invoices paged three ways: an array in memory, a server that counts, and a cursor API. */
function Invoices({ Preset, props }: { Preset: React.ElementType; props: Record<string, any> }) {
  const mode = props._mode as 'client' | 'server' | 'cursor';
  // `loading` is printed as your fetch state; the preview drives it from its own fetch.
  const { _mode, loading: _printed, ...rest } = props;
  const [query, setQuery] = React.useState({ page: 1, pageSize: rest.pageSizes?.[0] ?? 10 });
  const slice = (q: typeof query) => INVOICES.slice((q.page - 1) * q.pageSize, q.page * q.pageSize);
  const [shown, setShown] = React.useState(() => slice(query));
  const [fetching, setFetching] = React.useState(false);
  // The "server": answers after a short wait, as a real request would. The first page arrives with the page.
  // Keyed on what is on screen, so a remount (or React's double effect in development) never refetches.
  const loaded = React.useRef(`${query.page}/${query.pageSize}`);
  React.useEffect(() => {
    const key = `${query.page}/${query.pageSize}`;
    if (key === loaded.current) return;
    if (mode === 'client') {
      loaded.current = key;
      return setShown(slice(query));
    }
    setFetching(true);
    const timer = setTimeout(() => {
      loaded.current = key;
      setShown(slice(query));
      setFetching(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [mode, query.page, query.pageSize]); // eslint-disable-line react-hooks/exhaustive-deps
  const onChange = (page: number, { pageSize }: { pageSize: number }) => setQuery({ page, pageSize });
  const counted = mode === 'cursor' ? { hasNext: query.page * query.pageSize < INVOICES.length, total: undefined } : { total: INVOICES.length };
  return (
    <div className="dx-stack">
      <InvoiceTable rows={shown} busy={fetching} />
      <Preset {...rest} {...counted} page={query.page} pageSize={query.pageSize} onChange={onChange} {...(fetching ? { loading: true } : null)} />
    </div>
  );
}

export function PaginationPlayground() {
  const page = usePage(paginationMeta, ['size', 'tone'], { _data: 'client', _sizes: true });
  const mode = String(page.inputs._data) as 'client' | 'server' | 'cursor';
  const sizes = page.inputs._sizes ? [10, 25, 50] : undefined;
  const scope = mode === 'cursor' ? { hasNext: true } : { total: INVOICES.length };
  const inactive = inactivePaginationOptions({ ...page.options, ...scope });
  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));
  const onChange = src(() => {}, '(page, { pageSize }) => setQuery({ page, pageSize })');
  const base = { page: src(1, 'query.page'), pageSize: src(sizes?.[0] ?? 10, 'query.pageSize'), pageSizes: sizes, onChange, _mode: src(mode, '') };
  const shapes = {
    client: {
      body: ['const [query, setQuery] = useState({ page: 1, pageSize: 10 });', 'const rows = invoices.slice((query.page - 1) * query.pageSize, query.page * query.pageSize);'],
      use: { total: src(INVOICES.length, 'invoices.length'), ...base },
      code: ['<InvoiceTable rows={rows} />', '$TAG'],
    },
    server: {
      body: [
        'const [query, setQuery] = useState({ page: 1, pageSize: 10 });',
        '// Your fetch, e.g. TanStack Query: GET /invoices?offset=(page - 1) * pageSize&limit=pageSize',
        "const { data, isFetching } = useQuery({ queryKey: ['invoices', query], queryFn: () => fetchInvoices(query), placeholderData: keepPreviousData });",
      ],
      use: { total: src(INVOICES.length, 'data.total'), ...base, loading: src(false, 'isFetching') },
      code: ['<InvoiceTable rows={data.rows} busy={isFetching} />', '$TAG'],
    },
    cursor: {
      body: [
        'const [query, setQuery] = useState({ page: 1, pageSize: 10 });',
        '// A cursor API has no total: it says whether there is more.',
        'const { data, isFetching } = useInvoicesAfter(cursors[query.page - 1], query.pageSize); // { rows, nextCursor }',
      ],
      use: { hasNext: src(true, 'data.nextCursor != null'), ...base, loading: src(false, 'isFetching') },
      code: ['<InvoiceTable rows={data.rows} busy={isFetching} />', '$TAG'],
    },
  }[mode];
  const spec: ExampleSpec = { name: 'Pages', preset: set, body: shapes.body, tree: [{ app: Invoices, use: shapes.use, code: shapes.code }] };
  return (
    <Page
      meta={paginationMeta}
      page={page}
      define={definePagination}
      spec={spec}
      inactive={inactive}
      inherit={['size', 'tone']}
      provider
      align="start"
      file="components/invoices"
      note={
        mode === 'client'
          ? 'One state object drives the rows and the pages. A page-size change keeps the first row on screen.'
          : mode === 'server'
            ? 'The table waits on a (simulated) server: loading keeps the old rows, pulses the cursor and blocks double clicks.'
            : 'No total from the API: hasNext says whether there is more; the row shows previous, the page, next.'
      }
      demo={
        <>
          <Choice page={page} name="_data" label="data" options={[['client', 'an array you hold'], ['server', 'a server that counts (total)'], ['cursor', 'a cursor API (hasNext)']]} />
          <div className="dx-opts">
            <Toggle page={page} name="_sizes" label="page sizes [10, 25, 50]" />
          </div>
        </>
      }
    />
  );
}

/* --------------------------------------------------------------- stepper */

function CartStep() {
  return (
    <ul className="dx-lines">
      <li><span>Wool overshirt · M</span><span>$118.00</span></li>
      <li><span>Canvas tote</span><span>$34.00</span></li>
      <li className="dx-lines__total"><span>Subtotal</span><span>$152.00</span></li>
    </ul>
  );
}
function ShippingStep({ address, setAddress, error }: { address: string; setAddress: (v: string) => void; error?: string }) {
  return (
    <div className="dx-panel">
      <Input label="Full name" defaultValue="Maya Chen" />
      <Input label="Street address" value={address} onChange={setAddress} error={error} required placeholder="12 Harbour Road" />
    </div>
  );
}
function PaymentStep() {
  return (
    <Radio
      label="Pay with"
      variant="card"
      defaultValue="card"
      items={[
        { value: 'card', label: 'Card', description: 'Visa ending 4242' },
        { value: 'paypal', label: 'PayPal' },
        { value: 'invoice', label: 'Invoice', description: 'Due in 30 days' },
      ]}
    />
  );
}
function ReviewStep({ address }: { address: string }) {
  return (
    <ul className="dx-lines">
      <li><span>Ship to</span><span>{address || '—'}</span></li>
      <li><span>Pay with</span><span>Card ending 4242</span></li>
      <li className="dx-lines__total"><span>Total</span><span>$152.00</span></li>
    </ul>
  );
}
const WIZARD = [
  { label: 'Cart', description: '2 items' },
  { label: 'Shipping', description: 'Where it goes' },
  { label: 'Payment', optional: true },
  { label: 'Review' },
];
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** A checkout: the stepper drives the panels; Next checks the address first. */
function Checkout({ Preset, props }: { Preset: React.ElementType; props: Record<string, any> }) {
  const { _async, _markError, ...rest } = props;
  const [step, setStep] = React.useState(0);
  const [address, setAddress] = React.useState('');
  const [error, setError] = React.useState<string>();
  const validate = () => {
    const ok = address.trim().length > 3;
    setError(ok ? undefined : 'Enter the street address.');
    return ok;
  };
  const items = [
    { ...WIZARD[0], content: <CartStep /> },
    { ...WIZARD[1], error: _markError && !!error, content: <ShippingStep address={address} setAddress={(v) => (setAddress(v), setError(undefined))} error={error} /> },
    { ...WIZARD[2], content: <PaymentStep /> },
    { ...WIZARD[3], content: <ReviewStep address={address} /> },
  ];
  const done = (
    <div className="dx-panel dx-done">
      <strong>Order placed.</strong>
      <span className="dx-hint">A receipt is on its way to maya@example.com.</span>
      <div><Button label="Start over" size="sm" variant="soft" onClick={() => (setStep(0), setAddress(''))} /></div>
    </div>
  );
  return (
    <Preset
      {...rest}
      items={items}
      value={step}
      onChange={setStep}
      onNext={(s: number) => (s !== 1 ? true : _async ? wait(700).then(validate) : validate())}
      onComplete={() => wait(600)}
      doneContent={done}
    />
  );
}

/** Progress only: the stepper beside your own flow, its value from your state. */
function StepsOnly({ Preset, props }: { Preset: React.ElementType; props: Record<string, any> }) {
  const { _back, ...rest } = props;
  const [step, setStep] = React.useState<number>(rest.value);
  React.useEffect(() => setStep(rest.value), [rest.value]);
  return <Preset {...rest} value={step} onChange={_back ? setStep : undefined} />;
}

export function StepperPlayground() {
  const page = usePage(stepperMeta, ['size', 'tone'], { _content: true, _async: true, _error: true, _step: '1', _back: true });
  const content = !!page.inputs._content;
  const inactive = inactiveStepperOptions({ ...page.options, onChange: content || page.inputs._back ? () => {} : undefined, items: content ? [{ content: 1 }] : [] });
  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));
  let spec: ExampleSpec;
  if (content) {
    spec = {
      name: 'Checkout',
      preset: set,
      body: [
        'const [step, setStep] = useState(0);',
        "const [address, setAddress] = useState('');",
        `const checkAddress = ${page.inputs._async ? "async () => (await api.validateAddress(address)).ok; // Next shows loading meanwhile" : '() => address.trim().length > 3;'}`,
      ],
      tree: [
        {
          app: Checkout,
          use: {
            items: [
              { ...WIZARD[0], content: src(null, '<Cart />') },
              { ...WIZARD[1], content: src(null, '<ShippingForm address={address} onChange={setAddress} />'), error: page.inputs._error ? src(false, '!addressValid') : undefined },
              { ...WIZARD[2], content: src(null, '<Payment />') },
              { ...WIZARD[3], content: src(null, '<Review />') },
            ],
            value: src(0, 'step'),
            onChange: src(() => {}, 'setStep'),
            onNext: src(() => true, '(step) => step !== 1 || checkAddress()'),
            onComplete: src(() => {}, 'placeOrder'),
            doneContent: src(null, '<OrderPlaced onRestart={() => setStep(0)} />'),
            _async: src(!!page.inputs._async, ''),
            _markError: src(!!page.inputs._error, ''),
          },
          code: ['$TAG'],
        },
      ],
    };
  } else {
    const use: Record<string, unknown> = { value: src(Number(page.inputs._step), String(page.inputs._step)), items: ['Cart', 'Shipping', 'Payment', 'Review'], _back: src(!!page.inputs._back, '') };
    if (page.inputs._back) use.onChange = src(() => {}, 'setStep');
    spec = { name: 'Steps', preset: set, tree: [{ app: StepsOnly, use, code: ['$TAG'] }] };
  }
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
      note={
        content
          ? 'Try Next on Shipping with an empty address: onNext keeps you there (after a check when it is async). Done steps go back; Finish waits on onComplete.'
          : 'Steps already done are buttons that go back (with onChange); steps not reached never are, unless linear is off.'
      }
      demo={
        <>
          <div className="dx-opts">
            <Toggle page={page} name="_content" label="steps with content, Back and Next" />
          </div>
          {content ? (
            <div className="dx-opts">
              <Toggle page={page} name="_async" label="async check on Next" />
              <Toggle page={page} name="_error" label="mark the step with an error" />
            </div>
          ) : (
            <>
              <Choice page={page} name="_step" label="current step" options={[['0', '0'], ['1', '1'], ['2', '2'], ['3', '3'], ['4', '4 (all done)']]} />
              <div className="dx-opts">
                <Toggle page={page} name="_back" label="steps are buttons (onChange)" />
              </div>
            </>
          )}
        </>
      }
    />
  );
}

/* ---------------------------------------------------------------- select */

const PLANS = [
  { value: 'free', label: 'Free', description: '1 project', group: 'Personal', price: 0 },
  { value: 'pro', label: 'Pro', description: 'Unlimited projects', group: 'Personal', price: 12 },
  { value: 'team', label: 'Team', description: 'Up to 25 seats', group: 'Business', price: 48 },
  { value: 'enterprise', label: 'Enterprise', description: 'Talk to us', group: 'Business', price: -1, disabled: true },
];
const REGIONS = ['Frankfurt', 'Mumbai', 'Oregon', 'São Paulo', 'Singapore', 'Sydney', 'Tokyo', 'Virginia'];
const LABELS = ['bug', 'design', 'docs', 'feature', 'performance', 'security'];

/** A project form: the select's value drives the summary under it. */
function ProjectForm({ Preset, props }: { Preset: React.ElementType; props: Record<string, any> }) {
  const { _kind, ...rest } = props;
  const [plan, setPlan] = React.useState<string | null>('pro');
  const [labels, setLabels] = React.useState<string[]>(['bug', 'docs']);
  const [region, setRegion] = React.useState<string | null>('Tokyo');
  if (_kind === 'multiple')
    return (
      <div className="dx-stack">
        <Preset {...rest} value={labels} onChange={setLabels} />
        <p className="dx-panel__lead">{labels.length ? `Issues labelled ${labels.join(', ')} go to this board.` : 'No labels: every issue goes to this board.'}</p>
      </div>
    );
  if (_kind === 'strings')
    return (
      <div className="dx-stack">
        <Preset {...rest} value={region} onChange={setRegion} />
        <p className="dx-panel__lead">{region ? `Data stays in ${region}.` : 'Pick where your data lives.'}</p>
      </div>
    );
  const chosen = PLANS.find((p) => p.value === plan);
  return (
    <div className="dx-stack">
      <Preset {...rest} value={plan} onChange={setPlan} />
      <ul className="dx-lines">
        <li><span>Plan</span><span>{chosen?.label ?? '—'}</span></li>
        <li className="dx-lines__total"><span>Billed monthly</span><span>{chosen ? `$${chosen.price}.00` : '—'}</span></li>
      </ul>
    </div>
  );
}

export function SelectPlayground() {
  const page = usePage(selectMeta, ['size', 'tone'], { _kind: 'groups', _keep: true });
  const kind = String(page.inputs._kind);
  const inactive = inactiveSelectOptions({ multiple: kind === 'multiple' });
  const set = Object.fromEntries(changed(page.options, page.defaults, { ...inactive, multiple: 'set by the example' }));
  const shapes: Record<string, { body: string[]; use: Record<string, unknown>; code: string[] }> = {
    groups: {
      body: ["const [plan, setPlan] = useState('pro');"],
      use: { label: 'Plan', items: PLANS.map(({ price, ...p }) => p), value: src('pro', 'plan'), onChange: src(() => {}, 'setPlan') },
      code: ['$TAG', '<PlanSummary plan={plan} />'],
    },
    strings: {
      body: ["const [region, setRegion] = useState('Tokyo');"],
      use: { label: 'Region', description: 'Where your data lives.', items: REGIONS, value: src('Tokyo', 'region'), onChange: src(() => {}, 'setRegion') },
      code: ['$TAG'],
    },
    multiple: {
      body: ["const [labels, setLabels] = useState(['bug', 'docs']);"],
      use: { label: 'Labels', multiple: true, name: 'labels', items: LABELS, value: src(['bug', 'docs'], 'labels'), onChange: src(() => {}, 'setLabels') },
      code: ['$TAG'],
    },
  };
  const shape = shapes[kind];
  const spec: ExampleSpec = { name: 'Field', preset: set, body: shape.body, tree: [{ app: ProjectForm, use: { ...shape.use, _kind: src(kind, '') }, code: shape.code }], previewOnly: page.inputs._keep ? { open: true } : undefined };
  return (
    <Page
      meta={selectMeta}
      page={page}
      define={defineSelect}
      spec={spec}
      inactive={{ ...inactive, multiple: 'set by the example above.' }}
      inherit={['size', 'tone']}
      provider
      align="start"
      file="components/project-form"
      frame={(live) => <div className="dx-list-demo">{live}</div>}
      note={page.inputs._keep ? KEEP_NOTE : 'Arrows, Home and End move past disabled rows; letters jump; Enter or Space chooses. A hidden native select submits and validates.'}
      demo={<><Choice page={page} name="_kind" label="example" options={[['groups', 'a plan: groups and descriptions'], ['strings', 'a region: rows from strings'], ['multiple', 'labels: several values']]} /><Keep page={page} /></>}
    />
  );
}

/* -------------------------------------------------------------- combobox */

const CITIES = ['Amsterdam', 'Athens', 'Bogotá', 'Kraków', 'Lisbon', 'Montréal', 'Oslo', 'Osaka', 'Reykjavík', 'São Paulo', 'Zagreb', 'Zürich'];
const REPOS = ['pinfold/pinfold', 'pinfold/pinfold-ui', 'facebook/react', 'vercel/next.js', 'vitejs/vite', 'tailwindlabs/tailwindcss', 'microsoft/typescript', 'nodejs/node', 'denoland/deno', 'sveltejs/svelte', 'vuejs/core', 'withastro/astro'];

/** City: the chosen value drives a card; repository: a simulated server search; tags: a tag input. */
function Finder({ Preset, props }: { Preset: React.ElementType; props: Record<string, any> }) {
  const { _kind, loading: _printed, ...rest } = props;
  const [city, setCity] = React.useState<string | null>(null);
  const [tags, setTags] = React.useState<string[]>(['react']);
  const [query, setQuery] = React.useState('vi');
  const [results, setResults] = React.useState<string[]>(() => REPOS.filter((r) => r.includes('vi')));
  const searched = React.useRef('vi');
  const [fetching, setFetching] = React.useState(false);
  // The "server": answers after a short wait; an empty query asks for nothing. Keyed on the query
  // whose results are on screen, so a remount (or React's double effect) never refetches.
  React.useEffect(() => {
    if (_kind !== 'server' || query === searched.current) return setFetching(false);
    if (!query.trim()) {
      searched.current = query;
      setFetching(false);
      return setResults([]);
    }
    setFetching(true);
    const timer = setTimeout(() => {
      searched.current = query;
      setResults(REPOS.filter((r) => r.includes(query.trim().toLowerCase())));
      setFetching(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [_kind, query]);
  if (_kind === 'server')
    return (
      <div className="dx-stack">
        <Preset {...rest} items={results} inputValue={query} onInputChange={setQuery} {...(fetching ? { loading: true } : null)} />
        <p className="dx-panel__lead">{query ? `${results.length} repositories match "${query}".` : 'Type a few letters: results come from the (simulated) server.'}</p>
      </div>
    );
  if (_kind === 'tags')
    return (
      <div className="dx-stack">
        <Preset {...rest} value={tags} onChange={setTags} />
        <p className="dx-panel__lead">{tags.length} tags: {tags.join(', ') || 'none'}.</p>
      </div>
    );
  return (
    <div className="dx-stack">
      <Preset {...rest} value={city} onChange={setCity} />
      <p className="dx-panel__lead">{city ? `Shipping to ${city}.` : 'Type "zur" or "sao": accents and case do not matter.'}</p>
    </div>
  );
}

export function ComboboxPlayground() {
  const page = usePage(comboboxMeta, ['size', 'tone'], { _kind: 'cities', _keep: true });
  const kind = String(page.inputs._kind);
  const inactive = inactiveComboboxOptions({ multiple: kind === 'tags' });
  const fixed = { multiple: 'set by the example above.', ...(kind === 'server' ? { filter: 'set by the example: the server filters.' } : {}), ...(kind === 'tags' ? { allowCustom: 'set by the example above.' } : {}) };
  const set = Object.fromEntries(changed(page.options, page.defaults, { ...inactive, ...fixed }));
  const shapes: Record<string, { body: string[]; use: Record<string, unknown> }> = {
    cities: {
      body: ['const [city, setCity] = useState(null);'],
      use: { label: 'City', placeholder: 'Search cities', items: CITIES, defaultInputValue: 'o', value: src(null, 'city'), onChange: src(() => {}, 'setCity') },
    },
    server: {
      body: ["const [query, setQuery] = useState('vi');", 'const { data = [], isFetching } = useQuery({ queryKey: [\'repos\', query], queryFn: () => searchRepos(query), enabled: !!query });'],
      use: { label: 'Repository', placeholder: 'owner/name', filter: 'none', items: src([], 'data'), loading: src(false, 'isFetching'), inputValue: src('vi', 'query'), onInputChange: src(() => {}, 'setQuery') },
    },
    tags: {
      body: ["const [tags, setTags] = useState(['react']);"],
      use: { label: 'Tags', multiple: true, allowCustom: true, placeholder: 'Add a tag', defaultInputValue: 'type', items: ['react', 'typescript', 'css', 'accessibility', 'design-system'], value: src(['react'], 'tags'), onChange: src(() => {}, 'setTags') },
    },
  };
  const shape = shapes[kind];
  const spec: ExampleSpec = { name: 'Search', preset: set, body: shape.body, tree: [{ app: Finder, use: { ...shape.use, _kind: src(kind, '') }, code: ['$TAG'] }], previewOnly: page.inputs._keep ? { open: true } : undefined };
  return (
    <Page
      meta={comboboxMeta}
      page={page}
      define={defineCombobox}
      spec={spec}
      inactive={{ ...inactive, ...fixed }}
      inherit={['size', 'tone']}
      provider
      align="start"
      file="components/search"
      frame={(live) => <div className="dx-list-demo">{live}</div>}
      note={
        page.inputs._keep
          ? KEEP_NOTE
          : kind === 'server'
          ? 'filter="none": your items are the results; loading shows a row and marks the list busy while the (simulated) request runs.'
          : kind === 'tags'
            ? 'Enter adds what you typed; Backspace in an empty field removes the last tag.'
            : 'The first match is active as you type, so Enter takes it. Escape closes, then clears.'
      }
      demo={<><Choice page={page} name="_kind" label="example" options={[['cities', 'cities: filter your rows'], ['server', 'repositories: search a server'], ['tags', 'tags: several, free text']]} /><Keep page={page} /></>}
    />
  );
}

/* ------------------------------------------------------------------ tags */

const PRODUCTS = [
  { name: 'Trail runner', tags: ['Waterproof', 'Under $100'] },
  { name: 'City sneaker', tags: ['Vegan', 'Under $100'] },
  { name: 'Hiking boot', tags: ['Waterproof', 'Leather'] },
  { name: 'Canvas slip-on', tags: ['Vegan', 'Under $100', 'Sale'] },
  { name: 'Derby shoe', tags: ['Leather', 'Sale'] },
  { name: 'Rain boot', tags: ['Waterproof', 'Vegan'] },
];
const TOPICS = ['Design', 'Engineering', 'Accessibility', 'Research', 'Writing'];
const ARTICLES = [
  { title: 'Focus rings that survive dark mode', topics: ['Design', 'Accessibility'] },
  { title: 'A listbox from scratch', topics: ['Engineering', 'Accessibility'] },
  { title: 'Interviewing five teams about forms', topics: ['Research'] },
  { title: 'Error messages people read', topics: ['Writing', 'Design'] },
  { title: 'Tokens over themes', topics: ['Design', 'Engineering'] },
];

/** Filters remove themselves and the product list follows; topics pick the articles. */
function TagsDemo({ Preset, props }: { Preset: React.ElementType; props: Record<string, any> }) {
  const { _kind, ...rest } = props;
  const [filters, setFilters] = React.useState(['Waterproof', 'Under $100']);
  const [topics, setTopics] = React.useState<string[]>(['Accessibility']);
  if (_kind === 'pick') {
    const shown = ARTICLES.filter((a) => !topics.length || a.topics.some((t) => topics.includes(t)));
    return (
      <div className="dx-stack">
        <Preset {...rest} value={topics} onChange={setTopics} />
        <ul className="dx-tasks">{shown.map((a) => <li key={a.title}>{a.title}</li>)}</ul>
      </div>
    );
  }
  if (_kind === 'status') return <Preset {...rest} />;
  const shown = PRODUCTS.filter((p) => filters.every((f) => p.tags.includes(f)));
  return (
    <div className="dx-stack">
      <Preset {...rest} items={filters} onRemove={(v: string) => setFilters((f) => f.filter((x) => x !== v))} />
      <p className="dx-panel__lead">{shown.length} of {PRODUCTS.length} shoes: {shown.map((p) => p.name).join(', ') || 'none'}.</p>
      {filters.length < 2 ? (
        <div>
          <Button label="Reset filters" size="sm" variant="soft" onClick={() => setFilters(['Waterproof', 'Under $100'])} />
        </div>
      ) : null}
    </div>
  );
}

export function TagsPlayground() {
  const page = usePage(tagsMeta, ['size'], { _kind: 'filters' });
  const kind = String(page.inputs._kind);
  const config = { selection: kind === 'pick' ? 'multiple' : (page.options.selection as string), onRemove: kind === 'filters' ? 1 : undefined, maxVisible: kind === 'status' ? 3 : undefined };
  const inactive = { ...inactiveTagsOptions(config), selection: 'set by the example above.' };
  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));
  const shapes: Record<string, { body: string[]; use: Record<string, unknown>; code: string[] }> = {
    filters: {
      body: ["const [filters, setFilters] = useState(['Waterproof', 'Under $100']);"],
      use: { label: 'Filters', items: src(['Waterproof', 'Under $100'], 'filters'), onRemove: src(() => {}, '(value) => setFilters((f) => f.filter((x) => x !== value))') },
      code: ['$TAG', '<Results filters={filters} />'],
    },
    pick: {
      body: ["const [topics, setTopics] = useState(['Accessibility']);"],
      use: { label: 'Topics', selection: 'multiple', items: TOPICS, value: src(['Accessibility'], 'topics'), onChange: src(() => {}, 'setTopics') },
      code: ['$TAG', '<Articles topics={topics} />'],
    },
    status: {
      body: [],
      use: {
        label: 'Release',
        maxVisible: 3,
        items: [
          { value: 'live', label: 'Live', tone: 'success' },
          { value: 'beta', label: 'Beta', tone: 'warning' },
          { value: 'docs', label: 'Docs', href: '#/tags' },
          { value: 'a11y', label: 'Accessible', tone: 'info' },
          { value: 'rtl', label: 'RTL' },
        ],
      },
      code: ['$TAG'],
    },
  };
  const shape = shapes[kind];
  const spec: ExampleSpec = { name: 'Chips', preset: set, body: shape.body.length ? shape.body : undefined, tree: [{ app: TagsDemo, use: { ...shape.use, _kind: src(kind, '') }, code: shape.code }] };
  return (
    <Page
      meta={tagsMeta}
      page={page}
      define={defineTags}
      spec={spec}
      inactive={inactive}
      inherit={['size']}
      provider={['size']}
      align="start"
      file="components/chips"
      note={
        kind === 'pick'
          ? 'A listbox: Tab in once, arrows move, Space picks. The articles follow the picked topics.'
          : kind === 'status'
            ? 'Each tag can carry its own tone; a tag with href is a link. "+2" shows the rest.'
            : 'Each remove button says which tag it removes; focus moves to the next tag. The shoes follow the filters.'
      }
      demo={<Choice page={page} name="_kind" label="example" options={[['filters', 'filters to remove'], ['pick', 'topics to pick'], ['status', 'labels, tones and a link']]} />}
    />
  );
}

/* --------------------------------------------------------------- command */

const ICONS_CMD = {
  file: TAB_ICON('M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5'),
  folder: FOLDER_ICON,
  gear: TAB_ICON('M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z'),
  moon: TAB_ICON('M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z'),
  user: USER_ICON,
};
const COMMANDS = [
  { label: 'New file', icon: ICONS_CMD.file, shortcut: '⌘N', group: 'File' },
  { label: 'Open folder', icon: ICONS_CMD.folder, shortcut: '⌘O', group: 'File' },
  { label: 'Toggle dark mode', icon: ICONS_CMD.moon, keywords: ['theme', 'light'], group: 'View' },
  { label: 'Preferences', icon: ICONS_CMD.gear, keywords: ['settings'], shortcut: '⌘,', group: 'View' },
  { label: 'Invite a teammate', icon: ICONS_CMD.user, description: 'Send an email invite', group: 'Team' },
  { label: 'Billing', icon: ICONS_CMD.user, group: 'Team', disabled: true },
];

/** Commands run here: the last one shows under the palette. */
function CommandDemo({ Preset, props }: { Preset: React.ElementType; props: Record<string, any> }) {
  const { _kind, ...rest } = props;
  const [ran, setRan] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);
  const run = (value: string) => setRan(value);
  if (_kind === 'dialog')
    return (
      <div className="dx-stack">
        <div className="dx-panel__row">
          <Button label="Open the palette" variant="outline" onClick={() => setOpen(true)} />
          <Kbd keys={['mod', 'k']} />
        </div>
        <Preset {...rest} open={open} onOpenChange={setOpen} onSelect={run} />
        <p className="dx-panel__lead">{ran ? `Ran "${ran}".` : 'Press ⌘K (Ctrl+K) anywhere on this page.'}</p>
      </div>
    );
  return (
    <div className="dx-stack">
      <Preset {...rest} onSelect={run} />
      <p className="dx-panel__lead">{ran ? `Ran "${ran}".` : 'Type "set" to find Preferences by its keyword.'}</p>
    </div>
  );
}

export function CommandPlayground() {
  const page = usePage(commandMeta, ['size', 'tone'], { _kind: 'inline' });
  const kind = String(page.inputs._kind);
  const inactive = { ...inactiveCommandOptions({ mode: kind }), mode: 'set by the example above.' };
  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));
  const preset = kind === 'dialog' ? { ...set, mode: 'dialog' } : set;
  const items = COMMANDS.map((c, i) => ({ ...c, icon: src(c.icon, ['<FileIcon />', '<FolderIcon />', '<MoonIcon />', '<GearIcon />', '<UserIcon />', '<UserIcon />'][i]) }));
  const use: Record<string, unknown> = { label: 'Commands', items, onSelect: src(() => {}, 'runCommand'), _kind: src(kind, '') };
  if (kind === 'dialog') {
    use.open = src(false, 'open');
    use.onOpenChange = src(() => {}, 'setOpen');
  }
  const spec: ExampleSpec = {
    name: 'Palette',
    preset,
    body: kind === 'dialog' ? ['const [open, setOpen] = useState(false); // ⌘K / Ctrl+K toggles it too'] : undefined,
    tree: [{ app: CommandDemo, use, code: kind === 'dialog' ? ["<Button label=\"Open the palette\" onClick={() => setOpen(true)} />", '$TAG'] : ['$TAG'] }],
    after: ['// Each command can carry its own onSelect, or an href that goes through the provider\'s navigate.'],
  };
  return (
    <Page
      meta={commandMeta}
      page={page}
      define={defineCommand}
      spec={spec}
      inactive={inactive}
      inherit={['size', 'tone']}
      provider
      align="start"
      file="components/palette"
      note={kind === 'dialog' ? 'A native modal: the page goes inert, Escape closes and focus returns. ⌘K / Ctrl+K opens it from anywhere.' : 'Typing narrows by name or keyword; the first command is active, so Enter runs it. Arrows skip the disabled one.'}
      demo={<Choice page={page} name="_kind" label="example" options={[['inline', 'on the page'], ['dialog', 'a ⌘K dialog']]} />}
    />
  );
}

/* -------------------------------------------------------------- calendar */

const BOOKED = new Set(['2026-11-13', '2026-11-14', '2026-11-27']);
const EVENTS: Record<string, string[]> = {
  '2026-11-09': ['Design review, 10:00', 'Lunch with Maya'],
  '2026-11-12': ['Release 0.17, 16:00'],
  '2026-11-18': ['Accessibility audit'],
  '2026-11-25': ['Quarterly planning', 'Team dinner'],
};
const nights = (r: { start: string; end: string } | null) => (r ? Math.round((Date.parse(r.end) - Date.parse(r.start)) / 864e5) : 0);

/** A stay whose price follows the range; an agenda that follows the day; days that follow the picks. */
function CalendarDemo({ Preset, props }: { Preset: React.ElementType; props: Record<string, any> }) {
  const { _kind, ...rest } = props;
  const [stay, setStay] = React.useState<{ start: string; end: string } | null>({ start: '2026-11-18', end: '2026-11-21' });
  const [day, setDay] = React.useState('2026-11-09');
  const [days, setDays] = React.useState<string[]>(['2026-11-10', '2026-11-11', '2026-11-17']);
  if (_kind === 'range') {
    const n = nights(stay);
    return (
      <div className="dx-stack">
        <Preset {...rest} value={stay} onChange={setStay} />
        <ul className="dx-lines">
          <li><span>Stay</span><span>{stay ? `${stay.start} → ${stay.end}` : '—'}</span></li>
          <li className="dx-lines__total"><span>{n} night{n === 1 ? '' : 's'} × $140</span><span>${n * 140}</span></li>
        </ul>
      </div>
    );
  }
  if (_kind === 'multiple')
    return (
      <div className="dx-stack">
        <Preset {...rest} value={days} onChange={setDays} />
        <p className="dx-panel__lead">{days.length ? `Available on ${days.length} day${days.length === 1 ? '' : 's'}: ${days.join(', ')}.` : 'Pick the days you are free.'}</p>
      </div>
    );
  return (
    <div className="dx-stack">
      <Preset {...rest} value={day} onChange={setDay} />
      <ul className="dx-tasks">{(EVENTS[day] ?? ['Nothing planned.']).map((e) => <li key={e}>{e}</li>)}</ul>
    </div>
  );
}

export function CalendarPlayground() {
  const page = usePage(calendarMeta, ['size', 'tone'], { _kind: 'single' });
  const kind = String(page.inputs._kind);
  const inactive = { ...inactiveCalendarOptions(page.options), mode: 'set by the example above.' };
  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));
  const shapes: Record<string, { body: string[]; use: Record<string, unknown>; code: string[] }> = {
    single: {
      body: ["const [day, setDay] = useState('2026-11-09');"],
      use: { defaultMonth: '2026-11-01', value: src('2026-11-09', 'day'), onChange: src(() => {}, 'setDay') },
      code: ['$TAG', '<Agenda day={day} />'],
    },
    range: {
      body: ["const [stay, setStay] = useState({ start: '2026-11-18', end: '2026-11-21' });", "const booked = new Set(['2026-11-13', '2026-11-14', '2026-11-27']);"],
      use: { mode: 'range', defaultMonth: '2026-11-01', min: '2026-11-03', value: src(null, 'stay'), onChange: src(() => {}, 'setStay'), isDateDisabled: src((d: string) => BOOKED.has(d), '(d) => booked.has(d)') },
      code: ['$TAG', '<Price nights={nights(stay)} />'],
    },
    multiple: {
      body: ["const [days, setDays] = useState(['2026-11-10', '2026-11-11', '2026-11-17']);"],
      use: { mode: 'multiple', defaultMonth: '2026-11-01', isDateDisabled: src((d: string) => [0, 6].includes(new Date(d).getUTCDay()), '(d) => isWeekend(d)'), value: src([], 'days'), onChange: src(() => {}, 'setDays') },
      code: ['$TAG'],
    },
  };
  const shape = shapes[kind];
  const spec: ExampleSpec = { name: 'Picker', preset: set, body: shape.body, tree: [{ app: CalendarDemo, use: { ...shape.use, _kind: src(kind, '') }, code: shape.code }] };
  return (
    <Page
      meta={calendarMeta}
      page={page}
      define={defineCalendar}
      spec={spec}
      inactive={inactive}
      inherit={['size', 'tone']}
      provider
      align="start"
      file="components/picker"
      note={
        kind === 'range'
          ? 'Two picks, in any order; the band follows the pointer until the second. Booked nights cannot be chosen. The price follows.'
          : kind === 'multiple'
            ? 'Each pick toggles a day; weekends cannot be chosen. Values are ISO dates, the same on the server.'
            : 'Arrows move a day or a week, PageUp and PageDown a month (with Shift, a year). The agenda follows the day.'
      }
      demo={<Choice page={page} name="_kind" label="example" options={[['single', 'a day and its agenda'], ['range', 'a stay and its price'], ['multiple', 'days you are free']]} />}
    />
  );
}

/* ------------------------------------------------------------ datepicker */

/** A due date with how far away it is; a stay with its nights. */
function DateDemo({ Preset, props }: { Preset: React.ElementType; props: Record<string, any> }) {
  const { _kind, ...rest } = props;
  const [due, setDue] = React.useState<string | null>('2026-11-20');
  const [stay, setStay] = React.useState<{ start: string; end: string } | null>({ start: '2026-12-22', end: '2026-12-27' });
  if (_kind === 'range')
    return (
      <div className="dx-stack">
        <Preset {...rest} value={stay} onChange={setStay} />
        <p className="dx-panel__lead">{stay ? `${nights(stay)} nights, checking in ${stay.start}.` : 'No dates yet.'}</p>
      </div>
    );
  return (
    <div className="dx-stack">
      <Preset {...rest} value={due} onChange={setDue} />
      <p className="dx-panel__lead">{due ? `Due ${due}: ${Math.round((Date.parse(due) - Date.parse('2026-11-08')) / 864e5)} days after 8 November.` : 'No due date.'}</p>
    </div>
  );
}

export function DatePickerPlayground() {
  const page = usePage(datepickerMeta, ['size', 'tone'], { _kind: 'single', _keep: true });
  const kind = String(page.inputs._kind);
  const inactive = { ...inactiveDatePickerOptions(page.options), mode: 'set by the example above.' };
  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));
  const use: Record<string, unknown> =
    kind === 'range'
      ? { label: 'Stay', mode: 'range', name: 'stay', months: 2, locale: 'en-GB', value: src(null, 'stay'), onChange: src(() => {}, 'setStay'), _kind: src(kind, '') }
      : { label: 'Due date', description: 'Type it, or pick it from the calendar.', locale: 'en-GB', min: '2026-11-08', value: src(null, 'due'), onChange: src(() => {}, 'setDue'), _kind: src(kind, '') };
  const spec: ExampleSpec = {
    name: 'DateField',
    preset: set,
    body: [kind === 'range' ? "const [stay, setStay] = useState({ start: '2026-12-22', end: '2026-12-27' });" : "const [due, setDue] = useState('2026-11-20');"],
    tree: [{ app: DateDemo, use, code: ['$TAG'] }],
    previewOnly: page.inputs._keep ? { open: true } : undefined,
  };
  return (
    <Page
      meta={datepickerMeta}
      page={page}
      define={defineDatePicker}
      spec={spec}
      inactive={inactive}
      inherit={['size', 'tone']}
      provider
      align="start"
      file="components/date-field"
      frame={(live) => <div className="dx-list-demo dx-list-demo--tall">{live}</div>}
      note={page.inputs._keep ? KEEP_NOTE : 'Type "24/12/2026" (the UK order here) and press Enter, or ArrowDown to open the calendar on the chosen day.'}
      demo={
        <>
          <Choice page={page} name="_kind" label="example" options={[['single', 'a due date'], ['range', 'a stay (range)']]} />
          <Keep page={page} />
        </>
      }
    />
  );
}

/* ----------------------------------------------------------------- table */

const ROLES = ['Engineer', 'Designer', 'Researcher', 'Writer', 'Manager'];
const TEAM = Array.from({ length: 23 }, (_, i) => ({
  id: `u${i + 1}`,
  name: ['Maya Chen', 'Leo Park', 'Ines Duarte', 'Sam Okafor', 'Aiko Mori', 'Noah Fischer', 'Priya Nair', 'Tom Hale', 'Lena Kraus', 'Omar Haddad', 'Sara Lind', 'Jon Price'][i % 12] + (i >= 12 ? ' II' : ''),
  role: ROLES[(i * 3) % ROLES.length],
  projects: ((i * 7) % 9) + 1,
  joined: `20${18 + (i % 8)}-0${(i % 9) + 1}-1${i % 9}`,
}));
type Person = (typeof TEAM)[number];

/** A directory: search filters the rows, boxes feed a bulk bar, a row opens its details. */
function Directory({ Preset, props }: { Preset: React.ElementType; props: Record<string, any> }) {
  const { _kind, _choose, loading: _printed, ...rest } = props;
  const [query, setQuery] = React.useState('');
  const [chosen, setChosen] = React.useState<string[]>([]);
  const [open, setOpen] = React.useState<Person | null>(null);
  const [page, setPage] = React.useState(1);
  const [sort, setSort] = React.useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null);
  const [fetching, setFetching] = React.useState(false);
  const [served, setServed] = React.useState(() => TEAM.slice(0, 8));
  const found = TEAM.filter((p) => `${p.name} ${p.role}`.toLowerCase().includes(query.trim().toLowerCase()));
  // The "server": sorts and pages after a short wait. Keyed on what is on screen, so a remount never refetches.
  const loaded = React.useRef('1/null');
  React.useEffect(() => {
    if (_kind !== 'server') return;
    const key = `${page}/${sort ? sort.key + sort.direction : 'null'}`;
    if (key === loaded.current) return;
    setFetching(true);
    const timer = setTimeout(() => {
      const ordered = sort ? [...TEAM].sort((a, b) => String(a[sort.key as keyof Person]).localeCompare(String(b[sort.key as keyof Person]), undefined, { numeric: true }) * (sort.direction === 'ascending' ? 1 : -1)) : TEAM;
      loaded.current = key;
      setServed(ordered.slice((page - 1) * 8, page * 8));
      setFetching(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [_kind, page, sort]);
  const server = _kind === 'server';
  return (
    <div className="dx-stack">
      {server ? null : <Input label="Search people" hideLabel placeholder="Search by name or role" value={query} onChange={(v) => (setQuery(v), setPage(1))} />}
      {chosen.length ? (
        <div className="dx-panel__row dx-bulk">
          <span>{chosen.length} selected</span>
          <Button label="Message" size="sm" variant="soft" />
          <Button label="Clear" size="sm" variant="ghost" onClick={() => setChosen([])} />
        </div>
      ) : null}
      <Preset
        {...rest}
        rows={server ? served : found}
        {...(server ? { total: TEAM.length, manualSort: true, sort, onSortChange: (s: typeof sort) => (setSort(s), setPage(1)) } : null)}
        page={page}
        onPageChange={setPage}
        {...(_choose ? { selected: chosen, onSelectionChange: setChosen } : null)}
        onRowAction={(row: Person) => setOpen(row)}
        {...(fetching ? { loading: true } : null)}
      />
      {open ? (
        <Card title={open.name} description={`${open.role} · ${open.projects} projects · joined ${open.joined}`} actions={[{ label: 'Close', onClick: () => setOpen(null) }]} />
      ) : null}
    </div>
  );
}

export function TablePlayground() {
  const page = usePage(tableMeta, ['size', 'tone'], { _kind: 'client' });
  const kind = String(page.inputs._kind);
  const inactive = inactiveTableOptions({ selection: page.options.selection as string, pageSize: 8 });
  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));
  const columns = [
    { key: 'name', sortable: true },
    { key: 'role', sortable: true },
    { key: 'projects', align: 'end', sortable: true },
    { key: 'joined', header: 'Joined', sortable: true },
  ];
  const choose = !!page.options.selection && page.options.selection !== 'none';
  const use: Record<string, unknown> = { label: 'Team', columns, pageSize: 8, _kind: src(kind, ''), _choose: src(choose, '') };
  const spec: ExampleSpec =
    kind === 'server'
      ? {
          name: 'Grid',
          preset: set,
          body: [
            'const [page, setPage] = useState(1);',
            'const [sort, setSort] = useState(null);',
            "const { data, isFetching } = useQuery({ queryKey: ['team', page, sort], queryFn: () => fetchTeam({ page, sort }), placeholderData: keepPreviousData });",
          ],
          tree: [{ app: Directory, use: { ...use, rows: src([], 'data.rows'), total: src(TEAM.length, 'data.total'), manualSort: true, sort: src(null, 'sort'), onSortChange: src(() => {}, 'setSort'), page: src(1, 'page'), onPageChange: src(() => {}, 'setPage'), loading: src(false, 'isFetching') }, code: ['$TAG'] }],
        }
      : {
          name: 'Grid',
          preset: set,
          body: [
            "const [query, setQuery] = useState('');",
            'const [chosen, setChosen] = useState([]);',
            'const rows = team.filter((p) => matches(p, query));',
          ],
          tree: [
            {
              app: Directory,
              use: { ...use, rows: src(TEAM, 'rows'), ...(choose ? { selected: src([], 'chosen'), onSelectionChange: src(() => {}, 'setChosen') } : null), onRowAction: src(() => {}, '(person) => openProfile(person)') },
              code: ['<Search value={query} onChange={setQuery} />', ...(choose ? ['{chosen.length > 0 && <BulkBar count={chosen.length} />}'] : []), '$TAG'],
            },
          ],
        };
  return (
    <Page
      meta={tableMeta}
      page={page}
      define={defineTable}
      spec={spec}
      inactive={inactive}
      inherit={['size', 'tone']}
      provider
      align="start"
      file="components/team"
      note={
        kind === 'server'
          ? 'The (simulated) server sorts and pages: manualSort and total. While it answers, the rows stay and the table is busy.'
          : 'Search filters the rows; headers sort (again to reverse, a third time to clear); boxes feed the bar above; a row opens its details.'
      }
      demo={<Choice page={page} name="_kind" label="example" options={[['client', 'rows you hold: search, sort, choose'], ['server', 'a server that sorts and pages']]} />}
    />
  );
}

/* ---------------------------------------------------------------- rating */

const VOTES = [5, 4, 5, 3, 4, 5, 4, 4, 5, 2];
const WORDS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

/** Your rating joins the others: the average (a read-only rating) follows. */
function Review({ Preset, props }: { Preset: React.ElementType; props: Record<string, any> }) {
  const { _ro, ...rest } = props;
  // The average is read-only: no handler, no form name.
  const { onChange: _change, name: _name, ...shared } = rest;
  const [mine, setMine] = React.useState(4);
  const votes = mine ? [...VOTES, mine] : VOTES;
  const average = Math.round((votes.reduce((a, b) => a + b, 0) / votes.length) * 10) / 10;
  return (
    <div className="dx-stack">
      <Preset {...rest} value={mine} {...(_ro ? null : { onChange: setMine })} />
      <p className="dx-panel__lead">{mine ? `${WORDS[Math.ceil(mine)]}: ${mine} of 5.` : 'No rating yet.'}</p>
      <Preset {...shared} label="Average rating" readOnly showValue value={average} />
      <span className="dx-hint">{votes.length} ratings</span>
    </div>
  );
}

export function RatingPlayground() {
  const page = usePage(ratingMeta, ['size'], {});
  const inactive = inactiveRatingOptions(page.options);
  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));
  const spec: ExampleSpec = {
    name: 'Stars',
    preset: set,
    body: ['const [mine, setMine] = useState(4);', 'const average = averageOf([...votes, mine]);'],
    tree: [{ app: Review, use: { label: 'Your rating', name: 'rating', value: src(4, 'mine'), ...(page.options.readOnly ? null : { onChange: src(() => {}, 'setMine') }), _ro: src(!!page.options.readOnly, '') }, code: ['$TAG', '<Stars label="Average rating" readOnly showValue value={average} />'] }],
  };
  return (
    <Page
      meta={ratingMeta}
      page={page}
      define={defineRating}
      spec={spec}
      inactive={inactive}
      inherit={['size']}
      provider={['size']}
      align="start"
      file="components/review"
      note="Point to preview, press to choose, press again to clear; arrows move as in any radio group. Your rating moves the average under it."
    />
  );
}

/* -------------------------------------------------------------- timeline */

const STAGES = [
  { title: 'Ordered', description: 'Wool overshirt, canvas tote', time: '2026-11-02T10:15' },
  { title: 'Packed', time: '2026-11-03T16:40' },
  { title: 'Shipped', description: 'Tracking number PF-48213', time: '2026-11-04T09:30', tone: 'success' as const },
  { title: 'Out for delivery', time: '2026-11-06T07:55' },
  { title: 'Delivered', time: '2026-11-06T13:20', tone: 'success' as const },
];

/** An order you can move along: each step joins the history. */
function OrderTracking({ Preset, props }: { Preset: React.ElementType; props: Record<string, any> }) {
  const [step, setStep] = React.useState(3);
  const done = step >= STAGES.length;
  return (
    <div className="dx-stack">
      <Preset {...props} items={STAGES.slice(0, step)} pending={!done && props.pending} />
      <div className="dx-panel__row">
        <Button label={done ? 'Delivered' : `Mark "${STAGES[step].title}"`} size="sm" variant="soft" disabled={done} onClick={() => setStep((s) => s + 1)} />
        <Button label="Reset" size="sm" variant="ghost" onClick={() => setStep(1)} />
      </div>
    </div>
  );
}

export function TimelinePlayground() {
  const page = usePage(timelineMeta, ['size', 'tone'], {});
  const inactive = inactiveTimelineOptions(page.options);
  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));
  const spec: ExampleSpec = {
    name: 'History',
    preset: set,
    body: ['const events = order.events; // [{ title, time, description?, tone? }]'],
    tree: [{ app: OrderTracking, use: { label: 'Order history', locale: 'en-GB', items: src(STAGES.slice(0, 3), 'events') }, code: ['$TAG'] }],
  };
  return (
    <Page
      meta={timelineMeta}
      page={page}
      define={defineTimeline}
      spec={spec}
      inactive={inactive}
      inherit={['size', 'tone']}
      provider
      align="start"
      file="components/order-history"
      note="Times are ISO: shown in the locale (here en-GB), exact in <time datetime>. Mark the next step and the history grows."
    />
  );
}

/* ----------------------------------------------------------------- empty */

const MAIL = ['Your invoice is ready', 'Design review moved to 3pm', 'Welcome to the team'];

/** An inbox: archiving everything leaves the empty state, whose action brings it back. */
function Inbox({ Preset, props }: { Preset: React.ElementType; props: Record<string, any> }) {
  const [mail, setMail] = React.useState<string[]>([]);
  if (!mail.length) return <Preset {...props} actions={[{ label: 'Bring back the messages', onClick: () => setMail(MAIL) }, { label: 'Settings' }]} />;
  return (
    <div className="dx-stack">
      <ul className="dx-tasks">{mail.map((m) => <li key={m}>{m}</li>)}</ul>
      <div>
        <Button label="Archive all" size="sm" variant="soft" onClick={() => setMail([])} />
      </div>
    </div>
  );
}

export function EmptyPlayground() {
  const page = usePage(emptyMeta, ['size', 'tone'], {});
  const inactive = inactiveEmptyOptions(page.options);
  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));
  const spec: ExampleSpec = {
    name: 'InboxZero',
    preset: set,
    body: ['const { messages, restore } = useInbox();'],
    tree: [
      {
        app: Inbox,
        use: { title: 'You are all caught up', description: 'New messages land here. Archived ones are one click away.', actions: src([], "[{ label: 'Bring back the messages', onClick: restore }, { label: 'Settings' }]") },
        code: ['{messages.length === 0 ? (', '  $TAG', ') : (', '  <MessageList messages={messages} />', ')}'],
      },
    ],
  };
  return (
    <Page
      meta={emptyMeta}
      page={page}
      define={defineEmpty}
      spec={spec}
      inactive={inactive}
      inherit={['size', 'tone']}
      provider
      align="start"
      file="components/inbox"
      note="The empty state stands where the list was: its main action brings the messages back, and Archive all empties it again."
    />
  );
}

/* -------------------------------------------------------------- carousel */

const SHOP = [
  { name: 'Wool overshirt', price: 118 },
  { name: 'Canvas tote', price: 34 },
  { name: 'Linen shirt', price: 76 },
  { name: 'Field jacket', price: 189 },
  { name: 'Knit beanie', price: 28 },
  { name: 'Leather belt', price: 52 },
];

/** Products in a row: adding one fills the cart under it. */
function Shelf({ Preset, props }: { Preset: React.ElementType; props: Record<string, any> }) {
  const [cart, setCart] = React.useState<string[]>([]);
  const slides = SHOP.map((p, i) => ({
    label: p.name,
    content: (
      <div className="dx-product">
        <div className="dx-product__art" style={{ background: `linear-gradient(135deg, oklch(0.75 0.09 ${(i * 55) % 360}), oklch(0.6 0.12 ${(i * 55 + 40) % 360}))` }} />
        <strong>{p.name}</strong>
        <span className="dx-hint">${p.price}</span>
        <Button label={cart.includes(p.name) ? 'In cart' : 'Add to cart'} size="sm" variant={cart.includes(p.name) ? 'soft' : 'solid'} onClick={() => setCart((c) => (c.includes(p.name) ? c.filter((x) => x !== p.name) : [...c, p.name]))} />
      </div>
    ),
  }));
  const total = SHOP.filter((p) => cart.includes(p.name)).reduce((s, p) => s + p.price, 0);
  return (
    <div className="dx-stack">
      <Preset {...props} slides={slides} />
      <p className="dx-panel__lead">{cart.length ? `${cart.length} in cart: $${total}.` : 'Your cart is empty.'}</p>
    </div>
  );
}

export function CarouselPlayground() {
  const page = usePage(carouselMeta, ['size', 'tone'], { _autoplay: false, _per: '2' });
  const perView = Number(page.inputs._per);
  const inactive = inactiveCarouselOptions({ slides: SHOP, slidesPerView: perView });
  const set = { ...Object.fromEntries(changed(page.options, page.defaults, inactive)), ...(perView !== 1 ? { slidesPerView: perView } : null) };
  const use: Record<string, unknown> = { label: 'New arrivals', slides: src([], "products.map((p) => ({ label: p.name, content: <ProductCard product={p} onAdd={addToCart} /> }))") };
  if (page.inputs._autoplay) use.autoplay = 4000;
  const spec: ExampleSpec = { name: 'Gallery', preset: set, body: ['const { cart, addToCart } = useCart();'], tree: [{ app: Shelf, use, code: ['$TAG', '<CartSummary cart={cart} />'] }] };
  return (
    <Page
      meta={carouselMeta}
      page={page}
      define={defineCarousel}
      spec={spec}
      inactive={inactive}
      inherit={['size', 'tone']}
      provider
      align="start"
      file="components/new-arrivals"
      note="Swipe or scroll the row, or use the buttons and dots. Adding a product fills the cart under it. With autoplay there is a pause button, and it stops while you point at it."
      demo={
        <>
          <Choice page={page} name="_per" label="slidesPerView" options={[['1', '1'], ['1.2', '1.2 (peek)'], ['2', '2'], ['3', '3']]} />
          <div className="dx-opts">
            <Toggle page={page} name="_autoplay" label="autoplay every 4 s" />
          </div>
        </>
      }
    />
  );
}

/* ------------------------------------------------------------- resizable */

const FILES: Record<string, string> = {
  'App.tsx': "export function App() {\n  return <Workspace label=\"Editor\" panels={panels} />;\n}",
  'theme.css': ':root {\n  --pinfold-radius-scale: 1.25;\n}',
  'README.md': '# Pinfold\n\nDrag the handle, or focus it and use the arrow keys.',
};

/** An editor: the file list on one side drives the code on the other. */
function Editor({ Preset, props }: { Preset: React.ElementType; props: Record<string, any> }) {
  const [file, setFile] = React.useState('App.tsx');
  const panels = [
    {
      id: 'files',
      label: 'Files',
      defaultSize: 28,
      min: 18,
      max: 50,
      content: (
        <ul className="dx-filelist">
          {Object.keys(FILES).map((f) => (
            <li key={f}>
              <button type="button" aria-current={f === file || undefined} onClick={() => setFile(f)}>
                {FILE_ICON}
                {f}
              </button>
            </li>
          ))}
        </ul>
      ),
    },
    { id: 'code', label: 'Code', min: 30, content: <pre className="dx-file dx-file--flat">{FILES[file]}</pre> },
  ];
  return <Preset {...props} panels={panels} />;
}

export function ResizablePlayground() {
  const page = usePage(resizableMeta, ['size', 'tone'], {});
  const inactive = inactiveResizableOptions(page.options);
  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));
  const spec: ExampleSpec = {
    name: 'Workspace',
    preset: set,
    body: ["const [file, setFile] = useState('App.tsx');"],
    tree: [
      {
        app: Editor,
        use: {
          label: 'Editor',
          autoSaveId: 'editor',
          panels: src([], "[{ id: 'files', label: 'Files', defaultSize: 28, min: 18, max: 50, content: <FileList current={file} onOpen={setFile} /> }, { id: 'code', label: 'Code', min: 30, content: <Code file={file} /> }]"),
        },
        code: ['$TAG'],
      },
    ],
  };
  return (
    <Page
      meta={resizableMeta}
      page={page}
      define={defineResizable}
      spec={spec}
      inactive={inactive}
      inherit={['size', 'tone']}
      provider
      align="start"
      file="components/editor"
      note="Drag the handle, or focus it and use the arrow keys (Home and End for the limits; a double click restores it). The sizes are kept in this browser. Choosing a file shows it beside."
    />
  );
}
