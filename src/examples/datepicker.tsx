import * as React from 'react';
import { datepickerMeta } from '@pinfold/core/meta';
import { inactiveDatePickerOptions } from '@pinfold/core';
import { defineDatePicker } from '@pinfold/react/datepicker';
import { changed } from '../playground/shared';
import { src, type ExampleSpec } from '../playground/example';
import { Choice, Page, usePage } from '../playground/kit';
import { KEEP_NOTE } from './overlays';
import { Invoices } from './pagination';
import { nights } from './calendar';
import { reportEvent } from '../playground/preview-mode';

/** The datepicker page. */

/** A due date with how far away it is; a stay with its nights. */
/** Nights booked at the cabin: they cannot be picked, and a stay cannot span them. */
const CABIN_BOOKED = new Set(['2026-11-14', '2026-11-15', '2026-11-27', '2026-12-05', '2026-12-06']);
const nightPrice = (d: string) => 90 + ((Number(d.slice(8)) * 37) % 80) + ([5, 6].includes(new Date(d + 'T00:00:00Z').getUTCDay()) ? 40 : 0);

function DateDemo({ Preset, props }: { Preset: React.ElementType; props: Record<string, any> }) {
  const { _kind, ...rest } = props;
  const [due, setDue] = React.useState<string | null>('2026-11-20');
  const [stay, setStay] = React.useState<{ start: string; end: string } | null>({ start: '2026-12-22', end: '2026-12-27' });
  const [report, setReport] = React.useState<{ start: string; end: string } | null>({ start: '2026-11-01', end: '2026-11-09' });
  const [meeting, setMeeting] = React.useState<string | null>('2026-11-20T14:30');
  const [month, setMonth] = React.useState<string | null>('2026-11-01');
  const [booking, setBooking] = React.useState<{ start: string; end: string } | null>(null);
  if (_kind === 'report')
    return (
      <div className="dx-stack">
        <Preset {...rest} value={report} onChange={setReport} />
        <p className="dx-panel__lead">{report ? `Revenue from ${report.start} to ${report.end}.` : 'Pick a range or a preset.'}</p>
      </div>
    );
  if (_kind === 'booking') {
    const total = booking ? Array.from({ length: nights(booking) }, (_, i) => nightPrice(new Date(Date.parse(booking.start) + i * 864e5).toISOString().slice(0, 10))).reduce((a, b) => a + b, 0) : 0;
    return (
      <div className="dx-stack">
        <Preset {...rest} value={booking} onChange={setBooking} isDateDisabled={(d: string) => CABIN_BOOKED.has(d)} dayContent={(d: string) => (CABIN_BOOKED.has(d) ? null : `$${nightPrice(d)}`)} />
        <p className="dx-panel__lead">{booking ? `${nights(booking)} nights: $${total}.` : 'Two to fourteen nights; booked nights are struck through and a stay cannot span them.'}</p>
      </div>
    );
  }
  if (_kind === 'meeting')
    return (
      <div className="dx-stack">
        <Preset {...rest} value={meeting} onChange={setMeeting} />
        <p className="dx-panel__lead">{meeting ? `Meeting at ${meeting.replace('T', ' ')} (a wall time, no zone).` : 'No time yet.'}</p>
      </div>
    );
  if (_kind === 'month')
    return (
      <div className="dx-stack">
        <Preset {...rest} value={month} onChange={setMonth} />
        <p className="dx-panel__lead">{month ? `Invoices for ${month.slice(0, 7)}.` : 'No month.'}</p>
      </div>
    );
  if (_kind === 'range')
    return (
      <div className="dx-stack">
        <Preset {...rest} value={stay} onChange={setStay} />
        <p className="dx-panel__lead">{stay ? `${nights(stay)} nights, checking in ${stay.start}.` : 'No dates yet.'}</p>
      </div>
    );
  return (
    <div className="dx-stack">
      <Preset {...rest} value={due} onChange={setDue} />
      <p className="dx-panel__lead">{due ? `Due ${due}: ${Math.round((Date.parse(due) - Date.parse('2026-11-08')) / 864e5)} days after 8 November.` : 'No due date.'}</p>
    </div>
  );
}

export function DatePickerPlayground() {
  const page = usePage(datepickerMeta, ['size', 'tone'], { _kind: 'single' });
  const kind = String(page.inputs._kind);
  const inactive = { ...inactiveDatePickerOptions(page.options), mode: 'set by the example above.' };
  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));
  const uses: Record<string, Record<string, unknown>> = {
    range: { label: 'Stay', mode: 'range', name: 'stay', months: 2, locale: 'en-GB', value: src(null, 'stay'), onChange: src(() => reportEvent('Called: ' + "setStay"), 'setStay') },
    report: { label: 'Report period', mode: 'range', months: 2, locale: 'en-GB', presets: ['today', 'last7', 'last30', 'thisMonth', 'lastMonth', 'thisYear'], value: src(null, 'period'), onChange: src(() => reportEvent('Called: ' + "setPeriod"), 'setPeriod') },
    booking: {
      label: 'Your stay',
      mode: 'range',
      months: 2,
      locale: 'en-GB',
      min: '2026-11-08',
      minDays: 3,
      maxDays: 15,
      isDateDisabled: src(() => false, '(day) => booked.has(day)'),
      dayContent: src(() => null, '(day) => (booked.has(day) ? null : `$${price(day)}`)'),
      value: src(null, 'stay'),
      onChange: src(() => reportEvent('Called: ' + "setStay"), 'setStay'),
    },
    meeting: { label: 'Meeting', locale: 'en-GB', time: true, timeStep: 15, hourCycle: 24, value: src(null, 'meeting'), onChange: src(() => reportEvent('Called: ' + "setMeeting"), 'setMeeting') },
    month: { label: 'Billing month', granularity: 'month', locale: 'en-GB', value: src(null, 'month'), onChange: src(() => reportEvent('Called: ' + "setMonth"), 'setMonth') },
    single: { label: 'Due date', description: 'Type it, or pick it from the calendar.', locale: 'en-GB', min: '2026-11-08', value: src(null, 'due'), onChange: src(() => reportEvent('Called: ' + "setDue"), 'setDue') },
  };
  const use: Record<string, unknown> = { ...(uses[kind] ?? uses.single), _kind: src(kind, '') };
  if (page.options.granularity && page.options.granularity !== 'day') delete use.months;
  const bodies: Record<string, string> = {
    range: "const [stay, setStay] = useState({ start: '2026-12-22', end: '2026-12-27' });",
    report: "const [period, setPeriod] = useState({ start: '2026-11-01', end: '2026-11-09' });",
    booking: 'const [stay, setStay] = useState(null);',
    meeting: "const [meeting, setMeeting] = useState('2026-11-20T14:30');",
    month: "const [month, setMonth] = useState('2026-11-01');",
    single: "const [due, setDue] = useState('2026-11-20');",
  };
  const spec: ExampleSpec = {
    name: 'DateField',
    preset: set,
    body: [bodies[kind] ?? bodies.single],
    tree: [{ app: DateDemo, use, code: ['$TAG'] }],
    openOnLoad: true,
  };
  return (
    <Page
      examples={{ name: '_kind', options: [ ['single', 'a due date'], ['range', 'a stay (range)'], ['report', 'a report range with presets'], ['booking', 'a booking: nights, prices, booked days'], ['meeting', 'a meeting: day and time'], ['month', 'a billing month'], ] }}
      meta={datepickerMeta}
      page={page}
      define={defineDatePicker}
      spec={spec}
      inactive={inactive}
      inherit={['size', 'tone']}
      provider
      align="start"
      file="components/date-field"
      frame={(live) => <div className="dx-list-demo dx-list-demo--tall">{live}</div>}
      note={KEEP_NOTE + ' ' + 'Type "24/12/2026" (the UK order here) and press Enter, or ArrowDown to open the calendar on the chosen day.'}
    />
  );
}
