import * as React from 'react';
import type { ComponentMeta } from '@pinfold/core/meta';
import { Accordion } from '@pinfold/react/accordion';
import { Avatar } from '@pinfold/react/avatar';
import { Badge } from '@pinfold/react/badge';
import { Calendar } from '@pinfold/react/calendar';
import { Combobox } from '@pinfold/react/combobox';
import { Select } from '@pinfold/react/select';
import { Tabs } from '@pinfold/react/tabs';
import { Tags } from '@pinfold/react/tags';
import { PEOPLE } from './people';

/**
 * "Make it yours": every component's parts, and a live example of a part drawn by your own
 * component. The library keeps the behaviour (keys, ARIA, focus); you draw what it looks like.
 */

const TEAM = PEOPLE.slice(0, 5).map((p, i) => ({ value: `u${i}`, label: p.name, photo: p.photo, role: ['Design', 'Engineering', 'Research', 'Product', 'Support'][i] }));

function PersonOption({ name, photo, role, selected }: { name: React.ReactNode; photo?: string; role?: React.ReactNode; selected?: boolean }) {
  return (
    <span className="dx-custom-person">
      <Avatar name={String(name)} src={photo} size="sm" />
      <span>
        <strong>{name}</strong>
        <small>{role}</small>
      </span>
      {selected ? <Badge label="On the team" tone="success" size="sm" /> : null}
    </span>
  );
}

interface CustomDemo {
  code: string;
  Demo: () => React.ReactElement;
}

const DEMOS: Record<string, CustomDemo> = {
  accordion: {
    code: `useAccordion({
  items: tickets.map((t) => ({
    id: t.id,
    // Any node is a title: your own component.
    title: <TicketHeader ticket={t} />,
    content: <TicketThread ticket={t} />,
  })),
  // Or replace a part, keeping its behaviour props.
  render: {
    indicator: ({ props, state }) => <span {...props}>{state.open ? 'Hide' : 'Show'}</span>,
  },
});`,
    Demo: () => (
      <Accordion
        variant="separated"
        items={TEAM.slice(0, 3).map((p, i) => ({
          id: p.value,
          title: <PersonOption name={p.label} photo={p.photo} role={`${p.role} · ${3 + i} open tickets`} />,
          content: `${p.label} answers within a day. Tickets are sorted by age.`,
        }))}
        render={{ indicator: ({ props, state }) => <span {...props} className="dx-custom-toggle">{state.open ? 'Hide' : 'Show'}</span> }}
      />
    ),
  },
  select: {
    code: `useSelect({
  label: 'Assignee',
  items: people.map((p) => ({ value: p.id, label: p.name })),
  // Each option is drawn by your component; item has the row and its live state.
  render: {
    option: ({ props, item }) => (
      <div {...props}>
        <PersonOption name={item.label} photo={photos[item.value]} selected={item.selected} />
      </div>
    ),
  },
});`,
    Demo: () => (
      <Select
        label="Assignee"
        items={TEAM}
        defaultValue="u1"
        defaultOpen
        render={{ option: ({ props, item }) => <div {...props}><PersonOption name={item?.label} photo={TEAM.find((t) => t.value === item?.value)?.photo} role={TEAM.find((t) => t.value === item?.value)?.role} selected={item?.selected} /></div> }}
      />
    ),
  },
  combobox: {
    code: `useCombobox({
  label: 'Reviewers',
  multiple: true,
  items: people,
  // Chips drawn by you; item.remove takes the value out.
  render: {
    chip: ({ item }) => <PersonChip person={item} onRemove={item.remove} />,
  },
});`,
    Demo: () => (
      <Combobox
        label="Reviewers"
        multiple
        items={TEAM}
        defaultValue={['u0', 'u2']}
        render={{
          chip: ({ props, item }) =>
            item ? (
              <span {...props} className="dx-custom-chip">
                <Avatar name={String(item.label)} src={TEAM.find((t) => t.value === item.value)?.photo} size="sm" />
                {item.label}
                <button type="button" aria-label={`Remove ${item.text}`} onClick={item.remove}>
                  ×
                </button>
              </span>
            ) : (
              <span {...props} />
            ),
        }}
      />
    ),
  },
  tabs: {
    code: `useTabs({
  label: 'Inbox',
  items: folders,
  render: {
    tab: ({ props, item, children }) => (
      <button {...props}>
        {children}
        <Badge label={String(unread[item.id])} tone={item.selected ? 'primary' : 'neutral'} />
      </button>
    ),
  },
});`,
    Demo: () => {
      const unread: Record<string, number> = { Inbox: 12, Mentions: 3, Archive: 0 };
      return (
        <Tabs
          label="Inbox"
          items={['Inbox', 'Mentions', 'Archive']}
          render={{
            tab: ({ props, item, children }) => (
              <button {...props}>
                {children}
                {unread[String(item?.id)] ? <Badge label={String(unread[String(item?.id)])} tone={item?.selected ? 'primary' : 'neutral'} size="sm" /> : null}
              </button>
            ),
          }}
        />
      );
    },
  },
  tags: {
    code: `useTags({
  label: 'Labels',
  items: labels,
  onRemove: removeLabel,
  render: {
    tag: ({ props, item, children }) => (
      <li {...props}><span style={{ background: colours[item.value] }} className="dot" />{children}</li>
    ),
  },
});`,
    Demo: () => {
      const colours: Record<string, string> = { Bug: 'oklch(0.62 0.2 25)', Feature: 'oklch(0.6 0.15 150)', Docs: 'oklch(0.6 0.14 250)' };
      const [items, setItems] = React.useState(['Bug', 'Feature', 'Docs']);
      return (
        <Tags
          label="Labels"
          items={items}
          onRemove={(v) => setItems((x) => x.filter((y) => y !== v))}
          render={{ tag: ({ props, item, children }) => <li {...props}><span className="dx-custom-dot" style={{ background: colours[String(item?.value)] }} />{children}</li> }}
        />
      );
    },
  },
  calendar: {
    code: `useCalendar({
  mode: 'range',
  // Under each day: your content (a price, a dot).
  dayContent: (date) => price(date),
  // Or draw the whole day: item has the date and its state.
  render: {
    day: ({ props, item }) => <button {...props}>{item.today ? '★' : Number(item.date.slice(8))}</button>,
  },
});`,
    Demo: () => <Calendar mode="range" defaultMonth="2026-11-01" defaultValue={{ start: '2026-11-12', end: '2026-11-15' }} dayContent={(d) => `$${90 + ((Number(d.slice(8)) * 37) % 80)}`} />,
  },
};

/** The parts of a component and how to swap any of them for your own. */
export function MakeItYours({ meta, Code }: { meta: ComponentMeta; Code: (p: { label: string; code: string; tone: 'muted' | 'accent' }) => React.ReactElement }): React.ReactElement {
  const demo = DEMOS[meta.name];
  const name = meta.name.charAt(0).toUpperCase() + meta.name.slice(1);
  const part = meta.slots.find((s) => !['root', 'label', 'description', 'error'].includes(s)) ?? 'root';
  const generic = `use${meta.displayName.replace(/\s+/g, '')}({
  // ...your config
  classNames: { ${part}: 'my-${part}' },              // add a class
  styles: { ${part}: { letterSpacing: '0.02em' } },  // inline style
  slotProps: { ${part}: { 'data-test': '${meta.name}-${part}' } },  // any DOM prop
  // Draw it yourself: spread props (ARIA, handlers, refs), then render anything.
  // Parts that repeat (rows, options, tabs, days...) also get item: their data and state.
  render: { ${part}: ({ props, state, item, children }) => <My${name}Part {...props}>{children}</My${name}Part> },
});`;
  return (
    <div className="dx-custom">
      <div className="dx-custom__parts" aria-label="Parts you can style or replace">
        {meta.slots.map((s) => (
          <code key={s}>{s}</code>
        ))}
      </div>
      {demo ? (
        <div className="dx-custom__demo">
          <div className="dx-custom__stage">
            <demo.Demo />
          </div>
          <Code label="Your component in a part" tone="accent" code={demo.code} />
        </div>
      ) : null}
      <Code label="Every part, four ways" tone="muted" code={generic} />
    </div>
  );
}
