import { toolbarMeta } from '@pinfold/core/meta';
import { inactiveToolbarOptions } from '@pinfold/core';
import { defineToolbar } from '@pinfold/react/toolbar';
import { changed } from '../playground/shared';
import { src, type ExampleSpec } from '../playground/example';
import { Page, Toggle, usePage } from '../playground/kit';
import { BOLD_ICON, ITALIC_ICON, REDO_ICON, UNDO_ICON } from './toggle';
import { reportEvent } from '../playground/preview-mode';

/** The toolbar page. */

export function ToolbarPlayground() {
  const page = usePage(toolbarMeta, ['size'], { _icons: false });
  const icons = !!page.inputs._icons;
  const selection = (page.options.selection as string) ?? 'none';
  const inactive = inactiveToolbarOptions({ selection });
  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));
  const items = selection !== 'none'
    ? icons
      ? [
          { label: 'Bold', value: 'bold', icon: src(BOLD_ICON, '<BoldIcon />'), iconOnly: true },
          { label: 'Italic', value: 'italic', icon: src(ITALIC_ICON, '<ItalicIcon />'), iconOnly: true },
        ]
      : [
          { label: 'Day', value: 'day' },
          { label: 'Week', value: 'week' },
          { label: 'Month', value: 'month' },
        ]
    : icons
    ? [
        { label: 'Undo', icon: src(UNDO_ICON, '<UndoIcon />'), iconOnly: true, onClick: src(() => reportEvent('Called: ' + "undo"), 'undo') },
        { label: 'Redo', icon: src(REDO_ICON, '<RedoIcon />'), iconOnly: true, onClick: src(() => reportEvent('Called: ' + "redo"), 'redo') },
        { label: 'Bold', icon: src(BOLD_ICON, '<BoldIcon />'), iconOnly: true, onClick: src(() => reportEvent('Called: ' + "bold"), 'bold') },
        { label: 'Italic', icon: src(ITALIC_ICON, '<ItalicIcon />'), iconOnly: true, onClick: src(() => reportEvent('Called: ' + "italic"), 'italic') },
      ]
    : [
        { label: 'Previous', onClick: src(() => reportEvent('Called: ' + "previous"), 'previous') },
        { label: 'Today', onClick: src(() => reportEvent('Called: ' + "today"), 'today') },
        { label: 'Next', onClick: src(() => reportEvent('Called: ' + "next"), 'next') },
      ];
  const picked = selection === 'none' ? undefined : { defaultValue: icons ? ['bold'] : ['week'], onChange: src(() => {}, icons ? 'setStyles' : 'setView') };
  const name = selection === 'none' ? (icons ? 'Editor' : 'Pager') : icons ? 'Format' : 'Range';
  const spec: ExampleSpec = { name, preset: set, tree: [{ use: { label: selection === 'none' ? (icons ? 'Text formatting' : 'Pages') : icons ? 'Text style' : 'Calendar range', items, ...picked } }] };
  return (
    <Page
      meta={toolbarMeta}
      page={page}
      define={defineToolbar}
      spec={spec}
      inactive={inactive}
      inherit={['size']}
      provider={['size']}
      file={icons ? 'components/editor' : 'components/pager'}
      note="One tab stop: arrow keys, Home and End move between the buttons."
      demo={
        <div className="dx-opts">
          <Toggle page={page} name="_icons" label="icon buttons" />
        </div>
      }
    />
  );
}
