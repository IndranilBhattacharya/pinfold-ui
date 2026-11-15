import * as React from 'react';
import { selectMeta } from '@pinfold/core/meta';
import { inactiveSelectOptions } from '@pinfold/core';
import { Button } from '@pinfold/react/button';
import { defineSelect, type SelectListContext } from '@pinfold/react/select';
import { changed } from '../playground/shared';
import { src, type ExampleSpec } from '../playground/example';
import { Page, usePage } from '../playground/kit';
import { KEEP_NOTE } from './overlays';
import { reportEvent } from '../playground/preview-mode';
import { CUSTOMERS, type Customer } from '../demo/harbor';

/** The select page. */

const PLANS = [
  { value: 'free', label: 'Free', description: '1 project', group: 'Personal', price: 0 },
  { value: 'pro', label: 'Pro', description: 'Unlimited projects', group: 'Personal', price: 12 },
  { value: 'team', label: 'Team', description: 'Up to 25 seats', group: 'Business', price: 48 },
  { value: 'enterprise', label: 'Enterprise', description: 'Talk to us', group: 'Business', price: -1, disabled: true },
];
const REGIONS = ['Frankfurt', 'Mumbai', 'Oregon', 'São Paulo', 'Singapore', 'Sydney', 'Tokyo', 'Virginia'];
const LABELS = ['bug', 'design', 'docs', 'feature', 'performance', 'security'];

export const SWATCH_ITEMS = [
  { value: 'success', label: 'Success', color: 'var(--pinfold-color-success)' },
  { value: 'warning', label: 'Warning', color: 'var(--pinfold-color-warning)' },
  { value: 'danger', label: 'Danger', color: 'var(--pinfold-color-danger)' },
  { value: 'info', label: 'Info', color: 'var(--pinfold-color-info)' },
  { value: 'accent', label: 'Accent', color: 'var(--pinfold-color-accent)' },
];

export const CUSTOMER_ITEMS = CUSTOMERS.map((c) => ({
  value: c.id,
  label: c.name,
  description: `${c.plan} · ${c.city}`,
  data: c,
}));

/** A project form: the select's value drives the summary under it. */
function ProjectForm({ Preset, props }: { Preset: React.ElementType; props: Record<string, unknown> }) {
  const { _kind, ...rest } = props;
  const [plan, setPlan] = React.useState<string | null>('pro');
  const [labels, setLabels] = React.useState<string[]>(['bug', 'docs']);
  const [region, setRegion] = React.useState<string | null>('Tokyo');
  const [customer, setCustomer] = React.useState<string | null>('c1');
  const [tone, setTone] = React.useState<string | null>('accent');

  if (_kind === 'multiple')
    return (
      <div className="dx-stack">
        <Preset {...rest} value={labels} onChange={setLabels} />
        <p className="dx-panel__lead">{labels.length ? `Issues labelled ${labels.join(', ')} go to this board.` : 'No labels: every issue goes to this board.'}</p>
      </div>
    );
  if (_kind === 'strings')
    return (
      <div className="dx-stack">
        <Preset {...rest} value={region} onChange={setRegion} />
        <p className="dx-panel__lead">{region ? `Data stays in ${region}.` : 'Pick where your data lives.'}</p>
      </div>
    );
  if (_kind === 'table') {
    const chosenCust = CUSTOMERS.find((c) => c.id === customer);
    return (
      <div className="dx-stack">
        <Preset {...rest} value={customer} onChange={setCustomer} />
        <p className="dx-panel__lead">{chosenCust ? `Selected: ${chosenCust.name} (${chosenCust.plan} · ${chosenCust.city}).` : 'Pick a customer from the grid table.'}</p>
      </div>
    );
  }
  if (_kind === 'swatches')
    return (
      <div className="dx-stack">
        <Preset {...rest} value={tone} onChange={setTone} />
        <p className="dx-panel__lead">{tone ? `Tone ${tone} selected for brand assets.` : 'Select a brand tone swatch.'}</p>
      </div>
    );
  if (_kind === 'footer') {
    const chosenCust = CUSTOMERS.find((c) => c.id === customer);
    return (
      <div className="dx-stack">
        <Preset {...rest} value={customer} onChange={setCustomer} />
        <p className="dx-panel__lead">{chosenCust ? `Current customer: ${chosenCust.name}.` : 'Select or create a customer account.'}</p>
      </div>
    );
  }
  const chosen = PLANS.find((p) => p.value === plan);
  return (
    <div className="dx-stack">
      <Preset {...rest} value={plan} onChange={setPlan} />
      <ul className="dx-lines">
        <li><span>Plan</span><span>{chosen?.label ?? '—'}</span></li>
        <li className="dx-lines__total"><span>Billed monthly</span><span>{chosen ? `$${chosen.price}.00` : '—'}</span></li>
      </ul>
    </div>
  );
}

const renderCustomerTable = (ctx: SelectListContext) => (
  <div role="grid" style={{ minWidth: '24rem', padding: '0.25rem' }}>
    <div role="row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '0.375rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--pinfold-color-text-muted)', borderBottom: '1px solid var(--pinfold-color-border)' }}>
      <div role="columnheader">Customer</div>
      <div role="columnheader">Plan</div>
      <div role="columnheader">City</div>
    </div>
    {ctx.items.map((item) => {
      const c = (item.data as unknown as Customer) || CUSTOMERS.find((x) => x.id === item.value);
      const rowProps = ctx.getRowProps(item.value);
      return (
        <div key={item.value} {...rowProps} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '0.375rem 0.5rem', borderRadius: 'var(--pinfold-radius-sm)', cursor: 'pointer', alignItems: 'center', fontSize: '0.8125rem' }}>
          <div role="gridcell" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</div>
          <div role="gridcell" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c?.plan}</div>
          <div role="gridcell" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c?.city}</div>
        </div>
      );
    })}
  </div>
);

const renderSwatches = (ctx: SelectListContext) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.375rem', padding: '0.5rem', minWidth: '16rem' }}>
    {ctx.items.map((item) => {
      const itemProps = ctx.getRowProps(item.value);
      const swatch = SWATCH_ITEMS.find((s) => s.value === item.value);
      return (
        <div key={item.value} {...itemProps} aria-label={item.label ? String(item.label) : undefined} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.5rem', borderRadius: 'var(--pinfold-radius-sm)', cursor: 'pointer', fontSize: '0.8125rem' }}>
          <span style={{ width: '0.75rem', height: '0.75rem', borderRadius: '9999px', background: swatch?.color, flexShrink: 0 }} />
          <span>{item.label}</span>
        </div>
      );
    })}
  </div>
);

const createCustomer = () => {
  reportEvent('Created customer');
};

const renderWithFooter = (ctx: SelectListContext) => (
  <div style={{ display: 'flex', flexDirection: 'column' }}>
    <div style={{ maxHeight: '14rem', overflowY: 'auto' }}>
      {ctx.items.map((item) => {
        const itemProps = ctx.getRowProps(item.value);
        return (
          <div key={item.value} {...itemProps} style={{ padding: '0.375rem 0.5rem', borderRadius: 'var(--pinfold-radius-sm)', cursor: 'pointer', fontSize: '0.8125rem' }}>
            {item.label}
          </div>
        );
      })}
    </div>
    <div style={{ padding: '0.375rem 0.5rem', borderTop: '1px solid var(--pinfold-color-border)' }}>
      <Button
        label="+ Create new customer…"
        variant="ghost"
        size="sm"
        style={{ width: '100%', justifyContent: 'flex-start' }}
        onClick={() => {
          ctx.close();
          createCustomer();
        }}
      />
    </div>
  </div>
);

export function SelectPlayground() {
  const page = usePage(selectMeta, ['size', 'tone'], { _kind: 'groups' });
  const kind = String(page.inputs._kind);
  const isCustomList = kind === 'table' || kind === 'swatches' || kind === 'footer';
  const inactive = inactiveSelectOptions({ multiple: kind === 'multiple', renderList: isCustomList ? true : undefined });
  const set = Object.fromEntries(changed(page.options, page.defaults, { ...inactive, multiple: 'set by the example above.' }));

  const shapes: Record<string, { body: string[]; imports?: string[]; use: Record<string, unknown>; code: string[] }> = {
    groups: {
      body: ["const [plan, setPlan] = useState<string | null>('pro');"],
      use: { label: 'Plan', items: PLANS.map(({ price, ...p }) => p), value: src('pro', 'plan'), onChange: src(() => reportEvent('Called: ' + "setPlan"), 'setPlan') },
      code: ['$TAG', '<PlanSummary plan={plan} />'],
    },
    strings: {
      body: ["const [region, setRegion] = useState<string | null>('Tokyo');"],
      use: { label: 'Region', description: 'Where your data lives.', items: REGIONS, value: src('Tokyo', 'region'), onChange: src(() => reportEvent('Called: ' + "setRegion"), 'setRegion') },
      code: ['$TAG'],
    },
    multiple: {
      body: ["const [labels, setLabels] = useState(['bug', 'docs']);"],
      use: { label: 'Labels', multiple: true, name: 'labels', items: LABELS, value: src(['bug', 'docs'], 'labels'), onChange: src(() => reportEvent('Called: ' + "setLabels"), 'setLabels') },
      code: ['$TAG'],
    },
    table: {
      imports: ["import { type SelectListContext } from '@pinfold/react/select';"],
      body: [
        "const [customer, setCustomer] = useState<string | null>('c1');",
        "const customers = " + JSON.stringify(CUSTOMERS.map((c) => ({ value: c.id, label: c.name, plan: c.plan, city: c.city })), null, 2) + ";",
        "const renderCustomerTable = (ctx: SelectListContext) => (",
        "  <div role=\"grid\" style={{ minWidth: '24rem', padding: '0.25rem' }}>",
        "    <div role=\"row\" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '0.375rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--pinfold-color-text-muted)', borderBottom: '1px solid var(--pinfold-color-border)' }}>",
        "      <div role=\"columnheader\">Customer</div>",
        "      <div role=\"columnheader\">Plan</div>",
        "      <div role=\"columnheader\">City</div>",
        "    </div>",
        "    {ctx.items.map((item) => {",
        "      const props = ctx.getRowProps(item.value);",
        "      const c = customers.find((x) => x.value === item.value);",
        "      return (",
        "        <div key={item.value} {...props} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '0.375rem 0.5rem', borderRadius: 'var(--pinfold-radius-sm)', cursor: 'pointer', alignItems: 'center', fontSize: '0.8125rem' }}>",
        "          <div role=\"gridcell\" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</div>",
        "          <div role=\"gridcell\" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c?.plan}</div>",
        "          <div role=\"gridcell\" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c?.city}</div>",
        "        </div>",
        "      );",
        "    })}",
        "  </div>",
        ");",
      ],
      use: {
        label: 'Customer',
        items: src(CUSTOMER_ITEMS, 'customers'),
        popupRole: 'grid',
        renderList: src(renderCustomerTable, 'renderCustomerTable'),
        value: src('c1', 'customer'),
        onChange: src(() => reportEvent('Called: ' + "setCustomer"), 'setCustomer'),
      },
      code: ['$TAG'],
    },
    swatches: {
      imports: ["import { type SelectListContext } from '@pinfold/react/select';"],
      body: [
        "const [tone, setTone] = useState<string | null>('accent');",
        "const swatches = " + JSON.stringify(SWATCH_ITEMS, null, 2) + ";",
        "const renderSwatches = (ctx: SelectListContext) => (",
        "  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.375rem', padding: '0.5rem', minWidth: '16rem' }}>",
        "    {ctx.items.map((item) => {",
        "      const props = ctx.getRowProps(item.value);",
        "      const swatch = swatches.find((s) => s.value === item.value);",
        "      return (",
        "        <div key={item.value} {...props} aria-label={item.label ? String(item.label) : undefined} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.5rem', borderRadius: 'var(--pinfold-radius-sm)', cursor: 'pointer', fontSize: '0.8125rem' }}>",
        "          <span style={{ width: '0.75rem', height: '0.75rem', borderRadius: '9999px', background: swatch?.color, flexShrink: 0 }} />",
        "          <span>{item.label}</span>",
        "        </div>",
        "      );",
        "    })}",
        "  </div>",
        ");",
      ],
      use: {
        label: 'Theme colour',
        items: src(SWATCH_ITEMS, 'swatches'),
        renderList: src(renderSwatches, 'renderSwatches'),
        value: src('accent', 'tone'),
        onChange: src(() => reportEvent('Called: ' + "setTone"), 'setTone'),
      },
      code: ['$TAG'],
    },
    footer: {
      imports: [
        "import { Button } from '@pinfold/react/button';",
        "import { type SelectListContext } from '@pinfold/react/select';",
      ],
      body: [
        "const [customer, setCustomer] = useState<string | null>('c1');",
        "const customers = " + JSON.stringify(CUSTOMERS.slice(0, 5).map((c) => ({ value: c.id, label: c.name })), null, 2) + ";",
        "const createCustomer = () => fetch('/api/customers', { method: 'POST' });",
        "const renderWithFooter = (ctx: SelectListContext) => (",
        "  <div style={{ display: 'flex', flexDirection: 'column' }}>",
        "    <div style={{ maxHeight: '14rem', overflowY: 'auto' }}>",
        "      {ctx.items.map((item) => {",
        "        const props = ctx.getRowProps(item.value);",
        "        return (",
        "          <div key={item.value} {...props} style={{ padding: '0.375rem 0.5rem', borderRadius: 'var(--pinfold-radius-sm)', cursor: 'pointer', fontSize: '0.8125rem' }}>",
        "            {item.label}",
        "          </div>",
        "        );",
        "      })}",
        "    </div>",
        "    <div style={{ padding: '0.375rem 0.5rem', borderTop: '1px solid var(--pinfold-color-border)' }}>",
        "      <Button label=\"+ Create new customer…\" variant=\"ghost\" size=\"sm\" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => { ctx.close(); createCustomer(); }} />",
        "    </div>",
        "  </div>",
        ");",
      ],
      use: {
        label: 'Customer account',
        items: src(CUSTOMERS.slice(0, 5).map((c) => ({ value: c.id, label: c.name })), 'customers'),
        renderList: src(renderWithFooter, 'renderWithFooter'),
        value: src('c1', 'customer'),
        onChange: src(() => reportEvent('Called: ' + "setCustomer"), 'setCustomer'),
      },
      code: ['$TAG'],
    },
  };

  const shape = shapes[kind];
  const spec: ExampleSpec = {
    name: 'Field',
    imports: shape.imports,
    preset: set,
    body: shape.body,
    tree: [{ app: ProjectForm, use: { ...shape.use, _kind: src(kind, '') }, code: shape.code }],
    openOnLoad: true,
  };

  return (
    <Page
      examples={{
        name: '_kind',
        options: [
          ['groups', 'a plan: groups and descriptions'],
          ['strings', 'a region: rows from strings'],
          ['multiple', 'labels: several values'],
          ['table', 'customer table'],
          ['swatches', 'colour swatches'],
          ['footer', 'create new'],
        ],
      }}
      meta={selectMeta}
      page={page}
      define={defineSelect}
      spec={spec}
      inactive={{ ...inactive, multiple: 'set by the example above.' }}
      inherit={['size', 'tone']}
      provider
      align="start"
      file="components/project-form"
      frame={(live) => <div className="dx-list-demo">{live}</div>}
      note={KEEP_NOTE + ' ' + 'Arrows, Home and End move past disabled rows; letters jump; Enter or Space chooses. A hidden native select submits and validates.'}
    />
  );
}
