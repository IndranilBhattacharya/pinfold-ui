import * as React from 'react';
import { fileuploadMeta, tourMeta, treeviewMeta } from '@pinfold/core/meta';
import { inactiveFileUploadOptions, inactiveTourOptions, inactiveTreeViewOptions } from '@pinfold/core';
import { defineTreeView } from '@pinfold/react/treeview';
import { defineFileUpload } from '@pinfold/react/fileupload';
import { defineTour } from '@pinfold/react/tour';
import { Badge } from '@pinfold/react/badge';
import { Button } from '@pinfold/react/button';
import { Input } from '@pinfold/react/input';
import { changed } from './shared';
import { src, type ExampleSpec } from './example';
import { Page, svg, Toggle, usePage } from './Playgrounds';

/**
 * The tree view, file upload and tour pages. Each demo is a small working app: the line under the
 * preview reports what the component's events said last, so the interaction is visible.
 */

const wait = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(t);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });

/* -------------------------------------------------------------- tree view */

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

function TreeDemo({ Preset, props }: { Preset: React.ElementType; props: Record<string, any> }) {
  const { _lazy: lazy, ...rest } = props;
  const [last, setLast] = React.useState('Nothing yet: select a row, open a folder or press Enter.');
  const [selected, setSelected] = React.useState<string[]>([]);
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
    body: ['const [selected, setSelected] = useState<string[]>([]);', ...(lazy ? ['const load = (item, { signal }) => api.list(item.id, { signal }); // resolves to the node\'s children'] : [])],
    tree: [
      {
        app: TreeDemo,
        use: {
          label: 'Project files',
          items: src([], 'projectFiles // [{ id: "src", label: "src", children: [...] }, { id: "dist", label: "dist", badge: "build", hasChildren: true }, "package.json"]'),
          dimensions: { height: 340 },
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

/* ------------------------------------------------------------ file upload */

/** A fake upload: progress over about a second and a half; names containing "fail" are rejected by the "server". */
const fakeUpload = async (file: File, { signal, onProgress }: { signal: AbortSignal; onProgress: (fraction: number) => void }) => {
  for (let i = 1; i <= 10; i++) {
    await wait(150, signal);
    onProgress(i / 10);
    if (i === 6 && file.name.toLowerCase().includes('fail')) throw new Error('The server rejected this file (500)');
  }
  return { url: `/files/${encodeURIComponent(file.name)}` };
};

const nameOf = (f: any): string => f?.name ?? f?.file?.name ?? String(f);

function UploadDemo({ Preset, props }: { Preset: React.ElementType; props: Record<string, any> }) {
  const [files, setFiles] = React.useState<any[]>([]);
  const [last, setLast] = React.useState('No events yet. Drop files, or press the zone to browse.');
  return (
    <div className="dx-stack">
      <Preset
        {...props}
        accept="image/*,application/pdf"
        maxSize={5_000_000}
        maxFiles={5}
        upload={fakeUpload}
        onChange={(next: any[]) => setFiles(next)}
        onReject={(r: Array<{ file: File; reasons: string[] }>) => setLast(`onReject: ${r.map((x) => `${x.file.name} (${x.reasons.join(', ')})`).join('; ')}`)}
        onUploadComplete={(f: any) => setLast(`onUploadComplete: ${nameOf(f)}`)}
        onUploadError={(f: any, e: Error) => setLast(`onUploadError: ${nameOf(f)}: ${e.message}`)}
      />
      <p className="dx-hint" role="status">
        onChange: {files.length ? files.map(nameOf).join(', ') : 'no files'}
        <br />
        Last event: <b>{last}</b>
      </p>
    </div>
  );
}

export function FileUploadPlayground() {
  const page = usePage(fileuploadMeta, ['size', 'tone'], {});
  const inactive = inactiveFileUploadOptions({ ...(page.options as any), upload: () => null });
  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));
  const spec: ExampleSpec = {
    name: 'Files',
    preset: { accept: 'image/*,application/pdf', maxSize: 5_000_000, maxFiles: 5, ...set },
    body: [
      'const [files, setFiles] = useState<File[]>([]);',
      'const send = (file, { signal, onProgress }) => api.upload(file, { signal, onProgress }); // resolves with the response',
    ],
    tree: [{ app: UploadDemo, use: { upload: src(fakeUpload, 'send'), onChange: src(undefined, 'setFiles'), onReject: src(undefined, '(rejections) => notify(rejections)') }, code: ['$TAG'] }],
  };
  return (
    <Page
      meta={fileuploadMeta}
      page={page}
      define={defineFileUpload}
      spec={spec}
      inactive={inactive}
      inherit={['size', 'tone']}
      provider
      motion
      align="start"
      file="components/files"
      note={'The upload here is a stand-in: progress runs for 1.5 s and a file with "fail" in its name is rejected, so you can try Retry. Images get a thumbnail; PDFs are accepted; anything else, or a file over 5 MB, is listed as rejected with its reasons. Switch the variant to see the button and the one-line forms.'}
    />
  );
}

/* ------------------------------------------------------------------- tour */

const PLUS = svg('M12 5v14M5 12h14');

/** Selectors are scoped to the mock app, so a step can never land on the site's own chrome. */
function MockApp() {
  return (
    <div className="dx-mock" data-tour-demo>
      <header className="dx-mock__bar">
        <strong>Acme</strong>
        <div data-tour="search" className="dx-mock__search">
          <Input label="Search" placeholder="Search projects" size="sm" />
        </div>
        <div data-tour="create">
          <Button label="New project" size="sm" startContent={PLUS} />
        </div>
      </header>
      <div className="dx-mock__stats" data-tour="stats">
        {[['Projects', '12'], ['Open issues', '48'], ['Deploys', '7']].map(([k, v]) => (
          <div key={k} className="dx-mock__stat">
            <span className="dx-hint">{k}</span>
            <b>{v}</b>
          </div>
        ))}
      </div>
      <div data-tour="activity" className="dx-mock__activity">
        <Badge label="Live" variant="soft" size="sm" tone="success" />
        <span>Mara deployed Atlas 2.4.0 a minute ago</span>
      </div>
    </div>
  );
}

function TourDemo({ Preset, props }: { Preset: React.ElementType; props: Record<string, any> }) {
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState(0);
  const [last, setLast] = React.useState('The tour has not run yet.');
  const steps = [
    { id: 'search', target: '[data-tour-demo] [data-tour=search]', title: 'Search anything', content: 'Find a project, an issue or a person from here.' },
    { id: 'create', target: '[data-tour-demo] [data-tour=create]', title: 'Start something new', content: 'New project sets up a workspace in a few seconds.', placement: 'bottom-end' },
    { id: 'stats', target: '[data-tour-demo] [data-tour=stats]', title: 'Your numbers', content: 'Projects, open issues and deploys at a glance.', placement: 'top' },
    { id: 'activity', target: '[data-tour-demo] [data-tour=activity]', title: 'What just happened', content: 'The latest activity from your team lands here.' },
  ];
  return (
    <div className="dx-stack">
      <div>
        <Button
          label="Start the tour"
          onClick={() => {
            setStep(0);
            setOpen(true);
            setLast('Tour started.');
          }}
        />
      </div>
      <MockApp />
      <Preset
        {...props}
        steps={steps}
        open={open}
        step={step}
        onOpenChange={setOpen}
        onStepChange={(i: number) => setStep(i)}
        onComplete={() => {
          setOpen(false);
          setLast('onComplete(): you finished all four steps.');
        }}
        onSkip={(i: number) => {
          setOpen(false);
          setLast(`onSkip(${i}): skipped on step ${i + 1} of ${steps.length}.`);
        }}
      />
      <p className="dx-hint" role="status">
        {open ? `Step ${step + 1} of ${steps.length}` : 'Closed'} · Last event: <b>{last}</b>
      </p>
    </div>
  );
}

export function TourPlayground() {
  const page = usePage(tourMeta, ['size', 'tone'], {});
  const inactive = inactiveTourOptions({ ...(page.options as any), steps: [{}, {}, {}, {}] });
  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));
  const spec: ExampleSpec = {
    name: 'Onboarding',
    preset: set,
    body: [
      'const [open, setOpen] = useState(false);',
    ],
    tree: [
      {
        app: TourDemo,
        use: {
          steps: src(
            [],
            "[\n      { target: '[data-tour=search]', title: 'Search anything', content: 'Find a project, an issue or a person from here.' },\n      { target: '[data-tour=create]', title: 'Start something new', content: 'New project sets up a workspace.', placement: 'bottom-end' },\n      { target: '[data-tour=stats]', title: 'Your numbers', content: 'Projects, open issues and deploys.', placement: 'top' },\n      { target: '[data-tour=activity]', title: 'What just happened', content: 'The latest activity lands here.' },\n    ]",
          ),
          open: src(false, 'open'),
          onOpenChange: src(undefined, 'setOpen'),
          onComplete: src(undefined, 'markSeen'),
          onSkip: src(undefined, '(index) => track("tour-skipped", index)'),
        },
        code: ['<Button label="Start the tour" onClick={() => setOpen(true)} />', '<AppHeader /> {/* marks its search field, button, stats and activity with data-tour */}', '$TAG'],
      },
    ],
  };
  return (
    <Page
      meta={tourMeta}
      page={page}
      define={defineTour}
      spec={spec}
      inactive={inactive}
      inherit={['size', 'tone']}
      provider
      motion
      align="start"
      file="components/onboarding"
      note="Press Start the tour. The four steps point at the search field, the New project button and the stat cards of the small app above; Next, Back, the arrow keys, Skip and Escape all work, and the line under the preview shows onComplete or onSkip. With the dim or blur mask the rest of the page is covered while the tour runs; mask none leaves it usable."
    />
  );
}
