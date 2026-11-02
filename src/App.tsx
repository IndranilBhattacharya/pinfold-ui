import * as React from 'react';
import { DEFAULT_PALETTE, PinfoldProvider, useLiveTheme, type Palette } from './theme';
import { PaletteStudio } from './PaletteStudio';
import { useAccordion } from '@pinfold/react/accordion';
import { resolveNode, version } from '@pinfold/core';
import type { AccordionConfig, AccordionVariant } from '@pinfold/react/accordion';
import { accordionMeta, buttonMeta, spinnerMeta, type ComponentMeta, type PropMeta } from '@pinfold/core/meta';
import { AccordionPlayground } from './playground/AccordionPlayground';
import { ButtonPlayground, SpinnerPlayground } from './playground/ButtonPlayground';

/**
 * The site shell: a side nav and one page per route (`#/button`). Bare minimum on
 * purpose; every component page is generated from the component's meta.
 */

interface ComponentRoute {
  meta: ComponentMeta;
  status: 'stable' | 'new';
  Playground: () => React.ReactElement;
  extra?: () => React.ReactElement;
}

const COMPONENTS: ComponentRoute[] = [
  { meta: accordionMeta, status: 'stable', Playground: AccordionPlayground, extra: AccordionExtras },
  { meta: buttonMeta, status: 'new', Playground: ButtonPlayground },
  { meta: spinnerMeta, status: 'new', Playground: SpinnerPlayground },
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

export function App() {
  const [mode, setMode] = React.useState<'light' | 'dark'>('dark');
  const [palette, setPalette] = React.useState<Palette>(DEFAULT_PALETTE);
  const theme = useLiveTheme(palette, mode);
  const radius = (palette.radius ?? 'md') as 'none' | 'sm' | 'md' | 'lg' | 'full';
  const route = useRoute();
  const component = COMPONENTS.find((c) => c.meta.name === route);

  const link = (to: string, label: React.ReactNode) => (
    <a href={`#/${to}`} aria-current={route === to ? 'page' : undefined}>
      {label}
    </a>
  );

  return (
    <PinfoldProvider theme={mode} radius={radius}>
      <header className="dx-header">
        <div className="dx-header__inner dx-shell-width">
          <a className="dx-logo" href="#/overview">
            <PinfoldMark />
            <span>
              Pinfold<b>UI</b>
            </span>
          </a>
          <span className="dx-hint dx-version">v{version}</span>
          <div className="dx-controls">
            <a className="dx-btn" href="https://github.com/IndranilBhattacharya/pinfold">
              GitHub
            </a>
            <button
              className="dx-icon-btn"
              onClick={() => setMode((t) => (t === 'dark' ? 'light' : 'dark'))}
              aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} theme`}
            >
              {mode === 'dark' ? '☾' : '☀'}
            </button>
          </div>
        </div>
      </header>

      <div className="dx-shell dx-shell-width">
        <aside className="dx-side">
          <nav aria-label="Site">
            <p className="dx-side__group">Get started</p>
            {link('overview', 'Overview')}
            {link('palette', 'Palette studio')}
            <p className="dx-side__group">Components</p>
            {COMPONENTS.map((c) => (
              <React.Fragment key={c.meta.name}>
                {link(
                  c.meta.name,
                  <>
                    {c.meta.displayName}
                    {c.status === 'new' ? <span className="dx-tag">new</span> : null}
                  </>,
                )}
              </React.Fragment>
            ))}
          </nav>
        </aside>

        <main className="dx-main" id="top">
          {component ? (
            <ComponentPage route={component} />
          ) : route === 'palette' ? (
            <Page title="Palette studio" lede="Seven roles, eleven steps each, generated from hue angles in OKLCH. The sliders run the same createTheme() the CLI runs, so the command underneath reproduces exactly what you see, including the sRGB fallbacks.">
              <PaletteStudio palette={palette} onChange={setPalette} theme={theme} />
            </Page>
          ) : (
            <Overview />
          )}
          <footer className="dx-footer">
            MIT · Created by Indranil Bhattacharya · <a href="https://github.com/IndranilBhattacharya/pinfold">pinfold</a> ·{' '}
            <a href="https://github.com/IndranilBhattacharya/pinfold-ui">pinfold-ui</a> · <a href="/llms.txt">llms.txt</a>
          </footer>
        </main>
      </div>
    </PinfoldProvider>
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
  return (
    <article key={meta.name}>
      <header className="dx-page-head">
        <h1>{meta.displayName}</h1>
        <p className="dx-lede">{meta.description}</p>
        <p className="dx-meta">
          <code>import {`{ use${meta.displayName}, define${meta.displayName} }`} from '{meta.importPath}'</code>
          <a href={meta.pattern}>WAI-ARIA pattern ↗</a>
        </p>
      </header>

      <Section id="playground" title="Playground" lede="Every control comes from the component's metadata and opens on the library defaults; the link keeps your state.">
        <Playground />
      </Section>

      {Extra ? <Extra /> : null}

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
        <ul className="dx-checks">
          {[...meta.aria, ...meta.keyboard.map((k) => `${k.keys}: ${k.action}`)].map((line) => (
            <li key={line}>{line.replace(/`/g, '')}</li>
          ))}
        </ul>
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
    '3 — every component, the same way',
    `const Save = useButton({
  label: 'Save',
  tone: 'success',
  onClick: async () => { await save(); }, // loading state for free
});

return <Save />;`,
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
          <button className="dx-btn" onClick={api.openAll}>
            openAll()
          </button>
          <button className="dx-btn" onClick={api.closeAll}>
            closeAll()
          </button>
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
        <code>{code}</code>
      </pre>
    </div>
  );
}

function ApiTable({ meta }: { meta: ComponentMeta }) {
  const type = (p: PropMeta) =>
    p.type === 'enum' ? p.values!.map((v) => JSON.stringify(v)).join(' | ') + (p.orNode ? ' | node' : '') + (p.orLength ? ' | length' : '') : p.type;
  return (
    <div className="dx-table-wrap">
      <table className="dx-table">
        <thead>
          <tr>
            <th>Option</th>
            <th>Type</th>
            <th>Default</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(meta.props).map(([key, p]) => (
            <tr key={key}>
              <td>
                <code>{key}</code>
                {p.required ? ' (required)' : ''}
              </td>
              <td>
                <code className="dx-type">{type(p)}</code>
              </td>
              <td>{p.default === undefined ? (p.auto ? <span className="dx-hint">{p.auto}</span> : '') : <code>{JSON.stringify(p.default)}</code>}</td>
              <td>{p.description.replace(/`/g, '')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PinfoldMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 18c6-2 6-10 12-12M6 6c6 2 6 10 12 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
