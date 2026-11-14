import * as React from 'react';
import { sidebarMeta } from '@pinfold/core/meta';
import { inactiveSidebarOptions } from '@pinfold/core';
import { defineSidebar } from '@pinfold/react/sidebar';
import { changed } from '../playground/shared';
import { src, type ExampleSpec } from '../playground/example';
import { Page, usePage } from '../playground/kit';
import { BOARD_ICON, CAL_ICON, svg } from './toggle';
import { ME, PAGES_OF_APP } from '../demo/harbor';

/** The sidebar page. */

/** Harbor's own navigation: the demos route between these pages. */
export const NAV_ITEMS = [
  {
    label: 'Shipments',
    icon: svg('M3 17h18l-2 3H5zM5 17V9h14v8M9 9V5h6v4'),
    items: [
      { label: 'Active', href: '/shipments/active' },
      { label: 'Delayed', href: '/shipments/delayed', badge: 3 },
      { label: 'Archive', href: '/shipments/archive' },
    ],
  },
  { label: 'Orders', href: '/orders', icon: svg('M4 13h4l2 3h4l2-3h4M5 5h14l2 8v6H3v-6z'), badge: 12 },
  { label: 'Customers', href: '/customers', icon: svg('M16 21a5 5 0 0 0-10 0M11 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM21 21a4 4 0 0 0-4-4') },
  { label: 'Reports', href: '/reports', icon: BOARD_ICON },
  { label: 'Settings', href: '/settings', icon: svg('M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM4 12h2M18 12h2M12 4v2M12 18v2'), group: 'Account' },
  { label: 'Billing', href: '/billing', icon: svg('M3 6h18v12H3zM3 10h18'), group: 'Account' },
];
export const NAV_PAGES: Record<string, { title: string; lead: string }> = {
  ...PAGES_OF_APP,
  '/shipments/archive': { title: 'Archive', lead: 'Delivered shipments from the last 12 months, read only.' },
};

/** An app shell: the sidebar drives the page beside it through its router. */
function Shell({ Preset, props }: { Preset: React.ElementType; props: Record<string, any> }) {
  const [path, setPath] = React.useState('/shipments/active');
  const current = NAV_PAGES[path] ?? { title: path, lead: '' };
  return (
    <div className="dx-app">
      <Preset
        {...props}
        value={path}
        onNavigate={setPath}
        header={
          <div className="dx-app__brand">
            <span aria-hidden="true">H</span>
            <strong>Harbor</strong>
          </div>
        }
        footer={
          <div className="dx-app__brand dx-app__brand--user">
            <span aria-hidden="true">MC</span>
            <span>{ME.name}</span>
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
          value: src('/shipments/active', 'pathname'),
          onNavigate: src(undefined, 'router.push'),
          header: src(null, '<Workspace />'),
          footer: src(null, '<Account />'),
          items: src(NAV_ITEMS, "[{ label: 'Shipments', icon: <ShipIcon />, items: [{ label: 'Active', href: '/shipments/active' }, { label: 'Delayed', href: '/shipments/delayed', badge: 3 }, { label: 'Archive', href: '/shipments/archive' }] }, { label: 'Orders', href: '/orders', icon: <InboxIcon />, badge: 12 }, { label: 'Customers', href: '/customers', icon: <PeopleIcon /> }, { label: 'Reports', href: '/reports', icon: <ChartIcon /> }, { label: 'Settings', href: '/settings', icon: <GearIcon />, group: 'Account' }, { label: 'Billing', href: '/billing', icon: <CardIcon />, group: 'Account' }]"),
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
