import * as React from 'react';

/**
 * Path routes: `/` is the landing page, `/docs` the introduction, `/docs/<page>` a guide or a component.
 * Old `#/<page>` links (shared before the move) land on the same page.
 */

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/** The route for the address: '' (landing), 'docs' or 'docs/<page>'. */
export function readRoute(): string {
  const path = location.pathname.slice(BASE.length).replace(/^\/+|\/+$/g, '');
  return path;
}

/** The page name inside the docs ('introduction' for /docs), or null on the landing page. */
export function docsPage(route: string): string | null {
  if (route === 'docs') return 'introduction';
  if (route.startsWith('docs/')) return route.slice(5);
  return null;
}

export const href = (route: string) => `${BASE}/${route}`.replace(/\/+$/, '') || '/';
export const docsHref = (page: string) => href(page === 'introduction' ? 'docs' : `docs/${page}`);

const LEGACY: Record<string, string> = { overview: 'docs', palette: 'docs/theming', playground: 'docs/accordion' };

/** `#/button?x` from before path routes, as a path. */
function fromLegacyHash(): string | null {
  const m = /^#\/([a-z-]+)/.exec(location.hash);
  if (!m) return null;
  return LEGACY[m[1]] ?? `docs/${m[1]}`;
}

// An old link is rewritten before anything renders, so every part of the page (previews included)
// reads the same route.
if (typeof location !== 'undefined' && !location.pathname.endsWith('preview.html')) {
  const legacy = fromLegacyHash();
  if (legacy) history.replaceState(null, '', href(legacy) + location.search);
}

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function navigate(to: string, { replace = false } = {}) {
  const url = new URL(to, location.href);
  if (url.origin !== location.origin) {
    location.href = url.href;
    return;
  }
  const samePage = url.pathname === location.pathname;
  history[replace ? 'replaceState' : 'pushState'](null, '', url.pathname + url.search + url.hash);
  emit();
  if (url.hash) requestAnimationFrame(() => document.getElementById(decodeURIComponent(url.hash.slice(1)))?.scrollIntoView({ block: 'start' }));
  else if (!samePage) window.scrollTo({ top: 0 });
}

/** The current route; re-renders on navigation and on the back and forward buttons. */
export function useRoute(): string {
  const [route, setRoute] = React.useState(readRoute);
  React.useEffect(() => {
    const update = () => setRoute(readRoute());
    listeners.add(update);
    window.addEventListener('popstate', update);
    return () => {
      listeners.delete(update);
      window.removeEventListener('popstate', update);
    };
  }, []);
  return route;
}

/**
 * Plain links inside the site (in prose, cards, the footer) move without a reload. Pinfold components
 * route their own links through the provider's `navigate`.
 */
export function useLinkInterception() {
  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!a || a.target || a.hasAttribute('download')) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || /\.(txt|json|svg|png|xml)$/.test(url.pathname)) return;
      if (url.pathname === location.pathname && url.hash) return;
      e.preventDefault();
      navigate(url.pathname + url.search + url.hash);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
}
