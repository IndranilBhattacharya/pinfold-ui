import * as React from 'react';
import { ArrowUpRight, BookOpen, Bot, Boxes, FileText, Moon, Package, Search, Sun } from 'lucide-react';
import { defineAppShell } from '@pinfold/react/appshell';
import { defineNavbar } from '@pinfold/react/navbar';
import { defineNavMenu } from '@pinfold/react/navmenu';
import { defineSidebar } from '@pinfold/react/sidebar';
import { defineCommand } from '@pinfold/react/command';
import { defineButton } from '@pinfold/react/button';
import { defineKbd } from '@pinfold/react/kbd';
import { defineBadge } from '@pinfold/react/badge';
import { version } from '@pinfold/core';
import { COMPONENT_GROUPS, COMPONENTS, GUIDES, groupOf, metaFor } from './nav';
import { Brand, PageIcon } from './icons';
import { Mark } from './Logo';
import { docsHref, href } from './router';
import { Toc } from './Toc';

const REPO = 'https://github.com/IndranilBhattacharya/pinfold';
const NPM = 'https://www.npmjs.com/package/@pinfold/react';

/** The landing page: full width; the navigation is a drawer behind the menu button on small screens. */
const LandingShell = defineAppShell({ sidebarBehavior: 'drawer', backdrop: 'blur', closeOnNavigate: true });
/** The docs: navigation beside the page (a drawer under 1024 px, foldable to icons), "On this page" on the right. */
const DocsShell = defineAppShell({
  layout: 'navbar-top',
  sidebarBehavior: 'auto',
  breakpoint: 1024,
  backdrop: 'blur',
  sidebarCollapsible: true,
  autoSaveId: 'pinfold-docs',
  closeOnNavigate: true,
  dimensions: { sidebarWidth: 272, asideWidth: 232 },
});
const TopBar = defineNavbar({ variant: 'glass', indicator: 'none', size: 'md', collapseAt: 0, dimensions: { paddingX: 'clamp(0.75rem, 2.5vw, 1.5rem)' } });
const Menu = defineNavMenu({ variant: 'ghost', size: 'sm', openOn: 'hover', transition: 'slide', dimensions: { columnWidth: '15rem' } });
const DocsNav = defineSidebar({ surface: 'transparent', variant: 'soft', size: 'sm', match: 'exact' });
const Finder = defineCommand({ mode: 'dialog', placeholder: 'Search the docs…', hotkey: 'mod+k' });
const SearchButton = defineButton({ variant: 'outline', tone: 'neutral', size: 'sm' });
const Key = defineKbd({ size: 'sm' });
const Version = defineBadge({ variant: 'soft', size: 'sm', tone: 'neutral' });

export type Mode = 'light' | 'dark';

const ico = (Icon: React.ComponentType<{ size?: number; strokeWidth?: number; 'aria-hidden'?: boolean }>) => <Icon size={18} strokeWidth={1.75} aria-hidden />;

function navMenuItems() {
  return [
    {
      label: 'Docs',
      items: GUIDES.map((g) => ({ label: g.title, href: docsHref(g.name), description: g.blurb, icon: <PageIcon name={g.name} size={18} /> })),
    },
    {
      label: 'Components',
      // The most used, one or two per group; the featured card leads to all of them.
      items: ['table', 'datepicker', 'select', 'combobox', 'dialog', 'command', 'appshell', 'toast'].flatMap((n) => {
        const m = metaFor(n);
        return m ? [{ label: m.displayName, href: docsHref(n), icon: <PageIcon name={n} size={18} />, description: groupOf(n) }] : [];
      }),
      content: (
        <a className="dx-menu-feature" href={docsHref('table')}>
          <span className="dx-menu-feature__eyebrow">Featured</span>
          <strong>A data grid that scrolls a billion rows</strong>
          <span>Sort, filter, group, edit, resize and pin, from one config.</span>
          <span className="dx-menu-feature__cta">
            All {COMPONENTS.length} components <ArrowUpRight size={14} aria-hidden="true" />
          </span>
        </a>
      ),
    },
    {
      label: 'Resources',
      items: [
        { label: 'AI and MCP', href: docsHref('ai'), description: 'Give your coding agent the real API.', icon: ico(Bot) },
        { label: 'shadcn registry', href: docsHref('shadcn'), description: 'npx shadcn add @pinfold/<name>.', icon: <Brand name="shadcn" size={18} /> },
        { label: 'llms.txt', href: '/llms.txt', description: 'Every component, as text for models.', icon: ico(FileText) },
        { label: 'npm', href: NPM, description: `@pinfold/react ${version}`, icon: <Brand name="npm" size={18} /> },
        { label: 'GitHub', href: REPO, description: 'Source, issues and releases.', icon: <Brand name="github" size={18} /> },
      ],
    },
  ];
}

/** The docs navigation: guides, then components by group, each with its icon (the collapsed rail shows them). */
function docsNavItems() {
  return [
    ...GUIDES.map((g) => ({ id: g.name, label: g.title, href: docsHref(g.name), icon: <PageIcon name={g.name} />, group: g.group })),
    ...COMPONENT_GROUPS.flatMap(([group, names]) =>
      names.flatMap((n) => {
        const m = metaFor(n);
        return m ? [{ id: n, label: m.displayName, href: docsHref(n), icon: <PageIcon name={n} />, group }] : [];
      }),
    ),
    ...COMPONENTS.filter((m) => !COMPONENT_GROUPS.some(([, names]) => names.includes(m.name))).map((m) => ({ id: m.name, label: m.displayName, href: docsHref(m.name), icon: <PageIcon name={m.name} />, group: 'More' })),
  ];
}

function searchItems() {
  return [
    ...GUIDES.map((g) => ({ value: g.name, label: g.title, description: g.blurb, group: 'Guides', href: docsHref(g.name), icon: <PageIcon name={g.name} />, keywords: [g.name] })),
    ...COMPONENTS.map((m) => ({ value: m.name, label: m.displayName, description: m.description, group: 'Components', href: docsHref(m.name), icon: <PageIcon name={m.name} />, keywords: [m.name, m.displayName] })),
    { value: 'llms', label: 'llms.txt', description: 'The docs as plain text for models', group: 'Resources', href: '/llms.txt', icon: ico(FileText) },
    { value: 'github', label: 'GitHub repository', group: 'Resources', href: REPO, icon: <Brand name="github" /> },
  ];
}

/** The navigation keeps the current page in view: its own list scrolls, never the page. */
function useCurrentInView(page: string | null) {
  React.useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const current = document.querySelector<HTMLElement>('.dx-docsnav [aria-current="page"]');
      let box = current?.parentElement ?? null;
      while (box && !(/auto|scroll/.test(getComputedStyle(box).overflowY) && box.scrollHeight > box.clientHeight)) box = box.parentElement;
      if (!current || !box) return;
      const r = current.getBoundingClientRect();
      const b = box.getBoundingClientRect();
      if (r.top < b.top + 8) box.scrollTop -= b.top + 8 - r.top;
      else if (r.bottom > b.bottom - 8) box.scrollTop += r.bottom - (b.bottom - 8) + b.height / 3;
    });
    return () => cancelAnimationFrame(frame);
  }, [page]);
}

export function SiteShell({ page, mode, onMode, children }: { page: string | null; mode: Mode; onMode: (m: Mode) => void; children: React.ReactNode }) {
  const [searching, setSearching] = React.useState(false);
  const docs = page !== null;
  const menu = React.useMemo(navMenuItems, []);
  const nav = React.useMemo(docsNavItems, []);
  const Frame = docs ? DocsShell : LandingShell;
  useCurrentInView(page);
  return (
    <>
      <a className="dx-skip" href="#dx-main">
        Skip to content
      </a>
      <Frame
        className={docs ? 'dx-shell dx-shell--docs' : 'dx-shell dx-shell--landing'}
        navbar={
          <TopBar
            label="Site"
            brand={{
              label: (
                <span className="dx-brand">
                  pinfold <Version label={`v${version}`} />
                </span>
              ),
              logo: <Mark size={28} />,
              href: href(''),
            }}
            center={<Menu label="Main" className="dx-topmenu" items={menu} value={page ? docsHref(page) : undefined} />}
            end={
              <span className="dx-bar-end">
                <SearchButton className="dx-search" label="Search" icon={<Search size={15} aria-hidden="true" />} endIcon={<Key keys={['mod', 'k']} />} onClick={() => setSearching(true)} />
              </span>
            }
            tools={[
              { id: 'github', label: 'GitHub', icon: <Brand name="github" size={18} />, href: REPO, target: '_blank' },
              { id: 'theme', label: mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode', icon: mode === 'dark' ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />, onClick: () => onMode(mode === 'dark' ? 'light' : 'dark') },
            ]}
          />
        }
        sidebar={({ collapsed, drawer }) => (
          <div className="dx-docsnav">
            <DocsNav label="Documentation" items={nav} value={page ?? undefined} collapsed={collapsed && !drawer} />
          </div>
        )}
        aside={docs ? <Toc page={page!} /> : undefined}
        footer={<SiteFooter />}
      >
        <div id="dx-main" className={docs ? 'dx-docs-main' : 'dx-landing-main'} tabIndex={-1}>
          {children}
        </div>
      </Frame>
      <Finder label="Search the docs" open={searching} onOpenChange={setSearching} items={searchItems()} onSelect={() => setSearching(false)} />
    </>
  );
}

function SiteFooter() {
  const cols: Array<[string, Array<[string, string]>]> = [
    ['Get started', GUIDES.filter((g) => g.group === 'Get started').map((g) => [g.title, docsHref(g.name)])],
    ['Customise', [...GUIDES.filter((g) => g.group === 'Customise').map((g): [string, string] => [g.title, docsHref(g.name)]), ['Accessibility', docsHref('accessibility')]]],
    ['Components', [['Data grid', docsHref('table')], ['Date picker', docsHref('datepicker')], ['Command palette', docsHref('command')], ['App shell', docsHref('appshell')], [`All ${COMPONENTS.length}`, docsHref('accordion')]]],
    ['For agents', [['AI and MCP', docsHref('ai')], ['shadcn registry', docsHref('shadcn')], ['llms.txt', '/llms.txt'], ['llms-full.txt', '/llms-full.txt'], ['Registry index', '/r/registry.json']]],
    ['Project', [['GitHub', REPO], ['npm', NPM], ['Releases', `${REPO}/releases`], ['License (MIT)', `${REPO}/blob/main/LICENSE`]]],
  ];
  return (
    <footer className="dx-footer">
      <div className="dx-footer__top">
        <div className="dx-footer__brand">
          <span className="dx-brand dx-brand--lg">
            <Mark size={32} /> pinfold
          </span>
          <p>Accessible React components, configured, not composed.</p>
          <span className="dx-footer__icons">
            <a href={REPO} aria-label="GitHub" target="_blank" rel="noreferrer">
              <Brand name="github" size={18} />
            </a>
            <a href={NPM} aria-label="npm" target="_blank" rel="noreferrer">
              <Brand name="npm" size={18} mono />
            </a>
            <a href={docsHref('introduction')} aria-label="Documentation">
              <BookOpen size={18} aria-hidden="true" />
            </a>
            <a href={docsHref('accordion')} aria-label="Components">
              <Boxes size={18} aria-hidden="true" />
            </a>
            <a href={docsHref('installation')} aria-label="Install">
              <Package size={18} aria-hidden="true" />
            </a>
          </span>
        </div>
        {cols.map(([title, links]) => (
          <nav key={title} className="dx-footer__col" aria-label={title}>
            <h2>{title}</h2>
            <ul>
              {links.map(([label, to]) => (
                <li key={label}>
                  <a href={to} {...(/^https?:/.test(to) ? { target: '_blank', rel: 'noreferrer' } : {})}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <p className="dx-footer__legal">
        MIT licensed · Made by Indranil Bhattacharya · v{version}
      </p>
    </footer>
  );
}
