import * as React from 'react';
import { fileuploadMeta } from '@pinfold/core/meta';
import { inactiveFileUploadOptions } from '@pinfold/core';
import { changed } from '../playground/shared';
import { src, type ExampleSpec } from '../playground/example';
import { defineFileUpload } from '@pinfold/react/fileupload';
import { Page, usePage, wait } from '../playground/kit';

/** The file upload page. */

/** A fake upload: progress over about a second and a half; names containing "fail" are rejected by the "server". */
const fakeUpload = async (file: File, { signal, onProgress }: { signal: AbortSignal; onProgress: (fraction: number) => void }) => {
  for (let i = 1; i <= 10; i++) {
    await wait(150, signal);
    onProgress(i / 10);
    if (i === 6 && file.name.toLowerCase().includes('fail')) throw new Error('The server rejected this file (500)');
  }
  return { url: `/files/${encodeURIComponent(file.name)}` };
};

/** Two files already held, so the list and its thumbnails show as the page loads. */
const PHOTO = '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="64"><rect width="96" height="64" fill="#2f6f8f"/><rect y="40" width="96" height="24" fill="#1d4457"/><rect x="18" y="22" width="34" height="18" fill="#e8b04a"/><rect x="52" y="26" width="26" height="14" fill="#d9574a"/></svg>';
let held: File[] | undefined;
const demoFiles = (): File[] => (held ??= [
  new File([PHOTO], 'dock-7-container.svg', { type: 'image/svg+xml' }),
  new File(['%PDF-1.4 Harbor bill of lading HB-20418'], 'bill-of-lading-HB-20418.pdf', { type: 'application/pdf' }),
]);

const nameOf = (f: any): string => f?.name ?? f?.file?.name ?? String(f);

function UploadDemo({ Preset, props }: { Preset: React.ElementType; props: Record<string, any> }) {
  const [files, setFiles] = React.useState<any[]>(demoFiles);
  const [last, setLast] = React.useState('No events yet. Drop files, or press the zone to browse.');
  return (
    <div className="dx-stack">
      <Preset
        {...props}
        defaultValue={demoFiles()}
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
    // maxFiles counts only when the upload holds several files.
    preset: { accept: 'image/*,application/pdf', maxSize: 5_000_000, ...(page.options.multiple === false ? null : { maxFiles: 5 }), ...set },
    body: [
      'const [files, setFiles] = useState<File[]>(savedFiles); // files already attached',
      'const send = (file, { signal, onProgress }) => api.upload(file, { signal, onProgress }); // resolves with the response',
    ],
    tree: [{ app: UploadDemo, use: { defaultValue: src([], 'files'), upload: src(fakeUpload, 'send'), onChange: src(undefined, 'setFiles'), onReject: src(undefined, '(rejections) => notify(rejections)') }, code: ['$TAG'] }],
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
      align="start"
      file="components/files"
      note={'The upload here is a stand-in: progress runs for 1.5 s and a file with "fail" in its name is rejected, so you can try Retry. Images get a thumbnail; PDFs are accepted; anything else, or a file over 5 MB, is listed as rejected with its reasons. Switch the variant to see the button and the one-line forms.'}
    />
  );
}
