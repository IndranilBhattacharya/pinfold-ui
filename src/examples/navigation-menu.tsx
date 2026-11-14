import * as React from 'react';
import { navmenuMeta } from '@pinfold/core/meta';
import { inactiveNavMenuOptions } from '@pinfold/core';
import { defineNavMenu } from '@pinfold/react/navmenu';
import { changed } from '../playground/shared';
import { src, type ExampleSpec } from '../playground/example';
import { Page, usePage } from '../playground/kit';
import { KEEP_NOTE } from './overlays';
import { svg } from './toggle';

/** The navigation menu page. */

const SITE_ITEMS = [
  {
    label: 'Products',
    items: [
      { label: 'Analytics', href: '/analytics', description: 'Know where your traffic comes from.', icon: svg('M4 20V10M10 20V4M16 20v-7M22 20H2') },
      { label: 'Automation', href: '/automation', description: 'Flows that run on their own.', icon: svg('M13 2 4 14h7l-1 8 9-12h-7z') },
      { label: 'Reports', href: '/reports', description: 'Weekly numbers, sent to the team.', icon: svg('M6 3h9l4 4v14H6zM9 12h7M9 16h7') },
      { label: 'Security', href: '/security', description: 'Single sign-on and audit logs.', icon: svg('M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z') },
    ],
  },
  {
    label: 'Resources',
    content: (
      <a className="dx-feature" href="/launch" onClick={(e) => e.preventDefault()}>
        <strong>Northwind 3.0</strong>
        <span>Flows, reports and a new editor, out now.</span>
      </a>
    ),
    items: [
      { label: 'Docs', href: '/docs', description: 'Guides and the API reference.' },
      { label: 'Changelog', href: '/changelog', description: 'What shipped this month.' },
      { label: 'Community', href: '/community', description: 'Questions, answers and events.' },
    ],
  },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Customers', href: '/customers' },
];
const SITE_PAGES: Record<string, string> = {
  '/': 'Home: the product in one page.',
  '/analytics': 'Analytics: sessions, sources and funnels.',
  '/automation': 'Automation: triggers, steps and runs.',
  '/reports': 'Reports: scheduled summaries by email.',
  '/security': 'Security: SSO, roles and the audit log.',
  '/docs': 'Docs: start here.',
  '/changelog': 'Changelog: 12 releases this year.',
  '/community': 'Community: 4,200 members.',
  '/pricing': 'Pricing: free, team and enterprise.',
  '/customers': 'Customers: stories from 40 teams.',
};

/** A website: the menu routes the page under it. */
function SiteHeader({ Preset, props }: { Preset: React.ElementType; props: Record<string, any> }) {
  const [path, setPath] = React.useState('/analytics');
  return (
    <div className="dx-site">
      <header className="dx-site__bar">
        <a className="dx-site__logo" href="/" onClick={(e) => { e.preventDefault(); setPath('/'); }}>
          Northwind
        </a>
        <Preset {...props} value={path} onNavigate={setPath} />
      </header>
      <div className="dx-site__page">
        <p className="dx-hint">{path}</p>
        <p className="dx-panel__lead">{SITE_PAGES[path] ?? path}</p>
      </div>
    </div>
  );
}

export function NavMenuPlayground() {
  const page = usePage(navmenuMeta, ['size', 'tone'], {});
  const inactive = inactiveNavMenuOptions({ items: SITE_ITEMS });
  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));
  const spec: ExampleSpec = {
    name: 'SiteNav',
    preset: set,
    body: ['const pathname = usePathname();', 'const router = useRouter();'],
    tree: [
      {
        app: SiteHeader,
        use: {
          label: 'Main',
          value: src('/analytics', 'pathname'),
          onNavigate: src(undefined, 'router.push'),
          items: src(SITE_ITEMS, "[{ label: 'Products', items: [{ label: 'Analytics', href: '/analytics', description: 'Know where your traffic comes from.', icon: <ChartIcon /> }, { label: 'Automation', href: '/automation', description: 'Flows that run on their own.', icon: <BoltIcon /> }, { label: 'Reports', href: '/reports', description: 'Weekly numbers, sent to the team.', icon: <FileIcon /> }, { label: 'Security', href: '/security', description: 'Single sign-on and audit logs.', icon: <ShieldIcon /> }] }, { label: 'Resources', content: <LaunchCard />, items: [{ label: 'Docs', href: '/docs', description: 'Guides and the API reference.' }, { label: 'Changelog', href: '/changelog', description: 'What shipped this month.' }, { label: 'Community', href: '/community', description: 'Questions, answers and events.' }] }, { label: 'Pricing', href: '/pricing' }, { label: 'Customers', href: '/customers' }]"),
        },
        code: ['<header>', '  <Logo />', '  $TAG', '</header>'],
      },
    ],
    previewOnly: { open: 'Products' },
  };
  return (
    <Page
      wide
      meta={navmenuMeta}
      page={page}
      define={defineNavMenu}
      spec={spec}
      inactive={inactive}
      inherit={['size', 'tone']}
      provider
      align="start"
      file="components/site-header"
      note={KEEP_NOTE + ' Products is open so its options show; rest the pointer on another entry or press it, and arrow keys move between entries and into a panel. Choosing a link routes the page under the header.'}
    />
  );
}
