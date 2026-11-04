import * as React from 'react';
import { Tooltip, useTooltip, type TooltipConfig } from '@pinfold/react/tooltip';
import { Popover, usePopover, type PopoverConfig } from '@pinfold/react/popover';
import { useDialog, type DialogConfig } from '@pinfold/react/dialog';
import { Menu, useMenu, type MenuConfig, type MenuItem } from '@pinfold/react/menu';
import { defineToast, type ToastPlacement } from '@pinfold/react/toast';
import { useButton } from '@pinfold/react/button';
import { dialogMeta, menuMeta, popoverMeta, toastMeta, tooltipMeta } from '@pinfold/core/meta';
import { inactiveDialogOptions, inactiveMenuOptions, inactivePopoverOptions } from '@pinfold/core';
import { changed, CodePanel, EnvControls, OptionControls, Stage } from './shared';
import { autoFromEnv, presetCode, usePage } from './DisplayPlayground';
import { TextField } from './SurfacePlayground';

/**
 * Playgrounds for the overlays. Each preview holds two copies of the same config: one forced open,
 * so every option shows without hovering or clicking, and one that behaves for real.
 */

const Demo = ({ children }: { children: React.ReactNode }) => <div className="dx-overlay-demo">{children}</div>;
const Note = ({ children }: { children: React.ReactNode }) => <p className="dx-hint dx-resolved">{children}</p>;

/* --------------------------------------------------------------- tooltip */

function TooltipPreview({ config }: { config: Omit<TooltipConfig, 'trigger'> }) {
  const Shown = useTooltip({ ...config, open: true, trigger: { label: 'Always open here', variant: 'outline' } });
  return (
    <Demo>
      <Shown />
      <Tooltip {...config} trigger={{ label: 'Hover or focus me' }} />
    </Demo>
  );
}

export function TooltipPlayground() {
  const page = usePage(tooltipMeta, 'Copies the link to this page');
  const { state, setState, controls, defaults } = page;
  const set = changed(state.options, defaults);
  const config = { ...(Object.fromEntries(set) as Partial<TooltipConfig>), content: state.text };
  return (
    <div className="dx-play">
      <div className="dx-play__editor">
        <TextField id="tooltip-content" label="content" hint="the hint" value={state.text} onChange={(v) => setState((s) => ({ ...s, text: v }))} />
        <OptionControls controls={controls} options={state.options} setOption={page.setOption} />
        <EnvControls env={state.env} setEnv={page.setEnv} />
        <button type="button" className="dx-btn" onClick={page.reset}>
          Reset
        </button>
      </div>
      <div className="dx-play__preview">
        <Stage env={state.env}>
          <TooltipPreview config={config} />
        </Stage>
        <Note>Escape closes it; the pointer can move onto it without it closing.</Note>
        <CodePanel
          file="components/hint"
          code={() => presetCode(tooltipMeta, 'Hint', set, [`content=${JSON.stringify(state.text)}`, "trigger={{ label: 'Share' }}"], state.env)}
          actions={[{ label: 'Copy CLI command', copy: 'npx pinfold add tooltip' }]}
        />
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- popover */

function PopoverPreview({ config }: { config: Omit<PopoverConfig, 'trigger'> }) {
  const Shown = usePopover({ ...config, open: true, trigger: { label: 'Always open here', variant: 'outline' } });
  return (
    <Demo>
      <Shown />
      <Popover {...config} trigger={{ label: config.openOn === 'hover' ? 'Hover or focus me' : 'Click me' }} />
    </Demo>
  );
}

export function PopoverPlayground() {
  const page = usePage(popoverMeta, 'Share this page');
  const { state, setState, controls, defaults } = page;
  const inactive = inactivePopoverOptions(state.options);
  const set = changed(state.options, defaults, inactive);
  const description = 'Anyone with the link can view it.';
  const config = { ...(Object.fromEntries(set) as Partial<PopoverConfig>), title: state.text, description, actions: [{ label: 'Copy link' }, { label: 'Close' }] };
  return (
    <div className="dx-play">
      <div className="dx-play__editor">
        <TextField id="popover-title" label="title" hint="the panel's accessible name" value={state.text} onChange={(v) => setState((s) => ({ ...s, text: v }))} />
        <OptionControls controls={controls} options={state.options} setOption={page.setOption} inactive={inactive} />
        <EnvControls env={state.env} setEnv={page.setEnv} />
        <button type="button" className="dx-btn" onClick={page.reset}>
          Reset
        </button>
      </div>
      <div className="dx-play__preview">
        <Stage env={state.env}>
          <PopoverPreview config={config} />
        </Stage>
        <CodePanel
          file="components/share"
          code={() =>
            presetCode(popoverMeta, 'Share', set, [`title=${JSON.stringify(state.text)}`, `description="${description}"`, "actions={[{ label: 'Copy link', onClick: copy }, { label: 'Close' }]}", "trigger={{ label: 'Share' }}"], state.env)
          }
          actions={[{ label: 'Copy CLI command', copy: 'npx pinfold add popover' }]}
        />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- dialog */

function DialogPreview({ config }: { config: Omit<DialogConfig, 'trigger'> }) {
  // Modal for real from the button; inline (non-modal, kept inside the stage) to show every option.
  const Real = useDialog({ ...config, trigger: { label: 'Open the real dialog' } });
  const Inline = useDialog({ ...config, open: true, modal: false, className: 'dx-dialog-inline' });
  return (
    <div className="dx-dialog-demo">
      <Real />
      <div className="dx-dialog-box">
        <Inline />
      </div>
    </div>
  );
}

export function DialogPlayground() {
  const page = usePage(dialogMeta, 'Delete this project?');
  const { state, setState, controls, defaults } = page;
  const inactive = inactiveDialogOptions(state.options);
  const set = changed(state.options, defaults, inactive);
  const description = 'It will be removed for everyone. This cannot be undone.';
  const config = { ...(Object.fromEntries(set) as Partial<DialogConfig>), title: state.text, description, actions: [{ label: 'Cancel' }, { label: 'Delete', tone: 'danger' as const }] };
  return (
    <div className="dx-play">
      <div className="dx-play__editor">
        <TextField id="dialog-title" label="title" hint="a real heading, and the accessible name" value={state.text} onChange={(v) => setState((s) => ({ ...s, text: v }))} />
        <OptionControls controls={controls} options={state.options} setOption={page.setOption} inactive={inactive} />
        <EnvControls env={state.env} setEnv={page.setEnv} />
        <button type="button" className="dx-btn" onClick={page.reset}>
          Reset
        </button>
      </div>
      <div className="dx-play__preview">
        <Stage env={state.env} align="start">
          <DialogPreview config={config} />
        </Stage>
        <Note>The panel below is drawn in place so its options show. The button opens it for real: focus stays inside, Escape closes it.</Note>
        <CodePanel
          file="components/confirm"
          code={() =>
            presetCode(dialogMeta, 'Confirm', set, [`title=${JSON.stringify(state.text)}`, `description="${description}"`, "trigger={{ label: 'Delete', tone: 'danger', variant: 'soft' }}", "actions={[{ label: 'Cancel' }, { label: 'Delete', tone: 'danger', onClick: remove }]}"], state.env)
          }
          actions={[{ label: 'Copy CLI command', copy: 'npx pinfold add dialog' }]}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ menu */

const ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4" />
  </svg>
);

function useMenuItems(): MenuItem[] {
  const [wrap, setWrap] = React.useState(true);
  const [sort, setSort] = React.useState('name');
  return [
    { label: 'Edit', icon: ICON, shortcut: 'E' },
    { label: 'Duplicate', shortcut: 'D' },
    { label: 'Archive', disabled: true },
    { type: 'separator' },
    { type: 'checkbox', label: 'Wrap lines', checked: wrap, onSelect: () => setWrap((v) => !v) },
    {
      type: 'group',
      label: 'Sort by',
      items: [
        { type: 'radio', label: 'Name', checked: sort === 'name', onSelect: () => setSort('name') },
        { type: 'radio', label: 'Date', checked: sort === 'date', onSelect: () => setSort('date') },
      ],
    },
    { type: 'separator' },
    { label: 'Delete', tone: 'danger' },
  ];
}

function MenuPreview({ config }: { config: Omit<MenuConfig, 'items' | 'trigger'> }) {
  const items = useMenuItems();
  const context = config.mode === 'context';
  const Shown = useMenu({ ...config, items, open: true, label: 'Row actions', trigger: context ? <div className="dx-menu-area">Always open here</div> : { label: 'Always open here', variant: 'outline' } });
  return (
    <div className="dx-overlay-demo dx-overlay-demo--tall">
      <Menu {...config} items={items} label="Row actions" trigger={context ? <div className="dx-menu-area" tabIndex={0}>Right-click here</div> : { label: 'Click me' }} />
      <Shown />
    </div>
  );
}

export function MenuPlayground() {
  const page = usePage(menuMeta, '', ['size']);
  const { state, controls, defaults } = page;
  const inactive = inactiveMenuOptions(state.options);
  const set = changed(state.options, defaults, inactive);
  const config = Object.fromEntries(set) as Partial<MenuConfig>;
  const use = ["trigger={{ label: 'Actions' }}", "items={[{ label: 'Edit', onSelect: edit }, { type: 'separator' }, { label: 'Delete', tone: 'danger', onSelect: remove }]}"];
  return (
    <div className="dx-play">
      <div className="dx-play__editor">
        <OptionControls controls={controls} options={state.options} setOption={page.setOption} inactive={inactive} inherit={['size']} autoLabel={autoFromEnv(state.env)} />
        <EnvControls env={state.env} setEnv={page.setEnv} provider={['size']} />
        <button type="button" className="dx-btn" onClick={page.reset}>
          Reset
        </button>
      </div>
      <div className="dx-play__preview">
        <Stage env={state.env} align="start">
          <MenuPreview config={config} />
        </Stage>
        <Note>Try the arrow keys, Home and End, and typing a letter.</Note>
        <CodePanel file="components/row-actions" code={() => presetCode(menuMeta, 'RowActions', set, use, state.env)} actions={[{ label: 'Copy CLI command', copy: 'npx pinfold add menu' }]} />
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- toast */

const Toasts = defineToast();
const SEED = () => Toasts.show({ id: 'sample', title: 'Sample toast', description: 'This one stays so you can see the options.', tone: 'success', duration: 0 });

function ToastPreview({ placement }: { placement?: ToastPlacement }) {
  React.useEffect(() => {
    SEED();
    return () => Toasts.clear();
  }, []);
  const Saved = useButton({ label: 'Success', variant: 'soft', tone: 'success', onClick: () => void Toasts.show({ title: 'Saved', description: 'Your changes are live.', tone: 'success' }) });
  const Failed = useButton({ label: 'Error with an action', variant: 'soft', tone: 'danger', onClick: () => void Toasts.show({ title: 'Upload failed', description: 'The file is too large.', tone: 'danger', action: { label: 'Retry' } }) });
  const Update = useButton({
    label: 'Update in place',
    variant: 'outline',
    onClick: () => {
      Toasts.show({ id: 'save', title: 'Saving…', duration: 0 });
      setTimeout(() => Toasts.show({ id: 'save', title: 'Saved', tone: 'success' }), 1200);
    },
  });
  return (
    <div className="dx-gallery__row">
      <Saved />
      <Failed />
      <Update />
      <Toasts placement={placement} />
    </div>
  );
}

export function ToastPlayground() {
  const page = usePage(toastMeta, '');
  const { state, controls, defaults } = page;
  const set = changed(state.options, defaults);
  const placement = state.options.placement as ToastPlacement | undefined;
  return (
    <div className="dx-play">
      <div className="dx-play__editor">
        <OptionControls controls={controls} options={state.options} setOption={page.setOption} />
        <EnvControls env={state.env} setEnv={page.setEnv} />
        <button type="button" className="dx-btn" onClick={page.reset}>
          Reset
        </button>
      </div>
      <div className="dx-play__preview">
        <Stage env={state.env}>
          <ToastPreview placement={placement} />
        </Stage>
        <Note>Hover a toast to pause it. Errors and toasts with an action stay until dismissed.</Note>
        <CodePanel
          file="components/toasts"
          code={() =>
            [
              presetCode(toastMeta, 'Toasts', set, [], state.env, (line) => [`  return ${line}; // once, near the root`]),
              '',
              '// Anywhere, also outside React.',
              "Toasts.show({ title: 'Saved', tone: 'success' });",
              "Toasts.show({ title: 'Upload failed', tone: 'danger', action: { label: 'Retry', onClick: retry } });",
            ].join('\n')
          }
          actions={[{ label: 'Copy CLI command', copy: 'npx pinfold add toast' }]}
        />
      </div>
    </div>
  );
}
