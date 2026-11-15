import * as React from 'react';
import { cursorMeta } from '@pinfold/core/meta';
import { Input } from '@pinfold/react/input';
import { Button } from '@pinfold/react/button';
import { changed } from '../playground/shared';
import { src, type ExampleSpec } from '../playground/example';
import { defineCursor } from '@pinfold/react/cursor';
import { Page, Text, usePage } from '../playground/kit';

/** The cursor page. */

function Arena({ Preset, props }: { Preset: React.ElementType; props: Record<string, any> }) {
  const [state, setState] = React.useState('default');
  return (
    <div className="dx-stack">
      <Preset {...props} onStateChange={(next: string) => setState(next)}>
        <div className="dx-arena">
          <div className="dx-arena__card">
            <h4>Plain text</h4>
            <p>Move over this card: the pointer stays in its default state.</p>
          </div>
          <div className="dx-arena__card">
            <h4>A button</h4>
            <p>Anything pressable turns the pointer into its pressable state.</p>
            <Button label="Open" size="sm" variant="soft" />
          </div>
          <div className="dx-arena__card dx-arena__card--zoom" data-cursor="zoom" data-cursor-label="View">
            <span>data-cursor="zoom"</span>
          </div>
          <div className="dx-arena__card">
            <h4>A text field</h4>
            <Input label="Your name" placeholder="Type here" size="sm" />
          </div>
        </div>
      </Preset>
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
    preset: set,
    body: ["const [state, setState] = useState('default');"],
    tree: [{ app: Arena, use: { label: label || undefined, onStateChange: src(undefined, 'setState') }, code: [`<Pointer${label ? ` label="${label}"` : ''} onStateChange={setState}>`, '  <Cards />', '</Pointer>'] }],
    imports: [],
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
      note={'Move the mouse over the cards: text, a button (pressable), an element marked data-cursor="zoom" with data-cursor-label="View", and a text field (the system I-beam takes over). It draws on a fine pointer only; on touch nothing changes.'}
      demo={<Text page={page} name="_label" label="label" hint="text beside the pointer; empty: none" />}
    />
  );
}
