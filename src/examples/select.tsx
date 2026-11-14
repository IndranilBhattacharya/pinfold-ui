import * as React from 'react';
import { selectMeta } from '@pinfold/core/meta';
import { inactiveSelectOptions } from '@pinfold/core';
import { defineSelect } from '@pinfold/react/select';
import { changed } from '../playground/shared';
import { src, type ExampleSpec } from '../playground/example';
import { Choice, Page, usePage } from '../playground/kit';
import { KEEP_NOTE } from './overlays';
import { reportEvent } from '../playground/preview-mode';

/** The select page. */

const PLANS = [
  { value: 'free', label: 'Free', description: '1 project', group: 'Personal', price: 0 },
  { value: 'pro', label: 'Pro', description: 'Unlimited projects', group: 'Personal', price: 12 },
  { value: 'team', label: 'Team', description: 'Up to 25 seats', group: 'Business', price: 48 },
  { value: 'enterprise', label: 'Enterprise', description: 'Talk to us', group: 'Business', price: -1, disabled: true },
];
const REGIONS = ['Frankfurt', 'Mumbai', 'Oregon', 'São Paulo', 'Singapore', 'Sydney', 'Tokyo', 'Virginia'];
const LABELS = ['bug', 'design', 'docs', 'feature', 'performance', 'security'];

/** A project form: the select's value drives the summary under it. */
function ProjectForm({ Preset, props }: { Preset: React.ElementType; props: Record<string, any> }) {
  const { _kind, ...rest } = props;
  const [plan, setPlan] = React.useState<string | null>('pro');
  const [labels, setLabels] = React.useState<string[]>(['bug', 'docs']);
  const [region, setRegion] = React.useState<string | null>('Tokyo');
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

export function SelectPlayground() {
  const page = usePage(selectMeta, ['size', 'tone'], { _kind: 'groups' });
  const kind = String(page.inputs._kind);
  const inactive = inactiveSelectOptions({ multiple: kind === 'multiple' });
  const set = Object.fromEntries(changed(page.options, page.defaults, { ...inactive, multiple: 'set by the example' }));
  const shapes: Record<string, { body: string[]; use: Record<string, unknown>; code: string[] }> = {
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
  };
  const shape = shapes[kind];
  const spec: ExampleSpec = { name: 'Field', preset: set, body: shape.body, tree: [{ app: ProjectForm, use: { ...shape.use, _kind: src(kind, '') }, code: shape.code }], openOnLoad: true };
  return (
    <Page
      examples={{ name: '_kind', options: [['groups', 'a plan: groups and descriptions'], ['strings', 'a region: rows from strings'], ['multiple', 'labels: several values']] }}
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
