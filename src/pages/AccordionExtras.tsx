import * as React from 'react';
import { resolveNode } from '@pinfold/core';
import { useAccordion, type AccordionConfig, type AccordionVariant } from '@pinfold/react/accordion';
import { defineButton } from '@pinfold/react/button';
import { Section } from './parts';

const Ghost = defineButton({ variant: 'ghost', size: 'sm' });


const FAQ = [
  { id: 'what', title: 'What actually ships in the bundle?', description: 'Core is ~3 kB gzipped', content: 'Each component is its own subpath with its own CSS file, so importing the accordion never pulls in anything else.', badge: 'Core' },
  { id: 'config', title: 'Why configuration instead of JSX?', content: 'A twelve-row accordion is 12 lines of data, not 60 lines of nested markup. Data is diffable, serialisable, storable in a CMS, and an LLM can emit it reliably.', badge: 'Design' },
  { id: 'escape', title: 'What if I need to change one tiny part?', content: 'Every slot takes classNames, slotProps and render. Below that, useAccordion() hands you the same state and prop getters with no markup at all.' },
  { id: 'a11y', title: 'How accessible is it, really?', content: 'Buttons inside real headings, aria-expanded and aria-controls, labelled regions, roving focus, aria-disabled, and prefers-reduced-motion honoured.', badge: 'WCAG 2.2 AA' },
];

export function AccordionExtras() {
  return (
    <>
      <Section id="variants" title="Variants" lede="Five surface treatments. Every combination is a valid, accessible accordion.">
        <div className="dx-grid">
          {(['solid', 'outline', 'separated', 'filled', 'ghost'] as const).map((variant) => (
            <figure key={variant} className="dx-card">
              <figcaption>{variant}</figcaption>
              <Demo variant={variant} items={FAQ.slice(0, 3)} defaultValue={['what']} indicator={variant === 'filled' ? 'plus' : 'chevron'} />
            </figure>
          ))}
          <figure className="dx-card">
            <figcaption>dimensions — nothing about size is locked</figcaption>
            <Demo variant="outline" items={FAQ.slice(0, 3)} defaultValue={['what']} dimensions={{ paddingX: 24, paddingY: 18, gap: 14, radius: 20, fontSize: 15, indicatorSize: 20 }} />
          </figure>
        </div>
      </Section>
      <Section id="headless" title="Headless" lede="Same state, zero markup. useAccordion() returns prop getters that carry every ARIA attribute.">
        <HeadlessDemo />
      </Section>
    </>
  );
}

function Demo(config: AccordionConfig & { variant?: AccordionVariant }) {
  return useAccordion(config).render();
}

/** Proves the hook is genuinely markup-free: this renders a definition list. */
function HeadlessDemo() {
  const api = useAccordion({ items: FAQ.slice(0, 3), mode: 'multiple', defaultValue: ['what'] });
  return (
    <div className="dx-split">
      <dl {...api.getRootProps({ className: 'dx-dl' })}>
        {api.items.map((item) => (
          <div key={item.id} {...api.getItemProps(item)}>
            <dt {...api.getHeaderProps(item, { className: 'dx-dt' })}>
              <button {...api.getTriggerProps(item, { className: 'dx-dt__btn' })}>
                <span>{item.open ? '−' : '+'}</span> {resolveNode(item.config.title, item)}
              </button>
            </dt>
            <dd {...api.getPanelProps(item, { className: 'dx-dd' })} hidden={!item.open}>
              {resolveNode(item.config.content, item)}
            </dd>
          </div>
        ))}
      </dl>
      <div className="dx-state">
        <div className="dx-state__row">
          <Ghost label="openAll()" variant="soft" onClick={api.openAll} />
          <Ghost label="closeAll()" variant="soft" onClick={api.closeAll} />
        </div>
        <pre>
          <code>{JSON.stringify({ value: api.value }, null, 2)}</code>
        </pre>
      </div>
    </div>
  );
}
