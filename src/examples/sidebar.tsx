import * as React from 'react';
import { sidebarMeta } from '@pinfold/core/meta';
import { inactiveSidebarOptions } from '@pinfold/core';
import { defineSidebar } from '@pinfold/react/sidebar';
import { changed } from '../playground/shared';
import { src, type ExampleSpec } from '../playground/example';
import { Page, usePage } from '../playground/kit';
import { BOARD_ICON, CAL_ICON, svg } from './toggle';

/** The sidebar page. */

export const NAV_ITEMS = [
  { label: 'Inbox', href: '/inbox', icon: svg('M4 13h4l2 3h4l2-3h4M5 5h14l2 8v6H3v-6z'), badge: 4 },
  { label: 'Today', href: '/today', icon: CAL_ICON },
  {
    label: 'Projects',
    icon: svg('M3 6h6l2 2h10v11H3z'),
    items: [
      { label: 'Pinfold', href: '/projects/pinfold' },
      { label: 'Atlas', href: '/projects/atlas', badge: 'New' },
      { label: 'Archive', href: '/projects/archive' },
    ],
  },
  { label: 'Reports', href: '/reports', icon: BOARD_ICON },
  { label: 'Settings', href: '/settings', icon: svg('M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM4 12h2M18 12h2M12 4v2M12 18v2'), group: 'Account' },
  { label: 'Billing', href: '/billing', icon: svg('M3 6h18v12H3zM3 10h18'), group: 'Account' },
];
export const NAV_PAGES: Record<string, { title: string; lead: string }> = {
  '/inbox': { title: 'Inbox', lead: '4 unread messages, newest first.' },
  '/today': { title: 'Today', lead: 'Three tasks due and one meeting at 15:00.' },
  '/projects/pinfold': { title: 'Pinfold', lead: '41 components, 12 open issues.' },
  '/projects/atlas': { title: 'Atlas', lead: 'Started this week: two members, no issues yet.' },
  '/projects/archive': { title: 'Archive', lead: 'Finished projects, read only.' },
  '/reports': { title: 'Reports', lead: 'Weekly activity and time spent per project.' },
  '/settings': { title: 'Settings', lead: 'Profile, notifications and connected apps.' },
  '/billing': { title: 'Billing', lead: 'Team plan, renews on the 1st.' },
};

/** An app shell: the sidebar drives the page beside it through its router. */
function Shell({ Preset, props }: { Preset: React.ElementType; props: Record<string, any> }) {
  const [path, setPath] = React.useState('/projects/atlas');
  const current = NAV_PAGES[path] ?? { title: path, lead: '' };
  return (
    <div className="dx-app">
      <Preset
        {...props}
        value={path}
        onNavigate={setPath}
        header={
          <div className="dx-app__brand">
            <span aria-hidden="true">A</span>
            <strong>Acme Inc</strong>
          </div>
        }
        footer={
          <div className="dx-app__brand dx-app__brand--user">
            <span aria-hidden="true">ML</span>
            <span>Mara Lind</span>
          </div>
        }
      />
      <main className="dx-app__main">
        <p className="dx-hint">{path}</p>
        <h3>{current.title}</h3>
        <p className="dx-panel__lead">{current.lead}</p>
      </main>
    </div>
  );
}

export function SidebarPlayground() {
  const page = usePage(sidebarMeta, ['size', 'tone'], {});
  const inactive = inactiveSidebarOptions(page.options);
  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));
  const spec: ExampleSpec = {
    name: 'AppNav',
    preset: set,
    body: ['const pathname = usePathname();', 'const router = useRouter();'],
    tree: [
      {
        app: Shell,
        use: {
          label: 'Main',
          value: src('/projects/atlas', 'pathname'),
          onNavigate: src(undefined, 'router.push'),
          header: src(null, '<Workspace />'),
          footer: src(null, '<Account />'),
          items: src(NAV_ITEMS, "[{ label: 'Inbox', href: '/inbox', icon: <InboxIcon />, badge: 4 }, { label: 'Today', href: '/today', icon: <CalendarIcon /> }, { label: 'Projects', icon: <FolderIcon />, items: [{ label: 'Pinfold', href: '/projects/pinfold' }, { label: 'Atlas', href: '/projects/atlas', badge: 'New' }, { label: 'Archive', href: '/projects/archive' }] }, { label: 'Reports', href: '/reports', icon: <ChartIcon /> }, { label: 'Settings', href: '/settings', icon: <CogIcon />, group: 'Account' }, { label: 'Billing', href: '/billing', icon: <CardIcon />, group: 'Account' }]"),
        },
        code: ['<div className="app">', '  $TAG', '  <main>{children}</main>', '</div>'],
      },
    ],
  };
  return (
    <Page
      meta={sidebarMeta}
      page={page}
      define={defineSidebar}
      spec={spec}
      inactive={inactive}
      inherit={['size', 'tone']}
      provider
      align="start"
      file="app/layout"
      note="Choosing an entry routes the page beside it (here a small in-page router stands in for yours). Projects opens because it holds the current page. With collapsible, the button at the foot folds it into a rail: names stay for screen readers, badges become dots, and pressing Projects opens it again."
    />
  );
}
