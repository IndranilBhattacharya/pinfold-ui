import * as React from 'react';
import { appshellMeta } from '@pinfold/core/meta';
import { inactiveAppShellOptions } from '@pinfold/core';
import { Avatar } from '@pinfold/react/avatar';
import { defineSidebar } from '@pinfold/react/sidebar';
import { changed } from '../playground/shared';
import { src, type ExampleSpec } from '../playground/example';
import { defineAppShell } from '@pinfold/react/appshell';
import { defineNavbar } from '@pinfold/react/navbar';
import { Page, usePage } from '../playground/kit';
import { svg } from './toggle';
import { NAV_ITEMS, NAV_PAGES } from './sidebar';
import { ACTIVITY, ME, NOTIFICATIONS, ORDERS, PRODUCT, STATUS_TONE } from '../demo/harbor';
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
const Shell = defineAppShell({});


function Page_({ path }: { path: string }) {
  const current = NAV_PAGES[path] ?? { title: path, lead: '' };
  return (
    <div className="dx-appbody">
      <p className="dx-hint">{path}</p>
      <h3>{current.title}</h3>
      <p className="dx-panel__lead">{current.lead}</p>
      <ul className="dx-rows">
        {ORDERS.filter((o) => (path === '/shipments/delayed' ? o.status === 'delayed' : path === '/shipments/archive' ? o.status === 'delivered' : true))
          .slice(0, 9)
          .map((o) => (
            <li key={o.id}>
              <b>{o.id}</b>
              <span>{o.customer.name}</span>
              <span className="dx-hint">{o.lane}</span>
              <Badge label={o.status} tone={STATUS_TONE[o.status]} size="sm" />
            </li>
          ))}
      </ul>
    </div>
  );
}

function ShellDemo({ Preset, props }: { Preset: React.ElementType; props: Record<string, any> }) {
  const rest = props;
  const [path, setPath] = React.useState('/shipments/active');
  const [unread, setUnread] = React.useState(3);
  const [said, setSaid] = React.useState('Nothing pressed yet.');
  return (
    <div>
      <Preset
        {...rest}
        navbar={
          <AppBar
            label="App"
            brand={{ label: PRODUCT, logo: MARK }}
            tools={[
              { id: 'search', label: 'Search', icon: SEARCH, onClick: () => setSaid('Search pressed: open your command palette here.') },
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
        sidebar={<AppNav label="Main" items={NAV_ITEMS} value={path} onNavigate={(next: string) => (setPath(next), setSaid(`Went to ${next}.`))} />}
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
        <Page_ path={path} />
      </Preset>
    </div>
  );
}

export function AppShellPlayground() {
  const page = usePage(appshellMeta, [], { scroll: 'content' });
  // The preview's width (the switch above the preview) decides whether the sidebar is a drawer.
  const device = page.env.device === 'full' ? Infinity : Number(page.env.device);
  // The shell measures itself, so the page measures the room it gives the shell: what is a drawer here is known, and
  // the options that only apply to a drawer are disabled (with the reason) while it is not one.
  const box = React.useRef<HTMLDivElement | null>(null);
  const [room, setRoom] = React.useState(1000);
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
  const behavior = (page.options.sidebarBehavior as string | undefined) ?? 'auto';
  const drawer = behavior === 'drawer' || (behavior === 'auto' && shellWidth < 768);
  const inactive = inactiveAppShellOptions({ sidebar: true, navbar: true, sidebarBehavior: behavior, scroll: page.options.scroll as string }, drawer);
  const set = { ...Object.fromEntries(changed(page.options, page.defaults, inactive)), dimensions: { height: 560 } };
  const attrs = ['navbar={<TopBar />}', "sidebar={<AppNav label=\"Main\" value={pathname} onNavigate={router.push} items={nav} />}", 'aside={<Activity />}', 'footer={<Legal />}'];
  const spec: ExampleSpec = {
    name: 'Shell',
    preset: set,
    body: ['const pathname = usePathname();', 'const router = useRouter();'],
    tree: [{ app: ShellDemo, use: {}, code: ['<Shell', ...attrs.map((a) => '  ' + a), '>', '  {children}', '</Shell>'] }],
  };
  return (
    <div ref={box}>
      <Page
        wide
        meta={appshellMeta}
        page={page}
        define={defineAppShell}
        spec={spec}
        inactive={inactive}
        motion
        align="start"
        file="app/layout"
        note={
          drawer
            ? 'The shell is narrower than its breakpoint (768 px), so the sidebar is a drawer: press the menu button in the bar. It closes on Escape, on its backdrop and when a link is followed. Everything in the preview works: the sidebar changes the page, the bell opens a menu, and the footer says what you pressed.'
            : 'The shell is wider than its breakpoint (768 px), so the sidebar sits beside the page; choose a tablet or phone width above the preview (or sidebarBehavior: drawer) to get the drawer and its menu button. Everything in the preview works: the sidebar changes the page, the bell opens a menu, and the footer says what you pressed.'
        }
      />
    </div>
  );
}
