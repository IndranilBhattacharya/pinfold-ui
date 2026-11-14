import { progressMeta } from '@pinfold/core/meta';
import { inactiveProgressOptions } from '@pinfold/core';
import { defineProgress } from '@pinfold/react/progress';
import { defineSlider } from '@pinfold/react/slider';
import { changed } from '../playground/shared';
import { type ExampleSpec } from '../playground/example';
import { Page, Text, Toggle, usePage } from '../playground/kit';

/** The progress page. */

const Level = defineSlider({ size: 'sm', min: 0, max: 100, showValue: 'label' });

export function ProgressPlayground() {
  const page = usePage(progressMeta, ['size', 'tone'], { _label: 'Uploading report.pdf', _value: 64, _busy: false });
  const busy = !!page.inputs._busy && page.options.kind !== 'meter';
  const value = busy ? undefined : Number(page.inputs._value ?? 64);
  const inactive = inactiveProgressOptions({ ...page.options, value });
  const spec: ExampleSpec = { name: 'Upload', preset: Object.fromEntries(changed(page.options, page.defaults, inactive)), tree: [{ use: { label: page.inputs._label, value } }] };
  return (
    <Page
      meta={progressMeta}
      page={page}
      define={defineProgress}
      spec={spec}
      inactive={inactive}
      inherit={['size', 'tone']}
      provider
      motion={busy}
      file="components/upload"
      demo={
        <>
          <Text page={page} name="_label" label="label" hint="the accessible name" />
          <div className="dx-field">
            <Level label="value" value={[value ?? 0]} disabled={busy} onChange={([n]) => page.setOption('_value', n)} />
          </div>
          <div className="dx-opts">
            <Toggle page={page} name="_busy" label="indeterminate (no value)" disabled={page.options.kind === 'meter'} />
          </div>
        </>
      }
    />
  );
}
