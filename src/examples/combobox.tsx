import * as React from 'react';
import { comboboxMeta } from '@pinfold/core/meta';
import { inactiveComboboxOptions } from '@pinfold/core';
import { defineCombobox } from '@pinfold/react/combobox';
import { changed } from '../playground/shared';
import { src, type ExampleSpec } from '../playground/example';
import { Choice, Page, usePage } from '../playground/kit';
import { KEEP_NOTE } from './overlays';

/** The combobox page. */

const CITIES = ['Amsterdam', 'Athens', 'Bogotá', 'Kraków', 'Lisbon', 'Montréal', 'Oslo', 'Osaka', 'Reykjavík', 'São Paulo', 'Zagreb', 'Zürich'];
const REPOS = ['pinfold/pinfold', 'pinfold/pinfold-ui', 'facebook/react', 'vercel/next.js', 'vitejs/vite', 'tailwindlabs/tailwindcss', 'microsoft/typescript', 'nodejs/node', 'denoland/deno', 'sveltejs/svelte', 'vuejs/core', 'withastro/astro'];

/** Ten thousand people behind a (simulated) API: the combobox fetches, waits for typing to pause, cancels old requests. */
const DIRECTORY = Array.from({ length: 10_000 }, (_, i) => {
  const first = ['Maya', 'Leo', 'Ines', 'Sam', 'Aiko', 'Noah', 'Priya', 'Tom', 'Lena', 'Omar', 'Sara', 'Jon', 'Mei', 'Ravi', 'Zoe'][i % 15];
  const last = ['Chen', 'Park', 'Duarte', 'Okafor', 'Mori', 'Fischer', 'Nair', 'Hale', 'Kraus', 'Haddad', 'Lind', 'Price', 'Novak', 'Silva'][(i * 7) % 14];
  return { value: `p${i}`, label: `${first} ${last}`, description: `${['Design', 'Engineering', 'Research', 'Sales', 'Support'][(i * 3) % 5]} · #${1000 + i}` };
});
function searchPeople(query: string, { signal }: { signal: AbortSignal }) {
  return new Promise<typeof DIRECTORY>((resolve, reject) => {
    const timer = setTimeout(() => {
      const q = query.trim().toLowerCase();
      resolve((q ? DIRECTORY.filter((p) => p.label.toLowerCase().includes(q)) : DIRECTORY).slice(0, 400));
    }, 300);
    signal.addEventListener('abort', () => (clearTimeout(timer), reject(new DOMException('aborted', 'AbortError'))));
  });
}

/** City: the chosen value drives a card; repository: a simulated server search; tags: a tag input. */
function Finder({ Preset, props }: { Preset: React.ElementType; props: Record<string, any> }) {
  const { _kind, loading: _printed, ...rest } = props;
  const [city, setCity] = React.useState<string | null>(null);
  const [tags, setTags] = React.useState<string[]>(['react']);
  const [team, setTeam] = React.useState<string[]>(['p0', 'p16']);
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
  return (
    <div className="dx-stack">
      <Preset {...rest} value={city} onChange={setCity} />
      <p className="dx-panel__lead">{city ? `Shipping to ${city}.` : 'Type "zur" or "sao": accents and case do not matter.'}</p>
    </div>
  );
}

export function ComboboxPlayground() {
  const page = usePage(comboboxMeta, ['size', 'tone'], { _kind: 'cities' });
  const kind = String(page.inputs._kind);
  const inactive = inactiveComboboxOptions({ multiple: kind === 'tags' || kind === 'people' });
  const fixed = { multiple: 'set by the example above.', ...(kind === 'server' || kind === 'people' ? { filter: 'set by the example: the server filters.' } : {}), ...(kind === 'tags' ? { allowCustom: 'set by the example above.', selectedInList: 'what is typed here hides the chosen tag; see the team example.' } : {}), ...(kind === 'people' ? { selectedInList: 'set by the example above.', chipsPlacement: 'set by the example above.' } : {}) };
  const set = Object.fromEntries(changed(page.options, page.defaults, { ...inactive, ...fixed }));
  const shapes: Record<string, { body: string[]; use: Record<string, unknown> }> = {
    cities: {
      body: ['const [city, setCity] = useState(null);'],
      use: { label: 'City', placeholder: 'Search cities', items: CITIES, defaultInputValue: 'o', value: src(null, 'city'), onChange: src(() => {}, 'setCity') },
    },
    server: {
      body: ["const [query, setQuery] = useState('vi');", 'const { data = [], isFetching } = useQuery({ queryKey: [\'repos\', query], queryFn: () => searchRepos(query), enabled: !!query });'],
      use: { label: 'Repository', placeholder: 'owner/name', filter: 'none', items: src([], 'data'), loading: src(false, 'isFetching'), inputValue: src('vi', 'query'), onInputChange: src(() => {}, 'setQuery') },
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
        onChange: src(() => {}, 'setTeam'),
      },
    },
    tags: {
      body: ["const [tags, setTags] = useState(['react']);"],
      use: { label: 'Tags', multiple: true, allowCustom: true, placeholder: 'Add a tag', defaultInputValue: 'type', items: ['react', 'typescript', 'css', 'accessibility', 'design-system'], value: src(['react'], 'tags'), onChange: src(() => {}, 'setTags') },
    },
  };
  const shape = shapes[kind];
  const spec: ExampleSpec = { name: 'Search', preset: set, body: shape.body, tree: [{ app: Finder, use: { ...shape.use, _kind: src(kind, '') }, code: ['$TAG'] }], openOnLoad: true };
  return (
    <Page
      examples={{ name: '_kind', options: [['cities', 'cities: filter your rows'], ['server', 'repositories: search a server'], ['people', 'a team: 10,000 people, async, chips'], ['tags', 'tags: several, free text']] }}
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
            : 'The first match is active as you type, so Enter takes it. Escape closes, then clears.')
      }
    />
  );
}
