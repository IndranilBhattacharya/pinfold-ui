import * as React from 'react';
import { paginationMeta } from '@pinfold/core/meta';
import { inactivePaginationOptions } from '@pinfold/core';
import { Badge } from '@pinfold/react/badge';
import { definePagination } from '@pinfold/react/pagination';
import { changed } from '../playground/shared';
import { src, type ExampleSpec } from '../playground/example';
import { Choice, Page, Toggle, usePage } from '../playground/kit';
import { CUSTOMERS as HARBOR_CUSTOMERS } from '../demo/harbor';
import { reportEvent } from '../playground/preview-mode';

/** The pagination page. */

const CUSTOMERS = HARBOR_CUSTOMERS.map((c) => c.name);
const STATUSES = [
  ['Paid', 'success'],
  ['Pending', 'warning'],
  ['Overdue', 'danger'],
] as const;
const INVOICES = Array.from({ length: 137 }, (_, i) => ({
  id: `INV-${String(2041 + i)}`,
  customer: CUSTOMERS[(i * 7) % CUSTOMERS.length],
  amount: ((i * 7919) % 4800) + 120,
  status: STATUSES[(i * 5) % 7 === 0 ? 2 : (i * 3) % 4 === 0 ? 1 : 0],
}));
type Invoice = (typeof INVOICES)[number];

function InvoiceTable({ rows, busy }: { rows: readonly Invoice[]; busy?: boolean }) {
  return (
    <div className="dx-table-wrap" aria-busy={busy || undefined} style={{ opacity: busy ? 0.55 : 1, transition: 'opacity 150ms' }}>
      <table className="dx-table dx-table--data">
        <thead>
          <tr>
            <th>Invoice</th>
            <th>Customer</th>
            <th>Status</th>
            <th style={{ textAlign: 'end' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td><code>{r.id}</code></td>
              <td>{r.customer}</td>
              <td><Badge label={r.status[0]} tone={r.status[1]} size="sm" /></td>
              <td style={{ textAlign: 'end' }}>${r.amount.toLocaleString('en-US')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Invoices paged three ways: an array in memory, a server that counts, and a cursor API. */
export function Invoices({ Preset, props }: { Preset: React.ElementType; props: Record<string, any> }) {
  const mode = props._mode as 'client' | 'server' | 'cursor';
  // `loading` is printed as your fetch state; the preview drives it from its own fetch.
  const { _mode, loading: _printed, ...rest } = props;
  const [query, setQuery] = React.useState({ page: 1, pageSize: rest.pageSizes?.[0] ?? 10 });
  const slice = (q: typeof query) => INVOICES.slice((q.page - 1) * q.pageSize, q.page * q.pageSize);
  const [shown, setShown] = React.useState(() => slice(query));
  const [fetching, setFetching] = React.useState(false);
  // The "server": answers after a short wait, as a real request would. The first page arrives with the page.
  // Keyed on what is on screen, so a remount (or React's double effect in development) never refetches.
  const loaded = React.useRef(`${query.page}/${query.pageSize}`);
  React.useEffect(() => {
    const key = `${query.page}/${query.pageSize}`;
    if (key === loaded.current) return;
    if (mode === 'client') {
      loaded.current = key;
      return setShown(slice(query));
    }
    setFetching(true);
    const timer = setTimeout(() => {
      loaded.current = key;
      setShown(slice(query));
      setFetching(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [mode, query.page, query.pageSize]); // eslint-disable-line react-hooks/exhaustive-deps
  const onChange = (page: number, { pageSize }: { pageSize: number }) => setQuery({ page, pageSize });
  const counted = mode === 'cursor' ? { hasNext: query.page * query.pageSize < INVOICES.length, total: undefined } : { total: INVOICES.length };
  return (
    <div className="dx-stack">
      <InvoiceTable rows={shown} busy={fetching} />
      <Preset {...rest} {...counted} page={query.page} pageSize={query.pageSize} onChange={onChange} {...(fetching ? { loading: true } : null)} />
    </div>
  );
}

export function PaginationPlayground() {
  const page = usePage(paginationMeta, ['size', 'tone'], { _data: 'client', _sizes: true });
  const mode = String(page.inputs._data) as 'client' | 'server' | 'cursor';
  const sizes = page.inputs._sizes ? [10, 25, 50] : undefined;
  const scope = mode === 'cursor' ? { hasNext: true } : { total: INVOICES.length };
  const inactive = inactivePaginationOptions({ ...page.options, ...scope });
  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));
  const onChange = src(() => reportEvent('Called: ' + "(page, { pageSize }) => setQuery({ page, pageSize })"), '(page, { pageSize }) => setQuery({ page, pageSize })');
  const base = { page: src(1, 'query.page'), pageSize: src(sizes?.[0] ?? 10, 'query.pageSize'), pageSizes: sizes, onChange, _mode: src(mode, '') };
  const shapes = {
    client: {
      body: ['const [query, setQuery] = useState({ page: 1, pageSize: 10 });', 'const rows = invoices.slice((query.page - 1) * query.pageSize, query.page * query.pageSize);'],
      use: { total: src(INVOICES.length, 'invoices.length'), ...base },
      code: ['<InvoiceTable rows={rows} />', '$TAG'],
    },
    server: {
      body: [
        'const [query, setQuery] = useState({ page: 1, pageSize: 10 });',
        '// Your fetch, e.g. TanStack Query: GET /invoices?offset=(page - 1) * pageSize&limit=pageSize',
        "const { data, isFetching } = useQuery({ queryKey: ['invoices', query], queryFn: () => fetchInvoices(query), placeholderData: keepPreviousData });",
      ],
      use: { total: src(INVOICES.length, 'data.total'), ...base, loading: src(false, 'isFetching') },
      code: ['<InvoiceTable rows={data.rows} busy={isFetching} />', '$TAG'],
    },
    cursor: {
      body: [
        'const [query, setQuery] = useState({ page: 1, pageSize: 10 });',
        '// A cursor API has no total: it says whether there is more.',
        'const { data, isFetching } = useInvoicesAfter(cursors[query.page - 1], query.pageSize); // { rows, nextCursor }',
      ],
      use: { hasNext: src(true, 'data.nextCursor != null'), ...base, loading: src(false, 'isFetching') },
      code: ['<InvoiceTable rows={data.rows} busy={isFetching} />', '$TAG'],
    },
  }[mode];
  const spec: ExampleSpec = { name: 'Pages', preset: set, body: shapes.body, tree: [{ app: Invoices, use: shapes.use, code: shapes.code }] };
  return (
    <Page
      meta={paginationMeta}
      page={page}
      define={definePagination}
      spec={spec}
      inactive={inactive}
      inherit={['size', 'tone']}
      provider
      align="start"
      file="components/invoices"
      note={
        mode === 'client'
          ? 'One state object drives the rows and the pages. A page-size change keeps the first row on screen.'
          : mode === 'server'
            ? 'The table waits on a (simulated) server: loading keeps the old rows, pulses the cursor and blocks double clicks.'
            : 'No total from the API: hasNext says whether there is more; the row shows previous, the page, next.'
      }
      demo={
        <>
          <Choice page={page} name="_data" label="data" options={[['client', 'an array you hold'], ['server', 'a server that counts (total)'], ['cursor', 'a cursor API (hasNext)']]} />
          <div className="dx-opts">
            <Toggle page={page} name="_sizes" label="page sizes [10, 25, 50]" />
          </div>
        </>
      }
    />
  );
}
