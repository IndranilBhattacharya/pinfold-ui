import * as React from 'react';
import { commandMeta } from '@pinfold/core/meta';
import { inactiveCommandOptions } from '@pinfold/core';
import { Kbd } from '@pinfold/react/kbd';
import { defineCommand } from '@pinfold/react/command';
import { Button } from '@pinfold/react/button';
import { changed } from '../playground/shared';
import { src, type ExampleSpec } from '../playground/example';
import { Choice, Page, usePage } from '../playground/kit';
import { FOLDER_ICON, TAB_ICON, USER_ICON } from './tabs';

/** The command page. */

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
