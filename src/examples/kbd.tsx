import { kbdMeta } from '@pinfold/core/meta';
import { defineKbd } from '@pinfold/react/kbd';
import { changed } from '../playground/shared';
import { type ExampleSpec } from '../playground/example';
import { Page, Text, flex, usePage } from '../playground/kit';

/** The kbd page. */

const APPLE = typeof navigator !== 'undefined' && /mac|iphone|ipad/i.test(navigator.platform);

export function KbdPlayground() {
  const page = usePage(kbdMeta, ['size'], { _keys: 'mod, k' });
  const keys = String(page.inputs._keys ?? '').split(/[\s,+]+/).filter(Boolean);
  const spec: ExampleSpec = { name: 'Shortcut', preset: Object.fromEntries(changed(page.options, page.defaults)), tree: [{ tag: 'div', props: flex('row', 8), children: ['Press', { use: { keys } }, 'to open the command menu.'] }] };
  return (
    <Page
      meta={kbdMeta}
      page={page}
      define={defineKbd}
      spec={spec}
      inherit={['size']}
      provider={['size']}
      file="components/shortcut"
      valueLabel={(key, value) => (key === 'display' && value === 'auto' ? `auto (${APPLE ? 'symbols' : 'text'} on this device)` : undefined)}
      note={`Shown for this device (${APPLE ? 'Apple: symbols' : 'not Apple: words'}). Set display to compare.`}
      demo={<Text page={page} name="_keys" label="keys" hint="comma separated; mod = ⌘ on Apple, Ctrl elsewhere" />}
    />
  );
}
