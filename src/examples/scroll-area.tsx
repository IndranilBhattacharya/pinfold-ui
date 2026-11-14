import * as React from 'react';
import { scrollareaMeta } from '@pinfold/core/meta';
import { inactiveScrollAreaOptions } from '@pinfold/core';
import { Badge } from '@pinfold/react/badge';
import { Button } from '@pinfold/react/button';
import { changed, Pick } from '../playground/shared';
import { src, type ExampleSpec } from '../playground/example';
import { defineScrollArea } from '@pinfold/react/scrollarea';
import { Page, usePage } from '../playground/kit';

/** The scroll area page. */

const LOG = [
  ['2.4.0', 'Nov 12', 'Scroll area and cursor', 'Edges that show they hide content, and a pointer that follows the mouse.'],
  ['2.3.2', 'Nov 03', 'Date picker', 'Typing a date in the locale order now keeps the cursor where it was.'],
  ['2.3.1', 'Oct 27', 'Table', 'Sticky headers no longer jump when a row is expanded.'],
  ['2.3.0', 'Oct 14', 'Navbar and app shell', 'A bar with dropdowns and an app frame with a drawer for narrow screens.'],
  ['2.2.4', 'Oct 02', 'Combobox', 'Remote results are cached per query and cancelled when you keep typing.'],
  ['2.2.3', 'Sep 21', 'Dialog', 'Focus returns to the button that opened it, also after a route change.'],
  ['2.2.0', 'Sep 08', 'Color picker', 'Four output formats and an alpha channel.'],
  ['2.1.5', 'Aug 29', 'Slider', 'Marks line up with the thumb at both ends of a range.'],
  ['2.1.0', 'Aug 11', 'Carousel', 'Several slides per view, a peek of the next one and autoplay with a pause button.'],
  ['2.0.2', 'Jul 30', 'Menu', 'Submenus open on the arrow key in right-to-left pages.'],
  ['2.0.0', 'Jul 15', 'Style packs', 'Glass, material, noise and brutalist, switched with one prop.'],
] as const;

function Entry({ version, date, title, text }: { version: string; date: string; title: string; text: string }) {
  return (
    <article className="dx-log__entry">
      <header>
        <Badge label={version} variant="soft" size="sm" />
        <time>{date}</time>
      </header>
      <h4>{title}</h4>
      <p>{text}</p>
    </article>
  );
}

const CHAT = [
  ['Mara', 'Did the build go through?'],
  ['You', 'Yes, green on every browser.'],
  ['Mara', 'Great. Can you tag 2.4.0?'],
  ['You', 'Tagging now.'],
  ['Mara', 'And the notes?'],
  ['You', 'Drafted, I will paste them in the changelog.'],
  ['Mara', 'Perfect, thank you.'],
  ['You', 'Anytime.'],
] as const;
const REPLIES = ['Looks good to me.', 'Shipping it after lunch.', 'One more check on Safari.', 'Done, closing the ticket.', 'Thanks all!'];

const TOPICS = ['Accordion', 'Alert', 'Avatar', 'Badge', 'Button', 'Calendar', 'Carousel', 'Combobox', 'Dialog', 'Menu', 'Navbar', 'Slider', 'Table', 'Tabs', 'Tooltip'];

function Message({ from, text }: { from: string; text: string }) {
  return (
    <p className="dx-chat__msg" data-own={from === 'You' || undefined}>
      <b>{from}</b>
      {text}
    </p>
  );
}

function ScrollDemo({ Preset, props }: { Preset: React.ElementType; props: Record<string, any> }) {
  const { _kind: kind, ...rest } = props;
  const [messages, setMessages] = React.useState<Array<readonly [string, string]>>(CHAT.slice(0, 6));
  if (kind === 'chat') {
    const add = () => setMessages((m) => [...m, [m.length % 2 ? 'Mara' : 'You', REPLIES[m.length % REPLIES.length]]]);
    return (
      <div className="dx-stack">
        <Preset {...rest}>
          {messages.map(([from, text], i) => (
            <Message key={i} from={from} text={text} />
          ))}
        </Preset>
        <div>
          <Button label="Add a message" size="sm" variant="soft" tone="neutral" onClick={add} />
        </div>
      </div>
    );
  }
  if (kind === 'chips') {
    return (
      <Preset {...rest}>
        <div className="dx-chips">
          {TOPICS.map((t) => (
            <Badge key={t} label={t} variant="outline" size="md" />
          ))}
        </div>
      </Preset>
    );
  }
  return (
    <Preset {...rest}>
      {LOG.map(([version, date, title, text]) => (
        <Entry key={version} version={version} date={date} title={title} text={text} />
      ))}
    </Preset>
  );
}

const SCROLL_KINDS: Array<[string, string]> = [
  ['changelog', 'a changelog: a long list'],
  ['chat', 'a chat that follows new messages'],
  ['chips', 'a row of chips that scrolls sideways'],
];

export function ScrollAreaPlayground() {
  const page = usePage(scrollareaMeta, ['tone'], { _kind: 'changelog' });
  const kind = String(page.inputs._kind);
  const inactive = inactiveScrollAreaOptions(page.options);
  const dimensions = kind === 'chips' ? { maxWidth: 360 } : { height: 300 };
  const set = { ...Object.fromEntries(changed(page.options, page.defaults, inactive)), dimensions };
  const names: Record<string, string> = { changelog: 'Changelog', chat: 'Messages', chips: 'Topics' };
  const name = names[kind] ?? 'Changelog';
  const code: Record<string, string[]> = {
    changelog: [`<${name} label="Changelog">`, '  {releases.map((r) => <Entry key={r.version} {...r} />)}', `</${name}>`],
    chat: [`<${name} label="Conversation">`, '  {messages.map((m) => <Message key={m.id} {...m} />)}', `</${name}>`, '<Button label="Add a message" onClick={() => setMessages(addReply)} />'],
    chips: [`<${name} label="Topics">`, '  <div style={{ display: "flex", gap: 8, width: "max-content" }}>', '    {topics.map((t) => <Badge key={t} label={t} variant="outline" />)}', '  </div>', `</${name}>`],
  };
  const spec: ExampleSpec = {
    name,
    preset: set,
    imports: kind === 'chat' ? ["import { Button } from '@pinfold/react/button';"] : kind === 'chips' ? ["import { Badge } from '@pinfold/react/badge';"] : [],
    body: kind === 'chat' ? ['const [messages, setMessages] = useState(initialMessages);'] : [],
    tree: [{ app: ScrollDemo, use: { _kind: src(kind, '') }, code: code[kind] ?? code.changelog }],
  };
  const notes: Record<string, string> = {
    changelog: 'The list is taller than the area. A fade shows which edge hides more, and the area is a keyboard-focusable region while it overflows.',
    chat: 'Add messages while the area is at the end and it follows them; scroll up and it stays where you are (scrollToEnd() pins it again).',
    chips: 'Sideways: the row is wider than the area. Use the wheel with Shift, a trackpad or the arrow keys.',
  };
  return (
    <Page
      meta={scrollareaMeta}
      page={page}
      define={defineScrollArea}
      spec={spec}
      inactive={inactive}
      inherit={['tone']}
      provider={['tone']}
      motion
      align="start"
      file="components/changelog"
      note={notes[kind]}
      demo={
        <div className="dx-opt">
          <Pick
            label="example"
            items={SCROLL_KINDS.map(([value, label]) => ({ value, label }))}
            value={kind}
            onChange={(next) => {
              if (!next) return;
              page.setOption('_kind', next);
              page.setOption('orientation', next === 'chips' ? 'horizontal' : 'vertical');
              page.setOption('stickToEnd', next === 'chat');
            }}
          />
        </div>
      }
    />
  );
}
