import * as React from 'react';
import { createRoot } from 'react-dom/client';

import '../styles';

import { defineAlert } from '@pinfold/react/alert';
import { PAGES } from '../examples';
import { DEFAULT_PALETTE, PinfoldProvider, useLiveTheme, type Palette } from '../theme';
import { FIXED_HEIGHT, postToPage } from '../playground/preview-mode';
import { SiteMode, SitePalette } from '../playground/site-context';

/**
 * A preview frame: one component page, in its own document, showing only its live preview. The page
 * that holds the frame sends the state, the site's colour mode and palette; the frame sends back its
 * height, what the demo did and any crash.
 */

const Crashed = defineAlert({ tone: 'danger', variant: 'soft' });
const route = location.hash.replace(/^#\/?/, '').split('/')[0] || '';
if (FIXED_HEIGHT.has(route)) document.documentElement.classList.add('dx-preview-fixed');

class Boundary extends React.Component<{ children: React.ReactNode }, { error: Error | null; tries: number }> {
  state = { error: null as Error | null, tries: 0 };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error) {
    postToPage({ type: 'error', message: error.message });
  }
  render() {
    if (!this.state.error) return <React.Fragment key={this.state.tries}>{this.props.children}</React.Fragment>;
    return (
      <div className="dx-preview-crash">
        <Crashed title="This preview crashed" description={this.state.error.message} actions={[{ label: 'Retry', onClick: () => this.setState((s) => ({ error: null, tries: s.tries + 1 })) }]} />
      </div>
    );
  }
}

/** The height the page should give the frame: the content, and any popup that reaches below it. */
function measure(): number {
  const stage = document.querySelector('.dx-stage--live');
  let bottom = stage ? stage.getBoundingClientRect().bottom + window.scrollY : document.body.scrollHeight;
  for (const el of document.querySelectorAll(':popover-open, dialog[open], [role="listbox"], [role="menu"], [role="tooltip"], [role="dialog"]')) {
    const r = el.getBoundingClientRect();
    if (r.width && r.height) bottom = Math.max(bottom, r.bottom + window.scrollY + 16);
  }
  return bottom + 4;
}

function useReportHeight(enabled: boolean) {
  React.useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    let last = 0;
    const send = () => {
      frame = 0;
      const px = Math.ceil(measure());
      if (Math.abs(px - last) < 4) return;
      last = px;
      postToPage({ type: 'height', px });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(send);
    };
    const resize = new ResizeObserver(schedule);
    resize.observe(document.body);
    const mutate = new MutationObserver(schedule);
    mutate.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['open', 'class', 'style', 'data-state', 'aria-expanded'] });
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      mutate.disconnect();
    };
  }, [enabled]);
}

function PreviewRoot() {
  const [site, setSite] = React.useState<{ mode: 'light' | 'dark'; palette: Palette } | null>(null);
  React.useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== location.origin || event.source !== window.parent) return;
      const data = event.data as { type?: string; mode?: 'light' | 'dark'; palette?: Palette | null };
      if (data?.type === 'site') setSite({ mode: data.mode ?? 'dark', palette: data.palette ?? DEFAULT_PALETTE });
    };
    window.addEventListener('message', onMessage);
    postToPage({ type: 'ready' });
    // Opened on its own (a new tab): no page to talk to, so use the site defaults.
    if (window.parent === window) setSite({ mode: matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark', palette: DEFAULT_PALETTE });
    return () => window.removeEventListener('message', onMessage);
  }, []);
  const mode = site?.mode ?? 'dark';
  useLiveTheme(site?.palette ?? DEFAULT_PALETTE, mode);
  useReportHeight(!!site && !FIXED_HEIGHT.has(route));
  // The preview says when it has painted (see Stage); if a page has no preview, show it anyway.
  React.useEffect(() => {
    if (!site) return;
    const t = setTimeout(() => postToPage({ type: 'painted' }), 3000);
    return () => clearTimeout(t);
  }, [site]);
  const Page = React.useMemo(() => (PAGES[route] ? React.lazy(PAGES[route]) : null), []);
  if (!site) return null;
  if (!Page) return <p className="dx-preview-crash">No preview for “{route}”.</p>;
  return (
    <SiteMode.Provider value={mode}>
      <SitePalette.Provider value={site.palette}>
        <PinfoldProvider theme={mode} radius={(site.palette.radius ?? 'md') as 'none' | 'sm' | 'md' | 'lg' | 'full'}>
          <Boundary>
            <React.Suspense fallback={null}>
              <Page />
            </React.Suspense>
          </Boundary>
        </PinfoldProvider>
      </SitePalette.Provider>
    </SiteMode.Provider>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PreviewRoot />
  </React.StrictMode>,
);
