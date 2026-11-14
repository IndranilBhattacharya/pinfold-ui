import * as React from 'react';
import { breadcrumbMeta } from '@pinfold/core/meta';
import { inactiveBreadcrumbOptions } from '@pinfold/core';
import { defineBreadcrumb } from '@pinfold/react/breadcrumb';
import { changed } from '../playground/shared';
import { src, type ExampleSpec } from '../playground/example';
import { Choice, Page, usePage } from '../playground/kit';
import { FOLDER_ICON } from './tabs';

/** The breadcrumb page. */

type Tree = { [name: string]: Tree };
const FOLDERS: Tree = {
  projects: {
    pinfold: { docs: { guides: {}, reference: {} }, src: { components: { buttons: {}, forms: { inputs: {}, selects: {} }, overlays: {} }, tokens: {} }, tests: {} },
    atlas: { docs: {}, src: {} },
    nova: { designs: {} },
  },
  team: { design: {}, research: {} },
  archive: { 2024: {}, 2025: {} },
};
const SETTINGS: Tree = {
  account: { profile: {}, security: { password: {}, 'two-factor': { 'recovery-codes': {} }, sessions: {} }, notifications: {}, billing: { invoices: {}, plans: {} } },
  workspace: { members: {}, integrations: {} },
};
const CRUMB_EXAMPLES: Record<string, { tree: Tree; start: string; source: 'items' | 'path'; maxItems?: number; blurb: string }> = {
  files: { tree: FOLDERS, start: '/projects/pinfold/src', source: 'items', blurb: 'A file browser: each crumb opens the folders next to it (the arrow beside it).' },
  settings: { tree: SETTINGS, start: '/account/security/two-factor', source: 'path', blurb: 'A settings path built from the URL: path plus home, no list of crumbs to keep.' },
  collapsed: { tree: FOLDERS, start: '/projects/pinfold/src/components/forms/inputs', source: 'items', maxItems: 3, blurb: 'A deep path with maxItems: 3: the middle folds into a menu behind the dots.' },
};
const segmentsOf = (path: string) => path.split('/').filter(Boolean);
const folderAt = (tree: Tree, segments: string[]) => segments.reduce<Tree | undefined>((node, s) => node?.[s], tree) ?? {};
const readable = (s: string) => {
  const t = s.replace(/-/g, ' ');
  return t.charAt(0).toUpperCase() + t.slice(1);
};

/** The crumbs of a path, each with the other folders at its level as a menu; `key` is what `onChange` reports. */
function crumbsFor(tree: Tree, path: string) {
  const all = segmentsOf(path);
  return all.map((segment, i) => {
    const href = '/' + all.slice(0, i + 1).join('/');
    const siblings = Object.keys(folderAt(tree, all.slice(0, i))).filter((s) => s !== segment);
    return { label: readable(segment), href, key: segment, menu: siblings.length ? siblings.map((s) => ({ label: readable(s), href: '/' + [...all.slice(0, i), s].join('/'), key: s })) : undefined };
  });
}

/** A folder browser: the trail, the folder it points at and a log of the events share one path. */
function FolderBrowser({ Preset, props }: { Preset: React.ElementType; props: Record<string, any> }) {
  const { _example: example, _icon, ...rest } = props;
  const setup = CRUMB_EXAMPLES[example] ?? CRUMB_EXAMPLES.files;
  const [path, setPath] = React.useState(setup.start);
  const [log, setLog] = React.useState<string[]>([]);
  React.useEffect(() => {
    setPath(setup.start);
    setLog([]);
  }, [example, setup.start]);
  const push = (line: string) => setLog((l) => [line, ...l].slice(0, 4));
  const children = Object.keys(folderAt(setup.tree, segmentsOf(path)));
  const trail = setup.source === 'path' ? { path, items: undefined } : { items: crumbsFor(setup.tree, path), path: undefined };
  return (
    <div className="dx-stack">
      <Preset
        {...rest}
        {...trail}
        maxItems={setup.maxItems}
        onChange={(key: string, item: { href?: string }) => push(`onChange('${key}', { href: '${item.href ?? ''}' })`)}
        onNavigate={(href: string) => {
          push(`onNavigate('${href}')`);
          setPath(href);
        }}
      />
      <div className="dx-folder__head">
        <span>
          Folder view of <b>{path}</b>
        </span>
      </div>
      <div className="dx-folder" aria-label="Folder contents">
        {children.length ? (
          children.map((name) => {
            const to = `${path === '/' ? '' : path}/${name}`;
            return (
              <button
                key={name}
                type="button"
                className="dx-folder__item"
                onClick={() => {
                  push(`app: opened '${to}' from the list`);
                  setPath(to);
                }}
              >
                {FOLDER_ICON}
                {readable(name)}
              </button>
            );
          })
        ) : (
          <span className="dx-hint">This folder is empty. Use the trail to go back up.</span>
        )}
      </div>
      <ol className="dx-log2" aria-label="Event log" aria-live="polite">
        {log.length ? log.map((l, i) => <li key={`${log.length - i}-${l}`}>{l}</li>) : <li>Events appear here: click a crumb, open the dots menu or a crumb's arrow.</li>}
      </ol>
    </div>
  );
}

export function BreadcrumbPlayground() {
  const page = usePage(breadcrumbMeta, ['size', 'tone'], { _example: 'files', home: true });
  const example = String(page.inputs._example);
  const setup = CRUMB_EXAMPLES[example] ?? CRUMB_EXAMPLES.files;
  const fromPath = setup.source === 'path';
  const maxItems = setup.maxItems;
  const inactive = inactiveBreadcrumbOptions({ maxItems, variant: page.options.variant as string, home: page.options.home as any, ...(fromPath ? { path: '/' } : { items: [] }) } as any);
  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));
  const use: Record<string, unknown> = {
    ...(fromPath ? { path: src(setup.start, 'path'), pathLabels: { security: 'Security', 'two-factor': 'Two-factor' } } : { items: src(crumbsFor(setup.tree, setup.start), 'crumbs') }),
    onChange: src(undefined, "(key, item) => log(`onChange('${key}', ${item.href})`)"),
    onNavigate: src(undefined, '(href) => { log(`onNavigate(${href})`); setPath(href); }'),
    _example: src(example, ''),
  };
  const spec: ExampleSpec = {
    name: 'Trail',
    preset: { ...set, maxItems },
    body: [
      `const [path, setPath] = useState('${setup.start}'); // or your router's pathname`,
      ...(fromPath
        ? []
        : [
            "const segments = path.split('/').filter(Boolean);",
            'const crumbs = segments.map((segment, i) => ({',
            '  label: titleCase(segment),',
            "  href: '/' + segments.slice(0, i + 1).join('/'),",
            '  key: segment, // what onChange reports',
            '  menu: otherFolders(segments.slice(0, i), segment), // [{ label, href }]: the pages next to this one',
            '}));',
          ]),
      'const [events, setEvents] = useState<string[]>([]);',
      'const log = (line: string) => setEvents((e) => [line, ...e].slice(0, 4));',
    ],
    tree: [{ app: FolderBrowser, use, code: ['$TAG', '<FolderView path={path} onOpen={setPath} />', '<EventLog events={events} />'] }],
  };
  return (
    <Page
      examples={{ name: '_example', options: [ ['files', 'file browser (items with menus)'], ['settings', 'settings path (path + home)'], ['collapsed', 'collapsed (maxItems: 3)'], ] }}
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
        <>
          {setup.blurb} The folder view and the trail share one path. Click a crumb, a hidden crumb in the dots menu, or a sibling page from a crumb's arrow menu: the folder view moves and the log under it shows the order the events fire in (onChange first, with the crumb's key, then onNavigate with the href). Folders in the list move the path too, and so does the trail.
        </>
      }
    />
  );
}
