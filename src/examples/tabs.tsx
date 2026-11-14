import * as React from 'react';
import { tabsMeta } from '@pinfold/core/meta';
import { inactiveTabsOptions } from '@pinfold/core';
import { Badge } from '@pinfold/react/badge';
import { Avatar } from '@pinfold/react/avatar';
import { Progress } from '@pinfold/react/progress';
import { Input } from '@pinfold/react/input';
import { Switch } from '@pinfold/react/switch';
import { defineTabs } from '@pinfold/react/tabs';
import { Button } from '@pinfold/react/button';
import { changed } from '../playground/shared';
import { src, type ExampleSpec } from '../playground/example';
import { PEOPLE } from '../playground/people';
import { Choice, Page, Toggle, usePage } from '../playground/kit';
import { reportEvent } from '../playground/preview-mode';

/** The tabs page. */

export const TAB_ICON = (d: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);
export const USER_ICON = TAB_ICON('M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10z');
const CARD_ICON = TAB_ICON('M3 6h18v12H3zM3 10h18');
const TEAM_ICON = TAB_ICON('M16 21a5 5 0 0 0-10 0M11 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM21 21a4 4 0 0 0-4-4M17 4a4 4 0 0 1 0 8');
const BELL_SMALL = TAB_ICON('M6 9a6 6 0 1 1 12 0c0 6 2 7 2 8H4c0-1 2-2 2-8zM10 21a2 2 0 0 0 4 0');
export const FILE_ICON = TAB_ICON('M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5');
const HOME_ICON = TAB_ICON('M3 11 12 4l9 7M5 10v10h14V10');
export const FOLDER_ICON = TAB_ICON('M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z');

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
  return <Preset {...props} items={items} value={open} onChange={setOpen} onClose={(id: string) => setFiles((f) => f.filter((x) => x !== id))} onAdd={add} onReorder={setFiles} />;
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
  const inactive = inactiveTabsOptions({ ...page.options, onAdd: demo === 'editor' || undefined, onClose: demo === 'editor' || undefined, onReorder: demo === 'editor' || undefined });
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
            onChange: src(() => reportEvent('Called: ' + "setOpen"), 'setOpen'),
            onClose: src(() => reportEvent('Called: ' + "(id) => setFiles((f) => f.filter((name) => name !== id))"), '(id) => setFiles((f) => f.filter((name) => name !== id))'),
            onAdd: src(() => reportEvent('Called: ' + "() => setFiles((f) => [...f, `untitled-${f.length}.ts`])"), '() => setFiles((f) => [...f, `untitled-${f.length}.ts`])'),
            onReorder: src(() => reportEvent('Called: ' + "setFiles"), 'setFiles'),
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
      tree: [{ app: ViewTabs, use: { label: 'View', items: [...VIEWS], value: src('Board', 'view'), onChange: src(() => reportEvent('Called: ' + "setView"), 'setView') }, code: ['$TAG', '<ViewOf name={view} />'] }],
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
      examples={{ name: '_demo', options: [['settings', 'settings with panels'], ['editor', 'editor: close and add'], ['views', 'views from strings']] }}
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
