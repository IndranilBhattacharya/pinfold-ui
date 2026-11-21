import * as React from 'react';
import type { PinfoldStylePack } from '@pinfold/core';
import { DEFAULT_PALETTE, PinfoldProvider, useLiveTheme, type Palette } from './theme';
import { SiteMode, SitePalette } from './playground/site-context';
import { SiteToasts } from './playground/site-toast';
import { SiteShell, type Mode } from './site/Shell';
import { LangProvider } from './site/code-context';
import { docsPage, navigate, useLinkInterception, useRoute } from './site/router';
import { guideFor, metaFor } from './site/nav';
import { Landing } from './pages/Landing';

const ComponentPage = React.lazy(() => import('./pages/ComponentPage').then((m) => ({ default: m.ComponentPage })));
const AccordionExtras = React.lazy(() => import('./pages/AccordionExtras').then((m) => ({ default: m.AccordionExtras })));
const Theming = React.lazy(() => import('./pages/Theming').then((m) => ({ default: m.Theming })));
const NotFound = React.lazy(() => import('./pages/NotFound').then((m) => ({ default: m.NotFound })));
const GuideView = React.lazy(() =>
  import('./pages/guides').then((m) => ({
    default: ({ page }: { page: string }) => {
      const Comp = m.GUIDE_PAGES[page];
      return Comp ? <Comp /> : null;
    },
  }))
);

const GUIDE_PAGE_NAMES = new Set(['introduction', 'installation', 'cli', 'tailwind', 'shadcn', 'ai', 'accessibility']);

function readMode(): Mode {
  try {
    const saved = localStorage.getItem('pinfold-mode');
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    /* private mode */
  }
  return matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

const TITLE = 'Pinfold — Config-Driven React UI Component Library';

export function App() {
  const [mode, setModeState] = React.useState<Mode>(readMode);
  const [palette, setPalette] = React.useState<Palette>(DEFAULT_PALETTE);
  const [pack, setPack] = React.useState<PinfoldStylePack | 'default'>('glass');
  const theme = useLiveTheme(palette, mode);
  const route = useRoute();
  const page = docsPage(route);
  useLinkInterception();

  const setMode = (m: Mode) => {
    setModeState(m);
    try {
      localStorage.setItem('pinfold-mode', m);
    } catch {
      /* private mode */
    }
  };

  const meta = page ? metaFor(page) : undefined;
  const guide = page ? guideFor(page) : undefined;
  React.useEffect(() => {
    document.title = meta ? `${meta.displayName} · Pinfold` : guide ? `${guide.title} · Pinfold` : TITLE;
  }, [meta, guide]);

  let content: React.ReactNode;
  if (route === '') content = <Landing />;
  else if (meta) content = <ComponentPage meta={meta} extra={meta.name === 'accordion' ? AccordionExtras : undefined} />;
  else if (page === 'theming') content = <Theming palette={palette} onPalette={setPalette} theme={theme} pack={pack} onPack={setPack} />;
  else if (page && GUIDE_PAGE_NAMES.has(page)) content = <GuideView page={page} />;
  else content = <NotFound />;

  return (
    <SiteMode.Provider value={mode}>
      <SitePalette.Provider value={palette}>
        <PinfoldProvider theme={mode} radius={(palette.radius ?? 'md') as 'none' | 'sm' | 'md' | 'lg' | 'full'} stylePack={pack} navigate={(to: string) => navigate(to)}>
          <LangProvider>
            <SiteShell page={route === '' ? null : page ?? 'introduction'} mode={mode} onMode={setMode}>
              <React.Suspense fallback={<div className="dx-loading" aria-busy="true" />}>{content}</React.Suspense>
            </SiteShell>
            <SiteToasts />
          </LangProvider>
        </PinfoldProvider>
      </SitePalette.Provider>
    </SiteMode.Provider>
  );
}
