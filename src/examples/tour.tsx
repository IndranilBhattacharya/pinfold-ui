import * as React from 'react';
import { tourMeta } from '@pinfold/core/meta';
import { inactiveTourOptions } from '@pinfold/core';
import { Badge } from '@pinfold/react/badge';
import { Input } from '@pinfold/react/input';
import { Button } from '@pinfold/react/button';
import { changed } from '../playground/shared';
import { src, type ExampleSpec } from '../playground/example';
import { defineTour } from '@pinfold/react/tour';
import { Page, Toggle, usePage } from '../playground/kit';
import { svg } from './toggle';

/** The tour page. */

const PLUS = svg('M12 5v14M5 12h14');

/** Selectors are scoped to the mock app, so a step can never land on the site's own chrome. */
function MockApp() {
  return (
    <div className="dx-mock" data-tour-demo>
      <header className="dx-mock__bar">
        <strong>Harbor</strong>
        <div data-tour="search" className="dx-mock__search">
          <Input label="Search" placeholder="Search projects" size="sm" />
        </div>
        <div data-tour="create">
          <Button label="New project" size="sm" startContent={PLUS} />
        </div>
      </header>
      <div className="dx-mock__stats" data-tour="stats">
        {[['Projects', '12'], ['Open issues', '48'], ['Deploys', '7']].map(([k, v]) => (
          <div key={k} className="dx-mock__stat">
            <span className="dx-hint">{k}</span>
            <b>{v}</b>
          </div>
        ))}
      </div>
      <div data-tour="activity" className="dx-mock__activity">
        <Badge label="Live" variant="soft" size="sm" tone="success" />
        <span>Amara Osei cleared HB-4107 at customs a minute ago</span>
      </div>
    </div>
  );
}

/**
 * The tour opens as the preview loads (Open on load), so a change of option shows at once: a change
 * mounts the preview afresh, as a new build would, and the tour starts again on its first step.
 */

function TourDemo({ Preset, props }: { Preset: React.ElementType; props: Record<string, any> }) {
  const { _open: openOnLoad, ...rest } = props as { _open?: boolean } & Record<string, unknown>;
  const [open, setOpen] = React.useState(openOnLoad !== false);
  const [step, setStep] = React.useState(0);
  const [last, setLast] = React.useState(openOnLoad !== false ? 'Tour started.' : 'The tour has not run yet.');
  const steps = [
    { id: 'search', target: '[data-tour-demo] [data-tour=search]', title: 'Search anything', content: 'Find a project, an issue or a person from here.' },
    { id: 'create', target: '[data-tour-demo] [data-tour=create]', title: 'Start something new', content: 'New project sets up a workspace in a few seconds.', placement: 'bottom-end' },
    { id: 'stats', target: '[data-tour-demo] [data-tour=stats]', title: 'Your numbers', content: 'Projects, open issues and deploys at a glance.', placement: 'top' },
    { id: 'activity', target: '[data-tour-demo] [data-tour=activity]', title: 'What just happened', content: 'The latest activity from your team lands here.' },
  ];
  return (
    <div className="dx-stack">
      <div>
        <Button
          label="Start the tour"
          onClick={() => {
            setStep(0);
            setOpen(true);
            setLast('Tour started.');
          }}
        />
      </div>
      <MockApp />
      <Preset
        {...rest}
        steps={steps}
        open={open}
        step={step}
        onOpenChange={setOpen}
        onStepChange={(i: number) => setStep(i)}
        onComplete={() => {
          setOpen(false);
          setLast('onComplete(): you finished all four steps.');
        }}
        onSkip={(i: number) => {
          setOpen(false);
          setLast(`onSkip(${i}): skipped on step ${i + 1} of ${steps.length}.`);
        }}
      />
      <p className="dx-hint" role="status">
        {open ? `Step ${step + 1} of ${steps.length}` : 'Closed'} · Last event: <b>{last}</b>
      </p>
    </div>
  );
}

export function TourPlayground() {
  const page = usePage(tourMeta, ['size', 'tone'], {});
  const openOnLoad = page.inputs._open !== false;
  const inactive = inactiveTourOptions({ ...(page.options as any), steps: [{}, {}, {}, {}] });
  const set = Object.fromEntries(changed(page.options, page.defaults, inactive));
  const spec: ExampleSpec = {
    name: 'Onboarding',
    preset: set,
    imports: ["import { Button } from '@pinfold/react/button';","import type { TourStep } from '@pinfold/react/tour';","","const steps: TourStep[] = [","  { target: '[data-tour=search]', title: 'Search anything', content: 'Find a project, an issue or a person from here.' },","  { target: '[data-tour=create]', title: 'Start something new', content: 'New project sets up a workspace.', placement: 'bottom-end' },","  { target: '[data-tour=stats]', title: 'Your numbers', content: 'Projects, open issues and deploys.', placement: 'top' },","  { target: '[data-tour=activity]', title: 'What just happened', content: 'The latest activity lands here.' },","];"],
    body: [`const [open, setOpen] = useState(${openOnLoad});`],
    tree: [
      {
        app: TourDemo,
        use: {
          steps: src([], 'steps'),
          open: src(false, 'open'),
          onOpenChange: src(undefined, 'setOpen'),
          onComplete: src(undefined, 'markSeen'),
          onSkip: src(undefined, '(index) => track("tour-skipped", index)'),
          _open: src(openOnLoad, ''),
        },
        code: ['<Button label="Start the tour" onClick={() => setOpen(true)} />', '{/* AppHeader marks its search field, button, stats and activity with data-tour. */}', '<AppHeader />', '$TAG'],
      },
    ],
  };
  return (
    <Page
      wide
      meta={tourMeta}
      page={page}
      define={defineTour}
      spec={spec}
      inactive={inactive}
      inherit={['size', 'tone']}
      provider
      motion
      align="start"
      file="components/onboarding"
      demo={<Toggle page={page} name="_open" label="Open on load" checked={openOnLoad} />}
      note="Press Start the tour. The tour opens as the preview loads (switch Open on load off to start closed), so a change of option shows at once. The four steps point at the search field, the New project button and the stat cards of the small app above; Next, Back, the arrow keys, Skip and Escape all work, and the line under the preview shows onComplete or onSkip. With the dim or blur mask the rest of the page is covered while the tour runs; mask none leaves it usable."
    />
  );
}
