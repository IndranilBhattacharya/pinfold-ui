import { separatorMeta } from '@pinfold/core/meta';
import { inactiveSeparatorOptions } from '@pinfold/core';
import { defineSeparator } from '@pinfold/react/separator';
import { changed } from '../playground/shared';
import { type ExampleSpec } from '../playground/example';
import { Page, Text, flex, usePage } from '../playground/kit';

/** The separator page. */

export function SeparatorPlayground() {
  const page = usePage(separatorMeta, [], { _label: 'or' });
  const label = String(page.inputs._label ?? '') || undefined;
  const inactive = inactiveSeparatorOptions({ ...page.options, label });
  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));
  const vertical = page.options.orientation === 'vertical';
  const spec: ExampleSpec = {
    name: 'Divider',
    preset: { ...set, label: 'label' in inactive ? undefined : label },
    tree: vertical
      ? [{ tag: 'div', props: flex('row', 8, { blockSize: 32 }), children: ['Edit', { use: {} }, 'Share', { use: {} }, 'Delete'] }]
      : [{ tag: 'div', props: flex('column', 8), children: ['Sign in with your email and password.', { use: {} }, 'Continue with a passkey.'] }],
  };
  return <Page meta={separatorMeta} page={page} define={defineSeparator} spec={spec} inactive={inactive} file="components/divider" demo={<Text page={page} name="_label" label="label" hint="empty: a plain line" />} />;
}
