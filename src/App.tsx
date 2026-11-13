import * as React from 'react';
import { DEFAULT_PALETTE, PinfoldProvider, useLiveTheme, type Palette } from './theme';
import { PaletteStudio } from './PaletteStudio';
import { useAccordion, defineAccordion } from '@pinfold/react/accordion';
import { defineAppShell } from '@pinfold/react/appshell';
import { defineNavbar } from '@pinfold/react/navbar';
import { defineSidebar } from '@pinfold/react/sidebar';
import { defineTable } from '@pinfold/react/table';
import { defineBadge } from '@pinfold/react/badge';
import { defineButton } from '@pinfold/react/button';
import { resolveNode, version } from '@pinfold/core';
import type { AccordionConfig, AccordionVariant } from '@pinfold/react/accordion';
import { accordionMeta, alertMeta, avatarMeta, badgeMeta, buttonMeta, cardMeta, checkboxMeta, dialogMeta, inputMeta, menuMeta, radioMeta, switchMeta, popoverMeta, progressMeta, toastMeta, tooltipMeta, kbdMeta, separatorMeta, skeletonMeta, spinnerMeta, toggleMeta, toolbarMeta, sliderMeta, numberMeta, otpMeta, tabsMeta, breadcrumbMeta, paginationMeta, stepperMeta, selectMeta, comboboxMeta, tagsMeta, commandMeta, calendarMeta, datepickerMeta, tableMeta, ratingMeta, timelineMeta, emptyMeta, carouselMeta, resizableMeta, sidebarMeta, navmenuMeta, colorpickerMeta, scrollareaMeta, appshellMeta, navbarMeta, cursorMeta, treeviewMeta, fileuploadMeta, tourMeta, type ComponentMeta, type PropMeta } from '@pinfold/core/meta';
import { AccordionPlayground } from './playground/AccordionPlayground';
import { ButtonPlayground, SpinnerPlayground } from './playground/ButtonPlayground';
import { AlertPlayground, AvatarPlayground, BadgePlayground, CardPlayground, CheckboxPlayground, DialogPlayground, InputPlayground, KbdPlayground, MenuPlayground, PopoverPlayground, ProgressPlayground, RadioPlayground, SeparatorPlayground, SkeletonPlayground, SwitchPlayground, ToastPlayground, TooltipPlayground, TogglePlayground, ToolbarPlayground, SliderPlayground, NumberPlayground, OtpPlayground, TabsPlayground, BreadcrumbPlayground, PaginationPlayground, StepperPlayground, SelectPlayground, ComboboxPlayground, TagsPlayground, CommandPlayground, CalendarPlayground, DatePickerPlayground, TablePlayground, RatingPlayground, TimelinePlayground, EmptyPlayground, CarouselPlayground, ResizablePlayground, SidebarPlayground, NavMenuPlayground, ColorPickerPlayground } from './playground/Playgrounds';
import { FileUploadPlayground, TourPlayground, TreeViewPlayground } from './playground/NewPlaygrounds';
import { ScrollAreaPlayground, AppShellPlayground, NavbarPlayground, CursorPlayground } from './playground/LayoutPlaygrounds';
import { SiteMode } from './playground/shared';
import { reflow } from './playground/example';
import { MakeItYours } from './playground/customize';

/**
 * The site shell: a side nav and one page per route (`#/button`). Bare minimum on
 * purpose; every component page is generated from the component's meta.
 */

interface ComponentRoute {
  meta: ComponentMeta;
  status: 'stable' | 'new';
  /** A page without one shows the component's examples and API. */
  Playground?: () => React.ReactElement;
  extra?: () => React.ReactElement;
}

/* The site is built from the library: the shell, the bar, the side navigation, the API tables and the
   small parts below are Pinfold presets, defined once here and used as one-liners. */
const Shell = defineAppShell({ dimensions: { maxWidth: 1180, padding: '0 clamp(1rem, 3vw, 2.5rem) 3rem', sidebarWidth: 248 }, backdrop: 'blur' });
const TopBar = defineNavbar({ variant: 'glass', indicator: 'none', dimensions: { paddingX: 'clamp(1rem, 3vw, 2rem)' } });
const SiteNav = defineSidebar({ surface: 'transparent', variant: 'soft', size: 'sm' });
const Api = defineTable<ApiRow>({ variant: 'outline', density: 'compact', sortable: true, toolbar: { search: true, columns: false }, columnMenu: false, lines: 'rows' });
const NewTag = defineBadge({ variant: 'soft', size: 'sm' });
const Checks = defineAccordion({ variant: 'ghost', mode: 'multiple' });
const Ghost = defineButton({ variant: 'ghost', size: 'sm' });

interface ApiRow {
  option: string;
  type: string;
  default: string;
  notes: string;
  required: boolean;
  group: string;
}

/** Where each component sits in the side navigation. */
const GROUPS: Array<[string, string[]]> = [
  ['Layout', ['appshell', 'navbar', 'sidebar', 'navmenu', 'tabs', 'breadcrumb', 'pagination', 'stepper', 'resizable', 'scrollarea']],
  ['Data', ['table', 'card', 'accordion', 'treeview', 'timeline', 'carousel', 'avatar', 'badge', 'tags', 'kbd', 'empty', 'skeleton']],
  ['Forms', ['input', 'number', 'otp', 'checkbox', 'radio', 'switch', 'toggle', 'toolbar', 'slider', 'select', 'combobox', 'calendar', 'datepicker', 'colorpicker', 'rating', 'fileupload']],
  ['Overlays', ['dialog', 'popover', 'tooltip', 'menu', 'command', 'toast', 'tour']],
  ['Feedback', ['alert', 'progress', 'spinner']],
  ['Actions and effects', ['button', 'separator', 'cursor']],
];

const COMPONENTS: ComponentRoute[] = [
  { meta: accordionMeta, status: 'stable', Playground: AccordionPlayground, extra: AccordionExtras },
  { meta: buttonMeta, status: 'stable', Playground: ButtonPlayground },
  { meta: spinnerMeta, status: 'stable', Playground: SpinnerPlayground },
  { meta: separatorMeta, status: 'stable', Playground: SeparatorPlayground },
  { meta: kbdMeta, status: 'stable', Playground: KbdPlayground },
  { meta: skeletonMeta, status: 'stable', Playground: SkeletonPlayground },
  { meta: badgeMeta, status: 'stable', Playground: BadgePlayground },
  { meta: alertMeta, status: 'stable', Playground: AlertPlayground },
  { meta: avatarMeta, status: 'stable', Playground: AvatarPlayground },
  { meta: cardMeta, status: 'stable', Playground: CardPlayground },
  { meta: progressMeta, status: 'stable', Playground: ProgressPlayground },
  { meta: tooltipMeta, status: 'stable', Playground: TooltipPlayground },
  { meta: popoverMeta, status: 'stable', Playground: PopoverPlayground },
  { meta: dialogMeta, status: 'stable', Playground: DialogPlayground },
  { meta: menuMeta, status: 'stable', Playground: MenuPlayground },
  { meta: toastMeta, status: 'stable', Playground: ToastPlayground },
  { meta: inputMeta, status: 'stable', Playground: InputPlayground },
  { meta: checkboxMeta, status: 'stable', Playground: CheckboxPlayground },
  { meta: radioMeta, status: 'stable', Playground: RadioPlayground },
  { meta: switchMeta, status: 'stable', Playground: SwitchPlayground },
  { meta: toggleMeta, status: 'stable', Playground: TogglePlayground },
  { meta: toolbarMeta, status: 'stable', Playground: ToolbarPlayground },
  { meta: sliderMeta, status: 'stable', Playground: SliderPlayground },
  { meta: numberMeta, status: 'stable', Playground: NumberPlayground },
  { meta: otpMeta, status: 'stable', Playground: OtpPlayground },
  { meta: tabsMeta, status: 'stable', Playground: TabsPlayground },
  { meta: breadcrumbMeta, status: 'stable', Playground: BreadcrumbPlayground },
  { meta: paginationMeta, status: 'stable', Playground: PaginationPlayground },
  { meta: stepperMeta, status: 'stable', Playground: StepperPlayground },
  { meta: selectMeta, status: 'stable', Playground: SelectPlayground },
  { meta: comboboxMeta, status: 'stable', Playground: ComboboxPlayground },
  { meta: tagsMeta, status: 'stable', Playground: TagsPlayground },
  { meta: commandMeta, status: 'stable', Playground: CommandPlayground },
  { meta: calendarMeta, status: 'stable', Playground: CalendarPlayground },
  { meta: datepickerMeta, status: 'stable', Playground: DatePickerPlayground },
  { meta: tableMeta, status: 'stable', Playground: TablePlayground },
  { meta: ratingMeta, status: 'stable', Playground: RatingPlayground },
  { meta: timelineMeta, status: 'stable', Playground: TimelinePlayground },
  { meta: emptyMeta, status: 'stable', Playground: EmptyPlayground },
  { meta: carouselMeta, status: 'stable', Playground: CarouselPlayground },
  { meta: resizableMeta, status: 'stable', Playground: ResizablePlayground },
  { meta: sidebarMeta, status: 'stable', Playground: SidebarPlayground },
  { meta: navmenuMeta, status: 'stable', Playground: NavMenuPlayground },
  { meta: colorpickerMeta, status: 'stable', Playground: ColorPickerPlayground },
  { meta: scrollareaMeta, status: 'new', Playground: ScrollAreaPlayground },
  { meta: appshellMeta, status: 'new', Playground: AppShellPlayground },
  { meta: navbarMeta, status: 'new', Playground: NavbarPlayground },
  { meta: cursorMeta, status: 'new', Playground: CursorPlayground },
  { meta: treeviewMeta, status: 'new', Playground: TreeViewPlayground },
  { meta: fileuploadMeta, status: 'new', Playground: FileUploadPlayground },
  { meta: tourMeta, status: 'new', Playground: TourPlayground },
];

function useRoute(): string {
  const read = () => location.hash.replace(/^#\/?/, '') || 'overview';
  const [route, setRoute] = React.useState(read);
  React.useEffect(() => {
    const onHash = () => {
      setRoute(read());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return route;
}

const ICON = (d: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);
const SUN = ICON('M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z');
const MOON = ICON('M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z');
const CODE = ICON('m8 7-5 5 5 5M16 7l5 5-5 5');

export function App() {
  const [mode, setMode] = React.useState<'light' | 'dark'>('dark');
  const [palette, setPalette] = React.useState<Palette>(DEFAULT_PALETTE);
  const theme = useLiveTheme(palette, mode);
  const radius = (palette.radius ?? 'md') as 'none' | 'sm' | 'md' | 'lg' | 'full';
  const route = useRoute();
  const component = COMPONENTS.find((c) => c.meta.name === route);

  const byName = new Map(COMPONENTS.map((c) => [c.meta.name, c]));
  const placed = new Set(GROUPS.flatMap(([, names]) => names));
  const entry = (c: ComponentRoute, group: string) => ({ id: c.meta.name, label: c.meta.displayName, href: `#/${c.meta.name}`, group, badge: c.status === 'new' ? <NewTag label="new" /> : undefined });
  const nav = [
    { id: 'overview', label: 'Overview', href: '#/overview', group: 'Get started' },
    { id: 'palette', label: 'Palette studio', href: '#/palette', group: 'Get started' },
    ...GROUPS.flatMap(([group, names]) => names.flatMap((name) => (byName.has(name) ? [entry(byName.get(name)!, group)] : []))),
    ...COMPONENTS.filter((c) => !placed.has(c.meta.name)).map((c) => entry(c, 'More')),
  ];

  return (
    <SiteMode.Provider value={mode}>
      <PinfoldProvider theme={mode} radius={radius}>
        <Shell
          navbar={
            <TopBar
              label="Site"
              brand={{ label: <span className="dx-logo">Pinfold<b>UI</b></span>, logo: <PinfoldMark />, href: '#/overview' }}
              start={<span className="dx-hint dx-version">v{version}</span>}
              tools={[
                { id: 'github', label: 'GitHub', icon: CODE, showLabel: true, href: 'https://github.com/IndranilBhattacharya/pinfold', target: '_blank', whenCollapsed: 'panel' },
                { id: 'theme', label: `Switch to ${mode === 'dark' ? 'light' : 'dark'} theme`, icon: mode === 'dark' ? MOON : SUN, onClick: () => setMode((t) => (t === 'dark' ? 'light' : 'dark')) },
              ]}
            />
          }
          sidebar={<SiteNav label="Components" items={nav} value={route} />}
          footer={
            <p className="dx-footer">
              MIT · Created by Indranil Bhattacharya · <a href="https://github.com/IndranilBhattacharya/pinfold">pinfold</a> · <a href="https://github.com/IndranilBhattacharya/pinfold-ui">pinfold-ui</a> ·{' '}
              <a href="/llms.txt">llms.txt</a>
            </p>
          }
        >
          {component ? (
            <ComponentPage route={component} />
          ) : route === 'palette' ? (
            <Page title="Palette studio" lede="Seven roles, eleven steps each, generated from hue angles in OKLCH. The sliders run the same createTheme() the CLI runs, so the command underneath reproduces exactly what you see, including the sRGB fallbacks.">
              <PaletteStudio palette={palette} onChange={setPalette} theme={theme} />
            </Page>
          ) : (
            <Overview />
          )}
        </Shell>
      </PinfoldProvider>
    </SiteMode.Provider>
  );
}

function Page({ title, lede, children }: { title: string; lede: string; children: React.ReactNode }) {
  return (
    <article>
      <header className="dx-page-head">
        <h1>{title}</h1>
        <p className="dx-lede">{lede}</p>
      </header>
      {children}
    </article>
  );
}

/** Every component page: generated from meta, so the site never hand-copies an API. */
function ComponentPage({ route }: { route: ComponentRoute }) {
  const { meta, Playground, extra: Extra } = route;
  const pascal = meta.pascal ?? meta.displayName.split(' ')[0];
  return (
    <article key={meta.name}>
      <header className="dx-page-head">
        <h1>{meta.displayName}</h1>
        <p className="dx-lede">{meta.description}</p>
        <p className="dx-meta">
          <code>import {`{ define${pascal}, use${pascal} }`} from '{meta.importPath}'</code>
          <a href={meta.pattern}>WAI-ARIA pattern ↗</a>
        </p>
      </header>

      {Playground ? (
        <Section id="playground" title="Playground" lede="Every control comes from the component's metadata and opens on the library defaults; the link keeps your state.">
          <Playground />
        </Section>
      ) : null}

      {Extra ? <Extra /> : null}

      <Section id="customize" title="Make it yours" lede="Every part has a name. Add a class or a style to it, merge any prop into it, or draw it with your own component: the library keeps the keys, focus and ARIA.">
        <MakeItYours meta={meta} Code={Code} />
      </Section>

      <Section id="examples" title="Examples" lede="From the component's metadata, the same snippets that ship in llms.txt.">
        <div className="dx-compare">
          {meta.examples.map((e) => (
            <Code key={e.title} label={e.title} tone="muted" code={e.code} />
          ))}
        </div>
      </Section>

      <Section id="api" title="API" lede="One flat object. Precedence for every option: this config, then defaults in defineConfig(), then the provider, then the library default.">
        <ApiTable meta={meta} />
      </Section>

      <Section id="a11y" title="Accessibility" lede={`Checked against ${meta.pattern.replace(/^https:\/\//, '')}.`}>
        <Checks
          defaultValue={['aria']}
          items={[
            { id: 'aria', title: 'Roles, names and states', content: <ul className="dx-checks">{meta.aria.map((line) => <li key={line}>{line.replace(/`/g, '')}</li>)}</ul> },
            ...(meta.keyboard.length ? [{ id: 'keys', title: 'Keyboard', content: <ul className="dx-checks">{meta.keyboard.map((k) => <li key={k.keys}><b>{k.keys}</b>: {k.action.replace(/`/g, '')}</li>)}</ul> }] : []),
          ]}
        />
      </Section>
    </article>
  );
}

/* ---------------------------------------------------------------- overview */

const JSX_WAY = `<Accordion type="single" collapsible>
  <AccordionItem value="a">
    <AccordionTrigger>
      <ChevronIcon />
      Shipping
    </AccordionTrigger>
    <AccordionContent>
      Ships in 2 days.
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="b">
    ...repeat forever
  </AccordionItem>
</Accordion>`;

const PINFOLD_WAY = `const Faq = useAccordion({
  items: [
    { title: 'Shipping', content: 'Ships in 2 days.' },
    { title: 'Returns', content: '30 days, no questions.' },
  ],
  variant: 'separated',
});

return <Faq />;`;

const WAYS: Array<[string, string]> = [
  [
    '1 — a tag, from a hook',
    `const Faq = useAccordion({ items });

return (
  <main className="mx-auto max-w-2xl py-12">
    <h1>Questions</h1>
    <Faq />          {/* sits in your layout like any element */}
  </main>
);`,
  ],
  [
    '2 — the same value is the controller',
    `const Faq = useAccordion({ items, mode: 'multiple' });

<button onClick={Faq.openAll}>Expand all</button>
<Faq className="mt-4" />

// Faq.value · Faq.toggle(id) · Faq.isOpen(id) · Faq.focusItem(0)`,
  ],
  [
    '3 — presets: decide the look once',
    `// ui/presets.ts, outside components
export const Danger = defineButton({ variant: 'soft', tone: 'danger' });
export const Faq = defineAccordion({ variant: 'separated' });

// anywhere, loops included
{rows.map((r) => <Danger key={r.id} label="Delete" onClick={() => remove(r.id)} />)}
<Faq items={questions} />`,
  ],
  [
    '4 — parts, for layouts config cannot express',
    `const Faq = useAccordion({ items });

<div className="grid grid-cols-2 gap-6">
  {Faq.items.map((item) => (
    <section key={item.id} className="rounded-2xl border p-4">
      <Faq.Trigger id={item.id}>{item.config.title}</Faq.Trigger>
      <Faq.Panel id={item.id} />
    </section>
  ))}
</div>`,
  ],
];

const TAILWIND_WAYS: Array<[string, string]> = [
  [
    'utilities just win — no plugin, no !important',
    `// Pinfold CSS lives in the \`pinfold\` cascade layer. Unlayered utilities beat
// layered rules at any specificity, so nothing has to be fought.
<Faq className="mt-8 max-w-2xl" classNames={{ trigger: 'px-6 text-base' }} />`,
  ],
  [
    'one palette, both systems',
    `// tailwind.config.js  (v4: @import "@pinfold/css/tailwind.css")
module.exports = { presets: [require('@pinfold/css/tailwind')] };

// bg-primary-600  text-content-muted  border-line  rounded-lg  shadow-md
// all resolve to --pinfold-* vars, so \`npx pinfold theme\` moves both.`,
  ],
];

function Overview() {
  return (
    <article>
      <section className="dx-hero">
        <p className="dx-eyebrow">
          v{version} · {COMPONENTS.length} components · more every round
        </p>
        <h1>
          Build UI from <em>configuration</em>,<br /> not from markup.
        </h1>
        <p className="dx-lede">
          Every component, from a button to an accordion, from one config object or one hook, with an escape hatch on every slot.
        </p>
        <div className="dx-cta">
          <code className="dx-cmd">npx pinfold init</code>
          <code className="dx-cmd">npx pinfold add accordion button</code>
        </div>
        <p className="dx-hint">React today. Vue and Angular support is coming in the future.</p>
        <div className="dx-compare">
          <Code label="Everyone else" tone="muted" code={JSX_WAY} />
          <Code label="Pinfold" tone="accent" code={PINFOLD_WAY} />
        </div>
      </section>

      <Section id="ways" title="Four levels" lede="Start with the config. Reach further only when you need to; the config object never changes shape.">
        <div className="dx-compare">
          {WAYS.map(([label, code]) => (
            <Code key={label} label={label} tone="muted" code={code} />
          ))}
        </div>
      </Section>

      <Section id="tailwind" title="Tailwind" lede="Cascade layers mean your utilities always win, and the palette is shared.">
        <div className="dx-compare">
          {TAILWIND_WAYS.map(([label, code]) => (
            <Code key={label} label={label} tone="muted" code={code} />
          ))}
        </div>
      </Section>
    </article>
  );
}

/* ------------------------------------------------------- accordion extras */

const FAQ = [
  { id: 'what', title: 'What actually ships in the bundle?', description: 'Core is ~3 kB gzipped', content: 'Each component is its own subpath with its own CSS file, so importing the accordion never pulls in anything else.', badge: 'Core' },
  { id: 'config', title: 'Why configuration instead of JSX?', content: 'A twelve-row accordion is 12 lines of data, not 60 lines of nested markup. Data is diffable, serialisable, storable in a CMS, and an LLM can emit it reliably.', badge: 'Design' },
  { id: 'escape', title: 'What if I need to change one tiny part?', content: 'Every slot takes classNames, slotProps and render. Below that, useAccordion() hands you the same state and prop getters with no markup at all.' },
  { id: 'a11y', title: 'How accessible is it, really?', content: 'Buttons inside real headings, aria-expanded and aria-controls, labelled regions, roving focus, aria-disabled, and prefers-reduced-motion honoured.', badge: 'WCAG 2.2 AA' },
];

function AccordionExtras() {
  return (
    <>
      <Section id="variants" title="Variants" lede="Five surface treatments. Every combination is a valid, accessible accordion.">
        <div className="dx-grid">
          {(['solid', 'outline', 'separated', 'filled', 'ghost'] as const).map((variant) => (
            <figure key={variant} className="dx-card">
              <figcaption>{variant}</figcaption>
              <Demo variant={variant} items={FAQ.slice(0, 3)} defaultValue={['what']} indicator={variant === 'filled' ? 'plus' : 'chevron'} />
            </figure>
          ))}
          <figure className="dx-card">
            <figcaption>dimensions — nothing about size is locked</figcaption>
            <Demo variant="outline" items={FAQ.slice(0, 3)} defaultValue={['what']} dimensions={{ paddingX: 24, paddingY: 18, gap: 14, radius: 20, fontSize: 15, indicatorSize: 20 }} />
          </figure>
        </div>
      </Section>
      <Section id="headless" title="Headless" lede="Same state, zero markup. useAccordion() returns prop getters that carry every ARIA attribute.">
        <HeadlessDemo />
      </Section>
    </>
  );
}

function Demo(config: AccordionConfig & { variant?: AccordionVariant }) {
  return useAccordion(config).render();
}

/** Proves the hook is genuinely markup-free: this renders a definition list. */
function HeadlessDemo() {
  const api = useAccordion({ items: FAQ.slice(0, 3), mode: 'multiple', defaultValue: ['what'] });
  return (
    <div className="dx-split">
      <dl {...api.getRootProps({ className: 'dx-dl' })}>
        {api.items.map((item) => (
          <div key={item.id} {...api.getItemProps(item)}>
            <dt {...api.getHeaderProps(item, { className: 'dx-dt' })}>
              <button {...api.getTriggerProps(item, { className: 'dx-dt__btn' })}>
                <span>{item.open ? '−' : '+'}</span> {resolveNode(item.config.title, item)}
              </button>
            </dt>
            <dd {...api.getPanelProps(item, { className: 'dx-dd' })} hidden={!item.open}>
              {resolveNode(item.config.content, item)}
            </dd>
          </div>
        ))}
      </dl>
      <div className="dx-state">
        <div className="dx-state__row">
          <Ghost label="openAll()" variant="soft" onClick={api.openAll} />
          <Ghost label="closeAll()" variant="soft" onClick={api.closeAll} />
        </div>
        <pre>
          <code>{JSON.stringify({ value: api.value }, null, 2)}</code>
        </pre>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ shared */

function Section({ id, title, lede, children }: { id: string; title: string; lede: string; children: React.ReactNode }) {
  return (
    <section className="dx-section" id={id}>
      <h2>{title}</h2>
      <p className="dx-lede">{lede}</p>
      {children}
    </section>
  );
}

function Code({ label, code, tone }: { label: string; code: string; tone: 'muted' | 'accent' }) {
  return (
    <div className={`dx-code dx-code--${tone}`}>
      <span className="dx-code__label">{label}</span>
      <pre>
        <code>{reflow(code)}</code>
      </pre>
    </div>
  );
}

function ApiTable({ meta }: { meta: ComponentMeta }) {
  const type = (p: PropMeta) =>
    p.type === 'enum' ? p.values!.map((v) => JSON.stringify(v)).join(' | ') + (p.orNode ? ' | node' : '') + (p.orLength ? ' | length' : '') : p.type;
  const rows: ApiRow[] = Object.entries(meta.props).map(([key, p]) => ({
    option: key,
    type: type(p),
    default: p.default === undefined ? p.auto ?? '' : JSON.stringify(p.default),
    notes: p.description.replace(/`/g, ''),
    required: !!p.required,
    group: p.group,
  }));
  return (
    <Api
      label={`${meta.displayName} options`}
      hideLabel
      rows={rows}
      rowKey="option"
      labels={{ search: 'Search options' }}
      columns={[
        { key: 'option', header: 'Option', width: 190, cell: ({ row }) => <><code>{row.option}</code>{row.required ? <NewTag label="required" tone="warning" /> : null}</> },
        { key: 'type', header: 'Type', width: 240, cell: ({ row }) => <code className="dx-type">{row.type}</code> },
        { key: 'default', header: 'Default', width: 130, cell: ({ row }) => (row.default ? <code>{row.default}</code> : null) },
        { key: 'notes', header: 'Notes', sortable: false },
      ]}
    />
  );
}

function PinfoldMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 18c6-2 6-10 12-12M6 6c6 2 6 10 12 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
