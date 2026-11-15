import * as React from 'react';
import { dialogMeta, menuMeta, popoverMeta, toastMeta, tooltipMeta } from '@pinfold/core/meta';
import { inactiveDialogOptions, inactiveMenuOptions, inactivePopoverOptions } from '@pinfold/core';
import { defineTooltip } from '@pinfold/react/tooltip';
import { definePopover } from '@pinfold/react/popover';
import { defineDialog } from '@pinfold/react/dialog';
import { defineMenu, type MenuItem } from '@pinfold/react/menu';
import { defineToast } from '@pinfold/react/toast';
import { Button, useButton } from '@pinfold/react/button';
import { Input } from '@pinfold/react/input';
import { NumberField } from '@pinfold/react/number';
import { Select } from '@pinfold/react/select';
import { Spinner } from '@pinfold/react/spinner';
import { CARRIERS, ORDERS, PORTS } from '../demo/harbor';
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

const DIALOG_EXAMPLES: Array<[string, string]> = [
  ['confirm', 'confirm'],
  ['form', 'form'],
  ['long', 'long content'],
  ['drawer', 'drawer'],
  ['sheet', 'bottom sheet'],
  ['nested', 'nested'],
  ['nonmodal', 'non-modal'],
];

const CARRIAGE_TERMS = [
  '1. Scope and Application. These Standard Conditions of Carriage apply to all contracts of carriage of goods by sea, road, rail, and multimodal transport arranged or performed by Harbor Operations B.V., whether evidenced by a bill of lading, seawaybill, or electronic consignment note.',
  '2. Paramount Clause and Statutory Enactments. The Hague Rules contained in the International Convention for the Unification of Certain Rules Relating to Bills of Lading, as amended by the Brussels Protocol of 1968, known as the Hague-Visby Rules, shall apply to all carriage of goods by water where compulsorily applicable by law.',
  "3. Shipper's Load, Stow, and Count. Where containers or trailers are packed by or on behalf of the Merchant, the Carrier shall not be liable for loss of or damage to the goods caused by defective packing, improper stowage, or the unsuitability of goods for containerised transport.",
  '4. Dangerous Goods and Hazardous Cargo. The Merchant shall not tender for carriage any dangerous, flammable, radioactive, or noxious goods without prior written consent and full disclosure of hazardous classifications in compliance with the IMDG Code and local port authority regulations.',
  '5. Freight Charges, Dead Freight, and Demurrage. Freight shall be deemed fully earned upon receipt of goods by the Carrier and shall be paid non-refundable under all circumstances, vessel or cargo lost or not lost. Demurrage and container detention incur at daily published tariffs upon expiry of free time.',
  "6. Carrier's Lien. The Carrier shall have a general and continuing possessory lien on the goods, documents, and any proceeds thereof for all freight charges, customs duties, storage fees, demurrage, and costs incurred in connection with the carriage or any previous transaction with the Merchant.",
  '7. Limitation of Liability. Unless a higher valuation has been declared by the Merchant prior to shipment and noted in the transport document with supplementary ad valorem freight paid, Carrier liability for loss or damage shall not exceed 666.67 SDR per package or 2 SDR per gross kilogram, whichever is higher.',
  '8. Notice of Loss, Damage, or Delay. Written notice of claim detailing the nature and extent of loss or damage must be submitted to the Carrier at the port of discharge before or at the time of delivery, or within three consecutive days if loss or damage is not apparent.',
  '9. General Average and New Jason Clause. General average shall be adjusted, stated, and settled at any port or place at the Carrier\'s option in accordance with the York-Antwerp Rules 2016. The Merchant shall contribute with the Carrier in general average even if loss resulted from negligence.',
  '10. Governing Law and Exclusive Jurisdiction. The contract of carriage evidenced herein shall be governed by English law, and any dispute arising out of or in connection with this contract shall be referred to the exclusive jurisdiction of the High Court of Justice in London.',
];

const SIX_PORTS = [...PORTS.slice(0, 6)];

function ShipmentEditFormApp({ Preset, props }: { Preset: React.ElementType; props: Record<string, any> }) {
  const [consignee, setConsignee] = React.useState('Brightwater Foods');
  const [weight, setWeight] = React.useState<number | null>(4200);
  const [carrier, setCarrier] = React.useState<(typeof CARRIERS)[number] | null>('Blue Anchor Line');
  const [error, setError] = React.useState('');

  const handleSave = async () => {
    if (!consignee.trim()) {
      setError('Consignee is required');
      return false;
    }
    setError('');
    await new Promise((resolve) => setTimeout(resolve, 900));
    reportEvent(`Saved: ${consignee} · ${weight ?? 0} kg · ${carrier ?? ''}`);
    return true;
  };

  return (
    <Preset
      {...props}
      actions={[
        { label: 'Cancel' },
        { label: 'Save shipment', tone: 'primary', onClick: handleSave },
      ]}
      content={
        <div className="dx-stack">
          <Input
            label="Consignee"
            value={consignee}
            error={error}
            onChange={(v) => {
              setConsignee(v);
              if (v.trim()) setError('');
            }}
          />
          <NumberField label="Weight (kg)" min={1} value={weight} onChange={setWeight} />
          <Select label="Carrier" items={[...CARRIERS]} value={carrier} onChange={setCarrier} />
        </div>
      }
    />
  );
}

function PortSheetApp({ Preset, props }: { Preset: React.ElementType; props: Record<string, any> }) {
  return (
    <Preset
      {...props}
      actions={[{ label: 'Cancel' }]}
      content={({ close }: { close: () => void }) => (
        <div className="dx-stack">
          <p className="dx-panel__lead">Select the port of discharge for manifest HB-4100.</p>
          <div className="dx-chips">
            {SIX_PORTS.map((port) => (
              <Button
                key={port}
                label={port}
                variant="outline"
                onClick={() => {
                  reportEvent(`Saved: Port ${port} selected`);
                  close();
                }}
              />
            ))}
          </div>
        </div>
      )}
    />
  );
}

function NestedDialogApp({ Preset, props }: { Preset: React.ElementType; props: Record<string, any> }) {
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  return (
    <>
      <Preset
        {...props}
        actions={[{ label: 'Done' }]}
        content={
          <div className="dx-stack">
            <p>Update container assignments or cancel shipment HB-4100.</p>
            <div>
              <Button label="Cancel shipment" tone="danger" variant="soft" onClick={() => setConfirmOpen(true)} />
            </div>
          </div>
        }
      />
      <Preset
        placement="center"
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        role="alertdialog"
        size="sm"
        title="Cancel this shipment?"
        description="All customs declarations and bookings for HB-4100 will be withdrawn. This cannot be undone."
        actions={[
          { label: 'Keep shipment', onClick: () => setConfirmOpen(false) },
          {
            label: 'Cancel shipment',
            tone: 'danger',
            onClick: () => {
              setConfirmOpen(false);
              reportEvent('Saved: Shipment HB-4100 cancelled');
            },
          },
        ]}
      />
    </>
  );
}

function NonModalApp({ Preset, props }: { Preset: React.ElementType; props: Record<string, any> }) {
  const [ticks, setTicks] = React.useState(0);
  return (
    <div className="dx-stack" style={{ inlineSize: '100%' }}>
      <div className="dx-panel" style={{ inlineSize: '100%' }}>
        <p className="dx-panel__lead">Operations dashboard (page behind dialog)</p>
        <p>You can interact with controls here while the tracking panel is open.</p>
        <div style={{ marginTop: '0.5rem' }}>
          <Button
            label={`Ping vessel (${ticks} received)`}
            variant="outline"
            onClick={() => {
              setTicks((t) => t + 1);
              reportEvent(`Called: Ping vessel (${ticks + 1})`);
            }}
          />
        </div>
      </div>
      <Preset {...props} />
    </div>
  );
}

export function DialogPlayground() {
  const page = usePage(dialogMeta, [], { _kind: 'confirm', role: 'alertdialog', size: 'sm', _title: `Delete order ${ORDERS[0].id}?` });
  const kind = String(page.inputs._kind || 'confirm');
  const inactive = inactiveDialogOptions({ ...page.options, modal: kind === 'nonmodal' ? false : (page.options.modal as boolean | undefined) });
  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));

  const switchExample = (nextKind: string) => {
    page.setOption('_kind', nextKind);
    if (nextKind === 'confirm') {
      page.setOption('role', 'alertdialog');
      page.setOption('placement', 'center');
      page.setOption('size', 'sm');
      page.setOption('scrollBehavior', 'inside');
      page.setOption('backdrop', 'dim');
    } else if (nextKind === 'drawer') {
      page.setOption('role', 'dialog');
      page.setOption('placement', 'end');
      page.setOption('size', 'md');
      page.setOption('scrollBehavior', 'inside');
      page.setOption('backdrop', 'dim');
    } else if (nextKind === 'sheet') {
      page.setOption('role', 'dialog');
      page.setOption('placement', 'bottom');
      page.setOption('size', 'md');
      page.setOption('scrollBehavior', 'inside');
      page.setOption('backdrop', 'dim');
    } else if (nextKind === 'nonmodal') {
      page.setOption('role', 'dialog');
      page.setOption('placement', 'end');
      page.setOption('size', 'sm');
      page.setOption('scrollBehavior', 'inside');
      page.setOption('backdrop', 'none');
    } else {
      page.setOption('role', 'dialog');
      page.setOption('placement', 'center');
      page.setOption('size', 'md');
      page.setOption('scrollBehavior', 'inside');
      page.setOption('backdrop', 'dim');
    }
  };

  let spec: ExampleSpec;
  let file = 'components/confirm';
  let note = KEEP_NOTE + ' It is a real modal in its own frame: focus stays inside, Escape and the backdrop close it, and Delete order opens it again.';

  if (kind === 'form') {
    file = 'components/shipment-dialog';
    note = KEEP_NOTE + ' Required fields validate before closing; an async action keeps the dialog open and shows the button\'s loading spinner.';
    spec = {
      name: 'ShipmentDialog',
      preset: set,
      imports: [
        "import { Input } from '@pinfold/react/input';",
        "import { NumberField } from '@pinfold/react/number';",
        "import { Select } from '@pinfold/react/select';",
      ],
      body: [
        `const CARRIERS = ${JSON.stringify(CARRIERS).split('"').join("'").split(",").join(", ")};`,
        "const [consignee, setConsignee] = useState('Brightwater Foods');",
        "const [weight, setWeight] = useState<number | null>(4200);",
        "const [carrier, setCarrier] = useState<string | null>('Blue Anchor Line');",
        "const [error, setError] = useState('');",
        '',
        'const save = async () => {',
        '  if (!consignee.trim()) {',
        "    setError('Consignee is required');",
        '    return false;',
        '  }',
        "  setError('');",
        `  await fetch('/api/orders/${ORDERS[0].id}', { method: 'PATCH', body: JSON.stringify({ consignee, weight, carrier }) });`,
        '  return true;',
        '};',
      ],
      tree: [
        {
          app: ShipmentEditFormApp,
          use: {
            title: `Edit shipment ${ORDERS[0].id}`,
            trigger: { label: 'Edit shipment', variant: 'outline' },
            actions: [
              { label: 'Cancel' },
              { label: 'Save shipment', tone: 'primary', onClick: src(() => {}, 'save') },
            ],
            content: src(
              null,
              '(\n      <div className="dx-stack">\n        <Input label="Consignee" value={consignee} error={error} onChange={setConsignee} />\n        <NumberField label="Weight (kg)" min={1} value={weight} onChange={setWeight} />\n        <Select label="Carrier" items={CARRIERS} value={carrier} onChange={setCarrier} />\n      </div>\n    )',
            ),
          },
          code: ['$TAG'],
        },
      ],
      openOnLoad: true,
    };
  } else if (kind === 'long') {
    file = 'components/terms-dialog';
    note = KEEP_NOTE + ' Try switching scrollBehavior between inside and outside to see the difference with long content.';
    spec = {
      name: 'TermsDialog',
      preset: set,
      body: [
        'const TERMS = [',
        ...CARRIAGE_TERMS.map((t) => `  ${JSON.stringify(t)},`),
        '];',
        "const acceptTerms = () => localStorage.setItem('carriage-terms', 'accepted');",
      ],
      tree: [
        {
          use: {
            title: 'Standard terms of freight carriage',
            trigger: { label: 'View carriage terms', variant: 'outline' },
            actions: [
              { label: 'Decline' },
              {
                label: 'Accept terms',
                tone: 'primary',
                onClick: src(() => reportEvent('Saved: Carriage terms accepted'), 'acceptTerms'),
              },
            ],
            content: src(
              <div className="dx-stack">
                {CARRIAGE_TERMS.map((t, i) => (
                  <p key={i}>{t}</p>
                ))}
              </div>,
              '(\n      <div className="dx-stack">\n        {TERMS.map((text, i) => (\n          <p key={i}>{text}</p>\n        ))}\n      </div>\n    )',
            ),
          },
        },
      ],
      openOnLoad: true,
    };
  } else if (kind === 'drawer') {
    file = 'components/order-drawer';
    note = KEEP_NOTE + ' Drawers dock to start or end; in RTL layouts they mirror automatically.';
    const o = ORDERS[2];
    spec = {
      name: 'OrderDrawer',
      preset: set,
      body: [
        `const order = { id: '${o.id}', customer: '${o.customer.name}', lane: '${o.lane}', carrier: '${o.carrier}', status: '${o.status}', weight: ${o.weight}, value: ${o.value} };`,
        "const exportManifest = () => window.open(`/api/orders/${order.id}/manifest.pdf`);",
      ],
      tree: [
        {
          use: {
            title: `Order details · ${o.id}`,
            description: 'Consignment manifest and routing status',
            trigger: { label: 'Order details', variant: 'outline' },
            actions: [
              { label: 'Close' },
              {
                label: 'Export manifest',
                onClick: src(() => reportEvent(`Saved: Manifest exported for ${o.id}`), 'exportManifest'),
              },
            ],
            content: src(
              <div className="dx-stack">
                <ul className="dx-lines">
                  <li><span>Customer</span><span>{ORDERS[2].customer.name}</span></li>
                  <li><span>Lane</span><span>{ORDERS[2].lane}</span></li>
                  <li><span>Carrier</span><span>{ORDERS[2].carrier}</span></li>
                  <li><span>Status</span><span>{ORDERS[2].status}</span></li>
                  <li><span>Weight</span><span>{ORDERS[2].weight.toLocaleString()} kg</span></li>
                  <li className="dx-lines__total">
                    <span>Value</span>
                    <span>{'$' + ORDERS[2].value.toLocaleString()}</span>
                  </li>
                </ul>
              </div>,
              '(\n      <div className="dx-stack">\n        <ul className="dx-lines">\n          <li><span>Customer</span><span>{order.customer}</span></li>\n          <li><span>Lane</span><span>{order.lane}</span></li>\n          <li><span>Carrier</span><span>{order.carrier}</span></li>\n          <li><span>Status</span><span>{order.status}</span></li>\n          <li><span>Weight</span><span>{order.weight.toLocaleString()} kg</span></li>\n          <li className="dx-lines__total">\n            <span>Value</span>\n            <span>{\'$\' + order.value.toLocaleString()}</span>\n          </li>\n        </ul>\n      </div>\n    )',
            ),
          },
        },
      ],
      openOnLoad: true,
    };
  } else if (kind === 'sheet') {
    file = 'components/port-sheet';
    note = KEEP_NOTE + ' Try it at the 390 px preview width to see how a bottom sheet docks to the screen on mobile devices.';
    spec = {
      name: 'PortSheet',
      preset: set,
      imports: [
        "import { Button } from '@pinfold/react/button';",
      ],
      body: [
        `const PORTS = ${JSON.stringify(SIX_PORTS).split('"').join("'").split(",").join(", ")};`,
        "const pickPort = (port: string) =>",
        `  fetch('/api/orders/${ORDERS[0].id}', { method: 'PATCH', body: JSON.stringify({ port }) });`,
      ],
      tree: [
        {
          app: PortSheetApp,
          use: {
            title: 'Pick a destination port',
            trigger: { label: 'Pick a port', variant: 'outline' },
            actions: [{ label: 'Cancel' }],
            content: src(
              null,
              '({ close }) => (\n      <div className="dx-stack">\n        <p className="dx-panel__lead">Select the port of discharge for manifest HB-4100.</p>\n        <div className="dx-chips">\n          {PORTS.map((port) => (\n            <Button key={port} label={port} variant="outline" onClick={() => { pickPort(port); close(); }} />\n          ))}\n        </div>\n      </div>\n    )',
            ),
          },
          code: ['$TAG'],
        },
      ],
      openOnLoad: true,
    };
  } else if (kind === 'nested') {
    file = 'components/nested-dialog';
    note = KEEP_NOTE + ' Nested dialogs stack on the top layer: Escape and outside presses close the topmost dialog first.';
    spec = {
      name: 'BookingDialog',
      preset: set,
      imports: [
        "import { Button } from '@pinfold/react/button';",
      ],
      body: [
        'const [confirmOpen, setConfirmOpen] = useState(false);',
        `const cancelShipment = () => fetch('/api/orders/${ORDERS[0].id}/cancel', { method: 'POST' });`,
      ],
      tree: [
        {
          app: NestedDialogApp,
          use: {
            title: `Edit booking ${ORDERS[0].id}`,
            trigger: { label: 'Edit booking', variant: 'outline' },
            actions: [{ label: 'Done' }],
          },
          code: [
            '<BookingDialog',
            `  title="Edit booking ${ORDERS[0].id}"`,
            "  trigger={{ label: 'Edit booking', variant: 'outline' }}",
            "  actions={[{ label: 'Done' }]}",
            '  content={',
            '    <div className="dx-stack">',
            `      <p>Update container assignments or cancel shipment ${ORDERS[0].id}.</p>`,
            '      <div>',
            '        <Button label="Cancel shipment" tone="danger" variant="soft" onClick={() => setConfirmOpen(true)} />',
            '      </div>',
            '    </div>',
            '  }',
            '  defaultOpen',
            '/>',
            '<BookingDialog',
            '  open={confirmOpen}',
            '  onOpenChange={setConfirmOpen}',
            '  role="alertdialog"',
            '  size="sm"',
            '  title="Cancel this shipment?"',
            `  description="All customs declarations and bookings for ${ORDERS[0].id} will be withdrawn. This cannot be undone."`,
            '  actions={[',
            "    { label: 'Keep shipment', onClick: () => setConfirmOpen(false) },",
            '    {',
            "      label: 'Cancel shipment',",
            "      tone: 'danger',",
            '      onClick: () => {',
            '        setConfirmOpen(false);',
            '        cancelShipment();',
            '      },',
            '    },',
            '  ]}',
            '/>',
          ],
        },
      ],
      openOnLoad: true,
    };
  } else if (kind === 'nonmodal') {
    file = 'components/tracking-panel';
    note = KEEP_NOTE + ' Non-modal dialogs leave the rest of the page usable: focus is not trapped, outside presses are ordinary clicks, and there is no backdrop.';
    spec = {
      name: 'TrackingPanel',
      preset: { modal: false, ...set },
      body: [`const refresh = () => fetch('/api/orders/${ORDERS[0].id}/position');`],
      tree: [
        {
          app: NonModalApp,
          use: {
            title: `Live tracking · ${ORDERS[0].id}`,
            description: 'Vessel Pacific Star · Position: 24.8° N, 118.2° W',
            trigger: { label: 'Open tracking panel', variant: 'outline' },
            actions: [
              {
                label: 'Refresh',
                onClick: src(() => reportEvent(`Saved: Tracking refreshed for ${ORDERS[0].id}`), 'refresh'),
              },
              { label: 'Close' },
            ],
            content: src(
              <div className="dx-stack">
                <p>Speed: 18.4 kn · Course: 082°</p>
                <p>ETA Rotterdam: 18 Nov, 14:00 UTC</p>
                <p className="dx-hint">Status: Normal transit in deep water</p>
              </div>,
              '(\n      <div className="dx-stack">\n        <p>Speed: 18.4 kn · Course: 082°</p>\n        <p>ETA Rotterdam: 18 Nov, 14:00 UTC</p>\n        <p className="dx-hint">Status: Normal transit in deep water</p>\n      </div>\n    )',
            ),
          },
          code: ['$TAG'],
        },
      ],
      openOnLoad: true,
    };
  } else {
    // confirm
    const orderId = ORDERS[0].id;
    const title = String(page.inputs._title || `Delete order ${orderId}?`);
    spec = {
      name: 'Confirm',
      preset: set,
      body: [`const deleteOrder = () => fetch('/api/orders/${orderId}', { method: 'DELETE' });`],
      tree: [
        {
          use: {
            title,
            description: 'All manifest lines, customs declarations and carrier bookings will be cancelled. This cannot be undone.',
            trigger: { label: 'Delete order', tone: 'danger', variant: 'soft' },
            actions: [
              { label: 'Cancel' },
              {
                label: 'Delete order',
                tone: 'danger',
                onClick: src(() => reportEvent(`Saved: Order ${orderId} deleted`), 'deleteOrder'),
              },
            ],
          },
        },
      ],
      openOnLoad: true,
    };
  }

  return (
    <Page
      examples={{ name: '_kind', options: DIALOG_EXAMPLES, onChange: switchExample }}
      meta={dialogMeta}
      page={page}
      define={defineDialog}
      spec={spec}
      inactive={inactive}
      motion
      align="start"
      file={file}
      note={note}
      demo={
        kind === 'confirm' ? (
          <>
            <Text page={page} name="_title" label="title" hint="a real heading, and the accessible name" />
          </>
        ) : null
      }
    />
  );
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
  { id: 'invite', title: 'Invitation sent', description: 'Amara will get an email.', tone: 'info' as const },
  { id: 'upload', title: 'Upload complete', description: 'report.pdf is ready to share.', tone: 'neutral' as const },
  { id: 'saved', title: 'Saved', description: 'Your changes are live.', tone: 'success' as const },
];
const sampleCode = SAMPLES.map((t) => `Toasts.show({ id: '${t.id}', title: '${t.title}', description: '${t.description}', tone: '${t.tone}' });`);

function ToastRegion(props: Record<string, unknown>) {
  // The samples follow `duration` like any toast; changing an option shows them again with it.
  const options = JSON.stringify(props, (_k, v) => (typeof v === 'function' ? undefined : v));
  React.useEffect(() => {
    for (const t of SAMPLES) Toasts.show(t);
    return () => Toasts.clear();
  }, [options]);
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
          <p className="dx-demo-text">Toasts appear in the corner set by placement. Hover or tab into the pile to fan it out. The three samples leave after `duration` (0 keeps them); change any option to show them again.</p>
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
