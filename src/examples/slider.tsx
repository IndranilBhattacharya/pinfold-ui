import { sliderMeta } from '@pinfold/core/meta';
import { inactiveSliderOptions } from '@pinfold/core';
import { defineSlider } from '@pinfold/react/slider';
import { changed } from '../playground/shared';
import { src, type ExampleSpec } from '../playground/example';
import { Page, SPEAKER_HIGH, SPEAKER_LOW, Toggle, usePage } from '../playground/kit';
import { reportEvent } from '../playground/preview-mode';

/** The slider page. */

export function SliderPlayground() {
  const page = usePage(sliderMeta, ['size', 'tone'], { _range: false, _marks: false, _icons: false });
  const range = !!page.inputs._range;
  // Steps of 5 (volume) and 25 (price): few enough for `showSteps` to draw.
  const scale = range ? { max: 500, step: 25 } : { step: 5 };
  const marks = page.inputs._marks ? (range ? [0, 100, 250, 500] : [0, 25, 50, 75, 100]).map((value) => ({ value, label: range ? `$${value}` : `${value}` })) : undefined;
  const inactive = inactiveSliderOptions({ defaultValue: range ? [20, 80] : [40], showValue: page.options.showValue as string, marks, snapToMarks: page.options.snapToMarks as boolean, ...scale });
  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));
  if ('step' in inactive) delete (scale as { step?: number }).step;
  const ends = page.inputs._icons ? { startContent: src(SPEAKER_LOW, '<VolumeLowIcon />'), endContent: src(SPEAKER_HIGH, '<VolumeHighIcon />') } : {};
  const spec: ExampleSpec = range
    ? { name: 'Price', preset: { ...set, ...scale, minGap: 25, formatValue: 'formatValue' in inactive ? undefined : src((v: number) => `$${v}`, '(v) => `$${v}`') }, tree: [{ use: { label: 'Price', name: 'price', defaultValue: [100, 350], marks, ...ends } }] }
    : { name: 'Volume', preset: { ...set, ...scale }, tree: [{ use: { label: 'Volume', defaultValue: [40], marks, ...ends, onChangeEnd: src(() => reportEvent('Called: ' + "save"), 'save') } }] };
  return (
    <Page
      meta={sliderMeta}
      page={page}
      define={defineSlider}
      spec={spec}
      inactive={inactive}
      inherit={['size', 'tone']}
      provider
      align="start"
      file={range ? 'components/price' : 'components/volume'}
      frame={(live) => <div className="dx-demo-fields">{live}</div>}
      demo={
        <div className="dx-opts">
          <Toggle page={page} name="_range" label="a range (two thumbs)" />
          <Toggle page={page} name="_marks" label="marks" />
          <Toggle page={page} name="_icons" label="icons either side" />
        </div>
      }
    />
  );
}
