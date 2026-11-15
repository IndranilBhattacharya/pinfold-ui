import * as React from 'react';
import { treeviewMeta } from '@pinfold/core/meta';
import { inactiveTreeViewOptions } from '@pinfold/core';
import { changed } from '../playground/shared';
import { src, type ExampleSpec } from '../playground/example';
import { defineTreeView } from '@pinfold/react/treeview';
import { Page, Toggle, usePage, wait } from '../playground/kit';
import { svg } from './toggle';

/** The tree view page. */

const FOLDER = svg('M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z');
const FILE = svg('M7 3h7l5 5v13H7zM14 3v5h5');

const file = (name: string, extra: Record<string, unknown> = {}) => ({ id: name, label: name.split('/').pop(), icon: FILE, ...extra });
const folder = (id: string, children: unknown[], extra: Record<string, unknown> = {}) => ({ id, label: id.split('/').pop(), icon: FOLDER, children, ...extra });

const nodeModules = [file('node_modules/react'), file('node_modules/vite'), file('node_modules/typescript')];
const dist = [file('dist/index.js'), file('dist/index.css'), file('dist/index.d.ts')];

function projectTree(lazy: boolean) {
  return [
    folder('src', [
      folder('src/components', [file('src/components/Button.tsx', { badge: 'M' }), file('src/components/Card.tsx'), file('src/components/Dialog.tsx', { badge: 'U' })]),
      folder('src/hooks', [file('src/hooks/useTheme.ts'), file('src/hooks/useMedia.ts')]),
      file('src/App.tsx', { badge: 'M' }),
      file('src/main.tsx'),
    ]),
    folder('docs', [file('docs/getting-started.md'), file('docs/theming.md')]),
    lazy ? { id: 'node_modules', label: 'node_modules', icon: FOLDER, hasChildren: true } : folder('node_modules', nodeModules),
    lazy ? { id: 'dist', label: 'dist', icon: FOLDER, hasChildren: true, badge: 'build' } : folder('dist', dist, { badge: 'build' }),
    file('package.json'),
    file('README.md'),
    file('tsconfig.json'),
  ];
}

const LAZY_CHILDREN: Record<string, unknown[]> = { node_modules: nodeModules, dist };

/** The file open in the editor: selected as the page loads, so selection options show at once. */
const OPEN_FILE = ['src/components/Button.tsx'];

function TreeDemo({ Preset, props }: { Preset: React.ElementType; props: Record<string, any> }) {
  const { _lazy: lazy, ...rest } = props;
  const [last, setLast] = React.useState('Nothing yet: select a row, open a folder or press Enter.');
  const [selected, setSelected] = React.useState<string[]>(OPEN_FILE);
  const items = React.useMemo(() => projectTree(!!lazy), [lazy]);
  return (
    <div className="dx-stack">
      <Preset
        {...rest}
        key={String(!!lazy)}
        label="Project files"
        items={items}
        dimensions={{ height: 340 }}
        defaultExpanded={['src', 'src/components']}
        defaultValue={OPEN_FILE}
        loadChildren={
          lazy
            ? async (item: { id: string }, { signal }: { signal: AbortSignal }) => {
                await wait(900, signal);
                return LAZY_CHILDREN[item.id] ?? [];
              }
            : undefined
        }
        onSelectionChange={(ids: string[]) => {
          setSelected(ids);
          setLast(`onSelectionChange(${ids.length ? ids.map((i) => `'${i}'`).join(', ') : '[]'})`);
        }}
        onAction={(id: string) => setLast(`onAction('${id}')`)}
        onExpandedChange={(_: string[], change: { id: string; expanded: boolean }) => setLast(`onExpandedChange('${change.id}', ${change.expanded ? 'open' : 'closed'})`)}
        onMove={!rest.reorderable ? undefined : ({ id, parentId, index }: { id: string; parentId: string | null; index: number }) => setLast(`onMove('${id}' to ${parentId ? `'${parentId}'` : 'the top'}, position ${index})`)}
      />
      <p className="dx-hint" role="status">
        Last event: <b>{last}</b>
        <br />
        {props.checkable ? 'Checked' : 'Selected'}: {selected.length ? `${selected.length} (${selected.slice(0, 3).join(', ')}${selected.length > 3 ? ', ...' : ''})` : 'none'}
      </p>
    </div>
  );
}

export function TreeViewPlayground() {
  const page = usePage(treeviewMeta, ['size', 'tone'], { _lazy: false });
  const lazy = !!page.inputs._lazy;
  const inactive = inactiveTreeViewOptions({ ...(page.options as any), loadChildren: lazy ? () => null : undefined });
  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));
  const spec: ExampleSpec = {
    name: 'Files',
    preset: set,
    body: ['// projectFiles: [{ id: \'src\', label: \'src\', children: [...] }, { id: \'dist\', label: \'dist\', badge: \'build\', hasChildren: true }, \'package.json\']', "const [selected, setSelected] = useState<string[]>(['src/components/Button.tsx']);", ...(lazy ? ['const load = (item, { signal }) => api.list(item.id, { signal }); // resolves to the node\'s children'] : [])],
    tree: [
      {
        app: TreeDemo,
        use: {
          label: 'Project files',
          items: src([], 'projectFiles'),
          dimensions: { height: 340 },
          defaultExpanded: ['src', 'src/components'],
          defaultValue: src(OPEN_FILE, 'selected'),
          ...(lazy ? { loadChildren: src(undefined, 'load') } : null),
          onSelectionChange: src(undefined, 'setSelected'),
          onAction: src(undefined, '(id) => openFile(id)'),
          onMove: src(undefined, '({ items }) => save(items)'),
          _lazy: src(lazy, ''),
        },
        code: ['$TAG'],
      },
    ],
  };
  return (
    <Page
      meta={treeviewMeta}
      page={page}
      define={defineTreeView}
      spec={spec}
      inactive={inactive}
      inherit={['size', 'tone']}
      provider
      motion
      align="start"
      file="components/files"
      note="Press a row to select it, the chevron or the arrow keys to open it. Turn on checkable for tri-state checkboxes (a folder shows mixed when only some files in it are checked), searchable for a search field that keeps the path to every match, reorderable to drag rows by their handle or move them with Alt and the arrows. The line under the tree prints the event each interaction fired."
      demo={<Toggle page={page} name="_lazy" label="load node_modules and dist on demand (loadChildren, 0.9 s)" />}
    />
  );
}
