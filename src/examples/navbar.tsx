import * as React from 'react';
import { navbarMeta } from '@pinfold/core/meta';
import { Avatar } from '@pinfold/react/avatar';
import { Button } from '@pinfold/react/button';
import { defineTabs } from '@pinfold/react/tabs';
import { defineNavbar } from '@pinfold/react/navbar';
import { changed } from '../playground/shared';
import { src, type ExampleSpec } from '../playground/example';
import { BELL, Page, Toggle, usePage } from '../playground/kit';
import { MARK, MOON, SEARCH } from './app-shell';
import { ME, NOTIFICATIONS as HARBOR_NOTES, ORDERS, PRODUCT } from '../demo/harbor';

/** The navbar page. */

const SectionTabs = defineTabs({ size: 'sm' });

export const MARKETING_ITEMS = [
  { label: 'Platform', href: '/platform' },
  {
    label: 'Solutions',
    items: [
      { label: 'Freight Forwarding', href: '/solutions/forwarding' },
      { label: 'Ocean Carriers', href: '/solutions/carriers' },
      { label: 'Customs & Port Operations', href: '/solutions/customs' },
    ],
  },
  { label: 'Rates', href: '/rates', badge: 'Live' },
  { label: 'Documentation', href: '/docs' },
];

export const MARKETING_ACTIONS = [
  { label: 'Sign in', variant: 'ghost', href: '/signin' },
  { label: 'Start free', tone: 'primary', href: '/start' },
];

export const APP_ITEMS = [
  { label: 'Overview', href: '/overview' },
  {
    label: 'Shipments',
    items: [
      { label: 'Active', href: '/shipments/active' },
      { label: 'Delayed', href: '/shipments/delayed' },
      { label: 'Archive', href: '/shipments/archive' },
    ],
  },
  { label: 'Reports', href: '/reports' },
  { label: 'Rates', href: '/rates', badge: 'New' },
];

export const PILL_ITEMS = [
  { label: 'Overview', href: '/overview' },
  { label: 'Lanes', href: '/lanes' },
  { label: 'Vessels', href: '/vessels' },
  { label: 'Tariffs', href: '/tariffs', badge: 'Live' },
];

export const OVERFLOW_ITEMS = [
  { label: 'Overview', href: '/overview' },
  { label: 'Shipments', href: '/shipments' },
  { label: 'Orders', href: '/orders' },
  { label: 'Carriers', href: '/carriers' },
  { label: 'Ports & Berths', href: '/ports' },
  { label: 'Freight Rates', href: '/rates', badge: 'Live' },
  { label: 'Analytics', href: '/analytics' },
  { label: 'Billing & Plans', href: '/billing' },
];

export const BAR_PAGES: Record<string, string> = {
  '/': 'Harbor: next-generation freight and container logistics.',
  '/platform': 'Platform: end-to-end logistics operating system.',
  '/signin': 'Sign in: access your Harbor account and active bookings.',
  '/start': 'Start free: deploy container tracking in under 5 minutes.',
  '/solutions/forwarding': 'Freight forwarding: automated quotes, customs, and documentation.',
  '/solutions/carriers': 'Ocean carriers: schedule management and container capacity.',
  '/solutions/customs': 'Customs: automated clearances at major container terminals.',
  '/overview': 'Overview: 42 shipments on the water, 3 delayed.',
  '/shipments': 'Shipments: full active directory across ocean and rail.',
  '/shipments/active': 'Active shipments: live AIS telemetry and ETA tracking.',
  '/shipments/delayed': 'Delayed shipments: 3 require lane adjustments.',
  '/shipments/archive': 'Archive: delivered consignments from past 12 months.',
  '/orders': 'Orders: recent customer purchase orders and manifests.',
  '/carriers': 'Carriers: contracted container fleet and feeder lines.',
  '/ports': 'Ports & Berths: congestion monitors and berth reservations.',
  '/lanes': 'Lanes: transpacific, transatlantic, and intra-Asia routes.',
  '/vessels': 'Vessels: active fleet registry and AIS tracking.',
  '/tariffs': 'Tariffs: spot container rates and bunker adjustments.',
  '/reports': 'Reports: on-time reliability 94.2% this quarter.',
  '/rates': 'Rates: live spot pricing per FEU across top 20 lanes.',
  '/analytics': 'Analytics: port turn-time and dwell hour metrics.',
  '/billing': 'Billing: customer invoices and demurrage statements.',
  '/docs': 'Documentation: Harbor APIs and developer guides.',
  '/pricing': 'Pricing: volume freight tier pricing.',
};

export const NOTIFICATIONS = HARBOR_NOTES.slice(0, 3).map((n) => n.text);

/* -------------------------------------------------------------------------- */
/* 1. Marketing Demo                                                          */
/* -------------------------------------------------------------------------- */
function MarketingDemo({ Preset, props }: { Preset: React.ElementType; props: Record<string, unknown> }) {
  const [path, setPath] = React.useState('/platform');

  return (
    <div className="dx-site">
      <Preset {...props} value={path} onNavigate={setPath} />
      <div className="dx-site__page dx-navbar-hero">
        <h2>Global container logistics on one platform</h2>
        <p>Track {ORDERS.length} active shipments across maritime lanes in real time.</p>
        <div className="dx-navbar-stats">
          <div className="dx-navbar-stat-card">
            <div className="dx-navbar-stat-val">{Math.round((ORDERS.filter((o) => o.status !== 'delayed').length / ORDERS.length) * 100)}%</div>
            <div className="dx-hint">On-time delivery</div>
          </div>
          <div className="dx-navbar-stat-card">
            <div className="dx-navbar-stat-val">{ORDERS.length}</div>
            <div className="dx-hint">Tracked orders</div>
          </div>
        </div>
        <p className="dx-hint" style={{ marginTop: '1rem' }}>
          Page: {BAR_PAGES[path] ?? path}
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 2. App Bar Demo                                                            */
/* -------------------------------------------------------------------------- */
function AppBarDemo({ Preset, props }: { Preset: React.ElementType; props: Record<string, unknown> }) {
  const { _layout, _secondary, ...rest } = props;
  const [path, setPath] = React.useState('/shipments/active');

  return (
    <div className="dx-site">
      <Preset {...rest} value={path} onNavigate={setPath} />
      <div className="dx-site__page">
        <p className="dx-hint">{path}</p>
        <p className="dx-panel__lead">{BAR_PAGES[path] ?? path}</p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 3. Floating Pill Demo                                                      */
/* -------------------------------------------------------------------------- */
function PillBarDemo({ Preset, props }: { Preset: React.ElementType; props: Record<string, unknown> }) {
  const [path, setPath] = React.useState('/overview');

  return (
    <div className="dx-site" style={{ padding: '0.75rem' }}>
      <Preset {...props} value={path} onNavigate={setPath} />
      <div className="dx-site__page" style={{ marginTop: '0.75rem' }}>
        <p className="dx-hint">{path}</p>
        <p className="dx-panel__lead">{BAR_PAGES[path] ?? path}</p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 4. Tabs Demo                                                               */
/* -------------------------------------------------------------------------- */
function TabsBarDemo({ Preset, props }: { Preset: React.ElementType; props: Record<string, unknown> }) {
  const [path, setPath] = React.useState('/overview');

  return (
    <div className="dx-site">
      <Preset {...props} value={path} onNavigate={setPath} />
      <div className="dx-site__page">
        <p className="dx-hint">{path}</p>
        <p className="dx-panel__lead">{BAR_PAGES[path] ?? path}</p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 5. Scroll Demo                                                             */
/* -------------------------------------------------------------------------- */
function ScrollBarDemo({ Preset, props }: { Preset: React.ElementType; props: Record<string, unknown> }) {
  const [path, setPath] = React.useState('/overview');
  const scrollRef = React.useRef<HTMLDivElement>(null);

  return (
    <div ref={scrollRef} className="dx-navbar-scroll-demo">
      <Preset {...props} scrollTarget={scrollRef} value={path} onNavigate={setPath} />
      <div style={{ padding: '1rem' }}>
        <p className="dx-hint" style={{ marginBottom: '0.75rem' }}>
          Scroll down inside this container: the bar shrinks past 8px and hides past 120px; scrolling up reveals it.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {ORDERS.slice(0, 8).map((order) => (
            <div key={order.id} className="dx-navbar-stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>Order {order.id}</strong>
                <span className="dx-hint">{order.eta}</span>
              </div>
              <p style={{ margin: '0.25rem 0', fontSize: '0.8125rem' }}>
                {order.customer.name} · {order.lane} · {order.carrier}
              </p>
              <div className="dx-hint">
                Status: {order.status} · Weight: {order.weight.toLocaleString()} kg · Value: ${order.value.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 6. Overflow Demo                                                           */
/* -------------------------------------------------------------------------- */
function OverflowBarDemo({ Preset, props }: { Preset: React.ElementType; props: Record<string, unknown> }) {
  const [path, setPath] = React.useState('/overview');

  return (
    <div className="dx-site dx-navbar-overflow-box">
      <Preset {...props} value={path} onNavigate={setPath} />
      <div className="dx-site__page">
        <p className="dx-hint">Active link: {path}</p>
        <p className="dx-panel__lead">{BAR_PAGES[path] ?? path}</p>
        <p className="dx-hint">
          At this tablet width, eight links overflow: switch between <code>more</code> (menu), <code>scroll</code> (horizontal touch/wheel), and <code>none</code>.
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Navbar Playground Page                                                     */
/* -------------------------------------------------------------------------- */
export function NavbarPlayground() {
  const page = usePage(navbarMeta, ['size', 'tone'], { _demo: 'marketing', _layout: false, _secondary: false, collapseAt: 480 });
  const demo = String(page.inputs._demo ?? 'marketing');
  const inactive: Record<string, string> = {
    ...(demo === 'pill' ? { variant: 'set by the example above.' } : {}),
  };

  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));

  let spec: ExampleSpec;
  let note = '';
  let file = 'components/navbar';

  if (demo === 'app') {
    file = 'components/app-bar';
    note = 'App bar with search, notifications dropdown menu, and user account menu.';
    const custom = Boolean(page.inputs._layout);
    const secondary = Boolean(page.inputs._secondary);
    const previewTools = [
      { id: 'search', label: 'Search', icon: SEARCH, onClick: () => {} },
      {
        id: 'bell',
        label: 'Notifications',
        icon: BELL,
        badge: 3,
        menu: NOTIFICATIONS.map((n) => ({ label: n })),
      },
      { id: 'theme', label: 'Dark mode', icon: MOON, active: false, onClick: () => {} },
      {
        id: 'account',
        label: ME.name,
        content: <Avatar name={ME.name} size="sm" />,
        menu: [
          { label: `Signed in as ${ME.name}` },
          { type: 'separator' as const },
          { label: 'Account settings', onSelect: () => {} },
          { label: 'Sign out', onSelect: () => {} },
        ],
      },
    ];
    spec = {
      name: 'AppBar',
      imports: ["import { Avatar } from '@pinfold/react/avatar';", ...(secondary ? ["import { defineTabs } from '@pinfold/react/tabs';"] : [])],
      preset: set,
      body: [
        'const pathname = usePathname();',
        'const router = useRouter();',
        'const [unread, setUnread] = useState(3);',
        'const [dark, setDark] = useState(false);',
        "const openSearch = () => fetch('/api/search');",
        'const toggleTheme = () => setDark((d) => !d);',
        'const notifications = ' + JSON.stringify(NOTIFICATIONS, null, 2) + ';',
        'const user = ' + JSON.stringify({ name: ME.name }, null, 2) + ';',
        'const accountMenu = [{ label: "Signed in as " + user.name }, { type: "separator" as const }, { label: "Account settings", onSelect: () => router.push("/settings") }, { label: "Sign out", onSelect: () => router.push("/login") }];',
        ...(secondary ? ["const SectionTabs = defineTabs({ size: 'sm' });"] : []),
      ],
      tree: [
        {
          app: AppBarDemo,
          use: {
            label: 'Main',
            value: src('/shipments/active', 'pathname'),
            onNavigate: src(undefined, 'router.push'),
            brand: { label: PRODUCT, logo: src(MARK, '<Logo />'), href: '/' },
            items: src(APP_ITEMS, JSON.stringify(APP_ITEMS, null, 2)),
            tools: src(
              previewTools,
              "[{ id: 'search', label: 'Search', icon: <SearchIcon />, onClick: openSearch }, { id: 'bell', label: 'Notifications', icon: <BellIcon />, badge: unread, menu: notifications.map((n) => ({ label: n })) }, { id: 'theme', label: 'Dark mode', icon: <MoonIcon />, active: dark, onClick: toggleTheme }, { id: 'account', label: user.name, content: <Avatar name={user.name} size=\"sm\" />, menu: accountMenu }]"
            ),
            layout: custom ? { start: ['brand'], center: ['links'], end: ['tool:search', 'tool:bell', 'tool:theme', 'tool:account', 'toggle'] } : undefined,
            secondary: secondary ? src(<SectionTabs label="Section" items={['Summary', 'Shipments', 'Invoices']} />, "<SectionTabs label=\"Section\" items={['Summary', 'Shipments', 'Invoices']} />") : undefined,
            _layout: src(custom, ''),
            _secondary: src(secondary, ''),
          },
          code: ['$TAG'],
        },
      ],
    };
  } else if (demo === 'pill') {
    file = 'components/floating-navbar';
    note = 'A floating rounded bar over the content, centered with variant="floating".';
    const previewTools = [{ id: 'search', label: 'Search', icon: SEARCH, onClick: () => {} }];
    spec = {
      name: 'FloatingBar',
      imports: ["import { Avatar } from '@pinfold/react/avatar';"],
      preset: { ...set, variant: set.variant ?? 'floating' },
      body: ['const pathname = usePathname();', 'const router = useRouter();', "const openSearch = () => fetch('/api/search');"],
      tree: [
        {
          app: PillBarDemo,
          use: {
            label: 'Main',
            value: src('/overview', 'pathname'),
            onNavigate: src(undefined, 'router.push'),
            brand: { label: PRODUCT, logo: src(MARK, '<Logo />'), href: '/' },
            items: src(PILL_ITEMS, JSON.stringify(PILL_ITEMS, null, 2)),
            tools: src(previewTools, "[{ id: 'search', label: 'Search', icon: <SearchIcon />, onClick: openSearch }]"),
            end: src(<Avatar name={ME.name} size="sm" />, `<Avatar name="${ME.name}" size="sm" />`),
          },
          code: ['$TAG'],
        },
      ],
    };
  } else if (demo === 'tabs') {
    file = 'components/navbar-tabs';
    note = 'A secondary row of Pinfold Tabs under the bar for deep view navigation.';
    const previewTools = [
      { id: 'search', label: 'Search', icon: SEARCH, onClick: () => {} },
      { id: 'bell', label: 'Notifications', icon: BELL, onClick: () => {} },
    ];
    spec = {
      name: 'TabsBar',
      imports: [
        "import { defineTabs } from '@pinfold/react/tabs';",
        "import { Avatar } from '@pinfold/react/avatar';",
      ],
      preset: set,
      body: [
        'const pathname = usePathname();',
        'const router = useRouter();',
        "const openSearch = () => fetch('/api/search');",
        "const openNotes = () => fetch('/api/notifications');",
        "const SectionTabs = defineTabs({ size: 'sm' });",
      ],
      tree: [
        {
          app: TabsBarDemo,
          use: {
            label: 'Main',
            value: src('/overview', 'pathname'),
            onNavigate: src(undefined, 'router.push'),
            brand: { label: PRODUCT, logo: src(MARK, '<Logo />'), href: '/' },
            items: src(APP_ITEMS, JSON.stringify(APP_ITEMS, null, 2)),
            tools: src(
              previewTools,
              "[{ id: 'search', label: 'Search', icon: <SearchIcon />, onClick: openSearch }, { id: 'bell', label: 'Notifications', icon: <BellIcon />, onClick: openNotes }]"
            ),
            end: src(<Avatar name={ME.name} size="sm" />, `<Avatar name="${ME.name}" size="sm" />`),
            secondary: src(
              <SectionTabs label="Section" items={['Overview', 'Active Shipments', 'Vessel Schedules', 'Invoices']} />,
              "<SectionTabs label=\"Section\" items={['Overview', 'Active Shipments', 'Vessel Schedules', 'Invoices']} />"
            ),
          },
          code: ['$TAG'],
        },
      ],
    };
  } else if (demo === 'scroll') {
    file = 'components/navbar-scroll';
    note = 'Shrink and hide on scroll: the bar follows the scrollable container via scrollTarget.';
    const previewTools = [{ id: 'search', label: 'Search', icon: SEARCH, onClick: () => {} }];
    spec = {
      name: 'ScrollBar',
      imports: ["import { Avatar } from '@pinfold/react/avatar';"],
      preset: { ...set, position: set.position ?? 'sticky', shrinkOnScroll: true, hideOnScroll: true },
      body: [
        'const scrollRef = useRef<HTMLDivElement>(null);',
        'const pathname = usePathname();',
        'const router = useRouter();',
        "const openSearch = () => fetch('/api/search');",
      ],
      tree: [
        {
          app: ScrollBarDemo,
          use: {
            label: 'Main',
            position: 'sticky',
            shrinkOnScroll: true,
            hideOnScroll: true,
            scrollTarget: src(null, 'scrollRef'),
            value: src('/overview', 'pathname'),
            onNavigate: src(undefined, 'router.push'),
            brand: { label: PRODUCT, logo: src(MARK, '<Logo />'), href: '/' },
            items: src(APP_ITEMS, JSON.stringify(APP_ITEMS, null, 2)),
            tools: src(previewTools, "[{ id: 'search', label: 'Search', icon: <SearchIcon />, onClick: openSearch }]"),
            end: src(<Avatar name={ME.name} size="sm" />, `<Avatar name="${ME.name}" size="sm" />`),
          },
          code: [
            '<div ref={scrollRef} style={{ maxHeight: "22rem", overflowY: "auto" }}>',
            '  $TAG',
            '  <main>{/* tall scrollable content */}</main>',
            '</div>',
          ],
        },
      ],
    };
  } else if (demo === 'overflow') {
    file = 'components/navbar-overflow';
    note = 'Eight links at tablet width: overflow control switches between more, scroll, and none.';
    spec = {
      name: 'OverflowBar',
      imports: ["import { Avatar } from '@pinfold/react/avatar';"],
      preset: set,
      body: ['const pathname = usePathname();', 'const router = useRouter();'],
      tree: [
        {
          app: OverflowBarDemo,
          use: {
            label: 'Main',
            value: src('/overview', 'pathname'),
            onNavigate: src(undefined, 'router.push'),
            brand: { label: PRODUCT, logo: src(MARK, '<Logo />'), href: '/' },
            items: src(OVERFLOW_ITEMS, JSON.stringify(OVERFLOW_ITEMS, null, 2)),
            end: src(<Avatar name={ME.name} size="sm" />, `<Avatar name="${ME.name}" size="sm" />`),
          },
          code: ['$TAG'],
        },
      ],
    };
  } else {
    // Marketing (default)
    file = 'components/marketing-navbar';
    note = 'Marketing navbar with logo, centered links, and call-to-action buttons.';
    spec = {
      name: 'MarketingBar',
      imports: ["import { Button } from '@pinfold/react/button';"],
      preset: set,
      body: ['const pathname = usePathname();', 'const router = useRouter();'],
      tree: [
        {
          app: MarketingDemo,
          use: {
            label: 'Main',
            value: src('/platform', 'pathname'),
            onNavigate: src(undefined, 'router.push'),
            brand: { label: PRODUCT, logo: src(MARK, '<Logo />'), href: '/' },
            items: src(MARKETING_ITEMS, JSON.stringify(MARKETING_ITEMS, null, 2)),
            actions: src(MARKETING_ACTIONS, JSON.stringify(MARKETING_ACTIONS, null, 2)),
          },
          code: ['$TAG'],
        },
      ],
    };
  }

  return (
    <Page
      wide
      examples={{
        name: '_demo',
        options: [
          ['marketing', 'marketing'],
          ['app', 'app bar'],
          ['pill', 'floating pill'],
          ['tabs', 'with tabs'],
          ['scroll', 'on scroll'],
          ['overflow', 'overflow'],
        ],
      }}
      meta={navbarMeta}
      page={page}
      define={defineNavbar}
      spec={spec}
      inactive={inactive}
      inherit={['size', 'tone']}
      provider
      align="start"
      file={file}
      note={note}
      demo={
        demo === 'app' ? (
          <>
            <Toggle page={page} name="_layout" label="custom layout (links centred, tools by name)" />
            <Toggle page={page} name="_secondary" label="secondary row (tabs under the bar)" />
          </>
        ) : null
      }
    />
  );
}
