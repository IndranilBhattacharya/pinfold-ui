import * as React from 'react';
import { resizableMeta } from '@pinfold/core/meta';
import { inactiveResizableOptions } from '@pinfold/core';
import { defineResizable } from '@pinfold/react/resizable';
import { changed } from '../playground/shared';
import { src, type ExampleSpec } from '../playground/example';
import { Page, usePage } from '../playground/kit';
import { FILE_ICON } from './tabs';

/** The resizable page. */

const FILES: Record<string, string> = {
  'App.tsx': "export function App() {\n  return <Workspace label=\"Editor\" panels={panels} />;\n}",
  'theme.css': ':root {\n  --pinfold-radius-scale: 1.25;\n}',
  'README.md': '# Pinfold\n\nDrag the handle, or focus it and use the arrow keys.',
};

/** An editor: the file list on one side drives the code on the other. */
function Editor({ Preset, props }: { Preset: React.ElementType; props: Record<string, any> }) {
  const [file, setFile] = React.useState('App.tsx');
  const panels = [
    {
      id: 'files',
      label: 'Files',
      defaultSize: 28,
      min: 18,
      max: 50,
      content: (
        <ul className="dx-filelist">
          {Object.keys(FILES).map((f) => (
            <li key={f}>
              <button type="button" aria-current={f === file || undefined} onClick={() => setFile(f)}>
                {FILE_ICON}
                {f}
              </button>
            </li>
          ))}
        </ul>
      ),
    },
    { id: 'code', label: 'Code', min: 30, content: <pre className="dx-file dx-file--flat">{FILES[file]}</pre> },
  ];
  return <Preset {...props} panels={panels} />;
}

export function ResizablePlayground() {
  const page = usePage(resizableMeta, ['size', 'tone'], {});
  const inactive = inactiveResizableOptions(page.options);
  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));
  const spec: ExampleSpec = {
    name: 'Workspace',
    preset: set,
    body: ["const [file, setFile] = useState('App.tsx');"],
    tree: [
      {
        app: Editor,
        use: {
          label: 'Editor',
          autoSaveId: 'editor',
          panels: src([], "[{ id: 'files', label: 'Files', defaultSize: 28, min: 18, max: 50, content: <FileList current={file} onOpen={setFile} /> }, { id: 'code', label: 'Code', min: 30, content: <Code file={file} /> }]"),
        },
        code: ['$TAG'],
      },
    ],
  };
  return (
    <Page
      wide
      meta={resizableMeta}
      page={page}
      define={defineResizable}
      spec={spec}
      inactive={inactive}
      inherit={['size', 'tone']}
      provider
      align="start"
      file="components/editor"
      note="Drag the handle, or focus it and use the arrow keys (Home and End for the limits; a double click restores it). The sizes are kept in this browser. Choosing a file shows it beside."
    />
  );
}
