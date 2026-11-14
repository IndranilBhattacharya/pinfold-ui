import { toggleMeta } from '@pinfold/core/meta';
import { inactiveToggleOptions } from '@pinfold/core';
import { defineToggle } from '@pinfold/react/toggle';
import { changed } from '../playground/shared';
import { src, type ExampleSpec } from '../playground/example';
import { Choice, Page, Toggle, usePage } from '../playground/kit';

/** The toggle page. */

export const svg = (d: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);
const LIST_ICON = svg('M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01');
export const BOARD_ICON = svg('M3 4h7v16H3zM14 4h7v10h-7z');
export const CAL_ICON = svg('M4 5h16v16H4zM4 10h16M9 3v4M15 3v4');
const PIN_ICON = svg('M12 17v5M9 3h6l-1 6 3 3H7l3-3z');
export const UNDO_ICON = svg('M9 14 4 9l5-5M4 9h11a5 5 0 0 1 0 10h-3');
export const REDO_ICON = svg('m15 14 5-5-5-5M20 9H9a5 5 0 0 0 0 10h3');
export const BOLD_ICON = svg('M7 4h6a4 4 0 0 1 0 8H7zM7 12h7a4 4 0 0 1 0 8H7z');
export const ITALIC_ICON = svg('M19 4h-9M14 20H5M15 4 9 20');

export function TogglePlayground() {
  const page = usePage(toggleMeta, ['size', 'tone'], { _kind: 'group', _icons: false });
  const group = page.inputs._kind === 'group';
  const icons = !!page.inputs._icons;
  const views = [
    { value: 'list', label: 'List', icon: icons ? src(LIST_ICON, '<ListIcon />') : undefined },
    { value: 'board', label: 'Board', icon: icons ? src(BOARD_ICON, '<BoardIcon />') : undefined },
    { value: 'calendar', label: 'Calendar', icon: icons ? src(CAL_ICON, '<CalendarIcon />') : undefined },
  ];
  const inactive = inactiveToggleOptions({ items: group ? views : undefined, selection: page.options.selection as string });
  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));
  const spec: ExampleSpec = group
    ? { name: 'View', preset: set, tree: [{ use: { label: 'View', items: views, defaultValue: ['list'], onChange: src(() => {}, 'setView') } }] }
    : { name: 'Pin', preset: set, tree: [{ use: { label: 'Pin', icon: icons ? src(PIN_ICON, '<PinIcon />') : undefined, defaultPressed: true, onChange: src(() => {}, 'setPinned') } }] };
  return (
    <Page
      meta={toggleMeta}
      page={page}
      define={defineToggle}
      spec={spec}
      inactive={inactive}
      inherit={['size', 'tone']}
      provider
      file={group ? 'components/view' : 'components/pin'}
      note={group ? 'Arrow keys move along the group; in a single selection they select as they go.' : undefined}
      demo={
        <div className="dx-opts">
          <Choice page={page} name="_kind" label="show" options={[['group', 'a group (items)'], ['one', 'one toggle']]} />
          <Toggle page={page} name="_icons" label="icons" />
        </div>
      }
    />
  );
}
