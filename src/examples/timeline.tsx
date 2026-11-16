import * as React from 'react';
import { timelineMeta } from '@pinfold/core/meta';
import { inactiveTimelineOptions } from '@pinfold/core';
import { defineTimeline } from '@pinfold/react/timeline';
import { Button } from '@pinfold/react/button';
import { changed } from '../playground/shared';
import { src, type ExampleSpec } from '../playground/example';
import { Page, usePage } from '../playground/kit';

/** The timeline page. */

const STAGES = [
  { title: 'Ordered', description: 'Wool overshirt, canvas tote', time: '2026-11-02T10:15' },
  { title: 'Packed', time: '2026-11-03T16:40' },
  { title: 'Shipped', description: 'Tracking number PF-48213', time: '2026-11-04T09:30', tone: 'success' as const },
  { title: 'Out for delivery', time: '2026-11-06T07:55' },
  { title: 'Delivered', time: '2026-11-06T13:20', tone: 'success' as const },
];

/** An order you can move along: each step joins the history. */
function OrderTracking({ Preset, props }: { Preset: React.ElementType; props: Record<string, any> }) {
  const [step, setStep] = React.useState(3);
  const done = step >= STAGES.length;
  return (
    <div className="dx-stack">
      <Preset {...props} items={STAGES.slice(0, step)} pending={!done && props.pending} />
      <div className="dx-panel__row">
        <Button label={done ? 'Delivered' : `Mark "${STAGES[step].title}"`} size="sm" variant="soft" disabled={done} onClick={() => setStep((s) => s + 1)} />
        <Button label="Reset" size="sm" variant="ghost" onClick={() => setStep(1)} />
      </div>
    </div>
  );
}

export function TimelinePlayground() {
  const page = usePage(timelineMeta, ['size', 'tone'], {});
  const inactive = inactiveTimelineOptions(page.options);
  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));
  const spec: ExampleSpec = {
    name: 'History',
    preset: set,
    body: ['const events = order.events; // [{ title, time, description?, tone? }]'],
    tree: [{ app: OrderTracking, use: { label: 'Order history', locale: 'en-GB', items: src(STAGES.slice(0, 3), 'events') }, code: ['$TAG'] }],
  };
  return (
    <Page
      wide
      meta={timelineMeta}
      page={page}
      define={defineTimeline}
      spec={spec}
      inactive={inactive}
      inherit={['size', 'tone']}
      provider
      align="start"
      file="components/order-history"
      note="Times are ISO: shown in the locale (here en-GB), exact in <time datetime>. Mark the next step and the history grows."
    />
  );
}
