import * as React from 'react';
import { dialogMeta, menuMeta, popoverMeta, toastMeta, tooltipMeta } from '@pinfold/core/meta';
import { inactiveDialogOptions, inactiveMenuOptions, inactivePopoverOptions } from '@pinfold/core';
import { defineTooltip } from '@pinfold/react/tooltip';
import { definePopover } from '@pinfold/react/popover';
import { defineDialog } from '@pinfold/react/dialog';
import { defineMenu, type MenuItem } from '@pinfold/react/menu';
import { defineToast } from '@pinfold/react/toast';
import { useButton } from '@pinfold/react/button';
import { Spinner } from '@pinfold/react/spinner';
import { ORDERS } from '../demo/harbor';
import { ObjectOptions, changed, CodePanel, EnvControls, OptionControls, Stage, Tool } from '../playground/shared';
import { exampleCode, src, type ExampleSpec } from '../playground/example';
import { Page, Text, usePage } from '../playground/kit';
import { reportEvent } from '../playground/preview-mode';

/** The overlays page. */

export const KEEP_NOTE = 'It opens as the preview loads (defaultOpen), so a change of option shows at once; switch Open on load off to start closed.';

export function TooltipPlayground() {
  const page = usePage(tooltipMeta, [], { _content: 'Copies the link to this page' });
  const spec: ExampleSpec = {
    name: 'Hint',
    preset: Object.fromEntries(changed(page.options, page.defaults)),
    tree: [{ use: { content: page.inputs._content, trigger: { label: 'Share', variant: 'outline' } } }],
    openOnLoad: true,
  };
  return <Page meta={tooltipMeta} page={page} define={defineTooltip} spec={spec} motion file="components/hint" frame={(live) => <div className="dx-overlay-demo">{live}</div>} note={KEEP_NOTE + ' ' + 'Hover or tab to it. Escape closes it; the pointer can move onto it without it closing.'} demo={<Text page={page} name="_content" label="content" hint="the hint" />} />;
}

export function PopoverPlayground() {
  const page = usePage(popoverMeta, [], { _title: 'Share this page' });
  const inactive = inactivePopoverOptions(page.options);
  const spec: ExampleSpec = {
    name: 'Share',
    preset: Object.fromEntries(changed(page.options, page.defaults, inactive)),
    tree: [{ use: { title: page.inputs._title, description: 'Anyone with the link can view it.', actions: [{ label: 'Copy link', onClick: src(() => reportEvent('Called: ' + "copy"), 'copy') }, { label: 'Close' }], trigger: { label: 'Share', variant: 'outline' } } }],
    openOnLoad: true,
  };
  return <Page meta={popoverMeta} page={page} define={definePopover} spec={spec} inactive={inactive} motion file="components/share" frame={(live) => <div className="dx-overlay-demo">{live}</div>} note={KEEP_NOTE} demo={<Text page={page} name="_title" label="title" hint="the panel's accessible name" />} />;
}

export function DialogPlayground() {
  const page = usePage(dialogMeta, [], { _title: 'Delete this project?' });
  const inactive = inactiveDialogOptions(page.options);
  const spec: ExampleSpec = {
    name: 'Confirm',
    preset: Object.fromEntries(changed(page.options, page.defaults, inactive)),
    tree: [{ use: { title: page.inputs._title, description: 'It will be removed for everyone. This cannot be undone.', trigger: { label: 'Delete project', tone: 'danger', variant: 'soft' }, actions: [{ label: 'Cancel' }, { label: 'Delete', tone: 'danger', onClick: src(() => reportEvent('Called: ' + "remove"), 'remove') }] } }],
    openOnLoad: true,
  };
  return <Page meta={dialogMeta} page={page} define={defineDialog} spec={spec} inactive={inactive} motion align="start" file="components/confirm" note={KEEP_NOTE + ' It is a real modal in its own frame: focus stays inside, Escape and the backdrop close it, and Delete project opens it again.'} demo={<><Text page={page} name="_title" label="title" hint="a real heading, and the accessible name" /></>} />;
}

export function MenuPlayground() {
  const page = usePage(menuMeta, ['size'], { _wrap: true, _sort: 'name' });
  const inactive = inactiveMenuOptions(page.options);
  const context = page.options.mode === 'context';
  const items: MenuItem[] = [
    { label: 'Edit', shortcut: 'E', onSelect: src(() => reportEvent('Called: ' + "edit"), 'edit') as never },
    { label: 'Duplicate', shortcut: 'D', onSelect: src(() => reportEvent('Called: ' + "duplicate"), 'duplicate') as never },
    { label: 'Archive', disabled: true },
    { type: 'submenu', label: 'Move to', items: [{ label: 'Inbox', onSelect: src(() => reportEvent('Called: ' + "moveToInbox"), 'moveToInbox') as never }, { label: 'Later', onSelect: src(() => reportEvent('Called: ' + "moveToLater"), 'moveToLater') as never }, { type: 'submenu', label: 'Team', items: [{ label: 'Operations', onSelect: src(() => reportEvent('Called: ' + "moveToOperations"), 'moveToOperations') as never }, { label: 'Customs', onSelect: src(() => reportEvent('Called: ' + "moveToCustoms"), 'moveToCustoms') as never }] }] },
    { type: 'separator' },
    { type: 'checkbox', label: 'Wrap lines', checked: !!page.inputs._wrap, onSelect: src(() => page.setOption('_wrap', !page.inputs._wrap), 'toggleWrap') as never },
    { type: 'group', label: 'Sort by', items: [{ type: 'radio', label: 'Name', checked: page.inputs._sort === 'name', onSelect: src(() => page.setOption('_sort', 'name'), 'sortByName') as never }, { type: 'radio', label: 'Date', checked: page.inputs._sort === 'date', onSelect: src(() => page.setOption('_sort', 'date'), 'sortByDate') as never }] },
    { type: 'separator' },
    { label: 'Delete', tone: 'danger', onSelect: src(() => reportEvent('Called: ' + "remove"), 'remove') as never },
  ];
  const spec: ExampleSpec = {
    name: 'RowActions',
    preset: Object.fromEntries(changed(page.options, page.defaults, inactive)),
    tree: [{ use: { label: context ? 'Row actions' : undefined, items, trigger: context ? src(<div className="dx-menu-area" tabIndex={0}>Right-click here</div>, '<div tabIndex={0}>Right-click here</div>') : { label: 'Actions' } } }],
    openOnLoad: true,
  };
  return <Page meta={menuMeta} page={page} define={defineMenu} spec={spec} inactive={inactive} inherit={['size']} provider={['size']} motion align="start" file="components/row-actions" frame={(live) => <div className="dx-overlay-demo dx-overlay-demo--tall">{live}</div>} note={KEEP_NOTE + ' ' + 'Try the arrow keys, Home and End, and typing a letter.'} />;
}

const Toasts = defineToast();
/** Three that stay, so the pile and its options show. The code panel prints the same calls. */
const SAMPLES = [
  { id: 'invite', title: 'Invitation sent', description: 'Amara will get an email.', tone: 'info' as const, duration: 0 },
  { id: 'upload', title: 'Upload complete', description: 'report.pdf is ready to share.', tone: 'neutral' as const, duration: 0 },
  { id: 'saved', title: 'Saved', description: 'Your changes are live.', tone: 'success' as const, duration: 0 },
];
const sampleCode = SAMPLES.map((t) => `Toasts.show({ id: '${t.id}', title: '${t.title}', description: '${t.description}', tone: '${t.tone}', duration: 0 });`);

function ToastRegion(props: Record<string, unknown>) {
  React.useEffect(() => {
    for (const t of SAMPLES) Toasts.show(t);
    return () => Toasts.clear();
  }, []);
  return <Toasts {...props} />;
}

let burst = 0;

export function ToastPlayground() {
  const page = usePage(toastMeta, []);
  const set = Object.fromEntries(changed(page.options, page.defaults));
  const saveTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
  }, []);

  const Shipped = useButton({
    label: 'Order shipped',
    variant: 'soft',
    tone: 'success',
    onClick: () => {
      void Toasts.show({
        title: `Order ${ORDERS[0].id} shipped`,
        description: `${ORDERS[0].customer.name} · ${ORDERS[0].lane}`,
        tone: 'success',
      });
    },
  });

  const Customs = useButton({
    label: 'Customs hold',
    variant: 'soft',
    tone: 'danger',
    onClick: () => {
      void Toasts.show({
        title: `Customs hold: ${ORDERS[1].id}`,
        description: 'Documentation required in Rotterdam.',
        tone: 'danger',
        action: {
          label: 'Retry',
          onClick: () => {
            void Toasts.show({ title: 'Customs check sent again', tone: 'info' });
          },
        },
      });
    },
  });

  const Save = useButton({
    label: 'Save changes',
    variant: 'outline',
    onClick: () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      void Toasts.show({ id: 'harbor-save', title: 'Saving…', duration: 0, icon: <Spinner size="sm" /> });
      saveTimer.current = setTimeout(() => {
        void Toasts.show({ id: 'harbor-save', title: 'Saved', tone: 'success' });
      }, 1200);
    },
  });

  const Many = useButton({
    label: 'Show four more',
    variant: 'outline',
    onClick: () => {
      for (let i = 1; i <= 4; i++) {
        const order = ORDERS[(burst + i) % ORDERS.length];
        void Toasts.show({ title: `Order ${order.id} updated`, description: `${order.lane} · ${order.status}`, tone: 'neutral' });
      }
      burst += 4;
    },
  });

  const spec: ExampleSpec = {
    name: 'Toasts',
    preset: set,
    imports: ["import { Spinner } from '@pinfold/react/spinner';"],
    body: ["const retry = () => Toasts.show({ title: 'Customs check sent again', tone: 'info' });"],
    tree: [{ use: {} }],
    after: [
      '// Anywhere, also outside React.',
      ...sampleCode,
      `Toasts.show({ title: 'Order ${ORDERS[0].id} shipped', tone: 'success' });`,
      `Toasts.show({ title: 'Customs hold: ${ORDERS[1].id}', tone: 'danger', action: { label: 'Retry', onClick: retry } });`,
      "Toasts.show({ id: 'harbor-save', title: 'Saving…', duration: 0, icon: <Spinner size=\"sm\" /> });",
      "Toasts.show({ id: 'harbor-save', title: 'Saved', tone: 'success' });",
    ],
  };

  return (
    <div className="dx-play">
      <div className="dx-play__editor">
        <ObjectOptions meta={toastMeta} options={page.options} setOption={page.setOption} />
        <OptionControls controls={page.controls} options={page.options} setOption={page.setOption} />
        <EnvControls env={page.env} setEnv={page.setEnv} />
        <Tool label="Reset" onClick={page.reset} />
      </div>
      <div className="dx-play__preview">
        <Stage env={page.env} setEnv={page.setEnv}>
          <p className="dx-demo-text">Toasts appear in the corner set by placement. Hover or tab into the pile to fan it out. The three samples stay so the options show.</p>
          {/* The buttons live with the region, in the preview's own document. */}
          <div className="dx-gallery__row dx-resolved">
            <Shipped />
            <Customs />
            <Save />
            <Many />
          </div>
          <p className="dx-hint">Hovering, focus inside the region, or leaving the window pauses every timer. Errors and toasts with an action stay until dismissed.</p>
          {/* Every option the code shows reaches the region. */}
          <ToastRegion {...set} />
        </Stage>
        <CodePanel file="components/toasts" code={() => exampleCode(toastMeta, spec, page.env)} actions={[{ label: 'Copy CLI command', copy: 'npx pinfold add toast' }]} />
      </div>
    </div>
  );
}
