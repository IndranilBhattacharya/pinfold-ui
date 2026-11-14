import { otpMeta } from '@pinfold/core/meta';
import { inactiveOtpOptions } from '@pinfold/core';
import { defineOtp } from '@pinfold/react/otp';
import { changed } from '../playground/shared';
import { src, type ExampleSpec } from '../playground/example';
import { Page, Text, Toggle, usePage } from '../playground/kit';
import { FORM_NOTE, InForm, formTree } from './forms';

/** The one-time code page. */

export function OtpPlayground() {
  const page = usePage(otpMeta, ['size'], { _groups: true, _value: '12', _form: false });
  const groups = page.inputs._groups ? [3, 3] : undefined;
  const inactive = inactiveOtpOptions({ groups });
  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));
  const spec: ExampleSpec = {
    name: 'Code',
    preset: { ...set, groups },
    ...formTree(page, { label: 'Verification code', name: 'code', defaultValue: String(page.inputs._value ?? '') || undefined, description: 'We sent it to your phone.', onComplete: src(() => {}, 'verify') }),
  };
  return (
    <Page
      meta={otpMeta}
      page={page}
      define={defineOtp}
      spec={spec}
      inactive={inactive}
      inherit={['size']}
      provider={['size']}
      align="start"
      file="components/code"
      note={page.inputs._form ? FORM_NOTE : 'Type, paste a code, or let the phone fill it from an SMS: it is one native field.'}
      frame={(live) => <div className="dx-demo-fields">{live}</div>}
      demo={
        <>
          <Text page={page} name="_value" label="defaultValue" hint="digits" />
          <div className="dx-opts">
            <Toggle page={page} name="_groups" label="two groups of 3" />
            <InForm page={page} />
          </div>
        </>
      }
    />
  );
}
