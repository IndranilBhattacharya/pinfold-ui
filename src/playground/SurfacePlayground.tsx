import * as React from 'react';
import { useAlert, type AlertConfig } from '@pinfold/react/alert';
import { Avatar, useAvatar, type AvatarConfig } from '@pinfold/react/avatar';
import { useCard, type CardConfig } from '@pinfold/react/card';
import { Progress, useProgress, type ProgressConfig } from '@pinfold/react/progress';
import { alertMeta, avatarMeta, cardMeta, progressMeta } from '@pinfold/core/meta';
import { inactiveAlertOptions, inactiveAvatarOptions, inactiveCardOptions, inactiveProgressOptions } from '@pinfold/core';
import { changed, CodePanel, EnvControls, OptionControls, Stage } from './shared';
import { autoFromEnv, presetCode, usePage } from './DisplayPlayground';

/**
 * Playgrounds for Alert, Avatar, Card and Progress. Same recipe as every page: meta-driven
 * controls, a preview inside the stage's provider, generated code that defines a preset once.
 * Demo-only toggles (an image, a link, a value) are stored under `_` keys and never reach the preset.
 */

const demo = (options: Record<string, unknown>) => Object.fromEntries(Object.entries(options).filter(([k]) => !k.startsWith('_')));
const Check = ({ id, label, checked, onChange, disabled }: { id: string; label: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) => (
  <label className="dx-opt dx-opt--check" htmlFor={id}>
    <input id={id} type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
    <span>{label}</span>
  </label>
);
const TextField = ({ id, label, hint, value, onChange }: { id: string; label: string; hint: string; value: string; onChange: (v: string) => void }) => (
  <>
    <label className="dx-label" htmlFor={id}>
      {label} <span className="dx-hint">{hint}</span>
    </label>
    <input id={id} className="dx-input" value={value} onChange={(e) => onChange(e.target.value)} />
  </>
);

/** A picture that needs no network: a soft landscape, drawn inline. */
const PHOTO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8ec5ff"/><stop offset="1" stop-color="#e0e7ff"/></linearGradient></defs><rect width="320" height="180" fill="url(#g)"/><circle cx="250" cy="48" r="20" fill="#fde68a"/><path d="M0 150 90 70l60 55 40-30 130 85H0z" fill="#6366f1" opacity=".75"/><path d="M0 180 120 110l80 70z" fill="#4338ca" opacity=".8"/></svg>',
  );

/* ----------------------------------------------------------------- alert */

function AlertPreview({ config }: { config: AlertConfig }) {
  const Message = useAlert(config);
  return Message.dismissed ? (
    <button type="button" className="dx-btn" onClick={Message.show}>
      Show the alert again
    </button>
  ) : (
    <Message />
  );
}

export function AlertPlayground() {
  const page = usePage(alertMeta, 'Payment failed');
  const { state, setState, controls, defaults } = page;
  const options = demo(state.options);
  const withActions = state.options._actions !== false;
  const inactive = inactiveAlertOptions(options);
  const set = changed(options, defaults, inactive);
  const description = 'Your card was declined. Try another card or contact your bank.';
  const config: AlertConfig = { ...(Object.fromEntries(set) as AlertConfig), title: state.text || undefined, description, actions: withActions ? [{ label: 'Retry' }, { label: 'Use another card' }] : undefined };
  const use = [
    ...(state.text ? [`title=${JSON.stringify(state.text)}`] : []),
    `description="${description}"`,
    ...(withActions ? ["actions={[{ label: 'Retry', onClick: retry }, { label: 'Use another card', onClick: change }]}"] : []),
  ];
  return (
    <div className="dx-play">
      <div className="dx-play__editor">
        <TextField id="alert-title" label="title" hint="the headline" value={state.text} onChange={(v) => setState((s) => ({ ...s, text: v }))} />
        <div className="dx-opts">
          <Check id="alert-actions" label="actions" checked={withActions} onChange={(v) => page.setOption('_actions', v)} />
        </div>
        <OptionControls controls={controls} options={options} setOption={page.setOption} inactive={inactive} />
        <EnvControls env={state.env} setEnv={page.setEnv} motion={false} />
        <button type="button" className="dx-btn" onClick={page.reset}>
          Reset
        </button>
      </div>
      <div className="dx-play__preview">
        <Stage env={state.env} align="start">
          <AlertPreview key={String(options.dismissible)} config={config} />
        </Stage>
        <CodePanel file="components/payment" code={() => presetCode(alertMeta, 'Problem', set, use, state.env)} actions={[{ label: 'Copy CLI command', copy: 'npx pinfold add alert' }]} />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- avatar */

const TEAM = ['Grace Hopper', 'Alan Turing', 'Katherine Johnson', 'Edsger Dijkstra', 'Barbara Liskov', 'Donald Knuth', 'Margaret Hamilton'].map((name) => ({ name }));

function AvatarPreview({ config }: { config: AvatarConfig }) {
  const Me = useAvatar(config);
  return (
    <div className="dx-demo-stack dx-demo-center">
      <Me />
      <Avatar {...config} name={undefined} src={undefined} status={undefined} items={TEAM} max={3} label="Project members" />
    </div>
  );
}

export function AvatarPlayground() {
  const page = usePage(avatarMeta, 'Ada Lovelace', ['size']);
  const { state, setState, controls, defaults } = page;
  const options = demo(state.options);
  const photo = !!state.options._photo;
  const inactive = inactiveAvatarOptions(options);
  const set = changed(options, defaults, inactive);
  const config: AvatarConfig = { ...(Object.fromEntries(set) as AvatarConfig), name: state.text || undefined, src: photo ? PHOTO : undefined };
  const preset = set.filter(([k]) => k !== 'status');
  const use = [...(state.text ? [`name=${JSON.stringify(state.text)}`] : []), ...(photo ? ['src={user.photo}'] : []), ...set.filter(([k]) => k === 'status').map(([k, v]) => `${k}="${v}"`)];
  return (
    <div className="dx-play">
      <div className="dx-play__editor">
        <TextField id="avatar-name" label="name" hint="initials, colour and the accessible name" value={state.text} onChange={(v) => setState((s) => ({ ...s, text: v }))} />
        <div className="dx-opts">
          <Check id="avatar-photo" label="photo" checked={photo} onChange={(v) => page.setOption('_photo', v)} />
        </div>
        <OptionControls
          controls={controls}
          options={options}
          setOption={page.setOption}
          inactive={inactive}
          inherit={['size']}
          autoLabel={(key, meta) => (key === 'status' ? 'none' : autoFromEnv(state.env)(key, meta))}
        />
        <EnvControls env={state.env} setEnv={page.setEnv} provider={['size']} motion={false} />
        <button type="button" className="dx-btn" onClick={page.reset}>
          Reset
        </button>
      </div>
      <div className="dx-play__preview">
        <Stage env={state.env}>
          <AvatarPreview config={config} />
        </Stage>
        <CodePanel file="components/person" code={() => presetCode(avatarMeta, 'Person', preset, use, state.env)} actions={[{ label: 'Copy CLI command', copy: 'npx pinfold add avatar' }]} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ card */

function CardPreview({ config }: { config: CardConfig }) {
  const Plan = useCard(config);
  return (
    <div className="dx-demo-grow">
      <Plan />
    </div>
  );
}

export function CardPlayground() {
  const page = usePage(cardMeta, 'Pro plan');
  const { state, setState, controls, defaults } = page;
  const raw = demo(state.options);
  // The select hands back strings; heading levels are numbers.
  const options = { ...raw, headingLevel: raw.headingLevel === undefined ? undefined : Number(raw.headingLevel) };
  const image = state.options._image !== false;
  const link = !!state.options._link;
  const description = 'Everything in Free, plus shared workspaces and priority support.';
  const inactive = inactiveCardOptions({ ...options, image: image || undefined, href: link ? '#/card' : undefined, title: state.text });
  const set = changed(options, defaults, inactive);
  const config: CardConfig = {
    ...(Object.fromEntries(set) as CardConfig),
    title: state.text || undefined,
    description,
    content: <p className="dx-demo-text"><b>$29</b>&nbsp;per month</p>,
    image: image ? { src: PHOTO, alt: '' } : undefined,
    href: link ? '#/card' : undefined,
    actions: link ? undefined : [{ label: 'Upgrade' }, { label: 'Compare plans' }],
  };
  const use = [
    ...(state.text ? [`title=${JSON.stringify(state.text)}`] : []),
    `description="${description}"`,
    'content={<Price amount={29} />}',
    ...(image ? ["image={{ src: plan.cover, alt: '' }}"] : []),
    ...(link ? ['href="/pricing/pro"'] : ["actions={[{ label: 'Upgrade', onClick: upgrade }, { label: 'Compare plans', onClick: compare }]}"]),
  ];
  return (
    <div className="dx-play">
      <div className="dx-play__editor">
        <TextField id="card-title" label="title" hint="a real heading; with link, the link text" value={state.text} onChange={(v) => setState((s) => ({ ...s, text: v }))} />
        <div className="dx-opts">
          <Check id="card-image" label="image" checked={image} onChange={(v) => page.setOption('_image', v)} />
          <Check id="card-link" label="whole card is a link" checked={link} onChange={(v) => page.setOption('_link', v)} />
        </div>
        <OptionControls controls={controls} options={raw} setOption={page.setOption} inactive={inactive} />
        <EnvControls env={state.env} setEnv={page.setEnv} motion={false} />
        <button type="button" className="dx-btn" onClick={page.reset}>
          Reset
        </button>
      </div>
      <div className="dx-play__preview">
        <Stage env={state.env} align="start">
          <CardPreview config={config} />
        </Stage>
        <CodePanel file="components/plan" code={() => presetCode(cardMeta, 'Plan', set, use, state.env)} actions={[{ label: 'Copy CLI command', copy: 'npx pinfold add card' }]} />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- progress */

function ProgressPreview({ config }: { config: ProgressConfig }) {
  const Upload = useProgress(config);
  return (
    <div className="dx-demo-stack dx-demo-center">
      <Upload />
      <div className="dx-gallery__row">
        {(['primary', 'success', 'warning', 'danger'] as const).map((tone) => (
          <Progress key={tone} {...config} tone={tone} label={`${tone} ${config.kind === 'meter' ? 'level' : 'task'}`} dimensions={{ width: 120 }} />
        ))}
      </div>
    </div>
  );
}

export function ProgressPlayground() {
  const page = usePage(progressMeta, 'Uploading report.pdf', ['size', 'tone']);
  const { state, setState, controls, defaults } = page;
  const options = demo(state.options);
  const busy = !!state.options._busy && options.kind !== 'meter';
  const value = busy ? undefined : Number(state.options._value ?? 64);
  const inactive = inactiveProgressOptions({ ...options, value });
  const set = changed(options, defaults, inactive);
  const config: ProgressConfig = { ...(Object.fromEntries(set) as ProgressConfig), label: state.text || undefined, value };
  const use = [...(state.text ? [`label=${JSON.stringify(state.text)}`] : []), ...(busy ? [] : ['value={progress}'])];
  return (
    <div className="dx-play">
      <div className="dx-play__editor">
        <TextField id="progress-label" label="label" hint="the accessible name" value={state.text} onChange={(v) => setState((s) => ({ ...s, text: v }))} />
        <label className="dx-label" htmlFor="progress-value">
          value <span className="dx-hint">{busy ? 'indeterminate' : `${value} of 100`}</span>
        </label>
        <input id="progress-value" type="range" min={0} max={100} value={value ?? 0} disabled={busy} onChange={(e) => page.setOption('_value', Number(e.target.value))} />
        <div className="dx-opts">
          <Check id="progress-busy" label="indeterminate" checked={busy} disabled={options.kind === 'meter'} onChange={(v) => page.setOption('_busy', v)} />
        </div>
        <OptionControls controls={controls} options={options} setOption={page.setOption} inactive={inactive} inherit={['size', 'tone']} autoLabel={autoFromEnv(state.env)} />
        <EnvControls env={state.env} setEnv={page.setEnv} provider />
        <button type="button" className="dx-btn" onClick={page.reset}>
          Reset
        </button>
      </div>
      <div className="dx-play__preview">
        <Stage env={state.env}>
          <ProgressPreview config={config} />
        </Stage>
        <CodePanel file="components/upload" code={() => presetCode(progressMeta, 'Upload', set, use, state.env)} actions={[{ label: 'Copy CLI command', copy: 'npx pinfold add progress' }]} />
      </div>
    </div>
  );
}
