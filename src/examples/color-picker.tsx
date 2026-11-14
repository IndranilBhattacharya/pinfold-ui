import * as React from 'react';
import { colorpickerMeta } from '@pinfold/core/meta';
import { inactiveColorPickerOptions } from '@pinfold/core';
import { defineColorPicker } from '@pinfold/react/colorpicker';
import { changed } from '../playground/shared';
import { src, type ExampleSpec } from '../playground/example';
import { Page, usePage } from '../playground/kit';

/** The color picker page. */

const BRAND_SWATCHES = ['#4f46e5', '#0ea5e9', '#16a34a', '#f59e0b', '#e11d48', '#0f172a'];

/** A brand colour editor: the card and the tokens follow the picker. */
function BrandEditor({ Preset, props }: { Preset: React.ElementType; props: Record<string, any> }) {
  const [color, setColor] = React.useState<{ hex: string; rgb: string; hsl: string; oklch: string; alpha: number }>({ hex: '#4f46e5', rgb: 'rgb(79 70 229)', hsl: 'hsl(243 75% 59%)', oklch: 'oklch(51.1% 0.23 276.9)', alpha: 1 });
  return (
    <div className="dx-brand">
      <Preset {...props} onChange={(_value: string, c: typeof color) => setColor(c)} />
      <div className="dx-brand__out">
        <div className="dx-brand__card" style={{ '--dx-brand': color.rgb } as React.CSSProperties}>
          <span className="dx-brand__chip">New</span>
          <strong>Your brand, live</strong>
          <span className="dx-hint">Buttons, links and highlights use it.</span>
          <span className="dx-brand__button">Get started</span>
        </div>
        <dl className="dx-brand__tokens">
          {(['hex', 'rgb', 'hsl', 'oklch'] as const).map((k) => (
            <React.Fragment key={k}>
              <dt>{k}</dt>
              <dd>
                <code>{color[k]}</code>
              </dd>
            </React.Fragment>
          ))}
        </dl>
      </div>
    </div>
  );
}

export function ColorPickerPlayground() {
  const page = usePage(colorpickerMeta, ['size'], {});
  const inactive = inactiveColorPickerOptions(page.options);
  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));
  const spec: ExampleSpec = {
    name: 'BrandColor',
    preset: set,
    body: ["const [brand, setBrand] = useState('#4f46e5');"],
    tree: [
      {
        app: BrandEditor,
        use: {
          label: 'Brand colour',
          value: src('#4f46e5', 'brand'),
          onChange: src(undefined, 'setBrand'),
          swatches: src(BRAND_SWATCHES, "['#4f46e5', '#0ea5e9', '#16a34a', '#f59e0b', '#e11d48', '#0f172a']"),
        },
        code: ['$TAG', "<BrandCard style={{ '--brand': brand }} />"],
      },
    ],
  };
  return (
    <Page
      meta={colorpickerMeta}
      page={page}
      define={defineColorPicker}
      spec={spec}
      inactive={inactive}
      inherit={['size']}
      provider={['size']}
      align="start"
      file="components/brand-color"
      note="Drag in the area, use the sliders, press a swatch, or type or paste any CSS colour (hex, rgb, hsl, oklch) and press Enter. The card and the token list beside it follow; format sets how the value is written. The eyedropper shows in browsers that have it (Chromium)."
    />
  );
}
