import * as React from 'react';
import {
  Accessibility, ArrowRight, Bot, Boxes, Check, Code2, Contrast, Copy, Feather, FileJson, FileText, Gauge, Layers, Minus, MousePointerClick, Palette,
  Paintbrush, Plug, Server, ShieldCheck, Sparkles, Table2, Terminal, Wand2, X, Zap,
} from 'lucide-react';
import { version } from '@pinfold/core';
import { componentMetas } from '@pinfold/core/meta';
import { defineButton } from '@pinfold/react/button';
import { defineCalendar } from '@pinfold/react/calendar';
import { defineColorPicker } from '@pinfold/react/colorpicker';
import { defineCommand } from '@pinfold/react/command';
import { defineTable } from '@pinfold/react/table';
import { defineSwitch } from '@pinfold/react/switch';
import { defineSlider } from '@pinfold/react/slider';
import { defineRating } from '@pinfold/react/rating';
import { defineBadge } from '@pinfold/react/badge';
import { defineAvatar } from '@pinfold/react/avatar';
import { defineTabs } from '@pinfold/react/tabs';
import { defineCursor } from '@pinfold/react/cursor';
import { defineProgress } from '@pinfold/react/progress';
import { defineAccordion } from '@pinfold/react/accordion';
import { ORDERS, STATUS_TONE, type Order } from '../demo/harbor';
import { SiteToasts } from '../playground/site-toast';
import { CodeBlock, copyText } from '../site/CodeBlock';
import { Brand, PageIcon } from '../site/icons';
import { Mark } from '../site/Logo';
import { docsHref } from '../site/router';

const COUNT = componentMetas.length;

const Primary = defineButton({ size: 'lg', variant: 'solid' });
const Secondary = defineButton({ size: 'lg', variant: 'outline', tone: 'neutral' });
const Small = defineButton({ size: 'sm', variant: 'soft' });
const Cal = defineCalendar({ mode: 'range', size: 'sm' });
const Hue = defineColorPicker({ format: 'hex' });
const Palette2 = defineCommand({ placeholder: 'Type a command…' });
const Grid = defineTable<Order>({ variant: 'plain', density: 'compact', lines: 'rows', columnMenu: false, sortable: true });
const Toggle = defineSwitch({ size: 'sm' });
const Volume = defineSlider({ size: 'sm', min: 0, max: 100 });
const Stars = defineRating({ size: 'sm' });
const Status = defineBadge({ variant: 'soft', size: 'sm' });
const People = defineAvatar({ size: 'sm' });
const Views = defineTabs({ variant: 'segmented', size: 'sm' });
const Meter = defineProgress({ size: 'sm' });
const Install = defineButton({ variant: 'outline', tone: 'neutral', size: 'lg' });
const More = defineAccordion({ variant: 'ghost' });
const Pointer = defineCursor({
  variant: 'dot-ring',
  smoothing: 0.75,
  states: {
    try: { label: 'Try it', variant: 'ring', scale: 1.6 },
    copy: { label: 'Copy', variant: 'ring', scale: 1.4 },
    go: { label: "Let's build", variant: 'ring', scale: 1.8 },
    read: { label: 'Read', variant: 'ring', scale: 1.3 },
  },
});

/* ---------------------------------------------------------------------------------------- hero */

function InstallChip() {
  const cmd = 'npx pinfold init';
  return (
    <Install
      className="dx-install"
      data-cursor="copy"
      aria-label={`Copy the command ${cmd}`}
      label={<code>{cmd}</code>}
      icon={<Terminal size={15} aria-hidden="true" />}
      endIcon={<Copy size={14} aria-hidden="true" />}
      onClick={() => void copyText('Command', cmd)}
    />
  );
}

function Hero() {
  return (
    <section className="dx-hero2" aria-labelledby="hero-title">
      <a className="dx-pill" href={docsHref('introduction')}>
        <Sparkles size={14} aria-hidden="true" />
        <span>
          v{version} · {COUNT} components · WCAG 2.2 AA
        </span>
        <ArrowRight size={14} aria-hidden="true" />
      </a>
      <h1 id="hero-title" className="dx-hero2__title">
        <span>Config in.</span>
        <span className="dx-hero2__shine">Interfaces out.</span>
      </h1>
      <p className="dx-hero2__lede">
        Pinfold turns one typed object into an accessible React component: data grids, date pickers, command palettes and {COUNT - 3} more. Every part stays yours to restyle.
      </p>
      <div className="dx-hero2__cta" data-cursor="go">
        <Primary label="Get started" href={docsHref('introduction')} endIcon={<ArrowRight size={16} aria-hidden="true" />} />
        <Secondary label="Browse components" href={docsHref('table')} icon={<Boxes size={16} aria-hidden="true" />} />
      </div>
      <InstallChip />
      <ul className="dx-hero2__trust" aria-label="Works with">
        {['React 18 and 19', 'Server Components', 'TypeScript', 'Tailwind v3 and v4', 'Zero runtime dependencies'].map((t) => (
          <li key={t}>
            <Check size={14} aria-hidden="true" /> {t}
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------------------------ showcase */

const COMMANDS = [
  { value: 'new', label: 'New shipment', group: 'Create', shortcut: 'Ctrl N', icon: <Zap size={16} /> },
  { value: 'invite', label: 'Invite a teammate', group: 'Create', icon: <Sparkles size={16} /> },
  { value: 'grid', label: 'Open the orders grid', group: 'Go to', shortcut: 'G O', icon: <Table2 size={16} /> },
  { value: 'theme', label: 'Change the theme', group: 'Go to', icon: <Palette size={16} /> },
];

function Showcase() {
  const [color, setColor] = React.useState('#7c3aed');
  const [view, setView] = React.useState('orders');
  const rows = ORDERS.slice(0, 9);
  return (
    <section className="dx-show" aria-label="Live components" data-cursor="try">
      <div className="dx-show__grid">
        <div className="dx-tile dx-tile--grid">
          <div className="dx-tile__bar">
            <Views label="View" items={[{ id: 'orders', label: 'Orders' }, { id: 'transit', label: 'In transit' }]} value={view} onChange={setView} />
            <People items={[{ name: 'Mara Lind' }, { name: 'Ade Okafor' }, { name: 'Kai Tan' }, { name: 'Rui Silva' }]} max={3} />
          </div>
          <Grid
            label="Orders"
            hideLabel
            rows={view === 'orders' ? rows : rows.filter((r) => r.status === 'in transit' || r.status === 'at customs')}
            rowKey="id"
            columns={[
              { key: 'id', header: 'Order' },
              { key: 'customer.name', header: 'Customer' },
              { key: 'status', header: 'Status', cell: ({ row }) => <Status label={row.status} tone={STATUS_TONE[row.status]} /> },
              { key: 'value', header: 'Value', type: 'number', format: { style: 'currency', currency: 'USD', maximumFractionDigits: 0 } },
            ]}
          />
        </div>
        <div className="dx-tile dx-tile--cal">
          <Cal label="Trip dates" mode="range" defaultValue={{ start: '2026-11-17', end: '2026-11-21' }} defaultMonth="2026-11-01" />
        </div>
        <div className="dx-tile dx-tile--color" style={{ '--dx-pick': color } as React.CSSProperties}>
          <Hue label="Brand colour" value={color} onChange={(v: string) => setColor(v)} swatches={['#7c3aed', '#2563eb', '#0d9488', '#e11d48', '#f59e0b']} />
        </div>
        <div className="dx-tile dx-tile--cmd">
          <Palette2 label="Command palette" items={COMMANDS} onSelect={(v: string) => void SiteToasts.show({ title: `Ran: ${COMMANDS.find((c) => c.value === v)?.label ?? v}`, tone: 'success' })} />
        </div>
        <div className="dx-tile dx-tile--settings">
          <p className="dx-tile__title">Notifications</p>
          <Toggle label="Shipment updates" defaultChecked />
          <Toggle label="Customs holds" defaultChecked />
          <Volume label="Volume" defaultValue={[64]} />
          <div className="dx-tile__row">
            <Stars label="Rate this release" defaultValue={4} />
            <Small label="Send" onClick={() => void SiteToasts.show({ title: 'Thanks for the rating', tone: 'success' })} />
          </div>
          <Meter label="Upload" value={72} />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------------------- marquee */

const FEATURES: Array<[React.ComponentType<{ size?: number; 'aria-hidden'?: boolean }>, string]> = [
  [Wand2, 'One config per component'],
  [Code2, 'Typed ids and options'],
  [Server, 'Server Components'],
  [ShieldCheck, 'WCAG 2.2 AA, zero axe violations'],
  [Feather, 'Zero runtime dependencies'],
  [Layers, 'CSS cascade layers'],
  [Palette, 'Any brand colour, contrast checked'],
  [Paintbrush, 'Glass, material, noise, brutalist'],
  [Table2, 'A grid for a billion rows'],
  [Accessibility, 'Keyboard first'],
  [Contrast, 'Light, dark and forced colours'],
  [Plug, 'shadcn registry'],
  [Bot, 'MCP server for agents'],
  [FileText, 'llms.txt'],
  [FileJson, 'JSON Schema per component'],
  [Terminal, 'A CLI that shows a diff first'],
  [MousePointerClick, 'Every part replaceable'],
  [Gauge, 'Per-component CSS and code'],
];

function Marquee() {
  const half = Math.ceil(FEATURES.length / 2);
  const rows = [FEATURES.slice(0, half), FEATURES.slice(half)];
  return (
    <section className="dx-marquee" aria-label="Features">
      {rows.map((row, i) => (
        <div key={i} className="dx-marquee__row" data-reverse={i === 1 ? '' : undefined}>
          <ul className="dx-marquee__track">
            {[...row, ...row].map(([Icon, label], j) => (
              <li key={j} className="dx-tagpill" aria-hidden={j >= row.length ? true : undefined}>
                <Icon size={15} aria-hidden /> {label}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

/* ---------------------------------------------------------------------------------- write less */

const COMPOSED = `import * as Accordion from 'some-primitives/accordion';
import { ChevronDown } from 'icons';

export function Faq() {
  return (
    <Accordion.Root type="single" collapsible className="faq">
      <Accordion.Item value="shipping" className="faq-item">
        <Accordion.Header className="faq-header">
          <Accordion.Trigger className="faq-trigger">
            Shipping
            <ChevronDown className="faq-chevron" aria-hidden />
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content className="faq-content">
          Ships in two days.
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="returns" className="faq-item">
        <Accordion.Header className="faq-header">
          <Accordion.Trigger className="faq-trigger">
            Returns
            <ChevronDown className="faq-chevron" aria-hidden />
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content className="faq-content">
          Thirty days, no questions.
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
}
/* plus the CSS for every class above */`;

const CONFIGURED = `import { defineAccordion } from '@pinfold/react/accordion';

export const Faq = defineAccordion({ variant: 'separated' });

export function Example() {
  return (
    <Faq
      items={[
        { title: 'Shipping', content: 'Ships in two days.' },
        { title: 'Returns', content: 'Thirty days, no questions.' },
      ]}
    />
  );
}`;

function WriteLess() {
  const composed = COMPOSED.split('\n').length;
  const configured = CONFIGURED.split('\n').length;
  return (
    <section className="dx-band" aria-labelledby="less-title">
      <div className="dx-band__text">
        <p className="dx-kicker">Write less</p>
        <h2 id="less-title">Describe the component. Skip the scaffolding.</h2>
        <p>
          Composed components make you rebuild the same tree, with the same classes and the same ARIA, every time. A Pinfold config is data: shorter to write, easy to diff, safe to store, and the shape an agent gets right first time.
        </p>
        <div className="dx-stat-pair">
          <span>
            <strong>{composed}</strong> lines composed
          </span>
          <ArrowRight size={18} aria-hidden="true" />
          <span className="dx-stat-pair__win">
            <strong>{configured}</strong> lines with Pinfold
          </span>
        </div>
        <p className="dx-band__note">The tinted lines are the Pinfold part: what you write for the library, as opposed to your app.</p>
      </div>
      <div className="dx-band__code" data-cursor="read">
        <CodeBlock code={CONFIGURED} file="Faq" />
        <More className="dx-band__other" items={[{ id: 'composed', title: `The same FAQ, composed (${composed} lines)`, content: <CodeBlock code={COMPOSED} file="Faq.composed" langToggle={false} showPinfold={false} /> }]} />
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------------------- compare */

type Mark3 = 'yes' | 'some' | 'no';
const COMPARE: Array<[string, Mark3, Mark3, Mark3, Mark3]> = [
  ['A typed config per component', 'yes', 'no', 'some', 'no'],
  ['Accessible by default, checked on every build', 'yes', 'some', 'some', 'yes'],
  ['Updates through npm, no copied code to maintain', 'yes', 'no', 'yes', 'yes'],
  ['Restyle or replace any part', 'yes', 'yes', 'some', 'yes'],
  ['Presets that work in Server Components', 'yes', 'some', 'some', 'some'],
  ['A theme from any brand colour, contrast checked', 'yes', 'no', 'some', 'no'],
  ['Data grid, date picker, command palette, tour', 'yes', 'some', 'some', 'no'],
  ['MCP server, llms.txt and JSON Schema', 'yes', 'some', 'some', 'no'],
  ['Zero runtime dependencies, CSS per component', 'yes', 'some', 'no', 'yes'],
];

function Tick({ v }: { v: Mark3 }) {
  if (v === 'yes') return <span className="dx-tick dx-tick--yes"><Check size={16} aria-hidden="true" /><span className="dx-sr">Yes</span></span>;
  if (v === 'some') return <span className="dx-tick dx-tick--some"><Minus size={16} aria-hidden="true" /><span className="dx-sr">Partly</span></span>;
  return <span className="dx-tick dx-tick--no"><X size={16} aria-hidden="true" /><span className="dx-sr">No</span></span>;
}

function Compare() {
  return (
    <section className="dx-landing-section" aria-labelledby="why-title">
      <p className="dx-kicker">Why Pinfold</p>
      <h2 id="why-title">The convenience of a kit. The control of primitives.</h2>
      <p className="dx-landing-section__lede">Most libraries make you choose: compose everything yourself, or accept the look you are given. Pinfold gives you a finished component from one object, and a name for every part when you want it your way.</p>
      <div className="dx-compare-table" role="table" aria-label="Pinfold compared with typical libraries">
        <div role="row" className="dx-compare-table__head">
          <span role="columnheader">
            <span className="dx-sr">Feature</span>
          </span>
          <span role="columnheader" className="dx-compare-table__us">
            <Mark size={18} /> Pinfold
          </span>
          <span role="columnheader">Copy-paste kits</span>
          <span role="columnheader">Styled kits</span>
          <span role="columnheader">Headless primitives</span>
        </div>
        {COMPARE.map(([label, ...marks]) => (
          <div role="row" key={label}>
            <span role="rowheader">{label}</span>
            {marks.map((m, i) => (
              <span role="cell" key={i} className={i === 0 ? 'dx-compare-table__us' : undefined}>
                <Tick v={m} />
              </span>
            ))}
          </div>
        ))}
      </div>
      <p className="dx-footnote">Typical of each kind of library; individual libraries vary.</p>
    </section>
  );
}

/* --------------------------------------------------------------------------------------- bento */

function Bento() {
  const cards: Array<{ icon: React.ReactNode; title: string; text: string; href: string; art: React.ReactNode; wide?: boolean }> = [
    {
      icon: <ShieldCheck size={18} />,
      title: 'Accessible, with proof',
      text: 'Every component renders in every style pack, light and dark, and axe must report nothing. Keyboard, focus, contrast, forced colours and reduced motion are tested too.',
      href: docsHref('accessibility'),
      art: (
        <div className="dx-art-score">
          <strong>0</strong>
          <span>axe violations · 62 rules · 8 themes</span>
        </div>
      ),
      wide: true,
    },
    {
      icon: <Palette size={18} />,
      title: 'Your colours, any format',
      text: '#hex, rgb(), oklch() or a hue name. Eleven steps per role, text that always reads.',
      href: docsHref('theming'),
      art: (
        <div className="dx-art-ramp" aria-hidden="true">
          {[100, 200, 300, 400, 500, 600, 700, 800, 900].map((s) => (
            <i key={s} style={{ background: `var(--pinfold-primary-${s})` }} />
          ))}
        </div>
      ),
    },
    {
      icon: <Table2 size={18} />,
      title: 'Data at any size',
      text: 'Virtual rows, multi-sort, typed filters, groups, editing and a server data source. Scroll a billion rows.',
      href: docsHref('table'),
      art: <div className="dx-art-big">1,000,000,000</div>,
    },
    {
      icon: <MousePointerClick size={18} />,
      title: 'Every part is yours',
      text: 'classNames, styles, slotProps or render on any named part, and the headless hook for full control.',
      href: docsHref('button'),
      art: (
        <div className="dx-art-slots" aria-hidden="true">
          {['root', 'trigger', 'icon', 'panel', 'content'].map((s) => (
            <code key={s}>{s}</code>
          ))}
        </div>
      ),
    },
    {
      icon: <Server size={18} />,
      title: 'Server-ready presets',
      text: 'define<Name>() works in Server Components and loops; hooks are there when you need state.',
      href: docsHref('introduction'),
      art: <code className="dx-art-code">defineButton(&#123; tone: 'danger' &#125;)</code>,
    },
    {
      icon: <Gauge size={18} />,
      title: 'Only what you use',
      text: 'One subpath and one stylesheet per component. Importing a button never pulls in the grid.',
      href: docsHref('installation'),
      art: (
        <div className="dx-art-bars" aria-hidden="true">
          {[22, 38, 54, 70, 86].map((w, i) => (
            <i key={i} style={{ inlineSize: `${w}%` }} />
          ))}
        </div>
      ),
    },
    {
      icon: <Terminal size={18} />,
      title: 'A CLI that shows a diff first',
      text: 'init detects your framework, language and Tailwind; add brings every stylesheet a component needs. Nothing is overwritten, and running it twice changes nothing.',
      href: docsHref('cli'),
      art: (
        <pre className="dx-art-term" aria-hidden="true">
          <span>$ npx pinfold add table</span>
          <span className="dx-art-term__add">+ components/ui/table.tsx</span>
          <span className="dx-art-term__add">+ import '@pinfold/css/table.css'</span>
          <span className="dx-art-term__dim">  and 9 more stylesheets it draws with</span>
        </pre>
      ),
      wide: true,
    },
  ];
  return (
    <section className="dx-landing-section" aria-labelledby="built-title">
      <p className="dx-kicker">Built in</p>
      <h2 id="built-title">Everything a product team reaches for.</h2>
      <div className="dx-bento">
        {cards.map((c) => (
          <a key={c.title} href={c.href} className={c.wide ? 'dx-bento__card dx-bento__card--wide' : 'dx-bento__card'} data-cursor="read">
            <span className="dx-bento__icon">{c.icon}</span>
            <h3>{c.title}</h3>
            <p>{c.text}</p>
            <div className="dx-bento__art">{c.art}</div>
          </a>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------------------------- AI */

function Agents() {
  return (
    <section className="dx-band dx-band--ai" aria-labelledby="ai-title">
      <div className="dx-band__text">
        <p className="dx-kicker">For coding agents</p>
        <h2 id="ai-title">Your agent already knows the API.</h2>
        <p>A local MCP server hands your agent the real options of the version you installed: search, full references, JSON Schema and a validator. No guessing, no invented props.</p>
        <ul className="dx-agent-list">
          {(['claude', 'cursor', 'windsurf', 'shadcn'] as const).map((b) => (
            <li key={b}>
              <Brand name={b} size={18} />
              <span>{b === 'shadcn' ? 'shadcn registry' : b === 'claude' ? 'Claude Code' : b[0].toUpperCase() + b.slice(1)}</span>
            </li>
          ))}
        </ul>
        <Small label="Set up your agent" href={docsHref('ai')} endIcon={<ArrowRight size={14} aria-hidden="true" />} />
      </div>
      <div className="dx-band__code" data-cursor="copy">
        <CodeBlock code="claude mcp add pinfold -- npx -y pinfold mcp" language="bash" />
        <CodeBlock language="json" title=".cursor/mcp.json" code={`{\n  "mcpServers": {\n    "pinfold": { "command": "npx", "args": ["-y", "pinfold", "mcp"] }\n  }\n}`} />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------------------ numbers */

function Numbers() {
  const stats: Array<[string, string]> = [
    [String(COUNT), 'components'],
    ['0', 'runtime dependencies'],
    ['0', 'axe violations'],
    ['2,100+', 'tests on every change'],
    ['4', 'style packs'],
  ];
  return (
    <section className="dx-numbers" aria-label="In numbers">
      {stats.map(([n, l]) => (
        <div key={l} className="dx-numbers__item">
          <strong>{n}</strong>
          <span>{l}</span>
        </div>
      ))}
    </section>
  );
}

function FinalCta() {
  return (
    <section className="dx-final" aria-labelledby="final-title">
      <span className="dx-final__mark" aria-hidden="true">
        <Mark size={72} />
      </span>
      <h2 id="final-title">Build the next screen from a config.</h2>
      <p>Free and open source under the MIT license.</p>
      <div className="dx-hero2__cta" data-cursor="go">
        <Primary label="Get started" href={docsHref('installation')} endIcon={<ArrowRight size={16} aria-hidden="true" />} />
        <Secondary label="Star on GitHub" href="https://github.com/IndranilBhattacharya/pinfold" target="_blank" icon={<Brand name="github" size={16} />} />
      </div>
      <ul className="dx-final__components" aria-label="A few components">
        {['table', 'datepicker', 'command', 'combobox', 'tour', 'appshell', 'colorpicker', 'toast'].map((n) => (
          <li key={n}>
            <a href={docsHref(n)}>
              <PageIcon name={n} size={15} /> {componentMetas.find((m) => m.name === n)?.displayName}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Landing() {
  const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = typeof matchMedia === 'function' && matchMedia('(pointer: fine)').matches;
  const body = (
    <div className="dx-landing">
      <div className="dx-aurora" aria-hidden="true" />
      <Hero />
      <Showcase />
      <Marquee />
      <WriteLess />
      <Compare />
      <Bento />
      <Agents />
      <Numbers />
      <FinalCta />
    </div>
  );
  return fine && !reduced ? <Pointer>{body}</Pointer> : body;
}
