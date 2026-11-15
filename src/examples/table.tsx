import * as React from 'react';
import { tableMeta } from '@pinfold/core/meta';
import { inactiveTableOptions } from '@pinfold/core';
import { Badge } from '@pinfold/react/badge';
import { Avatar } from '@pinfold/react/avatar';
import { Card } from '@pinfold/react/card';
import { Input } from '@pinfold/react/input';
import { defineTable } from '@pinfold/react/table';
import { Button } from '@pinfold/react/button';
import { changed } from '../playground/shared';
import { src, type ExampleSpec } from '../playground/example';
import { Choice, Page, Toggle, usePage } from '../playground/kit';
import { PEOPLE } from '../demo/harbor';
import { reportEvent } from '../playground/preview-mode';

/** The table page. */

const TEAM = PEOPLE.map((p, i) => ({
  id: p.id,
  name: p.name,
  role: p.role,
  projects: ((i * 7) % 9) + 1,
  joined: p.joined,
}));
type Person = (typeof TEAM)[number];

const ORDER_STATUSES = ['paid', 'pending', 'refunded', 'failed'] as const;
const STATUS_TONE = { paid: 'success', pending: 'warning', refunded: 'neutral', failed: 'danger' } as const;
const ORDER_PRODUCTS = ['Wool overshirt', 'Canvas tote', 'Linen shirt', 'Desk lamp', 'Field notebook', 'Ceramic mug', 'Rain jacket', 'Trail shoes'];
const ORDER_REGIONS = ['Europe', 'Americas', 'Asia Pacific'];
const BUYERS = ['Maya Chen', 'Leo Park', 'Ines Duarte', 'Sam Okafor', 'Aiko Mori', 'Noah Fischer', 'Priya Nair', 'Tom Hale', 'Lena Kraus', 'Omar Haddad'];
/** Orders made up from their position: the same on every load. */
const ORDERS = Array.from({ length: 240 }, (_, i) => {
  const who = BUYERS[(i * 7) % BUYERS.length];
  const qty = ((i * 5) % 6) + 1;
  return {
    id: `#${String(4100 + i)}`,
    customer: { name: who, email: `${who.split(' ')[0].toLowerCase()}@example.com` },
    product: ORDER_PRODUCTS[(i * 3) % ORDER_PRODUCTS.length],
    qty,
    total: Math.round(qty * (19 + ((i * 37) % 160)) * 100) / 100,
    status: ORDER_STATUSES[(i * 11) % 7 < 4 ? 0 : (i * 11) % 7 - 3] as (typeof ORDER_STATUSES)[number],
    region: ORDER_REGIONS[(i * 5) % 3],
    placed: `2026-${String(1 + ((i * 13) % 11)).padStart(2, '0')}-${String(1 + ((i * 17) % 28)).padStart(2, '0')}`,
  };
});
export type Order = (typeof ORDERS)[number];

/** Your own cells: a person with their email, a status badge. Any component goes in a cell. */
const BuyerCell = ({ row }: { row: Order }) => (
  <span className="dx-buyer">
    <Avatar name={row.customer.name} size="sm" />
    <span>
      <strong>{row.customer.name}</strong>
      <small>{row.customer.email}</small>
    </span>
  </span>
);
const ORDER_COLUMNS = [
  { key: 'id', width: 96, pinned: 'start' as const },
  { key: 'customer.name', header: 'Customer', width: 230, cell: ({ row }: { row: Order }) => <BuyerCell row={row} /> },
  { key: 'product', width: 160 },
  { key: 'qty', header: 'Qty', type: 'number' as const, width: 90, editable: true, validate: (v: unknown) => (Number(v) < 1 ? 'At least one' : undefined), aggregate: 'sum' as const },
  { key: 'total', type: 'number' as const, width: 120, format: { style: 'currency', currency: 'USD' }, aggregate: 'sum' as const },
  { key: 'status', type: 'enum' as const, options: [...ORDER_STATUSES], width: 130, editable: true, cell: ({ value }: { value: unknown }) => <Badge label={String(value)} tone={STATUS_TONE[value as keyof typeof STATUS_TONE]} /> },
  { key: 'region', type: 'enum' as const, width: 140 },
  { key: 'placed', type: 'date' as const, width: 130 },
];
const ORDER_COLUMNS_CODE = `[
  { key: 'id', width: 96, pinned: 'start' },
  { key: 'customer.name', header: 'Customer', cell: ({ row }) => <Buyer person={row.customer} /> },
  'product',
  { key: 'qty', type: 'number', editable: true, validate: (v) => (v < 1 ? 'At least one' : undefined), aggregate: 'sum' },
  { key: 'total', type: 'number', format: { style: 'currency', currency: 'USD' }, aggregate: 'sum' },
  { key: 'status', type: 'enum', options: ['paid', 'pending', 'refunded', 'failed'], editable: true, cell: ({ value }) => <Badge label={value} tone={tones[value]} /> },
  { key: 'region', type: 'enum' },
  { key: 'placed', type: 'date' },
]`;

/** Orders you can edit in place: the grid reports the edit, your state keeps it. */
function OrdersGrid({ Preset, props }: { Preset: React.ElementType; props: Record<string, any> }) {
  const [rows, setRows] = React.useState(ORDERS);
  const { _reorder, ...rest } = props;
  return (
    <Preset
      {...rest}
      rows={rows}
      // Reordering is set in the preset; the page says so through `_reorder`.
      onRowReorder={_reorder ? ({ rows: next }: { rows: Order[] }) => setRows(next) : undefined}
      onCellEdit={({ rowKey, key, value }: { rowKey: string; key: keyof Order; value: unknown }) => setRows((all) => all.map((r) => (r.id === rowKey ? { ...r, [key]: value } : r)))}
      renderDetail={(o: Order) => (
        <div className="dx-order-detail">
          <span>{o.qty} × {o.product}</span>
          <span>Ships to {o.region}</span>
          <span>{o.customer.email}</span>
        </div>
      )}
    />
  );
}

const EVENT_TYPES = ['page_view', 'sign_in', 'purchase', 'search', 'share', 'sign_out'];
/** A pretend server holding a billion events: any block, at once, made from its position. */
function eventAt(i: number) {
  const t = Date.UTC(2026, 0, 1) + i * 37_000;
  return { id: i + 1, time: new Date(t).toISOString(), type: EVENT_TYPES[(i * 7) % EVENT_TYPES.length], user: `user${(i * 7919) % 99991}@example.com`, latency: 20 + ((i * 131) % 480) };
}
const BILLION = 1_000_000_000;
const EVENTS_SOURCE = {
  rowCount: BILLION,
  getRows: ({ start, end, sort, signal }: { start: number; end: number; sort: Array<{ key: string; direction: string }>; signal: AbortSignal }) =>
    new Promise<object[]>((resolve) => {
      // A short wait stands in for the network; a request scrolled past is aborted.
      const timer = setTimeout(() => {
        const desc = sort[0]?.key === 'id' && sort[0].direction === 'descending';
        resolve(Array.from({ length: end - start }, (_, n) => eventAt(desc ? BILLION - 1 - (start + n) : start + n)));
      }, 120);
      signal.addEventListener('abort', () => clearTimeout(timer));
    }),
};

/** A directory: search filters the rows, boxes feed a bulk bar, a row opens its details. */
function Directory({ Preset, props }: { Preset: React.ElementType; props: Record<string, any> }) {
  const { _kind, _choose, loading: _printed, ...rest } = props;
  const [query, setQuery] = React.useState('');
  const [chosen, setChosen] = React.useState<string[]>([]);
  const [open, setOpen] = React.useState<Person | null>(null);
  const [page, setPage] = React.useState(1);
  const [sort, setSort] = React.useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null);
  const [fetching, setFetching] = React.useState(false);
  const [served, setServed] = React.useState(() => TEAM.slice(0, 8));
  const found = TEAM.filter((p) => `${p.name} ${p.role}`.toLowerCase().includes(query.trim().toLowerCase()));
  // The "server": sorts and pages after a short wait. Keyed on what is on screen, so a remount never refetches.
  const loaded = React.useRef('1/null');
  React.useEffect(() => {
    if (_kind !== 'server') return;
    const key = `${page}/${sort ? sort.key + sort.direction : 'null'}`;
    if (key === loaded.current) return;
    setFetching(true);
    const timer = setTimeout(() => {
      const ordered = sort ? [...TEAM].sort((a, b) => String(a[sort.key as keyof Person]).localeCompare(String(b[sort.key as keyof Person]), undefined, { numeric: true }) * (sort.direction === 'ascending' ? 1 : -1)) : TEAM;
      loaded.current = key;
      setServed(ordered.slice((page - 1) * 8, page * 8));
      setFetching(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [_kind, page, sort]);
  const server = _kind === 'server';
  return (
    <div className="dx-stack">
      {server ? null : <Input label="Search people" hideLabel placeholder="Search by name or role" value={query} onChange={(v) => (setQuery(v), setPage(1))} />}
      {chosen.length ? (
        <div className="dx-panel__row dx-bulk">
          <span>{chosen.length} selected</span>
          <Button label="Message" size="sm" variant="soft" />
          <Button label="Clear" size="sm" variant="ghost" onClick={() => setChosen([])} />
        </div>
      ) : null}
      <Preset
        {...rest}
        rows={server ? served : found}
        {...(server ? { total: TEAM.length, manualSort: true, sort, onSortChange: (s: Array<NonNullable<typeof sort>>) => (setSort(s[0] ?? null), setPage(1)) } : null)}
        page={page}
        onPageChange={setPage}
        {...(_choose ? { selected: chosen, onSelectionChange: setChosen } : null)}
        onRowAction={(row: Person) => setOpen(row)}
        {...(fetching ? { loading: true } : null)}
      />
      {open ? (
        <Card title={open.name} description={`${open.role} · ${open.projects} shipments this month · joined ${open.joined}`} actions={[{ label: 'Close', onClick: () => setOpen(null) }]} />
      ) : null}
    </div>
  );
}

/** Examples drawn at a fixed height (a virtual body or a data source). */
const tallFor = (kind: string, virtual: boolean) => (kind === 'grid' && virtual) || kind === 'billion';

export function TablePlayground() {
  const page = usePage(tableMeta, ['size', 'tone'], { _kind: 'grid', _group: '', _detail: true, _toolbar: true });
  const kind = String(page.inputs._kind);
  const grid = kind === 'grid';
  const billion = kind === 'billion';
  const opts = page.options as Record<string, unknown>;
  const inactive = inactiveTableOptions({
    selection: opts.selection as string,
    pageSize: grid || kind === 'client' || kind === 'server' ? 8 : undefined,
    virtual: !!opts.virtual,
    dataSource: billion ? {} : undefined,
    sortable: !!opts.sortable || !grid,
    filterable: !!opts.filterable,
    renderDetail: grid && page.inputs._detail ? () => null : undefined,
    reorderableRows: !!opts.reorderableRows,
    // The orders grid saves the new order; the other examples do not reorder.
    onRowReorder: grid ? () => {} : undefined,
    stickyHeader: !!opts.stickyHeader,
    dimensions: tallFor(kind, !!opts.virtual) ? { height: 520 } : undefined,
  });
  if (!grid) Object.assign(inactive, billion ? { virtual: 'a data source always scrolls virtually.' } : { sortable: 'set per column by this example.', virtual: 'this example pages its rows.', reorderableRows: 'the orders example reorders its rows; this one keeps the server\'s order.' });
  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));
  const choose = !!opts.selection && opts.selection !== 'none';
  const tall = (grid && !!opts.virtual) || billion;
  let spec: ExampleSpec;
  if (grid) {
    const use: Record<string, unknown> = {
      label: 'Orders',
      columns: src(ORDER_COLUMNS, ORDER_COLUMNS_CODE),
      rows: src(ORDERS, 'orders'),
      // A page size chosen above wins over the example's own.
      ...(opts.virtual ? { dimensions: { height: 520 } } : set.pageSize ? null : { pageSize: 8, pageSizes: [8, 25, 50] }),
      ...(opts.reorderableRows ? { onRowReorder: src(() => reportEvent('Called: setRows'), '({ rows }) => setOrders(rows)') } : null),
      _reorder: src(!!opts.reorderableRows, ''),
      ...(page.inputs._toolbar ? { toolbar: { search: true, columns: true, export: 'orders.csv' } } : null),
      ...(page.inputs._group ? { groupBy: String(page.inputs._group) } : null),
      onCellEdit: src(() => reportEvent('Called: ' + "({ rowKey, key, value }) => saveOrder(rowKey, { [key]: value })"), '({ rowKey, key, value }) => saveOrder(rowKey, { [key]: value })'),
      ...(page.inputs._detail ? { renderDetail: src(() => null, '(order) => <OrderDetail order={order} />') } : null),
    };
    spec = { name: 'Grid', preset: set, imports: ["import { Badge } from '@pinfold/react/badge';"], tree: [{ app: OrdersGrid, use, code: ['$TAG'] }] };
  } else if (billion) {
    spec = {
      name: 'Grid',
      preset: set,
      body: ['// Your API: rows start..end in the given order and filters. Aborted when scrolled past.', 'const events = { rowCount: 1_000_000_000, getRows: ({ start, end, sort, filters, signal }) => api.events({ start, end, sort, filters }, { signal }) };'],
      tree: [
        {
          use: { label: 'Events', dataSource: src(EVENTS_SOURCE, 'events'), columns: ['id', 'time', 'type', 'user', { key: 'latency', type: 'number', format: { style: 'unit', unit: 'millisecond' } }], dimensions: { height: 520 } },
          code: ['$TAG'],
        },
      ],
    };
  } else {
    const columns = [
      { key: 'name', sortable: true },
      { key: 'role', sortable: true },
      { key: 'projects', header: 'Shipments', align: 'end', sortable: true },
      { key: 'joined', header: 'Joined', sortable: true },
    ];
    const use: Record<string, unknown> = { label: 'Team', columns, ...(set.pageSize ? null : { pageSize: 8 }), _kind: src(kind, ''), _choose: src(choose, '') };
    spec =
      kind === 'server'
        ? {
            name: 'Grid',
            imports: ["import type { TableSort } from '@pinfold/react/table';"],
            preset: set,
            body: [
              'const [page, setPage] = useState(1);',
              'const [sort, setSort] = useState<TableSort[]>([]);',
              "const { data, isFetching } = useQuery({ queryKey: ['team', page, sort], queryFn: () => fetchTeam({ page, sort }), placeholderData: keepPreviousData });",
            ],
            tree: [{ app: Directory, use: { ...use, rows: src([], 'data.rows'), total: src(TEAM.length, 'data.total'), manualSort: true, sort: src(null, 'sort'), onSortChange: src(() => reportEvent('Called: ' + "setSort"), 'setSort'), page: src(1, 'page'), onPageChange: src(() => reportEvent('Called: ' + "setPage"), 'setPage'), loading: src(false, 'isFetching') }, code: ['$TAG'] }],
          }
        : {
            name: 'Grid',
            preset: set,
            body: ["const [query, setQuery] = useState('');", 'const [chosen, setChosen] = useState<string[]>([]);', 'const rows = team.filter((p) => matches(p, query));'],
            tree: [
              {
                app: Directory,
                use: { ...use, rows: src(TEAM, 'rows'), ...(choose ? { selected: src([], 'chosen'), onSelectionChange: src(() => reportEvent('Called: ' + "setChosen"), 'setChosen') } : null), onRowAction: src(() => reportEvent('Called: ' + "(person) => openProfile(person)"), '(person) => openProfile(person)') },
                code: ['<Search value={query} onChange={setQuery} />', ...(choose ? ['{chosen.length > 0 && <BulkBar count={chosen.length} />}'] : []), '$TAG'],
              },
            ],
          };
  }
  const notes: Record<string, string> = {
    grid: 'Turn on sortable, filterable, resizable or reorderable columns above. Shift + click a second header sorts by both. Double-click a quantity or a status to edit it; Enter saves. The first column stays pinned while the rest scrolls sideways; the Columns menu hides or pins any column; group by status or region for folding groups with totals.',
    billion: 'A billion rows, one block of 100 at a time from a (simulated) server: only the rows in view exist, the scrollbar still covers them all, and the wheel moves row by row. Sort by Id to ask the server for the other order.',
    server: 'The (simulated) server sorts and pages: manualSort and total. While it answers, the rows stay and the table is busy.',
    client: 'Search filters the rows; headers sort (again to reverse, a third time to clear); boxes feed the bar above; a row opens its details.',
  };
  return (
    <Page
      examples={{ name: '_kind', options: [ ['grid', 'orders: every grid feature'], ['billion', 'a billion rows from a server'], ['client', 'a directory you search and choose from'], ['server', 'a server that sorts and pages'], ] }}
      wide
      meta={tableMeta}
      page={page}
      define={defineTable}
      spec={spec}
      inactive={inactive}
      inherit={['size', 'tone']}
      provider
      align="start"
      file="components/orders"
      frame={tall ? (live) => <div className="dx-grid-demo">{live}</div> : undefined}
      note={notes[kind]}
      demo={
        <>
          
          {grid ? (
            <>
              <Choice page={page} name="_group" label="group by" options={[['', 'nothing'], ['status', 'status'], ['region', 'region']]} />
              <Toggle page={page} name="_detail" label="details under a row" />
              <Toggle page={page} name="_toolbar" label="toolbar (search, columns, CSV)" />
            </>
          ) : null}
        </>
      }
    />
  );
}
