import * as React from 'react';
import { navbarMeta } from '@pinfold/core/meta';
import { Avatar } from '@pinfold/react/avatar';
import { defineTabs } from '@pinfold/react/tabs';
import { changed } from '../playground/shared';
import { src, type ExampleSpec } from '../playground/example';
import { defineNavbar } from '@pinfold/react/navbar';
import { BELL, Page, Toggle, usePage } from '../playground/kit';
import { MARK, MOON, SEARCH } from './app-shell';
import { ME, NOTIFICATIONS as HARBOR_NOTES, PRODUCT } from '../demo/harbor';

/** The navbar page. */

const BAR_ITEMS = [
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
const BAR_PAGES: Record<string, string> = {
  '/': 'Overview: this week at a glance.',
  '/overview': 'Overview: 42 shipments on the water, 3 delayed.',
  '/shipments/active': 'Active shipments: everything between pickup and delivery.',
  '/shipments/delayed': 'Delayed: three shipments need a new ETA.',
  '/shipments/archive': 'Archive: delivered in the last 12 months.',
  '/reports': 'Reports: on-time delivery 94% this quarter.',
  '/rates': 'Rates: this week\'s prices per lane and carrier.',
};
const NOTIFICATIONS = HARBOR_NOTES.slice(0, 3).map((n) => n.text);
const SectionTabs = defineTabs({ size: 'sm' });

function BarDemo({ Preset, props }: { Preset: React.ElementType; props: Record<string, any> }) {
  const { _layout: custom, _secondary: secondary, ...rest } = props;
  const [path, setPath] = React.useState('/overview');
  const [unread, setUnread] = React.useState(3);
  const [dark, setDark] = React.useState(false);
  const [last, setLast] = React.useState('');
  const tools = [
    { id: 'search', label: 'Search', icon: SEARCH, onClick: () => setLast('Search opened') },
    { id: 'bell', label: 'Notifications', icon: BELL, badge: unread || undefined, menu: NOTIFICATIONS.map((n) => ({ label: n, onSelect: () => { setUnread((u) => Math.max(0, u - 1)); setLast(n); } })) },
    { id: 'theme', label: 'Dark mode', icon: MOON, active: dark, onClick: () => setDark((d) => !d) },
  ];
  return (
    <div className="dx-site">
      <Preset
        {...rest}
        value={path}
        onNavigate={setPath}
        tools={tools}
        actions={[{ label: 'Book a shipment', onClick: () => setLast('Book a shipment pressed') }]}
        end={<Avatar name={ME.name} size="sm" />}
        secondary={secondary ? <SectionTabs label="Section" items={['Summary', 'Shipments', 'Invoices']} /> : undefined}
        layout={custom ? { start: ['brand'], center: ['links'], end: ['tool:search', 'tool:bell', 'tool:theme', 'separator', 'actions', 'end', 'toggle'] } : undefined}
      />
      <div className="dx-site__page">
        <p className="dx-hint">{path}</p>
        <p className="dx-panel__lead">Current page: {BAR_PAGES[path] ?? path}</p>
        <p className="dx-hint">
          Dark mode {dark ? 'on' : 'off'} · {unread} unread{last ? ` · last: ${last}` : ''}
        </p>
      </div>
    </div>
  );
}

export function NavbarPlayground() {
  const page = usePage(navbarMeta, ['size', 'tone'], { _layout: false, _secondary: false, collapseAt: 480 });
  const inactive = {};
  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));
  const custom = !!page.inputs._layout;
  const secondary = !!page.inputs._secondary;
  const use: Record<string, unknown> = {
    label: 'Main',
    value: src('/overview', 'pathname'),
    onNavigate: src(undefined, 'router.push'),
    brand: { label: PRODUCT, logo: src(MARK, '<Logo />'), href: '/' },
    items: src(BAR_ITEMS, "[{ label: 'Overview', href: '/overview' }, { label: 'Shipments', items: [{ label: 'Active', href: '/shipments/active' }, { label: 'Delayed', href: '/shipments/delayed' }, { label: 'Archive', href: '/shipments/archive' }] }, { label: 'Reports', href: '/reports' }, { label: 'Rates', href: '/rates', badge: 'New' }]"),
    tools: src([], "[{ id: 'search', label: 'Search', icon: <SearchIcon />, onClick: openSearch }, { id: 'bell', label: 'Notifications', icon: <BellIcon />, badge: unread, menu: notifications }, { id: 'theme', label: 'Dark mode', icon: <MoonIcon />, active: dark, onClick: toggleTheme }]"),
    actions: src([], "[{ label: 'Book a shipment', onClick: openBooking }]"),
    end: src(null, `<Avatar name="${ME.name}" size="sm" />`),
    layout: custom ? { start: ['brand'], center: ['links'], end: ['tool:search', 'tool:bell', 'tool:theme', 'separator', 'actions', 'end', 'toggle'] } : undefined,
    secondary: secondary ? src(null, '<SectionTabs />') : undefined,
    _layout: src(custom, ''),
    _secondary: src(secondary, ''),
  };
  const spec: ExampleSpec = {
    name: 'TopBar',
    imports: ["import { Avatar } from '@pinfold/react/avatar';"],
    preset: set,
    body: ['const pathname = usePathname();', 'const router = useRouter();'],
    tree: [{ app: BarDemo, use, code: ['$TAG'] }],
  };
  return (
    <Page
      wide
      meta={navbarMeta}
      page={page}
      define={defineNavbar}
      spec={spec}
      inactive={inactive}
      inherit={['size', 'tone']}
      provider
      align="start"
      file="components/top-bar"
      note="Choose a link and the text under the bar says which page is current. Projects is a dropdown; the bell is a menu and its badge counts what is unread; the moon is a toggle. Preview at tablet width (the switch above the preview) and the links that do not fit go under More (or scroll, with overflow: scroll: drag the row or use the wheel); as a phone they fold into a menu button; the ones that do not fit go under More."
      demo={
        <>
          <Toggle page={page} name="_layout" label="custom layout (links centred, tools by name)" />
          <Toggle page={page} name="_secondary" label="secondary row (tabs under the bar)" />
        </>
      }
    />
  );
}
