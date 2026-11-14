import { badgeMeta } from '@pinfold/core/meta';
import { inactiveBadgeOptions } from '@pinfold/core';
import { defineBadge } from '@pinfold/react/badge';
import { Avatar } from '@pinfold/react/avatar';
import { Button } from '@pinfold/react/button';
import { changed } from '../playground/shared';
import { src, type ExampleSpec } from '../playground/example';
import { PEOPLE } from '../playground/people';
import { BELL, Choice, Page, Text, Toggle, flex, usePage } from '../playground/kit';

/** The badge page. */

const TONES = ['primary', 'neutral', 'success', 'warning', 'danger', 'info'];

export function BadgePlayground() {
  const page = usePage(badgeMeta, ['size', 'tone'], { _label: 'New', _count: '', _srLabel: '', _anchor: 'none', _tones: false });
  const label = String(page.inputs._label ?? '') || undefined;
  const count = page.inputs._count === '' || page.inputs._count == null ? undefined : Number(page.inputs._count);
  const srLabel = String(page.inputs._srLabel ?? '') || undefined;
  const which = String(page.inputs._anchor);
  const anchor = which === 'avatar' ? src(<Avatar name={PEOPLE[0].name} src={PEOPLE[0].photo} size="lg" />, `<Avatar name="${PEOPLE[0].name}" src="${PEOPLE[0].file}" size="lg" />`) : which === 'button' ? src(<Button label="Notifications" icon={BELL} iconOnly variant="outline" />, '<Button label="Notifications" icon={<BellIcon />} iconOnly variant="outline" />') : undefined;
  const inactive = inactiveBadgeOptions({ ...page.options, label, count, anchor });
  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));
  const use = { label, count, srLabel, anchor };
  const spec: ExampleSpec = {
    name: 'Status',
    preset: set,
    tree: page.inputs._tones ? [{ tag: 'div', props: flex('row', 8), children: TONES.map((tone) => ({ use: { ...use, label: label && tone[0].toUpperCase() + tone.slice(1), tone } })) }] : [{ use }],
    imports: [...(which === 'avatar' ? ["import { Avatar } from '@pinfold/react/avatar';"] : []), ...(which === 'button' ? ["import { Button } from '@pinfold/react/button';"] : [])],
  };
  return (
    <Page
      meta={badgeMeta}
      page={page}
      define={defineBadge}
      spec={spec}
      inactive={inactive}
      inherit={['size', 'tone']}
      provider
      file="components/status"
      demo={
        <>
          <Text page={page} name="_label" label="label" hint="always shown" />
          <Text page={page} name="_count" label="count" hint="a number; shown after the label" />
          <Text page={page} name="_srLabel" label="srLabel" hint="read, not shown: unread messages" />
          <div className="dx-opts">
            <Choice page={page} name="_anchor" label="anchor" options={[['none', 'none (in the text flow)'], ['avatar', 'an avatar'], ['button', 'a button']]} />
            <Toggle page={page} name="_tones" label="every tone" />
          </div>
        </>
      }
    />
  );
}
