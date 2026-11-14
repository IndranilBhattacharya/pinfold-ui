import * as React from 'react';
import { tagsMeta } from '@pinfold/core/meta';
import { inactiveTagsOptions } from '@pinfold/core';
import { defineTags } from '@pinfold/react/tags';
import { Button } from '@pinfold/react/button';
import { changed } from '../playground/shared';
import { src, type ExampleSpec } from '../playground/example';
import { Choice, Page, usePage } from '../playground/kit';
import { reportEvent } from '../playground/preview-mode';

/** The tags page. */

const PRODUCTS = [
  { name: 'Trail runner', tags: ['Waterproof', 'Under $100'] },
  { name: 'City sneaker', tags: ['Vegan', 'Under $100'] },
  { name: 'Hiking boot', tags: ['Waterproof', 'Leather'] },
  { name: 'Canvas slip-on', tags: ['Vegan', 'Under $100', 'Sale'] },
  { name: 'Derby shoe', tags: ['Leather', 'Sale'] },
  { name: 'Rain boot', tags: ['Waterproof', 'Vegan'] },
];
const TOPICS = ['Design', 'Engineering', 'Accessibility', 'Research', 'Writing'];
const ARTICLES = [
  { title: 'Focus rings that survive dark mode', topics: ['Design', 'Accessibility'] },
  { title: 'A listbox from scratch', topics: ['Engineering', 'Accessibility'] },
  { title: 'Interviewing five teams about forms', topics: ['Research'] },
  { title: 'Error messages people read', topics: ['Writing', 'Design'] },
  { title: 'Tokens over themes', topics: ['Design', 'Engineering'] },
];

/** Filters remove themselves and the product list follows; topics pick the articles. */
function TagsDemo({ Preset, props }: { Preset: React.ElementType; props: Record<string, any> }) {
  const { _kind, ...rest } = props;
  const [filters, setFilters] = React.useState(['Waterproof', 'Under $100']);
  const [topics, setTopics] = React.useState<string[]>(['Accessibility']);
  if (_kind === 'pick') {
    const shown = ARTICLES.filter((a) => !topics.length || a.topics.some((t) => topics.includes(t)));
    return (
      <div className="dx-stack">
        <Preset {...rest} value={topics} onChange={setTopics} />
        <ul className="dx-tasks">{shown.map((a) => <li key={a.title}>{a.title}</li>)}</ul>
      </div>
    );
  }
  if (_kind === 'status') return <Preset {...rest} />;
  const shown = PRODUCTS.filter((p) => filters.every((f) => p.tags.includes(f)));
  return (
    <div className="dx-stack">
      <Preset {...rest} items={filters} onRemove={(v: string) => setFilters((f) => f.filter((x) => x !== v))} />
      <p className="dx-panel__lead">{shown.length} of {PRODUCTS.length} shoes: {shown.map((p) => p.name).join(', ') || 'none'}.</p>
      {filters.length < 2 ? (
        <div>
          <Button label="Reset filters" size="sm" variant="soft" onClick={() => setFilters(['Waterproof', 'Under $100'])} />
        </div>
      ) : null}
    </div>
  );
}

export function TagsPlayground() {
  const page = usePage(tagsMeta, ['size'], { _kind: 'filters' });
  const kind = String(page.inputs._kind);
  const config = { selection: kind === 'pick' ? 'multiple' : (page.options.selection as string), onRemove: kind === 'filters' ? 1 : undefined, maxVisible: kind === 'status' ? 3 : undefined };
  const inactive = { ...inactiveTagsOptions(config), selection: 'set by the example above.' };
  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));
  const shapes: Record<string, { body: string[]; use: Record<string, unknown>; code: string[] }> = {
    filters: {
      body: ["const [filters, setFilters] = useState(['Waterproof', 'Under $100']);"],
      use: { label: 'Filters', items: src(['Waterproof', 'Under $100'], 'filters'), onRemove: src(() => reportEvent('Called: ' + "(value) => setFilters((f) => f.filter((x) => x !== value))"), '(value) => setFilters((f) => f.filter((x) => x !== value))') },
      code: ['$TAG', '<Results filters={filters} />'],
    },
    pick: {
      body: ["const [topics, setTopics] = useState(['Accessibility']);"],
      use: { label: 'Topics', selection: 'multiple', items: TOPICS, value: src(['Accessibility'], 'topics'), onChange: src(() => reportEvent('Called: ' + "setTopics"), 'setTopics') },
      code: ['$TAG', '<Articles topics={topics} />'],
    },
    status: {
      body: [],
      use: {
        label: 'Release',
        maxVisible: 3,
        items: [
          { value: 'live', label: 'Live', tone: 'success' },
          { value: 'beta', label: 'Beta', tone: 'warning' },
          { value: 'docs', label: 'Docs', href: '#/tags' },
          { value: 'a11y', label: 'Accessible', tone: 'info' },
          { value: 'rtl', label: 'RTL' },
        ],
      },
      code: ['$TAG'],
    },
  };
  const shape = shapes[kind];
  const spec: ExampleSpec = { name: 'Chips', preset: set, body: shape.body.length ? shape.body : undefined, tree: [{ app: TagsDemo, use: { ...shape.use, _kind: src(kind, '') }, code: shape.code }] };
  return (
    <Page
      examples={{ name: '_kind', options: [['filters', 'filters to remove'], ['pick', 'topics to pick'], ['status', 'labels, tones and a link']] }}
      meta={tagsMeta}
      page={page}
      define={defineTags}
      spec={spec}
      inactive={inactive}
      inherit={['size']}
      provider={['size']}
      align="start"
      file="components/chips"
      note={
        kind === 'pick'
          ? 'A listbox: Tab in once, arrows move, Space picks. The articles follow the picked topics.'
          : kind === 'status'
            ? 'Each tag can carry its own tone; a tag with href is a link. "+2" shows the rest.'
            : 'Each remove button says which tag it removes; focus moves to the next tag. The shoes follow the filters.'
      }
    />
  );
}
