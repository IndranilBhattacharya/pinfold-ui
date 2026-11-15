import * as React from 'react';
import { cursorMeta } from '@pinfold/core/meta';
import { Input } from '@pinfold/react/input';
import { Button } from '@pinfold/react/button';
import { Select } from '@pinfold/react/select';
import { changed } from '../playground/shared';
import { plain, src, type ExampleSpec } from '../playground/example';
import { Spinner } from '@pinfold/react/spinner';
import { defineCursor, type CursorConfig, type CursorVariant } from '@pinfold/react/cursor';
import type { PinfoldTone } from '@pinfold/core';
import { Page, Text, usePage } from '../playground/kit';
import { orderAt } from '../demo/harbor';

/** The cursor page. */

type CursorStateStyle = NonNullable<CursorConfig['states']>[string];

const HARBOR_STATES = {
  zoom: { label: 'View', variant: 'ring', scale: 2 },
  drag: { label: 'Drag', tone: 'neutral' },
  play: { label: src(({ element }: { element: Element }) => element.getAttribute('data-title') ?? 'Play', "({ element }) => element.getAttribute('data-title') ?? 'Play'"), blend: 'difference' },
  busy: { shape: src(<Spinner size="sm" tone="current" label="Refreshing" />, '<Spinner size="sm" tone="current" label="Refreshing" />'), hideNative: true },
};
const ORDER = orderAt(0);

const VARIANTS: CursorVariant[] = ['dot-ring', 'dot', 'ring', 'blob', 'crosshair', 'arrow'];
const TONES: PinfoldTone[] = ['primary', 'neutral', 'success', 'warning', 'danger', 'info'];

interface CustomStateItem {
  name: string;
  variant: CursorVariant;
  tone: PinfoldTone;
  label: string;
}

function Arena({ Preset, props }: { Preset: React.ElementType; props: Record<string, any> }) {
  const [state, setState] = React.useState('default');
  const [customName, setCustomName] = React.useState('inspect');
  const [customVariant, setCustomVariant] = React.useState<CursorVariant>('crosshair');
  const [customTone, setCustomTone] = React.useState<PinfoldTone>('info');
  const [customLabel, setCustomLabel] = React.useState('Inspect manifest');
  const [addedStates, setAddedStates] = React.useState<CustomStateItem[]>([]);

  const order = ORDER;

  const runtimeStates = React.useMemo(() => {
    const map: Record<string, CursorStateStyle> = { ...plain(HARBOR_STATES) };
    for (const s of addedStates) {
      map[s.name] = { variant: s.variant, tone: s.tone, label: s.label };
    }
    return map;
  }, [addedStates]);

  const addState = () => {
    const trimmed = customName.trim().toLowerCase();
    if (!trimmed || addedStates.some((s) => s.name === trimmed)) return;
    setAddedStates((prev) => [...prev, { name: trimmed, variant: customVariant, tone: customTone, label: customLabel }]);
  };

  return (
    <div className="dx-stack">
      <Preset {...props} states={runtimeStates} onStateChange={(next: string) => setState(next)}>
        <div className="dx-arena">
          <div className="dx-arena__card">
            <h4>Plain text</h4>
            <p>Default pointer state over plain content.</p>
          </div>
          <div className="dx-arena__card">
            <h4>Pressable</h4>
            <p>Over interactive elements.</p>
            <Button label="Open order" size="sm" variant="soft" />
          </div>
          <div className="dx-arena__card" data-cursor="zoom">
            <h4>Order {order.id} manifest</h4>
            <p>{order.customer.name} · {order.lane}</p>
            <span className="dx-hint">data-cursor="zoom"</span>
          </div>
          <div className="dx-arena__card" data-cursor="drag" data-cursor-label="Reorder shipment">
            <h4>Waypoints</h4>
            <p>Rotterdam Depot → Antwerp Hub</p>
            <span className="dx-hint">data-cursor="drag"</span>
          </div>
          <div className="dx-arena__card" data-cursor="play" data-title="Tracking playback">
            <h4>Vessel feed</h4>
            <p>Live satellite AIS stream</p>
            <span className="dx-hint">data-cursor="play"</span>
          </div>
          <div className="dx-arena__card" data-cursor="busy">
            <h4>Port congestion</h4>
            <p>Terminal 4: refresh in progress</p>
            <span className="dx-hint">data-cursor="busy"</span>
          </div>
          <div className="dx-arena__card">
            <h4>A text field</h4>
            <Input label="Consignee" placeholder="Type here" size="sm" />
          </div>
          {addedStates.map((st) => (
            <div key={st.name} className="dx-arena__card" data-cursor={st.name}>
              <h4>Custom: {st.name}</h4>
              <p>{st.variant} · {st.tone}</p>
              <span className="dx-hint">{st.label}</span>
            </div>
          ))}
        </div>
      </Preset>
      <div className="dx-cursor-builder">
        <h4 className="dx-cursor-builder__title">Add a custom state</h4>
        <Input label="State name" value={customName} onChange={setCustomName} size="sm" />
        <Select label="Variant" items={VARIANTS} value={customVariant} onChange={(v) => v && setCustomVariant(v as CursorVariant)} size="sm" />
        <Select label="Tone" items={TONES} value={customTone} onChange={(v) => v && setCustomTone(v as PinfoldTone)} size="sm" />
        <Input label="Label" value={customLabel} onChange={setCustomLabel} size="sm" />
        <Button label="Add state" variant="soft" size="sm" onClick={addState} />
      </div>
      <p className="dx-hint" role="status">
        Pointer state: <b>{state}</b>
      </p>
    </div>
  );
}

export function CursorPlayground() {
  const page = usePage(cursorMeta, ['size', 'tone'], { _label: '' });
  const label = String(page.inputs._label ?? '');
  const set = Object.fromEntries(changed(page.options, page.defaults));
  const spec: ExampleSpec = {
    name: 'Pointer',
    preset: {
      ...set,
      states: HARBOR_STATES,
    },
    body: ["const [state, setState] = useState('default');"],
    tree: [
      {
        app: Arena,
        use: { label: label || undefined, onStateChange: src(undefined, 'setState') },
        code: [
          `<Pointer${label ? ` label="${label}"` : ''} onStateChange={setState}>`,
          '  <div className="dx-arena">',
          '    <div className="dx-arena__card">',
          '      <h4>Plain text</h4>',
          '      <p>Default pointer state over plain content.</p>',
          '    </div>',
          '    <div className="dx-arena__card">',
          '      <h4>Pressable</h4>',
          '      <Button label="Open order" size="sm" variant="soft" />',
          '    </div>',
          '    <div className="dx-arena__card" data-cursor="zoom">',
          `      <h4>Order ${ORDER.id} manifest</h4>`,
          `      <p>${ORDER.customer.name} · ${ORDER.lane}</p>`,
          '    </div>',
          '    <div',
          '      className="dx-arena__card"',
          '      data-cursor="drag"',
          '      data-cursor-label="Reorder shipment"',
          '    >',
          '      <h4>Waypoints</h4>',
          '      <p>Rotterdam Depot → Antwerp Hub</p>',
          '    </div>',
          '    <div',
          '      className="dx-arena__card"',
          '      data-cursor="play"',
          '      data-title="Tracking playback"',
          '    >',
          '      <h4>Vessel feed</h4>',
          '      <p>Live satellite AIS stream</p>',
          '    </div>',
          '    <div className="dx-arena__card" data-cursor="busy">',
          '      <h4>Port congestion</h4>',
          '      <p>Terminal 4: refresh in progress</p>',
          '    </div>',
          '    <div className="dx-arena__card">',
          '      <h4>A text field</h4>',
          '      <Input label="Consignee" placeholder="Type here" size="sm" />',
          '    </div>',
          '  </div>',
          '</Pointer>',
        ],
      },
    ],
    imports: ["import { Button } from '@pinfold/react/button';", "import { Input } from '@pinfold/react/input';", "import { Spinner } from '@pinfold/react/spinner';"],
  };
  return (
    <Page
      meta={cursorMeta}
      page={page}
      define={defineCursor}
      spec={spec}
      inherit={['size', 'tone']}
      provider
      align="start"
      file="components/pointer"
      note={'Move the mouse over the cards: plain text, an interactive button, and custom states for zoom (order manifest), drag (waypoints), play (vessel feed), and busy (port congestion). You can also add custom states using the builder below.'}
      demo={<Text page={page} name="_label" label="label" hint="text beside the pointer; empty: none" />}
    />
  );
}
