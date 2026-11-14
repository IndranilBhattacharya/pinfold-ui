import * as React from 'react';
import { carouselMeta } from '@pinfold/core/meta';
import { inactiveCarouselOptions } from '@pinfold/core';
import { defineCarousel } from '@pinfold/react/carousel';
import { Button } from '@pinfold/react/button';
import { changed } from '../playground/shared';
import { src, type ExampleSpec } from '../playground/example';
import { Choice, Page, Toggle, usePage } from '../playground/kit';

/** The carousel page. */

const SHOP = [
  { name: 'Wool overshirt', price: 118 },
  { name: 'Canvas tote', price: 34 },
  { name: 'Linen shirt', price: 76 },
  { name: 'Field jacket', price: 189 },
  { name: 'Knit beanie', price: 28 },
  { name: 'Leather belt', price: 52 },
];

/** Products in a row: adding one fills the cart under it. */
function Shelf({ Preset, props }: { Preset: React.ElementType; props: Record<string, any> }) {
  const [cart, setCart] = React.useState<string[]>([]);
  const slides = SHOP.map((p, i) => ({
    label: p.name,
    content: (
      <div className="dx-product">
        <div className="dx-product__art" style={{ background: `linear-gradient(135deg, oklch(0.75 0.09 ${(i * 55) % 360}), oklch(0.6 0.12 ${(i * 55 + 40) % 360}))` }} />
        <strong>{p.name}</strong>
        <span className="dx-hint">${p.price}</span>
        <Button label={cart.includes(p.name) ? 'In cart' : 'Add to cart'} size="sm" variant={cart.includes(p.name) ? 'soft' : 'solid'} onClick={() => setCart((c) => (c.includes(p.name) ? c.filter((x) => x !== p.name) : [...c, p.name]))} />
      </div>
    ),
  }));
  const total = SHOP.filter((p) => cart.includes(p.name)).reduce((s, p) => s + p.price, 0);
  return (
    <div className="dx-stack">
      <Preset {...props} slides={slides} />
      <p className="dx-panel__lead">{cart.length ? `${cart.length} in cart: $${total}.` : 'Your cart is empty.'}</p>
    </div>
  );
}

export function CarouselPlayground() {
  const page = usePage(carouselMeta, ['size', 'tone'], { _autoplay: false, _per: '2' });
  const perView = Number(page.inputs._per);
  const inactive = inactiveCarouselOptions({ slides: SHOP, slidesPerView: perView });
  const set = { ...Object.fromEntries(changed(page.options, page.defaults, inactive)), ...(perView !== 1 ? { slidesPerView: perView } : null) };
  const use: Record<string, unknown> = { label: 'New arrivals', slides: src([], "products.map((p) => ({ label: p.name, content: <ProductCard product={p} onAdd={addToCart} /> }))") };
  if (page.inputs._autoplay) use.autoplay = 4000;
  const spec: ExampleSpec = { name: 'Gallery', preset: set, body: ['const { cart, addToCart } = useCart();'], tree: [{ app: Shelf, use, code: ['$TAG', '<CartSummary cart={cart} />'] }] };
  return (
    <Page
      wide
      meta={carouselMeta}
      page={page}
      define={defineCarousel}
      spec={spec}
      inactive={inactive}
      inherit={['size', 'tone']}
      provider
      align="start"
      file="components/new-arrivals"
      note="Swipe or scroll the row, or use the buttons and dots. Adding a product fills the cart under it. With autoplay there is a pause button, and it stops while you point at it."
      demo={
        <>
          <Choice page={page} name="_per" label="slidesPerView" options={[['1', '1'], ['1.2', '1.2 (peek)'], ['2', '2'], ['3', '3']]} />
          <div className="dx-opts">
            <Toggle page={page} name="_autoplay" label="autoplay every 4 s" />
          </div>
        </>
      }
    />
  );
}
