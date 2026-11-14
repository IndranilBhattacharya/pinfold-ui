import { avatarMeta } from '@pinfold/core/meta';
import { inactiveAvatarOptions } from '@pinfold/core';
import { defineAvatar } from '@pinfold/react/avatar';
import { changed } from '../playground/shared';
import { src, type ExampleSpec } from '../playground/example';
import { PEOPLE } from '../playground/people';
import { Choice, Page, Text, Toggle, autoFromEnv, usePage } from '../playground/kit';

/** The avatar page. */

export function AvatarPlayground() {
  const page = usePage(avatarMeta, ['size'], { _kind: 'one', _photo: true, _name: PEOPLE[0].name });
  const group = page.inputs._kind === 'group';
  const photo = !!page.inputs._photo;
  const inactive = inactiveAvatarOptions({ items: group ? [] : undefined, src: photo || undefined });
  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));
  const name = String(page.inputs._name ?? '') || undefined;
  const person = PEOPLE.find((p) => p.name === name);
  const picture = photo ? src(person?.photo ?? PEOPLE[0].photo, `'${person?.file ?? PEOPLE[0].file}'`) : undefined;
  const items = PEOPLE.map((p, i) => ({ name: p.name, src: photo ? src(p.photo, `'${p.file}'`) : undefined, status: i === 0 ? set.status ?? 'online' : undefined }));
  const spec: ExampleSpec = group
    ? { name: 'Team', preset: { ...set, label: 'Project members' }, tree: [{ use: { items } }] }
    : { name: 'Person', preset: set, tree: [{ use: { name, src: picture, status: set.status } }] };
  return (
    <Page
      meta={avatarMeta}
      page={page}
      define={defineAvatar}
      spec={{ ...spec, preset: Object.fromEntries(Object.entries(spec.preset).filter(([k]) => k !== 'status')) }}
      inactive={inactive}
      inherit={['size']}
      provider={['size']}
      file="components/people"
      note={group ? 'Hover or tab to a face: its tooltip has the name. "+N" lists who is hidden. Photos: Unsplash.' : 'Turn off the photo to see the initials: a person keeps one colour everywhere. Photos: Unsplash.'}
      autoLabel={(key, meta) => (key === 'status' ? 'none' : key === 'tooltip' ? 'auto' : autoFromEnv(page.env)(key, meta))}
      demo={
        <>
          <div className="dx-opts">
            <Choice page={page} name="_kind" label="show" options={[['one', 'one person'], ['group', 'a group (items)']]} />
            <Toggle page={page} name="_photo" label="photo" />
          </div>
          {group ? null : <Text page={page} name="_name" label="name" hint="initials, colour and the accessible name" />}
        </>
      }
    />
  );
}
