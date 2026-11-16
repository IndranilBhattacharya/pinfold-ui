import * as React from 'react';
import { ArrowLeft, ArrowRight, BookOpenCheck, ExternalLink, Info, Keyboard as KeyboardIcon, Eye, MousePointerClick, Shapes, Database, Zap, Paintbrush } from 'lucide-react';
import { defineTable } from '@pinfold/react/table';
import { defineBadge } from '@pinfold/react/badge';
import { defineBreadcrumb } from '@pinfold/react/breadcrumb';
import { defineKbd } from '@pinfold/react/kbd';
import type { ComponentMeta, PropMeta } from '@pinfold/core/meta';
import { PageBoundary, PageLoading } from '../playground/boundary';
import { MakeItYours } from '../playground/customize';
import { PAGES } from '../examples';
import { CodeBlock, CopyButton } from '../site/CodeBlock';
import { PageIcon } from '../site/icons';
import { docsHref } from '../site/router';
import { groupOf, guideFor, metaFor, ORDER } from '../site/nav';
import { Section } from './parts';

const Api = defineTable<ApiRow>({ variant: 'outline', density: 'compact', lines: 'rows', columnMenu: false });
const Required = defineBadge({ variant: 'soft', size: 'sm', tone: 'warning' });
const Crumbs = defineBreadcrumb({ variant: 'plain', size: 'sm' });
const Key = defineKbd({ size: 'sm' });

interface ApiRow {
  option: string;
  type: React.ReactNode;
  typeText: string;
  default: string;
  notes: string;
  required: boolean;
  status?: string;
}

const LAZY = new Map<string, React.LazyExoticComponent<React.ComponentType>>();
function playgroundFor(name: string) {
  if (!PAGES[name]) return null;
  if (!LAZY.has(name)) LAZY.set(name, React.lazy(PAGES[name]));
  return LAZY.get(name)!;
}

const GROUPS: Array<{ id: PropMeta['group']; title: string; icon: React.ReactNode; lede: string }> = [
  { id: 'data', title: 'Data', icon: <Database size={16} aria-hidden="true" />, lede: 'What the component shows: its content, its items and the value it holds.' },
  { id: 'appearance', title: 'Appearance', icon: <Paintbrush size={16} aria-hidden="true" />, lede: 'How it looks: variant, size, tone, radius and spacing. None of these change what it does.' },
  { id: 'behaviour', title: 'Behaviour', icon: <MousePointerClick size={16} aria-hidden="true" />, lede: 'How it acts when someone uses it: keyboard, selection, opening and closing.' },
  { id: 'events', title: 'Events', icon: <Zap size={16} aria-hidden="true" />, lede: 'Functions it calls when something happens, so your app can react or take control.' },
];

/** A type the way a developer reads it, with each choice as a chip. */
function typeOf(p: PropMeta): { node: React.ReactNode; text: string } {
  const extras = [p.orNode && 'a node', p.orLength && 'a length', p.orString && 'a string', p.orBoolean && 'true / false', p.nullable && 'null'].filter(Boolean) as string[];
  if (p.type === 'enum' && p.values) {
    const text = p.values.map((v) => JSON.stringify(v)).join(' | ') + (extras.length ? ` | ${extras.join(' | ')}` : '');
    return {
      text,
      node: (
        <span className="dx-type-chips">
          {p.values.map((v) => (
            <code key={String(v)} className="dx-type-chip">
              {typeof v === 'string' ? `'${v}'` : String(v)}
            </code>
          ))}
          {extras.map((e) => (
            <span key={e} className="dx-type-or">
              or {e}
            </span>
          ))}
        </span>
      ),
    };
  }
  const words: Record<string, string> = { node: 'React node', function: 'function', boolean: 'boolean', string: 'string', number: 'number', object: 'object', array: 'array', length: 'length' };
  const base = words[p.type] ?? p.type;
  const range = p.type === 'number' && (p.min !== undefined || p.max !== undefined) ? ` (${p.min ?? '…'} to ${p.max ?? '…'}${p.unit ? ` ${p.unit}` : ''})` : '';
  const text = base + range + (extras.length ? ` | ${extras.join(' | ')}` : '');
  return { text, node: <code className="dx-type">{text}</code> };
}

function rowsFor(meta: ComponentMeta, group: PropMeta['group']): ApiRow[] {
  return Object.entries(meta.props)
    .filter(([, p]) => p.group === group && p.status !== 'deprecated')
    .map(([key, p]) => {
      const t = typeOf(p);
      return {
        option: key,
        type: t.node,
        typeText: t.text,
        default: p.default === undefined ? p.auto ?? '' : JSON.stringify(p.default),
        notes: p.description.replace(/`/g, ''),
        required: !!p.required,
      };
    });
}

function ApiGroup({ meta, group }: { meta: ComponentMeta; group: (typeof GROUPS)[number] }) {
  const rows = rowsFor(meta, group.id);
  if (!rows.length) return null;
  return (
    <div className="dx-api-group">
      <h3 id={`api-${group.id}`} data-toc-label={group.title}>
        <span className="dx-api-group__icon">{group.icon}</span>
        {group.title}
        <span className="dx-api-group__count">{rows.length}</span>
      </h3>
      <p className="dx-api-group__lede">{group.lede}</p>
      <Api
        label={`${meta.displayName}: ${group.title.toLowerCase()} options`}
        hideLabel
        rows={rows}
        rowKey="option"
        columns={[
          {
            key: 'option',
            header: 'Option',
            width: 200,
            cell: ({ row }) => (
              <span className="dx-api-name">
                <code>{row.option}</code>
                {row.required ? <Required label="required" /> : null}
              </span>
            ),
          },
          { key: 'typeText', header: 'Type', width: 260, cell: ({ row }) => row.type },
          { key: 'default', header: 'Default', width: 140, cell: ({ row }) => (row.default ? <code className="dx-default">{row.default}</code> : <span className="dx-muted">unset</span>) },
          { key: 'notes', header: 'What it does' },
        ]}
      />
    </div>
  );
}

/** "ArrowDown / ArrowUp", "Shift + Tab": keys as Kbd chips; anything else stays text. */
function Keys({ text }: { text: string }) {
  const parts = text.split(/\s*(?:\/|,| or )\s*/).filter(Boolean);
  const looksLikeKeys = parts.every((p) => /^[\w⌘⇧]+(\s*\+\s*[\w⌘⇧]+)*$/.test(p) && p.length < 24);
  if (!looksLikeKeys) return <span className="dx-keys-text">{text}</span>;
  return (
    <span className="dx-keys">
      {parts.map((p, i) => (
        <React.Fragment key={p}>
          {i ? <span className="dx-keys__or">or</span> : null}
          <Key keys={p.split(/\s*\+\s*/).map((k) => (/^(Cmd|Ctrl|Mod)$/i.test(k) ? 'mod' : k))} />
        </React.Fragment>
      ))}
    </span>
  );
}

function neighbours(name: string) {
  const at = ORDER.indexOf(name);
  const label = (n: string | undefined) => (n ? metaFor(n)?.displayName ?? guideFor(n)?.title ?? n : undefined);
  return { prev: at > 0 ? ORDER[at - 1] : undefined, next: at >= 0 && at < ORDER.length - 1 ? ORDER[at + 1] : undefined, label };
}

export function PrevNext({ name }: { name: string }) {
  const { prev, next, label } = neighbours(name);
  return (
    <nav className="dx-prevnext" aria-label="Previous and next page">
      {prev ? (
        <a href={docsHref(prev)} className="dx-prevnext__link">
          <span className="dx-prevnext__dir">
            <ArrowLeft size={14} aria-hidden="true" /> Previous
          </span>
          <span className="dx-prevnext__name">
            <PageIcon name={prev} /> {label(prev)}
          </span>
        </a>
      ) : (
        <span />
      )}
      {next ? (
        <a href={docsHref(next)} className="dx-prevnext__link dx-prevnext__link--next">
          <span className="dx-prevnext__dir">
            Next <ArrowRight size={14} aria-hidden="true" />
          </span>
          <span className="dx-prevnext__name">
            <PageIcon name={next} /> {label(next)}
          </span>
        </a>
      ) : null}
    </nav>
  );
}

export function ComponentPage({ meta, extra: Extra }: { meta: ComponentMeta; extra?: () => React.ReactElement }) {
  const Playground = playgroundFor(meta.name);
  const pascal = meta.pascal ?? meta.displayName.split(' ')[0];
  const importLine = `import { define${pascal} } from '${meta.importPath}';`;
  const add = `npx pinfold add ${meta.name}`;
  const group = groupOf(meta.name);
  return (
    <article id="dx-article" className="dx-article" key={meta.name}>
      <header className="dx-head">
        <Crumbs label="Breadcrumb" items={[{ label: 'Docs', href: docsHref('introduction') }, { label: group }, { label: meta.displayName }]} />
        <div className="dx-head__title">
          <span className="dx-head__icon">
            <PageIcon name={meta.name} size={26} />
          </span>
          <h1>{meta.displayName}</h1>
        </div>
        <p className="dx-head__lede">{meta.description}</p>
        <div className="dx-head__chips">
          <span className="dx-chipcode">
            <code>{importLine}</code>
            <CopyButton text={importLine} label="Copy import" what="Import" />
          </span>
          <span className="dx-chipcode">
            <code>{add}</code>
            <CopyButton text={add} label="Copy command" what="Command" />
          </span>
          <a className="dx-headlink" href={meta.pattern} target="_blank" rel="noreferrer">
            <BookOpenCheck size={15} aria-hidden="true" /> WAI-ARIA pattern <ExternalLink size={12} aria-hidden="true" />
          </a>
          <a className="dx-headlink" href={`https://github.com/IndranilBhattacharya/pinfold/tree/main/packages/react/src/${meta.name}`} target="_blank" rel="noreferrer">
            <Shapes size={15} aria-hidden="true" /> Source <ExternalLink size={12} aria-hidden="true" />
          </a>
        </div>
        <p className="dx-head__forms">
          <Info size={15} aria-hidden="true" />
          <span>
            <code>define{pascal}</code> works anywhere, Server Components included. <code>use{pascal}</code> is for a client component that needs the controller.
          </span>
        </p>
      </header>

      {Playground ? (
        <Section id="playground" title="Playground" lede="Change any option and watch the preview and the code follow. It opens on the library defaults, and the address keeps your choices, so you can share the exact state.">
          <PageBoundary name={meta.displayName}>
            <React.Suspense fallback={<PageLoading />}>
              <Playground />
            </React.Suspense>
          </PageBoundary>
        </Section>
      ) : null}

      {Extra ? <Extra /> : null}

      <Section id="examples" title="Examples" lede="Short, complete snippets for common jobs. The same examples ship in llms.txt and the MCP server, so your coding agent sees them too.">
        <div className="dx-examples-list">
          {meta.examples.map((e) => (
            <div key={e.title} className="dx-example">
              <h3 id={`example-${e.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>{e.title}</h3>
              <CodeBlock code={e.code} file="example" />
            </div>
          ))}
        </div>
      </Section>

      <Section id="customize" title="Make it yours" lede="Every part has a name. Add a class or a style to it, merge props into it, or draw it with your own component, and Pinfold keeps the keys, focus and ARIA working.">
        <MakeItYours meta={meta} Code={({ label, code }) => <CodeBlock code={code} title={label} />} />
      </Section>

      <Section id="api" title="API" lede="Every option is a key of one flat object, passed to define, to use, or as props. When an option is set in more than one place, the closest wins: the props, then the preset, then defaults in defineConfig(), then the provider, then the library default.">
        {GROUPS.map((g) => (
          <ApiGroup key={g.id} meta={meta} group={g} />
        ))}
      </Section>

      <Section id="accessibility" title="Accessibility" lede={`Built to the WAI-ARIA ${meta.displayName.toLowerCase()} pattern and checked with axe in light and dark mode, in every style pack, on every build.`}>
        <ul className="dx-a11y">
          {meta.aria.map((line) => (
            <li key={line} className="dx-a11y__item">
              <span className="dx-a11y__icon">
                <Eye size={16} aria-hidden="true" />
              </span>
              <span>{line.replace(/`/g, '')}</span>
            </li>
          ))}
        </ul>
      </Section>

      {meta.keyboard.length ? (
        <Section id="keyboard" title="Keyboard" lede="Everything works without a mouse. These keys apply while focus is inside the component.">
          <div className="dx-keyboard" role="table" aria-label={`${meta.displayName} keyboard`}>
            <div role="row" className="dx-keyboard__head">
              <span role="columnheader">
                <KeyboardIcon size={14} aria-hidden="true" /> Keys
              </span>
              <span role="columnheader">What happens</span>
            </div>
            {meta.keyboard.map((k) => (
              <div role="row" key={k.keys} className="dx-keyboard__row">
                <span role="cell">
                  <Keys text={k.keys} />
                </span>
                <span role="cell">{k.action.replace(/`/g, '')}</span>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      <PrevNext name={meta.name} />
    </article>
  );
}
