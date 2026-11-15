import * as React from 'react';
import { appshellMeta } from '@pinfold/core/meta';
import { inactiveAppShellOptions } from '@pinfold/core';
import { Avatar } from '@pinfold/react/avatar';
import { defineSidebar } from '@pinfold/react/sidebar';
import { changed } from '../playground/shared';
import { type ExampleSpec } from '../playground/example';
import { defineAppShell } from '@pinfold/react/appshell';
import { defineNavbar } from '@pinfold/react/navbar';
import { defineTable } from '@pinfold/react/table';
import { Page, usePage } from '../playground/kit';
import { svg } from './toggle';
import { NAV_ITEMS, NAV_PAGES } from './sidebar';
import { APP_ITEMS } from './navbar';
import { ACTIVITY, ME, NOTIFICATIONS, ORDERS, PRODUCT, STATUS_TONE, type Order } from '../demo/harbor';
import { Badge } from '@pinfold/react/badge';

/** The app shell page. */

export const SEARCH = svg('M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM16.5 16.5 21 21');
const BELL = svg('M6 9a6 6 0 1 1 12 0c0 6 2 7 2 8H4c0-1 2-2 2-8zM10 21a2 2 0 0 0 4 0');
export const MOON = svg('M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z');
export const MARK = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M6 18c6-2 6-10 12-12M6 6c6 2 6 10 12 12" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);

const AppBar = defineNavbar({ variant: 'plain', indicator: 'none', size: 'sm' });
const AppNav = defineSidebar({ surface: 'transparent', variant: 'soft', size: 'sm' });
const ORDER_COLUMNS = [
  { key: 'id', header: 'Order', width: 95, cell: ({ row }: { row: Order }) => <b>{row.id}</b> },
  { key: 'customer', header: 'Customer', cell: ({ row }: { row: Order }) => row.customer.name },
  { key: 'lane', header: 'Lane' },
  { key: 'status', header: 'Status', cell: ({ row }: { row: Order }) => <Badge label={row.status} tone={STATUS_TONE[row.status]} size="sm" /> },
];

const OrderTable = defineTable<Order>({
  variant: 'outline',
  density: 'compact',
  lines: 'rows',
});

const DOC_NAV = [
  { id: '/docs/overview', label: 'Overview', group: 'Get started' },
  { id: '/docs/architecture', label: 'Architecture', group: 'Get started' },
  { id: '/docs/regions', label: 'Regions and layout', group: 'Components' },
  { id: '/docs/responsive', label: 'Responsive drawer', group: 'Components' },
  { id: '/docs/collapse', label: 'Desktop collapse', group: 'Components' },
];

const TOC = [
  { id: 'overview', label: 'Overview' },
  { id: 'regions', label: 'Regions & layout' },
  { id: 'responsive', label: 'Responsive drawer' },
  { id: 'collapse', label: 'Desktop collapse' },
];

function ConsoleDemo({ Preset, props }: { Preset: React.ElementType; props: Record<string, unknown> }) {
  const [path, setPath] = React.useState('/shipments/active');
  const [selectedId, setSelectedId] = React.useState('HB-4100');
  const [unread, setUnread] = React.useState(3);
  const [said, setSaid] = React.useState('Nothing pressed yet.');
  const selectedOrder = ORDERS.find((o) => o.id === selectedId) ?? ORDERS[0];

  return (
    <div>
      <Preset
        {...props}
        navbar={
          <AppBar
            label="App"
            brand={{ label: PRODUCT, logo: MARK }}
            items={APP_ITEMS}
            tools={[
              { id: 'search', label: 'Search', icon: SEARCH, onClick: () => setSaid('Search pressed: open command palette.') },
              {
                id: 'bell',
                label: 'Notifications',
                icon: BELL,
                badge: unread || undefined,
                menu: [
                  ...NOTIFICATIONS.slice(0, 3).map((n) => ({ label: n.text, onSelect: () => setSaid(`Opened: ${n.text}.`) })),
                  { type: 'separator' as const },
                  { label: 'Mark all as read', disabled: !unread, onSelect: () => (setUnread(0), setSaid('All notifications read.')) },
                ],
              },
            ]}
            end={<Avatar name={ME.name} size="sm" />}
          />
        }
        sidebar={({ collapsed, drawer }: { collapsed: boolean; drawer: boolean }) => (
          <AppNav label="Main" items={NAV_ITEMS} value={path} collapsed={collapsed && !drawer} onNavigate={(next: string) => (setPath(next), setSaid(`Navigated to ${next}.`))} />
        )}
        aside={
          <div className="dx-aside">
            <strong>Order {selectedOrder.id}</strong>
            <p className="dx-hint dx-shell-demo-aside-lead">{selectedOrder.customer.name} · {selectedOrder.customer.city}</p>
            <div className="dx-shell-demo-aside">
              <div><span className="dx-hint">Lane:</span> {selectedOrder.lane}</div>
              <div><span className="dx-hint">Carrier:</span> {selectedOrder.carrier}</div>
              <div><span className="dx-hint">Weight:</span> {selectedOrder.weight.toLocaleString()} kg</div>
              <div><span className="dx-hint">Value:</span> ${selectedOrder.value.toLocaleString()}</div>
              <div><span className="dx-hint">ETA:</span> {selectedOrder.eta}</div>
              <div className="dx-shell-demo-aside-badge"><Badge label={selectedOrder.status} tone={STATUS_TONE[selectedOrder.status]} size="sm" /></div>
            </div>
            <div style={{ borderTop: '1px solid var(--pinfold-color-border)', margin: '0.75rem 0' }} />
            <strong>Recent activity</strong>
            <ul>
              {ACTIVITY.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
        }
        footer={
          <span className="dx-hint" role="status">
            © 2026 {PRODUCT} · {said}
          </span>
        }
      >
        <div className="dx-appbody">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem' }}>
            <div>
              <h3 style={{ margin: 0 }}>Operations console</h3>
              <p className="dx-panel__lead" style={{ margin: '0.25rem 0 0' }}>8 orders awaiting dispatch or customs clearance</p>
            </div>
            <Badge label="8 active" tone="info" size="sm" />
          </div>
          <OrderTable
            label="Orders"
            rows={ORDERS.slice(0, 8)}
            rowKey="id"
            selection="single"
            selected={[selectedId]}
            onSelectionChange={(keys) => {
              if (keys[0]) {
                setSelectedId(keys[0]);
                const found = ORDERS.find((o) => o.id === keys[0]);
                if (found) setSaid(`Selected order ${found.id}: ${found.customer.name}`);
              }
            }}
            columns={ORDER_COLUMNS}
          />
        </div>
      </Preset>
    </div>
  );
}

function RailDemo({ Preset, props }: { Preset: React.ElementType; props: Record<string, unknown> }) {
  const [path, setPath] = React.useState('/shipments/active');
  const [said, setSaid] = React.useState('Rail collapsed by default.');
  const current = NAV_PAGES[path] ?? { title: path, lead: '' };

  return (
    <div>
      <Preset
        {...props}
        navbar={
          <AppBar
            label="App"
            brand={{ label: PRODUCT, logo: MARK }}
            tools={[{ id: 'search', label: 'Search', icon: SEARCH, onClick: () => setSaid('Search clicked.') }]}
            end={<Avatar name={ME.name} size="sm" />}
          />
        }
        sidebar={({ collapsed, drawer }: { collapsed: boolean; drawer: boolean }) => (
          <AppNav label="Main" items={NAV_ITEMS} value={path} collapsed={collapsed && !drawer} onNavigate={(next: string) => (setPath(next), setSaid(`Went to ${next}.`))} />
        )}
        aside={
          <div className="dx-aside">
            <strong>Activity</strong>
            <ul>
              {ACTIVITY.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
        }
        footer={
          <span className="dx-hint" role="status">
            © 2026 {PRODUCT} · {said}
          </span>
        }
      >
        <div className="dx-appbody">
          <p className="dx-hint">{path}</p>
          <h3>{current.title}</h3>
          <p className="dx-panel__lead">{current.lead}</p>
          <ul className="dx-rows">
            {ORDERS.slice(0, 7).map((o) => (
              <li key={o.id}>
                <b>{o.id}</b>
                <span>{o.customer.name}</span>
                <span className="dx-hint">{o.lane}</span>
                <Badge label={o.status} tone={STATUS_TONE[o.status]} size="sm" />
              </li>
            ))}
          </ul>
        </div>
      </Preset>
    </div>
  );
}

function PhoneDemo({ Preset, props }: { Preset: React.ElementType; props: Record<string, unknown> }) {
  const [path, setPath] = React.useState('/shipments/active');
  const [said, setSaid] = React.useState('Mobile drawer navigation.');

  return (
    <div>
      <Preset
        {...props}
        navbar={
          <AppBar
            label="App"
            brand={{ label: PRODUCT, logo: MARK }}
            tools={[{ id: 'search', label: 'Search', icon: SEARCH, onClick: () => setSaid('Search tapped.') }]}
            end={<Avatar name={ME.name} size="sm" />}
          />
        }
        sidebar={<AppNav label="Main" items={NAV_ITEMS} value={path} onNavigate={(next: string) => (setPath(next), setSaid(`Navigated to ${next}.`))} />}
        footer={
          <span className="dx-hint" role="status">
            © 2026 {PRODUCT} · {said}
          </span>
        }
      >
        <div className="dx-appbody">
          <h3>Mobile shipments</h3>
          <p className="dx-panel__lead">Tap menu trigger to open the navigation drawer.</p>
          <ul className="dx-rows">
            {ORDERS.slice(0, 14).map((o) => (
              <li key={o.id} onClick={() => setSaid(`Tapped ${o.id}`)} style={{ cursor: 'pointer' }}>
                <b>{o.id}</b>
                <span>{o.customer.name}</span>
                <Badge label={o.status} tone={STATUS_TONE[o.status]} size="sm" />
              </li>
            ))}
          </ul>
        </div>
      </Preset>
    </div>
  );
}

function DocsDemo({ Preset, props }: { Preset: React.ElementType; props: Record<string, unknown> }) {
  const [path, setPath] = React.useState('/shipments/active');
  const [said, setSaid] = React.useState('Docs layout with TOC.');

  return (
    <div>
      <Preset
        {...props}
        navbar={
          <AppBar
            label="Docs"
            brand={{ label: 'Documentation', logo: MARK }}
            tools={[{ id: 'search', label: 'Search', icon: SEARCH, onClick: () => setSaid('Search documentation.') }]}
          />
        }
        sidebar={<AppNav label="Documentation" items={DOC_NAV} value={path} onNavigate={(next: string) => (setPath(next), setSaid(`Reading ${next}.`))} />}
        aside={
          <div className="dx-aside">
            <strong>On this page</strong>
            <ul style={{ margin: '0.5rem 0 0', padding: 0, listStyle: 'none' }}>
              {TOC.map((t) => (
                <li key={t.id} style={{ padding: '0.25rem 0' }}>
                  <a
                    href={`#${t.id}`}
                    style={{ color: 'var(--pinfold-color-text-muted)', textDecoration: 'none' }}
                    onClick={(e) => {
                      e.preventDefault();
                      setSaid(`Jumped to ${t.label}`);
                    }}
                  >
                    {t.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        }
        footer={
          <span className="dx-hint" role="status">
            © 2026 {PRODUCT} Docs · {said}
          </span>
        }
      >
        <article className="dx-appbody" style={{ maxWidth: 720, lineHeight: 1.6 }}>
          <h3>App shell documentation</h3>
          <p className="dx-panel__lead">Standard landmark regions that adapt smoothly across desktop and mobile screens.</p>
          <h4 id="overview" style={{ margin: '1rem 0 0.25rem' }}>Overview</h4>
          <p>The app shell organizes your layout into standard landmark regions that adapt smoothly across desktop and mobile screens.</p>
          <h4 id="regions" style={{ margin: '1rem 0 0.25rem' }}>Regions and layout</h4>
          <p>Configure layout with navbar-top or sidebar-full to position the bar above or beside the primary navigation column.</p>
          <h4 id="responsive" style={{ margin: '1rem 0 0.25rem' }}>Responsive drawer</h4>
          <p>On narrow viewports the sidebar slides in as an overlay dialog with accessible focus trapping and touch backdrop.</p>
          <h4 id="collapse" style={{ margin: '1rem 0 0.25rem' }}>Desktop collapse</h4>
          <p>Fold the inline sidebar into a compact rail on wide screens using the sidebarCollapsible option.</p>
        </article>
      </Preset>
    </div>
  );
}

export function AppShellPlayground() {
  const page = usePage(appshellMeta, [], { scroll: 'content', _demo: 'console' });
  const demo = (page.inputs._demo as string) || 'console';
  const device = demo === 'phone' ? (page.env.device === 'full' ? 390 : Number(page.env.device)) : page.env.device === 'full' ? Infinity : Number(page.env.device);
  const box = React.useRef<HTMLDivElement | null>(null);
  const [room, setRoom] = React.useState(1000);

  const prevDemo = React.useRef(demo);
  React.useEffect(() => {
    if (demo === 'phone' && prevDemo.current !== 'phone') {
      page.setEnv('device', '390');
    } else if (demo !== 'phone' && prevDemo.current === 'phone') {
      page.setEnv('device', 'full');
    }
    prevDemo.current = demo;
  }, [demo]);

  React.useEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => setRoom(el.clientWidth - 42);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const shellWidth = Math.min(device, (room * page.env.width) / 100);

  const demoDefaults =
    demo === 'rail'
      ? { layout: 'sidebar-full' as const, sidebarCollapsible: true, defaultSidebarCollapsed: true }
      : demo === 'phone'
        ? { sidebarBehavior: 'drawer' as const }
        : demo === 'docs'
          ? { scroll: 'page' as const, navbarPosition: 'sticky' as const }
          : {};

  const behavior = ((demoDefaults as Record<string, unknown>).sidebarBehavior as string | undefined) ?? (page.options.sidebarBehavior as string | undefined) ?? 'auto';
  const drawer = behavior === 'drawer' || (behavior === 'auto' && shellWidth < 768);

  const previewConfig = {
    sidebar: true,
    navbar: true,
    scroll: (page.options.scroll as string) ?? (demo === 'docs' ? 'page' : 'content'),
    sidebarCollapsible: Boolean(page.options.sidebarCollapsible ?? (demo === 'rail')),
    ...page.options,
    ...demoDefaults,
    sidebarBehavior: behavior,
  };

  const libraryInactive = inactiveAppShellOptions(previewConfig, drawer);
  const inactive: Record<string, string> = {
    ...libraryInactive,
    ...(demo === 'rail'
      ? {
          layout: 'set by the example above.',
          sidebarCollapsible: 'set by the example above.',
        }
      : {}),
    ...(demo === 'phone'
      ? {
          sidebarBehavior: 'set by the example above.',
        }
      : {}),
    ...(demo === 'docs' ? { scroll: 'set by the example above.' } : {}),
  };

  const changedOpts = Object.fromEntries(changed(page.options, page.defaults, inactive));
  const rawSet = {
    ...demoDefaults,
    ...changedOpts,
    dimensions: {
      height: (demo === 'docs' || page.options.scroll === 'page') ? undefined : 560,
      ...(page.options.dimensions as object | undefined),
    },
  };
  const set = Object.fromEntries(Object.entries(rawSet).filter(([key]) => !(key in libraryInactive)));

  let spec: ExampleSpec;
  if (demo === 'rail') {
    const attrs = [
      'navbar={<TopBar brand={{ label: "Harbor", logo: <Logo /> }} tools={tools} />}',
      'sidebar={({ collapsed, drawer }) => <AppNav label="Main" items={nav} value={pathname} collapsed={collapsed && !drawer} onNavigate={router.push} />}',
      'aside={<ActivityPanel items={activity} />}',
      'footer={<Legal />}',
    ];
    spec = {
      name: 'RailShell',
      preset: set,
      body: ['const pathname = usePathname();', 'const router = useRouter();'],
      tree: [{ app: RailDemo, use: {}, code: ['<RailShell', ...attrs.map((a) => '  ' + a), '>', '  <ShipmentsPage />', '</RailShell>'] }],
    };
  } else if (demo === 'phone') {
    const attrs = [
      'navbar={<AppBar brand={{ label: "Harbor", logo: <Logo /> }} tools={tools} />}',
      'sidebar={<AppNav label="Main" items={nav} value={pathname} onNavigate={router.push} />}',
      'footer={<Legal />}',
    ];
    spec = {
      name: 'MobileShell',
      preset: set,
      body: ['const pathname = usePathname();', 'const router = useRouter();'],
      tree: [{ app: PhoneDemo, use: {}, code: ['<MobileShell', ...attrs.map((a) => '  ' + a), '>', '  <ShipmentsFeed orders={orders} />', '</MobileShell>'] }],
    };
  } else if (demo === 'docs') {
    const attrs = [
      'navbar={<TopBar brand={{ label: "Docs", logo: <Logo /> }} />}',
      'sidebar={<DocsNav label="Documentation" items={docsNav} value={pathname} onNavigate={router.push} />}',
      'aside={<TableOfContents headings={toc} />}',
      'footer={<DocsFooter />}',
    ];
    spec = {
      name: 'DocsShell',
      preset: set,
      body: ['const pathname = usePathname();', 'const router = useRouter();'],
      tree: [{ app: DocsDemo, use: {}, code: ['<DocsShell', ...attrs.map((a) => '  ' + a), '>', '  <article className="prose">', '    <h1>App Shell</h1>', '    <p>Organize landmark regions across desktop and mobile screens.</p>', '  </article>', '</DocsShell>'] }],
    };
  } else {
    const attrs = [
      'navbar={<TopBar brand={{ label: "Harbor", logo: <Logo /> }} tools={tools} end={<UserMenu />} />}',
      'sidebar={({ collapsed, drawer }) => <AppNav label="Main" items={nav} value={pathname} collapsed={collapsed && !drawer} onNavigate={router.push} />}',
      'aside={<OrderDetail order={orders.find((o) => o.id === selectedId)} />}',
      'footer={<Legal status={status} />}',
    ];
    spec = {
      name: 'ConsoleShell',
      preset: set,
      imports: [
        "import { defineTable } from '@pinfold/react/table';",
        "import { Badge } from '@pinfold/react/badge';",
      ],
      body: [
        'const columns = [' +
          "{ key: 'id', header: 'Order', width: 95 }," +
          "{ key: 'customer', header: 'Customer' }," +
          "{ key: 'lane', header: 'Lane' }," +
          "{ key: 'status', header: 'Status' }" +
        '];',
        'const OrderTable = defineTable({ columns, stickyHeader: true });',
        'const [selectedId, setSelectedId] = useState("HB-4100");',
        'const pathname = usePathname();',
        'const router = useRouter();',
      ],
      tree: [
        {
          app: ConsoleDemo,
          use: {},
          code: [
            '<ConsoleShell',
            ...attrs.map((a) => '  ' + a),
            '>',
            '  <OrderTable',
            '    label="Orders"',
            '    rows={orders}',
            '    selection="single"',
            '    selected={[selectedId]}',
            '    onSelectionChange={(keys) => setSelectedId(keys[0])}',
            '  />',
            '</ConsoleShell>',
          ],
        },
      ],
    };
  }

  return (
    <div ref={box}>
      <Page
        wide
        examples={{
          name: '_demo',
          options: [
            ['console', 'operations console'],
            ['rail', 'full-height rail'],
            ['phone', 'phone'],
            ['docs', 'docs layout'],
          ],
        }}
        meta={appshellMeta}
        page={page}
        define={defineAppShell}
        spec={spec}
        inactive={inactive}
        align="start"
        file="app/layout"
        note={
          demo === 'console'
            ? 'Harbor console: bar with search and menus, collapsible sidebar, table of orders, and order detail aside.'
            : demo === 'rail'
              ? 'Sidebar as a full-height rail: sidebar takes full height on the left, navbar sits beside it.'
              : demo === 'phone'
                ? 'Mobile shell (preview set to 390 px device width): tap the menu button in the bar to open the drawer; bottom of the feed is reachable by scrolling.'
                : 'Documentation layout: aside holds a table of contents, sticky navbar, and page scrolling.'
        }
      />
    </div>
  );
}
