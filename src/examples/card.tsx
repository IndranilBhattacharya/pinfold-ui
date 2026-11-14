import { cardMeta } from '@pinfold/core/meta';
import { inactiveCardOptions } from '@pinfold/core';
import { defineCard } from '@pinfold/react/card';
import { changed } from '../playground/shared';
import { src, type ExampleSpec } from '../playground/example';
import { LANDSCAPE } from '../playground/people';
import { Page, Text, Toggle, usePage } from '../playground/kit';
import { reportEvent } from '../playground/preview-mode';

/** The card page. */

export function CardPlayground() {
  const page = usePage(cardMeta, [], { _title: 'Pro plan', _description: 'Everything in Free, plus shared workspaces and priority support.', _image: true, _link: false });
  const image = !!page.inputs._image;
  const link = !!page.inputs._link;
  const options = { ...page.options, headingLevel: page.options.headingLevel === undefined ? undefined : Number(page.options.headingLevel) };
  const inactive = inactiveCardOptions({ ...options, image: image || undefined, href: link ? '#/card' : undefined, title: page.inputs._title });
  const set = Object.fromEntries(changed(options, page.defaults, inactive));
  const spec: ExampleSpec = {
    name: 'Plan',
    preset: set,
    tree: [
      {
        use: {
          title: page.inputs._title,
          description: page.inputs._description,
          content: src(<b>$29 per month</b>, '<b>$29 per month</b>'),
          image: image ? { src: src(LANDSCAPE, "'/pro.png'"), alt: 'A lake under mountains at dawn' } : undefined,
          href: link ? '#/card' : undefined,
          actions: link ? undefined : [{ label: 'Upgrade', onClick: src(() => reportEvent('Called: ' + "upgrade"), 'upgrade') }, { label: 'Compare plans', onClick: src(() => reportEvent('Called: ' + "compare"), 'compare') }],
        },
      },
    ],
  };
  return (
    <Page
      meta={cardMeta}
      page={page}
      define={defineCard}
      spec={spec}
      inactive={inactive}
      align="start"
      file="components/plan"
      demo={
        <>
          <Text page={page} name="_title" label="title" hint="a real heading; with a link, the link text" />
          <Text page={page} name="_description" label="description" multiline />
          <div className="dx-opts">
            <Toggle page={page} name="_image" label="image" />
            <Toggle page={page} name="_link" label="whole card is a link" />
          </div>
        </>
      }
    />
  );
}
