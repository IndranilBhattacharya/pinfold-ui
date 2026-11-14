import { skeletonMeta } from '@pinfold/core/meta';
import { inactiveSkeletonOptions } from '@pinfold/core';
import { defineSkeleton } from '@pinfold/react/skeleton';
import { changed } from '../playground/shared';
import { src, type ExampleSpec } from '../playground/example';
import { Choice, Page, Text, usePage } from '../playground/kit';

/** The skeleton page. */

export function SkeletonPlayground() {
  const page = usePage(skeletonMeta, ['size'], { _lines: '3', _layout: 'shape' });
  const layout = String(page.inputs._layout);
  const composed = layout !== 'shape';
  const items = layout === 'profile' ? [{ variant: 'circle' }, { lines: 2 }] : layout === 'card' ? [{ variant: 'rect', dimensions: { height: 120 } }, { lines: 2 }, { direction: 'row', items: [{ variant: 'circle', size: 'sm' }, { lines: 1 }] }] : undefined;
  const inactive = inactiveSkeletonOptions({ ...page.options, items });
  const lines = Math.max(1, Math.min(8, Number(page.inputs._lines) || 1));
  const set = Object.fromEntries(changed({ ...page.options, loading: undefined }, page.defaults, inactive));
  const done = page.options.loading === false;
  const content = src(<p className="dx-demo-text">Ada Lovelace wrote the first program.</p>, '<p>{user.bio}</p>');
  const spec: ExampleSpec = {
    name: composed ? 'ProfileSkeleton' : 'Placeholder',
    preset: {
      ...set,
      lines: 'lines' in inactive || lines === 1 ? undefined : lines,
      items,
      direction: layout === 'profile' ? 'row' : set.direction,
    },
    tree: [{ use: done ? { loading: false, content } : {} }],
  };
  return (
    <Page
      meta={skeletonMeta}
      page={page}
      define={defineSkeleton}
      spec={spec}
      inactive={inactive}
      inherit={['size']}
      provider={['size']}
      motion
      align="start"
      file="components/placeholder"
      note="A layout is one config: nest shapes in `items`, and one band of light crosses all of them."
      demo={
        <>
          <div className="dx-opts">
            <Choice page={page} name="_layout" label="layout" options={[['shape', 'one shape'], ['profile', 'profile row (items)'], ['card', 'card (nested items)']]} />
          </div>
          {'lines' in inactive ? null : <Text page={page} name="_lines" label="lines" hint="text shapes" />}
        </>
      }
    />
  );
}
