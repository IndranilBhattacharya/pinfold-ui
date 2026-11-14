import { numberMeta } from '@pinfold/core/meta';
import { inactiveNumberOptions } from '@pinfold/core';
import { defineNumberField } from '@pinfold/react/number';
import { changed } from '../playground/shared';
import { src, type ExampleSpec } from '../playground/example';
import { Page, Toggle, usePage } from '../playground/kit';
import { FORM_NOTE, InForm, formTree } from './forms';

/** The number field page. */

export function NumberPlayground() {
  const page = usePage(numberMeta, ['size'], { _unit: false, _form: false });
  const inactive = inactiveNumberOptions(page.options);
  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));
  const spec: ExampleSpec = {
    name: 'Quantity',
    preset: { ...set, min: 0, max: 20 },
    ...formTree(page, { label: 'Quantity', name: 'qty', defaultValue: 2, endContent: page.inputs._unit ? src('kg', "'kg'") : undefined, description: 'Up to 20.' }),
  };
  return (
    <Page
      meta={numberMeta}
      page={page}
      define={defineNumberField}
      spec={spec}
      inactive={inactive}
      inherit={['size']}
      provider={['size']}
      align="start"
      file="components/quantity"
      note={page.inputs._form ? FORM_NOTE : 'Hold − or + to repeat; arrow keys step from the keyboard.'}
      frame={(live) => <div className="dx-demo-fields">{live}</div>}
      demo={
        <div className="dx-opts">
          <Toggle page={page} name="_unit" label="a unit (endContent)" />
          <InForm page={page} />
        </div>
      }
    />
  );
}
