import * as React from 'react';
import { emptyMeta } from '@pinfold/core/meta';
import { inactiveEmptyOptions } from '@pinfold/core';
import { defineEmpty } from '@pinfold/react/empty';
import { Button } from '@pinfold/react/button';
import { changed } from '../playground/shared';
import { src, type ExampleSpec } from '../playground/example';
import { Page, usePage } from '../playground/kit';

/** The empty page. */

const MAIL = ['Your invoice is ready', 'Design review moved to 3pm', 'Welcome to the team'];

/** An inbox: archiving everything leaves the empty state, whose action brings it back. */
function Inbox({ Preset, props }: { Preset: React.ElementType; props: Record<string, any> }) {
  const [mail, setMail] = React.useState<string[]>([]);
  if (!mail.length) return <Preset {...props} actions={[{ label: 'Bring back the messages', onClick: () => setMail(MAIL) }, { label: 'Settings' }]} />;
  return (
    <div className="dx-stack">
      <ul className="dx-tasks">{mail.map((m) => <li key={m}>{m}</li>)}</ul>
      <div>
        <Button label="Archive all" size="sm" variant="soft" onClick={() => setMail([])} />
      </div>
    </div>
  );
}

export function EmptyPlayground() {
  const page = usePage(emptyMeta, ['size', 'tone'], {});
  const inactive = inactiveEmptyOptions(page.options);
  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));
  const spec: ExampleSpec = {
    name: 'InboxZero',
    preset: set,
    body: ['const { messages, restore } = useInbox();'],
    tree: [
      {
        app: Inbox,
        use: { title: 'You are all caught up', description: 'New messages land here. Archived ones are one click away.', actions: src([], "[{ label: 'Bring back the messages', onClick: restore }, { label: 'Settings' }]") },
        code: ['{messages.length === 0 ? (', '  $TAG', ') : (', '  <MessageList messages={messages} />', ')}'],
      },
    ],
  };
  return (
    <Page
      meta={emptyMeta}
      page={page}
      define={defineEmpty}
      spec={spec}
      inactive={inactive}
      inherit={['size', 'tone']}
      provider
      align="start"
      file="components/inbox"
      note="The empty state stands where the list was: its main action brings the messages back, and Archive all empties it again."
    />
  );
}
