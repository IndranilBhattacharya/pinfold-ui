import * as React from 'react';
import { defineSelect } from '@pinfold/react/select';
import { defineButton } from '@pinfold/react/button';
import { defineSkeleton } from '@pinfold/react/skeleton';
import { FIXED_HEIGHT, type FrameMessage } from './preview-mode';
import { SiteMode, SitePalette } from './site-context';
import type { Env } from './shared';

const Device = defineSelect({ size: 'sm', dimensions: { width: '11rem' } });
const Action = defineButton({ variant: 'ghost', tone: 'neutral', size: 'sm' });
const Loading = defineSkeleton({ variant: 'rect', animation: 'shimmer' });

const DEVICE_OPTIONS = [
  { value: 'full', label: 'Full width' },
  { value: '700', label: 'Tablet (700 px)' },
  { value: '390', label: 'Phone (390 px)' },
  { value: '320', label: 'Small phone (320 px)' },
];

// Fits a 560 px shell or page and the preview's 1rem padding.
const FIXED_PX = 600;
const MIN_PX = 160;

const routeNow = () => location.hash.replace(/^#\/?/, '') || 'overview';
const frameUrl = (route: string, name: string) => `${import.meta.env.BASE_URL}preview.html${location.search}#/${route}/${name}`;

/**
 * The page side of a preview: an isolated document (`preview.html`) that runs the same page with the
 * same state, so a fixed bar, a modal dialog, a toast or a scrolling page stays inside it and can never
 * break the site. The page forwards every state change and the site's colour mode and palette; the frame
 * reports its height, what the demo did, and a crash.
 */
export function PreviewFrame({ env, setEnv, name = 'main' }: { env: Env; setEnv?: <K extends keyof Env>(key: K, value: Env[K]) => void; name?: string }) {
  const route = React.useMemo(routeNow, []);
  const mode = React.useContext(SiteMode);
  const palette = React.useContext(SitePalette);
  const frame = React.useRef<HTMLIFrameElement | null>(null);
  const [reloads, setReloads] = React.useState(0);
  // ready: the frame listens (send it the site); painted: it shows the site's theme (show it).
  const [ready, setReady] = React.useState(false);
  const [painted, setPainted] = React.useState(false);
  const [height, setHeight] = React.useState(FIXED_HEIGHT.has(route) ? FIXED_PX : 320);
  const [event, setEvent] = React.useState('');
  const [crash, setCrash] = React.useState('');
  const [dragWidth, setDragWidth] = React.useState<number | null>(null);
  // The address is read once per load: later changes travel as messages, so the frame never reloads.
  const src = React.useMemo(() => frameUrl(route, name), [route, name, reloads]); // eslint-disable-line react-hooks/exhaustive-deps

  const post = React.useCallback((message: unknown) => frame.current?.contentWindow?.postMessage(message, location.origin), []);

  // Page state -> frame.
  React.useEffect(() => {
    const onState = (e: Event) => post({ type: 'state', ...(e as CustomEvent<{ key: string; raw: string }>).detail });
    window.addEventListener('pinfold:state', onState);
    return () => window.removeEventListener('pinfold:state', onState);
  }, [post]);
  // Site colour mode and palette -> frame (once it is ready, and on every change).
  React.useEffect(() => {
    if (ready) post({ type: 'site', mode, palette });
  }, [ready, mode, palette, post]);
  // Frame -> page.
  React.useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== location.origin || e.source !== frame.current?.contentWindow) return;
      const data = e.data as FrameMessage;
      // The frame read its state from its address when it loaded; a control changed since then (while it
      // was loading or mounting its page) would be lost. Send it the page's state again, every key: it
      // ignores what it already has.
      const resend = () => new URLSearchParams(location.search).forEach((raw, key) => post({ type: 'state', key, raw }));
      if (data.type === 'ready') {
        setReady(true);
        setCrash('');
        resend();
      } else if (data.type === 'painted') {
        setPainted(true);
        resend();
      } else if (data.type === 'height' && !FIXED_HEIGHT.has(route)) setHeight(Math.max(MIN_PX, Math.ceil(data.px)));
      else if (data.type === 'event') setEvent(data.text);
      else if (data.type === 'error') setCrash(data.message);
      // The demo changed the page's state (a gallery pick): the page takes it.
      else if (data.type === 'state') window.dispatchEvent(new CustomEvent('pinfold:frame-state', { detail: { key: data.key, raw: data.raw } }));
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [route, post]);

  // The drag handle on the frame's end edge sets any width; choosing a device clears it.
  const box = React.useRef<HTMLDivElement | null>(null);
  const startDrag = (down: React.PointerEvent<HTMLDivElement>) => {
    const handle = down.currentTarget;
    const left = box.current?.getBoundingClientRect().left ?? 0;
    handle.setPointerCapture(down.pointerId);
    const move = (e: PointerEvent) => setDragWidth(Math.max(280, Math.round(e.clientX - left)));
    const up = () => {
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', up);
      handle.removeEventListener('pointercancel', up);
    };
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', up);
    handle.addEventListener('pointercancel', up);
  };
  const width = dragWidth ?? (env.device === 'full' ? null : Number(env.device));

  return (
    <div className="dx-frame">
      <div className="dx-frame__bar">
        <Device
          label="Preview width"
          items={DEVICE_OPTIONS}
          value={dragWidth ? null : env.device}
          placeholder={dragWidth ? `${dragWidth} px` : undefined}
          onChange={(next) => {
            setDragWidth(null);
            if (next) setEnv?.('device', next as Env['device']);
          }}
        />
        <span className="dx-frame__spacer" />
        <Action
          label="Reload preview"
          onClick={() => {
            setReady(false);
            setPainted(false);
            setReloads((n) => n + 1);
          }}
        />
        <Action label="Open in a new tab" href={src} target="_blank" rel="noopener" />
      </div>
      <div ref={box} className="dx-frame__box" style={{ width: width ? `min(100%, ${width}px)` : '100%' }}>
        {!painted ? <Loading className="dx-frame__loading" dimensions={{ height }} /> : null}
        <iframe
          key={reloads}
          ref={frame}
          data-preview={route}
          title={name === 'main' ? `${route} preview` : `${route} preview: ${name}`}
          src={src}
          className="dx-frame__view"
          style={{ height, visibility: painted ? 'visible' : 'hidden' }}
        />
        <div className="dx-frame__handle" role="presentation" title="Drag to resize the preview" onPointerDown={startDrag} />
      </div>
      {crash ? <p className="dx-frame__event dx-error">The preview stopped: {crash}</p> : null}
      {event ? (
        <p className="dx-frame__event" role="status">
          Last event in the preview: <b>{event}</b>
        </p>
      ) : null}
    </div>
  );
}
