import * as React from 'react';
import { ratingMeta } from '@pinfold/core/meta';
import { inactiveRatingOptions } from '@pinfold/core';
import { defineRating } from '@pinfold/react/rating';
import { changed } from '../playground/shared';
import { src, type ExampleSpec } from '../playground/example';
import { Page, usePage } from '../playground/kit';

/** The rating page. */

const VOTES = [5, 4, 5, 3, 4, 5, 4, 4, 5, 2];
const WORDS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

/** Your rating joins the others: the average (a read-only rating) follows. */
function Review({ Preset, props }: { Preset: React.ElementType; props: Record<string, any> }) {
  const { _ro, ...rest } = props;
  // The average is read-only: no handler, no form name.
  const { onChange: _change, name: _name, ...shared } = rest;
  const [mine, setMine] = React.useState(4);
  const votes = mine ? [...VOTES, mine] : VOTES;
  const average = Math.round((votes.reduce((a, b) => a + b, 0) / votes.length) * 10) / 10;
  return (
    <div className="dx-stack">
      <Preset {...rest} value={mine} {...(_ro ? null : { onChange: setMine })} />
      <p className="dx-panel__lead">{mine ? `${WORDS[Math.ceil(mine)]}: ${mine} of 5.` : 'No rating yet.'}</p>
      <Preset {...shared} label="Average rating" readOnly showValue value={average} />
      <span className="dx-hint">{votes.length} ratings</span>
    </div>
  );
}

export function RatingPlayground() {
  const page = usePage(ratingMeta, ['size'], {});
  const inactive = inactiveRatingOptions(page.options);
  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));
  const spec: ExampleSpec = {
    name: 'Stars',
    preset: set,
    body: ['const [mine, setMine] = useState(4);', 'const average = averageOf([...votes, mine]);'],
    tree: [{ app: Review, use: { label: 'Your rating', name: 'rating', value: src(4, 'mine'), ...(page.options.readOnly ? null : { onChange: src(() => {}, 'setMine') }), _ro: src(!!page.options.readOnly, '') }, code: ['$TAG', '<Stars label="Average rating" readOnly showValue value={average} />'] }],
  };
  return (
    <Page
      meta={ratingMeta}
      page={page}
      define={defineRating}
      spec={spec}
      inactive={inactive}
      inherit={['size']}
      provider={['size']}
      align="start"
      file="components/review"
      note="Point to preview, press to choose, press again to clear; arrows move as in any radio group. Your rating moves the average under it."
    />
  );
}
