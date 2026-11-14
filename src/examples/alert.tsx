import * as React from 'react';
import { alertMeta } from '@pinfold/core/meta';
import { inactiveAlertOptions } from '@pinfold/core';
import { defineAlert } from '@pinfold/react/alert';
import { changed, Tool } from '../playground/shared';
import { src, type ExampleSpec } from '../playground/example';
import { Page, Text, Toggle, usePage } from '../playground/kit';

/** The alert page. */

const SPOKEN: Record<string, string> = {
  off: 'Screen readers read it when they reach it, like any text. Right for a message on the page from the start.',
  polite: 'role="status": when it appears, a screen reader announces it at the next pause.',
  assertive: 'role="alert": when it appears, a screen reader interrupts to announce it.',
};

export function AlertPlayground() {
  const page = usePage(alertMeta, [], { _title: 'Payment failed', _description: 'Your card was declined. Try another card or contact your bank.', _actions: true, _shown: 0 });
  const inactive = inactiveAlertOptions(page.options);
  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));
  const spec: ExampleSpec = {
    name: 'Notice',
    preset: set,
    tree: [{ use: { title: page.inputs._title, description: page.inputs._description, actions: page.inputs._actions ? [{ label: 'Retry', onClick: src(() => {}, 'retry') }, { label: 'Use another card', onClick: src(() => {}, 'change') }] : undefined } }],
  };
  return (
    <Page
      meta={alertMeta}
      page={page}
      define={defineAlert}
      spec={spec}
      inactive={inactive}
      align="start"
      file="components/notice"
      note={
        <>
          {SPOKEN[String(page.options.live)]}
          {page.options.dismissible ? (
            <>
              {' '}
              <Tool label="Show it again" onClick={() => page.setOption('_shown', Number(page.inputs._shown) + 1)} />
            </>
          ) : null}
        </>
      }
      frame={(live) => <React.Fragment key={String(page.inputs._shown)}>{live}</React.Fragment>}
      demo={
        <>
          <Text page={page} name="_title" label="title" />
          <Text page={page} name="_description" label="description" multiline />
          <div className="dx-opts">
            <Toggle page={page} name="_actions" label="actions" />
          </div>
        </>
      }
    />
  );
}
