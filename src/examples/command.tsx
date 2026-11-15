import * as React from 'react';
import { commandMeta } from '@pinfold/core/meta';
import { inactiveCommandOptions } from '@pinfold/core';
import { Kbd } from '@pinfold/react/kbd';
import { defineCommand } from '@pinfold/react/command';
import { Button } from '@pinfold/react/button';
import { changed } from '../playground/shared';
import { src, type ExampleSpec } from '../playground/example';
import { Page, usePage } from '../playground/kit';
import { FOLDER_ICON, TAB_ICON, USER_ICON } from './tabs';
import { reportEvent } from '../playground/preview-mode';
import { ORDERS } from '../demo/harbor';

/** The command page. */

const ICONS_CMD = {
  file: TAB_ICON('M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5'),
  folder: FOLDER_ICON,
  gear: TAB_ICON('M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z'),
  ship: TAB_ICON('M2 20a2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 1 2-1 2.4 2.4 0 0 1 2 1 2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 1 2-1 2.4 2.4 0 0 1 2 1 2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1M4 18l-1-5h18l-1 5M19 13V9a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v4M12 3v4'),
  user: USER_ICON,
};

const STATIC_COMMANDS = [
  { value: 'New order', label: 'New order', icon: ICONS_CMD.file, shortcut: '⌘N', group: 'Orders' },
  { value: 'Export orders CSV', label: 'Export orders CSV', icon: ICONS_CMD.file, shortcut: '⌘E', group: 'Orders' },
  { value: 'Audit order log', label: 'Audit order log', icon: ICONS_CMD.file, group: 'Orders' },
  { value: 'View carriers', label: 'View carriers', icon: ICONS_CMD.ship, shortcut: '⌘C', group: 'Carriers' },
  { value: 'Check vessel schedule', label: 'Check vessel schedule', icon: ICONS_CMD.ship, group: 'Carriers' },
  { value: 'Fleet status', label: 'Fleet status', icon: ICONS_CMD.ship, group: 'Carriers' },
  { value: 'Go to Shipments', label: 'Go to Shipments', icon: ICONS_CMD.folder, onSelect: () => reportEvent('Navigated to: #/shipments'), group: 'Go to' },
  { value: 'Go to Orders', label: 'Go to Orders', icon: ICONS_CMD.folder, onSelect: () => reportEvent('Navigated to: #/orders'), group: 'Go to' },
  { value: 'Go to Customers', label: 'Go to Customers', icon: ICONS_CMD.user, onSelect: () => reportEvent('Navigated to: #/customers'), group: 'Go to' },
  { value: 'Go to Settings', label: 'Go to Settings', icon: ICONS_CMD.gear, onSelect: () => reportEvent('Navigated to: #/settings'), group: 'Go to' },
];

const PRINTED_COMMANDS = [
  { value: 'New order', label: 'New order', shortcut: '⌘N', group: 'Orders' },
  { value: 'Export orders CSV', label: 'Export orders CSV', shortcut: '⌘E', group: 'Orders' },
  { value: 'Audit order log', label: 'Audit order log', group: 'Orders' },
  { value: 'View carriers', label: 'View carriers', shortcut: '⌘C', group: 'Carriers' },
  { value: 'Check vessel schedule', label: 'Check vessel schedule', group: 'Carriers' },
  { value: 'Fleet status', label: 'Fleet status', group: 'Carriers' },
  { value: 'Go to Shipments', label: 'Go to Shipments', href: '#/shipments', group: 'Go to' },
  { value: 'Go to Orders', label: 'Go to Orders', href: '#/orders', group: 'Go to' },
  { value: 'Go to Customers', label: 'Go to Customers', href: '#/customers', group: 'Go to' },
  { value: 'Go to Settings', label: 'Go to Settings', href: '#/settings', group: 'Go to' },
];

const SAMPLE_ORDERS = ORDERS.slice(0, 5).map((o) => ({
  id: o.id,
  customer: o.customer.name,
  lane: o.lane,
  status: o.status,
}));

/** Commands run here: the last one shows under the palette. */
function CommandDemo({ Preset, props }: { Preset: React.ElementType; props: Record<string, unknown> }) {
  const { _kind, ...rest } = props;
  const [ran, setRan] = React.useState<string | null>(null);
  const [recent, setRecent] = React.useState<string[]>(['Export orders CSV', 'View carriers', 'Go to Shipments']);
  const [open, setOpen] = React.useState(false);

  const run = (value: string) => {
    setRan(value);
    setRecent((prev) => [value, ...prev.filter((x) => x !== value)].slice(0, 3));
    reportEvent('Called: ' + value);
  };

  const loadCommands = React.useCallback(
    async (query: string, { signal }: { signal: AbortSignal }) => {
      const q = query.trim().toLowerCase();
      if (q) {
        await new Promise<void>((resolve, reject) => {
          const timer = setTimeout(resolve, 300);
          signal.addEventListener('abort', () => {
            clearTimeout(timer);
            reject(new DOMException('aborted', 'AbortError'));
          });
        });
      }
      const recentItems = recent.map((name) => ({ value: name, label: name, group: 'Recent' }));
      const filteredStatic = q
        ? STATIC_COMMANDS.filter((c) => c.label.toLowerCase().includes(q) || c.group.toLowerCase().includes(q))
        : STATIC_COMMANDS;
      const matchingOrders = q
        ? ORDERS.filter((o) => o.id.toLowerCase().includes(q) || o.customer.name.toLowerCase().includes(q) || o.lane.toLowerCase().includes(q))
            .slice(0, 5)
            .map((o) => ({
              value: `Order ${o.id}`,
              label: `${o.id} · ${o.customer.name}`,
              description: `${o.lane} · ${o.status}`,
              group: 'Search orders',
            }))
        : [];
      return [...(q ? [] : recentItems), ...filteredStatic, ...matchingOrders];
    },
    [recent]
  );

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
      <Preset {...rest} loadItems={loadCommands} onSelect={run} />
      <p className="dx-panel__lead">{ran ? `Ran "${ran}".` : 'Type "HB" or "sea" to search orders asynchronously.'}</p>
    </div>
  );
}

export function CommandPlayground() {
  const page = usePage(commandMeta, ['size', 'tone'], { _kind: 'inline' });
  const kind = String(page.inputs._kind);
  const inactive = {
    ...inactiveCommandOptions({ mode: kind, footer: page.options.footer as boolean | undefined, loadItems: kind !== 'dialog' }),
    mode: 'set by the example above.',
  };
  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));
  const preset = kind === 'dialog' ? { ...set, mode: 'dialog' } : set;

  const searchCommandsCode = [
    "const [ran, setRan] = useState<string | null>(null);",
    "const [recent, setRecent] = useState(['Export orders CSV', 'View carriers', 'Go to Shipments']);",
    "const runCommand = (cmd: string) => {",
    "  setRan(cmd);",
    "  setRecent((prev) => [cmd, ...prev.filter((x) => x !== cmd)].slice(0, 3));",
    "};",
    "const staticCommands = " + JSON.stringify(PRINTED_COMMANDS, null, 2) + ";",
    "const sampleOrders = " + JSON.stringify(SAMPLE_ORDERS, null, 2) + ";",
    "const searchCommands = async (query: string, { signal }: { signal: AbortSignal }) => {",
    "  const q = query.trim().toLowerCase();",
    "  if (q) {",
    "    await new Promise<void>((resolve, reject) => {",
    "      const timer = setTimeout(resolve, 300);",
    "      signal.addEventListener('abort', () => {",
    "        clearTimeout(timer);",
    "        reject(new DOMException('aborted', 'AbortError'));",
    "      });",
    "    });",
    "  }",
    "  const recentItems = recent.map((name) => ({ value: name, label: name, group: 'Recent' }));",
    "  const filteredStatic = q",
    "    ? staticCommands.filter((c) => c.label.toLowerCase().includes(q) || c.group.toLowerCase().includes(q))",
    "    : staticCommands;",
    "  const matchingOrders = q",
    "    ? sampleOrders",
    "        .filter((o) => o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q) || o.lane.toLowerCase().includes(q))",
    "        .map((o) => ({",
    "          value: `Order ${o.id}`,",
    "          label: `${o.id} · ${o.customer}`,",
    "          description: `${o.lane} · ${o.status}`,",
    "          group: 'Search orders',",
    "        }))",
    "    : [];",
    "  return [...(q ? [] : recentItems), ...filteredStatic, ...matchingOrders];",
    "};",
  ];

  const hasFooter = page.options.footer !== false;
  const use: Record<string, unknown> = {
    label: 'Commands',
    placeholder: 'Type a command or search orders…',
    filter: 'none',
    debounce: 300,
    ...(hasFooter
      ? {
          hints: [
            { keys: ['↵'], label: 'to run' },
            { keys: ['↑', '↓'], label: 'to navigate' },
            { keys: ['esc'], label: 'to clear' },
          ],
          footerContent: src(<span className="dx-command-badge">Harbor Operations</span>, '<span>Harbor Operations</span>'),
        }
      : {}),
    onSelect: src(() => reportEvent('Called: runCommand'), 'runCommand'),
    loadItems: src(async () => [], 'searchCommands'),
    _kind: src(kind, ''),
  };

  if (kind === 'dialog') {
    use.open = src(false, 'open');
    use.onOpenChange = src(() => reportEvent('Called: setOpen'), 'setOpen');
    delete use.loadItems;
    delete use.debounce;
    delete use.filter;
    use.items = src(STATIC_COMMANDS, 'staticCommands');
  }

  const spec: ExampleSpec = {
    name: 'Palette',
    preset,
    body: kind === 'dialog'
      ? [
          "const [open, setOpen] = useState(false);",
          "const staticCommands = " + JSON.stringify(PRINTED_COMMANDS, null, 2) + ";",
          "const runCommand = (cmd: string) => alert(`Ran ${cmd}`);",
        ]
      : searchCommandsCode,
    imports: kind === 'dialog' ? ["import { Button } from '@pinfold/react/button';"] : undefined,
    tree: [{ app: CommandDemo, use, code: kind === 'dialog' ? ["<Button label=\"Open the palette\" onClick={() => setOpen(true)} />", '$TAG'] : ['$TAG'] }],
    after: ["// Each command can carry its own onSelect, or an href that goes through the provider's navigate."],
  };

  return (
    <Page
      examples={{ name: '_kind', options: [['inline', 'on the page'], ['dialog', 'a ⌘K dialog']] }}
      meta={commandMeta}
      page={page}
      define={defineCommand}
      spec={spec}
      inactive={inactive}
      inherit={['size', 'tone']}
      provider
      align="start"
      file="components/palette"
      note={kind === 'dialog' ? 'A native modal: the page goes inert, Escape closes and focus returns. ⌘K / Ctrl+K opens it from anywhere.' : 'Harbor command palette with sections for Orders, Carriers, Go to, and Recent commands. Async search filters orders with a 300 ms simulated server response.'}
    />
  );
}
