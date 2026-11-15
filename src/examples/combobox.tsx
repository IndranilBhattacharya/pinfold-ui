import * as React from 'react';
import { comboboxMeta } from '@pinfold/core/meta';
import { inactiveComboboxOptions } from '@pinfold/core';
import { defineCombobox, type ComboboxListContext } from '@pinfold/react/combobox';
import { changed } from '../playground/shared';
import { src, type ExampleSpec } from '../playground/example';
import { Page, usePage } from '../playground/kit';
import { KEEP_NOTE } from './overlays';
import { reportEvent } from '../playground/preview-mode';
import { PEOPLE, PORTS } from '../demo/harbor';

/** The combobox page. */

const CITIES = ['Amsterdam', 'Athens', 'Bogotá', 'Kraków', 'Lisbon', 'Montréal', 'Oslo', 'Osaka', 'Reykjavík', 'São Paulo', 'Zagreb', 'Zürich'];
const REPOS = ['pinfold/pinfold', 'pinfold/pinfold-ui', 'facebook/react', 'vercel/next.js', 'vitejs/vite', 'tailwindlabs/tailwindcss', 'microsoft/typescript', 'nodejs/node', 'denoland/deno', 'sveltejs/svelte', 'vuejs/core', 'withastro/astro'];

const PORT_REGIONS: Record<(typeof PORTS)[number], string> = {
  Rotterdam: 'Europe',
  Hamburg: 'Europe',
  Antwerp: 'Europe',
  Shanghai: 'Asia',
  Singapore: 'Asia',
  Busan: 'Asia',
  'Los Angeles': 'Americas',
  Chicago: 'Americas',
  Santos: 'Americas',
  Dubai: 'Middle East',
};

export const PORT_ITEMS = PORTS.map((port) => ({
  value: port,
  label: port,
  group: PORT_REGIONS[port],
}));

export const PEOPLE_ITEMS = PEOPLE.slice(0, 10).map((p) => ({ value: p.id, label: p.name, description: `${p.role} · ${p.city}` }));

/** Ten thousand people behind a (simulated) API: the combobox fetches, waits for typing to pause, cancels old requests. */
let _directory: Array<{ value: string; label: string; description: string }> | null = null;
function getDirectory() {
  if (!_directory) {
    _directory = Array.from({ length: 10_000 }, (_, i) => {
      const first = ['Maya', 'Leo', 'Ines', 'Sam', 'Aiko', 'Noah', 'Priya', 'Tom', 'Lena', 'Omar', 'Sara', 'Jon', 'Mei', 'Ravi', 'Zoe'][i % 15];
      const last = ['Chen', 'Park', 'Duarte', 'Okafor', 'Mori', 'Fischer', 'Nair', 'Hale', 'Kraus', 'Haddad', 'Lind', 'Price', 'Novak', 'Silva'][(i * 7) % 14];
      return { value: `p${i}`, label: `${first} ${last}`, description: `${['Design', 'Engineering', 'Research', 'Sales', 'Support'][(i * 3) % 5]} · #${1000 + i}` };
    });
  }
  return _directory;
}

function searchPeople(query: string, { signal }: { signal: AbortSignal }) {
  return new Promise<Array<{ value: string; label: string; description: string }>>((resolve, reject) => {
    const timer = setTimeout(() => {
      const dir = getDirectory();
      const q = query.trim().toLowerCase();
      resolve((q ? dir.filter((p) => p.label.toLowerCase().includes(q)) : dir).slice(0, 400));
    }, 300);
    signal.addEventListener('abort', () => (clearTimeout(timer), reject(new DOMException('aborted', 'AbortError'))));
  });
}

/** City: the chosen value drives a card; repository: a simulated server search; tags: a tag input. */
function Finder({ Preset, props }: { Preset: React.ElementType; props: Record<string, unknown> }) {
  const { _kind, loading: _printed, ...rest } = props;
  const [city, setCity] = React.useState<string | null>(null);
  const [tags, setTags] = React.useState<string[]>(['react']);
  const [team, setTeam] = React.useState<string[]>(['p0', 'p16']);
  const [location, setLocation] = React.useState<string | null>('Rotterdam');
  const [assignees, setAssignees] = React.useState<string[]>(['p1', 'p2']);
  const [query, setQuery] = React.useState('vi');
  const [results, setResults] = React.useState<string[]>(() => REPOS.filter((r) => r.includes('vi')));
  const searched = React.useRef('vi');
  const [fetching, setFetching] = React.useState(false);

  // The "server": answers after a short wait; an empty query asks for nothing. Keyed on the query
  // whose results are on screen, so a remount (or React's double effect) never refetches.
  React.useEffect(() => {
    if (_kind !== 'server' || query === searched.current) return setFetching(false);
    if (!query.trim()) {
      searched.current = query;
      setFetching(false);
      return setResults([]);
    }
    setFetching(true);
    const timer = setTimeout(() => {
      searched.current = query;
      setResults(REPOS.filter((r) => r.includes(query.trim().toLowerCase())));
      setFetching(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [_kind, query]);

  if (_kind === 'server')
    return (
      <div className="dx-stack">
        <Preset {...rest} items={results} inputValue={query} onInputChange={setQuery} {...(fetching ? { loading: true } : null)} />
        <p className="dx-panel__lead">{query ? `${results.length} repositories match "${query}".` : 'Type a few letters: results come from the (simulated) server.'}</p>
      </div>
    );
  if (_kind === 'people')
    return (
      <div className="dx-stack">
        <Preset {...rest} value={team} onChange={setTeam} />
        <p className="dx-panel__lead">{team.length} on the team. Chosen people stay in the list, disabled; remove them with their chip.</p>
      </div>
    );
  if (_kind === 'tags')
    return (
      <div className="dx-stack">
        <Preset {...rest} value={tags} onChange={setTags} />
        <p className="dx-panel__lead">{tags.length} tags: {tags.join(', ') || 'none'}.</p>
      </div>
    );
  if (_kind === 'tree')
    return (
      <div className="dx-stack">
        <Preset {...rest} value={location} onChange={setLocation} />
        <p className="dx-panel__lead">{location ? `Port selected: ${location}.` : 'Search or browse ports across global regions.'}</p>
      </div>
    );
  if (_kind === 'chips')
    return (
      <div className="dx-stack">
        <Preset {...rest} value={assignees} onChange={setAssignees} />
        <p className="dx-panel__lead">{assignees.length ? `Assigned to ${assignees.length} people.` : 'No assignees chosen.'}</p>
      </div>
    );
  return (
    <div className="dx-stack">
      <Preset {...rest} value={city} onChange={setCity} />
      <p className="dx-panel__lead">{city ? `Shipping to ${city}.` : 'Type "zur" or "sao": accents and case do not matter.'}</p>
    </div>
  );
}

const REGIONS = ['Europe', 'Asia', 'Americas', 'Middle East'] as const;

const renderLocationTree = (ctx: ComboboxListContext) => (
  <div role="tree" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0.375rem', minWidth: '16rem' }}>
    {ctx.loading ? (
      <div role="status" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--pinfold-color-text-muted)' }}>
        Searching ports…
      </div>
    ) : null}
    {REGIONS.map((region) => {
      const matching = ctx.items.filter((it) => it.group === region);
      if (!matching.length) return null;
      return (
        <div key={region} role="group" aria-label={region} style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--pinfold-color-text-muted)', padding: '0.25rem 0.5rem' }}>
            {region}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '0.75rem' }}>
            {matching.map((item) => {
              const nodeProps = ctx.getRowProps(item.value);
              return (
                <div key={item.value} {...nodeProps} style={{ padding: '0.375rem 0.5rem', borderRadius: 'var(--pinfold-radius-sm)', fontSize: '0.8125rem', cursor: 'pointer' }}>
                  {item.label}
                </div>
              );
            })}
          </div>
        </div>
      );
    })}
  </div>
);

export function ComboboxPlayground() {
  const page = usePage(comboboxMeta, ['size', 'tone'], { _kind: 'cities' });
  const kind = String(page.inputs._kind);
  const isMultiple = kind === 'tags' || kind === 'people' || kind === 'chips';
  const inactive = inactiveComboboxOptions({ multiple: isMultiple, renderList: kind === 'tree' ? true : undefined });
  const fixed: Record<string, string> = {
    multiple: 'set by the example above.',
    ...(kind === 'server' || kind === 'people' ? { filter: 'set by the example above.' } : {}),
    ...(kind === 'tags' ? { allowCustom: 'set by the example above.', selectedInList: 'set by the example above.' } : {}),
    ...(kind === 'people' ? { selectedInList: 'set by the example above.', chipsPlacement: 'set by the example above.' } : {}),
    ...(kind === 'chips' ? { chipsPlacement: 'set by the example above.' } : {}),
  };
  const set = Object.fromEntries(changed(page.options, page.defaults, { ...inactive, ...fixed }));

  const shapes: Record<string, { body: string[]; imports?: string[]; use: Record<string, unknown> }> = {
    cities: {
      body: ['const [city, setCity] = useState<string | null>(null);'],
      use: { label: 'City', placeholder: 'Search cities', items: CITIES, defaultInputValue: 'o', value: src(null, 'city'), onChange: src(() => reportEvent('Called: setCity'), 'setCity') },
    },
    server: {
      body: ["const [query, setQuery] = useState('vi');", "const { data = [], isFetching } = useQuery({ queryKey: ['repos', query], queryFn: () => searchRepos(query), enabled: !!query });"],
      use: { label: 'Repository', placeholder: 'owner/name', filter: 'none', items: src([], 'data'), loading: src(false, 'isFetching'), inputValue: src('vi', 'query'), onInputChange: src(() => reportEvent('Called: setQuery'), 'setQuery') },
    },
    people: {
      body: ["const [team, setTeam] = useState(['p0', 'p16']);", '// Your API: rows for what is typed. signal cancels a request the next keystroke made stale.', 'const searchPeople = (query, { signal }) => fetch(`/api/people?q=${query}`, { signal }).then((r) => r.json());'],
      use: {
        label: 'Team',
        multiple: true,
        placeholder: 'Search 10,000 people',
        loadItems: src(searchPeople, 'searchPeople'),
        chipsPlacement: 'below',
        selectedInList: 'disable',
        value: src(['p0', 'p16'], 'team'),
        onChange: src(() => reportEvent('Called: setTeam'), 'setTeam'),
      },
    },
    tags: {
      body: ["const [tags, setTags] = useState(['react']);"],
      use: { label: 'Tags', multiple: true, allowCustom: true, placeholder: 'Add a tag', defaultInputValue: 'type', items: ['react', 'typescript', 'css', 'accessibility', 'design-system'], value: src(['react'], 'tags'), onChange: src(() => reportEvent('Called: setTags'), 'setTags') },
    },
    tree: {
      imports: ["import { type ComboboxListContext } from '@pinfold/react/combobox';"],
      body: [
        "const [location, setLocation] = useState<string | null>('Rotterdam');",
        "const portItems = " + JSON.stringify(PORT_ITEMS, null, 2) + ";",
        "const regions = ['Europe', 'Asia', 'Americas', 'Middle East'] as const;",
        "const renderLocationTree = (ctx: ComboboxListContext) => (",
        "  <div role=\"tree\" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0.375rem', minWidth: '16rem' }}>",
        "    {ctx.loading ? (",
        "      <div role=\"status\" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--pinfold-color-text-muted)' }}>",
        "        Searching ports…",
        "      </div>",
        "    ) : null}",
        "    {regions.map((region) => {",
        "      const matching = ctx.items.filter((it) => it.group === region);",
        "      if (!matching.length) return null;",
        "      return (",
        "        <div key={region} role=\"group\" aria-label={region} style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>",
        "          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--pinfold-color-text-muted)', padding: '0.25rem 0.5rem' }}>",
        "            {region}",
        "          </div>",
        "          <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '0.75rem' }}>",
        "            {matching.map((item) => {",
        "              const props = ctx.getRowProps(item.value);",
        "              return (",
        "                <div key={item.value} {...props} style={{ padding: '0.375rem 0.5rem', borderRadius: 'var(--pinfold-radius-sm)', fontSize: '0.8125rem', cursor: 'pointer' }}>",
        "                  {item.label}",
        "                </div>",
        "              );",
        "            })}",
        "          </div>",
        "        </div>",
        "      );",
        "    })}",
        "  </div>",
        ");",
      ],
      use: {
        label: 'Port',
        placeholder: 'Search ports or regions',
        defaultInputValue: 'dam',
        items: src(PORT_ITEMS, 'portItems'),
        popupRole: 'tree',
        renderList: src(renderLocationTree, 'renderLocationTree'),
        value: src('Rotterdam', 'location'),
        onChange: src(() => reportEvent('Called: setLocation'), 'setLocation'),
      },
    },
    chips: {
      body: [
        "const [assignees, setAssignees] = useState(['p1', 'p2']);",
        "const people = " + JSON.stringify(PEOPLE_ITEMS, null, 2) + ";",
      ],
      use: {
        label: 'Assignees',
        multiple: true,
        chipsPlacement: 'below',
        placeholder: 'Add team members',
        defaultInputValue: 'a',
        items: src(PEOPLE_ITEMS, 'people'),
        value: src(['p1', 'p2'], 'assignees'),
        onChange: src(() => reportEvent('Called: setAssignees'), 'setAssignees'),
      },
    },
  };

  const shape = shapes[kind];
  const spec: ExampleSpec = {
    name: 'Search',
    imports: shape.imports,
    preset: set,
    body: shape.body,
    tree: [{ app: Finder, use: { ...shape.use, _kind: src(kind, '') }, code: ['$TAG'] }],
    openOnLoad: true,
  };

  return (
    <Page
      examples={{
        name: '_kind',
        options: [
          ['cities', 'cities: filter your rows'],
          ['server', 'repositories: search a server'],
          ['people', 'a team: 10,000 people, async, chips'],
          ['tags', 'tags: several, free text'],
          ['tree', 'locations tree'],
          ['chips', 'chips below'],
        ],
      }}
      meta={comboboxMeta}
      page={page}
      define={defineCombobox}
      spec={spec}
      inactive={{ ...inactive, ...fixed }}
      inherit={['size', 'tone']}
      provider
      align="start"
      file="components/search"
      frame={(live) => <div className="dx-list-demo">{live}</div>}
      note={
        KEEP_NOTE +
        ' ' +
        (kind === 'server'
          ? 'filter="none": your items are the results; loading shows a row and marks the list busy while the (simulated) request runs.'
          : kind === 'people'
            ? 'loadItems fetches as you type (after a pause, older requests cancelled, results cached per query). Chosen people show as a tag group under the field and stay disabled in the list.'
          : kind === 'tags'
            ? 'Enter adds what you typed; Backspace in an empty field removes the last tag.'
          : kind === 'tree'
            ? 'Hierarchical tree structure with popupRole="tree"; getRowProps wires active descendant, treeitem role, and selection.'
          : kind === 'chips'
            ? 'Multiple selection with chipsPlacement="below": chips render as a wrap group beneath the control, keeping the input uncluttered.'
            : 'The first match is active as you type, so Enter takes it. Escape closes, then clears.')
      }
    />
  );
}
