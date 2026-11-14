import * as React from 'react';
import { calendarMeta } from '@pinfold/core/meta';
import { inactiveCalendarOptions } from '@pinfold/core';
import { defineCalendar } from '@pinfold/react/calendar';
import { changed } from '../playground/shared';
import { src, type ExampleSpec } from '../playground/example';
import { Choice, Page, usePage } from '../playground/kit';

/** The calendar page. */

const BOOKED = new Set(['2026-11-13', '2026-11-14', '2026-11-27']);
const EVENTS: Record<string, string[]> = {
  '2026-11-09': ['Design review, 10:00', 'Lunch with Maya'],
  '2026-11-12': ['Release 0.17, 16:00'],
  '2026-11-18': ['Accessibility audit'],
  '2026-11-25': ['Quarterly planning', 'Team dinner'],
};
export const nights = (r: { start: string; end: string } | null) => (r ? Math.round((Date.parse(r.end) - Date.parse(r.start)) / 864e5) : 0);

/** A stay whose price follows the range; an agenda that follows the day; days that follow the picks. */
function CalendarDemo({ Preset, props }: { Preset: React.ElementType; props: Record<string, any> }) {
  const { _kind, ...rest } = props;
  const [stay, setStay] = React.useState<{ start: string; end: string } | null>({ start: '2026-11-18', end: '2026-11-21' });
  const [day, setDay] = React.useState('2026-11-09');
  const [days, setDays] = React.useState<string[]>(['2026-11-10', '2026-11-11', '2026-11-17']);
  if (_kind === 'range') {
    const n = nights(stay);
    return (
      <div className="dx-stack">
        <Preset {...rest} value={stay} onChange={setStay} />
        <ul className="dx-lines">
          <li><span>Stay</span><span>{stay ? `${stay.start} → ${stay.end}` : '—'}</span></li>
          <li className="dx-lines__total"><span>{n} night{n === 1 ? '' : 's'} × $140</span><span>${n * 140}</span></li>
        </ul>
      </div>
    );
  }
  if (_kind === 'multiple')
    return (
      <div className="dx-stack">
        <Preset {...rest} value={days} onChange={setDays} />
        <p className="dx-panel__lead">{days.length ? `Available on ${days.length} day${days.length === 1 ? '' : 's'}: ${days.join(', ')}.` : 'Pick the days you are free.'}</p>
      </div>
    );
  return (
    <div className="dx-stack">
      <Preset {...rest} value={day} onChange={setDay} />
      <ul className="dx-tasks">{(EVENTS[day] ?? ['Nothing planned.']).map((e) => <li key={e}>{e}</li>)}</ul>
    </div>
  );
}

export function CalendarPlayground() {
  const page = usePage(calendarMeta, ['size', 'tone'], { _kind: 'single' });
  const kind = String(page.inputs._kind);
  const inactive = { ...inactiveCalendarOptions(page.options), mode: 'set by the example above.' };
  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));
  const shapes: Record<string, { body: string[]; use: Record<string, unknown>; code: string[] }> = {
    single: {
      body: ["const [day, setDay] = useState('2026-11-09');"],
      use: { defaultMonth: '2026-11-01', value: src('2026-11-09', 'day'), onChange: src(() => {}, 'setDay') },
      code: ['$TAG', '<Agenda day={day} />'],
    },
    range: {
      body: ["const [stay, setStay] = useState({ start: '2026-11-18', end: '2026-11-21' });", "const booked = new Set(['2026-11-13', '2026-11-14', '2026-11-27']);"],
      use: { mode: 'range', defaultMonth: '2026-11-01', min: '2026-11-03', value: src(null, 'stay'), onChange: src(() => {}, 'setStay'), isDateDisabled: src((d: string) => BOOKED.has(d), '(d) => booked.has(d)') },
      code: ['$TAG', '<Price nights={nights(stay)} />'],
    },
    multiple: {
      body: ["const [days, setDays] = useState(['2026-11-10', '2026-11-11', '2026-11-17']);"],
      use: { mode: 'multiple', defaultMonth: '2026-11-01', isDateDisabled: src((d: string) => [0, 6].includes(new Date(d).getUTCDay()), '(d) => isWeekend(d)'), value: src([], 'days'), onChange: src(() => {}, 'setDays') },
      code: ['$TAG'],
    },
  };
  const shape = shapes[kind];
  const spec: ExampleSpec = { name: 'Picker', preset: set, body: shape.body, tree: [{ app: CalendarDemo, use: { ...shape.use, _kind: src(kind, '') }, code: shape.code }] };
  return (
    <Page
      examples={{ name: '_kind', options: [['single', 'a day and its agenda'], ['range', 'a stay and its price'], ['multiple', 'days you are free']] }}
      meta={calendarMeta}
      page={page}
      define={defineCalendar}
      spec={spec}
      inactive={inactive}
      inherit={['size', 'tone']}
      provider
      align="start"
      file="components/picker"
      note={
        kind === 'range'
          ? 'Two picks, in any order; the band follows the pointer until the second. Booked nights cannot be chosen. The price follows.'
          : kind === 'multiple'
            ? 'Each pick toggles a day; weekends cannot be chosen. Values are ISO dates, the same on the server.'
            : 'Arrows move a day or a week, PageUp and PageDown a month (with Shift, a year). The agenda follows the day.'
      }
    />
  );
}
