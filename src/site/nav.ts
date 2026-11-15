import { componentMetas, type ComponentMeta } from '@pinfold/core/meta';

export interface Guide {
  name: string;
  title: string;
  /** One line for menus and search. */
  blurb: string;
  group: string;
}

export const GUIDES: Guide[] = [
  { name: 'introduction', title: 'Introduction', blurb: 'What Pinfold is and how a component is built from one config.', group: 'Get started' },
  { name: 'installation', title: 'Installation', blurb: 'Add the packages to Next.js, Vite or React Router in a minute.', group: 'Get started' },
  { name: 'cli', title: 'CLI', blurb: 'init, add, theme and doctor: set up and check a project.', group: 'Get started' },
  { name: 'theming', title: 'Theming', blurb: 'Your colours in any CSS format, contrast checked, and style packs.', group: 'Customise' },
  { name: 'tailwind', title: 'Tailwind CSS', blurb: 'Utilities win by design; one palette for both.', group: 'Customise' },
  { name: 'shadcn', title: 'shadcn registry', blurb: 'npx shadcn add @pinfold/<name>, styles included.', group: 'Integrations' },
  { name: 'ai', title: 'AI and MCP', blurb: 'An MCP server, llms.txt and JSON Schema for coding agents.', group: 'Integrations' },
  { name: 'accessibility', title: 'Accessibility', blurb: 'WCAG 2.2 AA, checked on every build. What that covers.', group: 'Quality' },
];

/** Where each component sits in the navigation. */
export const COMPONENT_GROUPS: Array<[string, string[]]> = [
  ['Layout', ['appshell', 'navbar', 'sidebar', 'navmenu', 'tabs', 'breadcrumb', 'pagination', 'stepper', 'resizable', 'scrollarea']],
  ['Data display', ['table', 'card', 'accordion', 'treeview', 'timeline', 'carousel', 'avatar', 'badge', 'tags', 'kbd', 'empty', 'skeleton']],
  ['Forms', ['input', 'number', 'otp', 'checkbox', 'radio', 'switch', 'toggle', 'toolbar', 'slider', 'select', 'combobox', 'calendar', 'datepicker', 'colorpicker', 'rating', 'fileupload']],
  ['Overlays', ['dialog', 'popover', 'tooltip', 'menu', 'command', 'toast', 'tour']],
  ['Feedback', ['alert', 'progress', 'spinner']],
  ['Actions and effects', ['button', 'separator', 'cursor']],
];

const byName = new Map(componentMetas.map((m) => [m.name, m]));
export const metaFor = (name: string): ComponentMeta | undefined => byName.get(name);
export const guideFor = (name: string): Guide | undefined => GUIDES.find((g) => g.name === name);

/** Components in navigation order; any the groups do not name come last, so a new one is never lost. */
export const COMPONENTS: ComponentMeta[] = (() => {
  const placed = COMPONENT_GROUPS.flatMap(([, names]) => names).filter((n) => byName.has(n));
  const rest = componentMetas.map((m) => m.name).filter((n) => !placed.includes(n));
  return [...placed, ...rest].map((n) => byName.get(n)!);
})();

export const groupOf = (name: string) => COMPONENT_GROUPS.find(([, names]) => names.includes(name))?.[0] ?? 'More';

/** Every docs page in reading order, for previous / next links. */
export const ORDER: string[] = [...GUIDES.map((g) => g.name), ...COMPONENTS.map((m) => m.name)];
