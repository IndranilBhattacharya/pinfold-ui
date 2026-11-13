import * as React from 'react';
import { appshellMeta, cursorMeta, navbarMeta, scrollareaMeta } from '@pinfold/core/meta';
import { inactiveScrollAreaOptions } from '@pinfold/core';
import { defineScrollArea } from '@pinfold/react/scrollarea';
import { defineAppShell } from '@pinfold/react/appshell';
import { defineNavbar } from '@pinfold/react/navbar';
import { defineCursor } from '@pinfold/react/cursor';
import { defineSidebar } from '@pinfold/react/sidebar';
import { defineTabs } from '@pinfold/react/tabs';
import { Avatar } from '@pinfold/react/avatar';
import { Badge } from '@pinfold/react/badge';
import { Button } from '@pinfold/react/button';
import { Input } from '@pinfold/react/input';
import { changed, Pick } from './shared';
import { src, type ExampleSpec } from './example';
import { NAV_ITEMS, NAV_PAGES, Page, svg, Text, Toggle, usePage } from './Playgrounds';

/**
 * The layout and effect pages: a scroll area, an app shell, a navbar and a cursor. Each demo is a
 * small working app (state, a router stand-in) and the code panel prints what a developer writes.
 */

/* ------------------------------------------------------------ scroll area */

const LOG = [
  ['2.4.0', 'Nov 12', 'Scroll area and cursor', 'Edges that show they hide content, and a pointer that follows the mouse.'],
  ['2.3.2', 'Nov 03', 'Date picker', 'Typing a date in the locale order now keeps the cursor where it was.'],
  ['2.3.1', 'Oct 27', 'Table', 'Sticky headers no longer jump when a row is expanded.'],
  ['2.3.0', 'Oct 14', 'Navbar and app shell', 'A bar with dropdowns and an app frame with a drawer for narrow screens.'],
  ['2.2.4', 'Oct 02', 'Combobox', 'Remote results are cached per query and cancelled when you keep typing.'],
  ['2.2.3', 'Sep 21', 'Dialog', 'Focus returns to the button that opened it, also after a route change.'],
  ['2.2.0', 'Sep 08', 'Color picker', 'Four output formats and an alpha channel.'],
  ['2.1.5', 'Aug 29', 'Slider', 'Marks line up with the thumb at both ends of a range.'],
  ['2.1.0', 'Aug 11', 'Carousel', 'Several slides per view, a peek of the next one and autoplay with a pause button.'],
  ['2.0.2', 'Jul 30', 'Menu', 'Submenus open on the arrow key in right-to-left pages.'],
  ['2.0.0', 'Jul 15', 'Style packs', 'Glass, material, noise and brutalist, switched with one prop.'],
] as const;

function Entry({ version, date, title, text }: { version: string; date: string; title: string; text: string }) {
  return (
    <article className="dx-log__entry">
      <header>
        <Badge label={version} variant="soft" size="sm" />
        <time>{date}</time>
      </header>
      <h4>{title}</h4>
      <p>{text}</p>
    </article>
  );
}

const CHAT = [
  ['Mara', 'Did the build go through?'],
  ['You', 'Yes, green on every browser.'],
  ['Mara', 'Great. Can you tag 2.4.0?'],
  ['You', 'Tagging now.'],
  ['Mara', 'And the notes?'],
  ['You', 'Drafted, I will paste them in the changelog.'],
  ['Mara', 'Perfect, thank you.'],
  ['You', 'Anytime.'],
] as const;
const REPLIES = ['Looks good to me.', 'Shipping it after lunch.', 'One more check on Safari.', 'Done, closing the ticket.', 'Thanks all!'];

const TOPICS = ['Accordion', 'Alert', 'Avatar', 'Badge', 'Button', 'Calendar', 'Carousel', 'Combobox', 'Dialog', 'Menu', 'Navbar', 'Slider', 'Table', 'Tabs', 'Tooltip'];

function Message({ from, text }: { from: string; text: string }) {
  return (
    <p className="dx-chat__msg" data-own={from === 'You' || undefined}>
      <b>{from}</b>
      {text}
    </p>
  );
}

function ScrollDemo({ Preset, props }: { Preset: React.ElementType; props: Record<string, any> }) {
  const { _kind: kind, ...rest } = props;
  const [messages, setMessages] = React.useState<Array<readonly [string, string]>>(CHAT.slice(0, 6));
  if (kind === 'chat') {
    const add = () => setMessages((m) => [...m, [m.length % 2 ? 'Mara' : 'You', REPLIES[m.length % REPLIES.length]]]);
    return (
      <div className="dx-stack">
        <Preset {...rest}>
          {messages.map(([from, text], i) => (
            <Message key={i} from={from} text={text} />
          ))}
        </Preset>
        <div>
          <Button label="Add a message" size="sm" variant="soft" tone="neutral" onClick={add} />
        </div>
      </div>
    );
  }
  if (kind === 'chips') {
    return (
      <Preset {...rest}>
        <div className="dx-chips">
          {TOPICS.map((t) => (
            <Badge key={t} label={t} variant="outline" size="md" />
          ))}
        </div>
      </Preset>
    );
  }
  return (
    <Preset {...rest}>
      {LOG.map(([version, date, title, text]) => (
        <Entry key={version} version={version} date={date} title={title} text={text} />
      ))}
    </Preset>
  );
}

const SCROLL_KINDS: Array<[string, string]> = [
  ['changelog', 'a changelog: a long list'],
  ['chat', 'a chat that follows new messages'],
  ['chips', 'a row of chips that scrolls sideways'],
];

export function ScrollAreaPlayground() {
  const page = usePage(scrollareaMeta, ['tone'], { _kind: 'changelog' });
  const kind = String(page.inputs._kind);
  const inactive = inactiveScrollAreaOptions(page.options);
  const dimensions = kind === 'chips' ? { maxWidth: 360 } : { height: 300 };
  const set = { ...Object.fromEntries(changed(page.options, page.defaults, inactive)), dimensions };
  const names: Record<string, string> = { changelog: 'Changelog', chat: 'Messages', chips: 'Topics' };
  const name = names[kind] ?? 'Changelog';
  const code: Record<string, string[]> = {
    changelog: [`<${name} label="Changelog">`, '  {releases.map((r) => <Entry key={r.version} {...r} />)}', `</${name}>`],
    chat: [`<${name} label="Conversation">`, '  {messages.map((m) => <Message key={m.id} {...m} />)}', `</${name}>`, '<Button label="Add a message" onClick={() => setMessages(addReply)} />'],
    chips: [`<${name} label="Topics">`, '  <div style={{ display: "flex", gap: 8, width: "max-content" }}>', '    {topics.map((t) => <Badge key={t} label={t} variant="outline" />)}', '  </div>', `</${name}>`],
  };
  const spec: ExampleSpec = {
    name,
    preset: set,
    imports: kind === 'chat' ? ["import { Button } from '@pinfold/react/button';"] : kind === 'chips' ? ["import { Badge } from '@pinfold/react/badge';"] : [],
    body: kind === 'chat' ? ['const [messages, setMessages] = useState(initialMessages);'] : [],
    tree: [{ app: ScrollDemo, use: { _kind: src(kind, '') }, code: code[kind] ?? code.changelog }],
  };
  const notes: Record<string, string> = {
    changelog: 'The list is taller than the area. A fade shows which edge hides more, and the area is a keyboard-focusable region while it overflows.',
    chat: 'Add messages while the area is at the end and it follows them; scroll up and it stays where you are (scrollToEnd() pins it again).',
    chips: 'Sideways: the row is wider than the area. Use the wheel with Shift, a trackpad or the arrow keys.',
  };
  return (
    <Page
      meta={scrollareaMeta}
      page={page}
      define={defineScrollArea}
      spec={spec}
      inactive={inactive}
      inherit={['tone']}
      provider={['tone']}
      motion
      align="start"
      file="components/changelog"
      note={notes[kind]}
      demo={
        <div className="dx-opt">
          <Pick
            label="example"
            items={SCROLL_KINDS.map(([value, label]) => ({ value, label }))}
            value={kind}
            onChange={(next) => {
              if (!next) return;
              page.setOption('_kind', next);
              page.setOption('orientation', next === 'chips' ? 'horizontal' : 'vertical');
              page.setOption('stickToEnd', next === 'chat');
            }}
          />
        </div>
      }
    />
  );
}

/* -------------------------------------------------------------- app shell */

const SEARCH = svg('M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM16.5 16.5 21 21');
const BELL = svg('M6 9a6 6 0 1 1 12 0c0 6 2 7 2 8H4c0-1 2-2 2-8zM10 21a2 2 0 0 0 4 0');
const MOON = svg('M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z');
const MARK = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M6 18c6-2 6-10 12-12M6 6c6 2 6 10 12 12" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);

const AppBar = defineNavbar({ variant: 'plain', indicator: 'none', size: 'sm' });
const AppNav = defineSidebar({ surface: 'transparent', variant: 'soft', size: 'sm' });
const Shell = defineAppShell({});

const ACTIVITY = ['Mara closed Atlas #41', 'Jonas opened Pinfold #52', 'Nina deployed 2.4.0', 'Sam commented on Reports'];

function Page_({ path }: { path: string }) {
  const current = NAV_PAGES[path] ?? { title: path, lead: '' };
  return (
    <div className="dx-appbody">
      <p className="dx-hint">{path}</p>
      <h3>{current.title}</h3>
      <p className="dx-panel__lead">{current.lead}</p>
      <ul className="dx-rows">
        {Array.from({ length: 9 }, (_, i) => (
          <li key={i}>
            <b>{current.title}</b> item {i + 1}
            <span className="dx-hint">{i + 1}h</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ShellDemo({ Preset, props }: { Preset: React.ElementType; props: Record<string, any> }) {
  const { _narrow: narrow, ...rest } = props;
  const [path, setPath] = React.useState('/projects/atlas');
  return (
    <div style={{ maxWidth: narrow ? 520 : undefined }}>
      <Preset
        {...rest}
        navbar={<AppBar label="App" brand={{ label: 'Acme', logo: MARK }} tools={[{ id: 'search', label: 'Search', icon: SEARCH }, { id: 'bell', label: 'Notifications', icon: BELL, badge: true }]} end={<Avatar name="Mara Lind" size="sm" />} />}
        sidebar={<AppNav label="Main" items={NAV_ITEMS} value={path} onNavigate={setPath} />}
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
        footer={<span className="dx-hint">© 2026 Acme · All systems normal</span>}
      >
        <Page_ path={path} />
      </Preset>
    </div>
  );
}

export function AppShellPlayground() {
  const page = usePage(appshellMeta, [], { scroll: 'content', navbarPosition: 'static', _narrow: false });
  const narrow = !!page.inputs._narrow;
  const set = { ...Object.fromEntries(changed(page.options, page.defaults)), dimensions: { height: 460, sidebarWidth: 190, asideWidth: 150 }, breakpoint: 520 };
  const attrs = ['navbar={<TopBar />}', "sidebar={<AppNav label=\"Main\" value={pathname} onNavigate={router.push} items={nav} />}", 'aside={<Activity />}', 'footer={<Legal />}'];
  const spec: ExampleSpec = {
    name: 'Shell',
    preset: set,
    body: ['const pathname = usePathname();', 'const router = useRouter();'],
    tree: [{ app: ShellDemo, use: { _narrow: src(narrow, '') }, code: ['<Shell', ...attrs.map((a) => '  ' + a), '>', '  {children}', '</Shell>'] }],
  };
  return (
    <Page
      meta={appshellMeta}
      page={page}
      define={defineAppShell}
      spec={spec}
      motion
      align="start"
      file="app/layout"
      note="The shell has a fixed height and only the page region scrolls (scroll: 'content'). Choosing an entry in the sidebar changes the page (a small in-page router stands in for yours). It measures its own width: below the breakpoint the sidebar becomes a drawer behind the menu button in the bar, closes on Escape, on its backdrop and when a link is followed."
      demo={<Toggle page={page} name="_narrow" label="narrow container (the sidebar becomes a drawer)" />}
    />
  );
}

/* ----------------------------------------------------------------- navbar */

const BAR_ITEMS = [
  { label: 'Overview', href: '/overview' },
  {
    label: 'Projects',
    items: [
      { label: 'Pinfold', href: '/projects/pinfold' },
      { label: 'Atlas', href: '/projects/atlas' },
      { label: 'Archive', href: '/projects/archive' },
    ],
  },
  { label: 'Reports', href: '/reports' },
  { label: 'Pricing', href: '/pricing', badge: 'New' },
];
const BAR_PAGES: Record<string, string> = {
  '/': 'Home: the product in one page.',
  '/overview': 'Overview: this week at a glance.',
  '/projects/pinfold': 'Pinfold: 41 components, 12 open issues.',
  '/projects/atlas': 'Atlas: started this week, two members.',
  '/projects/archive': 'Archive: finished projects, read only.',
  '/reports': 'Reports: weekly activity and time spent.',
  '/pricing': 'Pricing: free, team and enterprise.',
};
const NOTIFICATIONS = ['Mara commented on Atlas', 'Jonas invited you to Pinfold', 'Your report is ready'];
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
        end={<Avatar name="Mara Lind" size="sm" />}
        secondary={secondary ? <SectionTabs label="Section" items={['Overview', 'Activity', 'Members']} /> : undefined}
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
  const page = usePage(navbarMeta, ['size', 'tone'], { _layout: false, _secondary: false });
  const inactive = {};
  const set = { ...Object.fromEntries(changed(page.options, page.defaults, inactive)), collapseAt: 480 };
  const custom = !!page.inputs._layout;
  const secondary = !!page.inputs._secondary;
  const use: Record<string, unknown> = {
    label: 'Main',
    value: src('/overview', 'pathname'),
    onNavigate: src(undefined, 'router.push'),
    brand: { label: 'Acme', logo: src(MARK, '<Logo />'), href: '/' },
    items: src(BAR_ITEMS, "[{ label: 'Overview', href: '/overview' }, { label: 'Projects', items: [{ label: 'Pinfold', href: '/projects/pinfold' }, { label: 'Atlas', href: '/projects/atlas' }, { label: 'Archive', href: '/projects/archive' }] }, { label: 'Reports', href: '/reports' }, { label: 'Pricing', href: '/pricing', badge: 'New' }]"),
    tools: src([], "[{ id: 'search', label: 'Search', icon: <SearchIcon />, onClick: openSearch }, { id: 'bell', label: 'Notifications', icon: <BellIcon />, badge: unread, menu: notifications }, { id: 'theme', label: 'Dark mode', icon: <MoonIcon />, active: dark, onClick: toggleTheme }]"),
    actions: [{ label: 'Start free' }],
    end: src(null, '<Avatar name="Mara Lind" size="sm" />'),
    layout: custom ? { start: ['brand'], center: ['links'], end: ['tool:search', 'tool:bell', 'tool:theme', 'separator', 'actions', 'end', 'toggle'] } : undefined,
    secondary: secondary ? src(null, '<SectionTabs />') : undefined,
    _layout: src(custom, ''),
    _secondary: src(secondary, ''),
  };
  const spec: ExampleSpec = {
    name: 'TopBar',
    preset: set,
    body: ['const pathname = usePathname();', 'const router = useRouter();'],
    tree: [{ app: BarDemo, use, code: ['$TAG'] }],
  };
  return (
    <Page
      meta={navbarMeta}
      page={page}
      define={defineNavbar}
      spec={spec}
      inactive={inactive}
      inherit={['size', 'tone']}
      provider
      motion
      align="start"
      file="components/top-bar"
      note="Choose a link and the text under the bar says which page is current. Projects is a dropdown; the bell is a menu and its badge counts what is unread; the moon is a toggle. Narrow the container and the links fold into a menu button; the ones that do not fit go under More."
      demo={
        <>
          <Toggle page={page} name="_layout" label="custom layout (links centred, tools by name)" />
          <Toggle page={page} name="_secondary" label="secondary row (tabs under the bar)" />
        </>
      }
    />
  );
}

/* ----------------------------------------------------------------- cursor */

function Arena({ Preset, props }: { Preset: React.ElementType; props: Record<string, any> }) {
  const [state, setState] = React.useState('default');
  return (
    <div className="dx-stack">
      <Preset {...props} onStateChange={(next: string) => setState(next)}>
        <div className="dx-arena">
          <div className="dx-arena__card">
            <h4>Plain text</h4>
            <p>Move over this card: the pointer stays in its default state.</p>
          </div>
          <div className="dx-arena__card">
            <h4>A button</h4>
            <p>Anything pressable turns the pointer into its pressable state.</p>
            <Button label="Open" size="sm" variant="soft" />
          </div>
          <div className="dx-arena__card dx-arena__card--zoom" data-cursor="zoom" data-cursor-label="View">
            <span>data-cursor="zoom"</span>
          </div>
          <div className="dx-arena__card">
            <h4>A text field</h4>
            <Input label="Your name" placeholder="Type here" size="sm" />
          </div>
        </div>
      </Preset>
      <p className="dx-hint" role="status">
        Pointer state: <b>{state}</b>
      </p>
    </div>
  );
}

export function CursorPlayground() {
  const page = usePage(cursorMeta, ['size', 'tone'], { _label: '' });
  const label = String(page.inputs._label ?? '');
  const set = Object.fromEntries(changed(page.options, page.defaults));
  const spec: ExampleSpec = {
    name: 'Pointer',
    preset: set,
    body: ["const [state, setState] = useState('default');"],
    tree: [{ app: Arena, use: { label: label || undefined, onStateChange: src(undefined, 'setState') }, code: [`<Pointer${label ? ` label="${label}"` : ''} onStateChange={setState}>`, '  <Cards />', '</Pointer>'] }],
    imports: [],
  };
  return (
    <Page
      meta={cursorMeta}
      page={page}
      define={defineCursor}
      spec={spec}
      inherit={['size', 'tone']}
      provider
      motion
      align="start"
      file="components/pointer"
      note={'Move the mouse over the cards: text, a button (pressable), an element marked data-cursor="zoom" with data-cursor-label="View", and a text field (the system I-beam takes over). It draws on a fine pointer only; on touch nothing changes.'}
      demo={<Text page={page} name="_label" label="label" hint="text beside the pointer; empty: none" />}
    />
  );
}
