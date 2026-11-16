import * as React from 'react';
import {
  Accessibility, AppWindow, Bell, Bot, BookOpen, Calendar, CalendarRange, ChevronsRight, ChevronsUpDown, CircleDot,
  CircleUserRound, CloudUpload, Columns2, Command, CreditCard, Footprints, GalleryHorizontal, GitCommitVertical, Hash,
  Inbox, Keyboard, Layers, ListCollapse, ListOrdered, ListTree, LoaderCircle, Map, MessageSquare, MousePointer2,
  MousePointerClick, Package, Palette, PanelLeft, PanelTop, PanelsTopLeft, Pipette, Rocket, Rows3, ScrollText,
  SeparatorHorizontal, SlidersHorizontal, Sparkles, SquareCheck, SquareMenu, SquareStack, Star, Table2, Tags,
  Terminal, TextCursorInput, TextSearch, ToggleRight, TriangleAlert, Gauge, RectangleEllipsis, Info, Wind, Blocks,
  type LucideIcon,
} from 'lucide-react';
import { siClaude, siCodesandbox, siCursor, siGithub, siJavascript, siNextdotjs, siNpm, siPnpm, siReact, siShadcnui, siStackblitz, siTailwindcss, siTypescript, siVite, siWindsurf, siYarn, siBun } from 'simple-icons';

/** One icon per component, used in the navigation, search and page headers. */
export const COMPONENT_ICONS: Record<string, LucideIcon> = {
  accordion: ListCollapse,
  alert: TriangleAlert,
  appshell: PanelsTopLeft,
  avatar: CircleUserRound,
  badge: CircleDot,
  breadcrumb: ChevronsRight,
  button: MousePointerClick,
  calendar: Calendar,
  card: CreditCard,
  carousel: GalleryHorizontal,
  checkbox: SquareCheck,
  colorpicker: Pipette,
  combobox: TextSearch,
  command: Command,
  cursor: MousePointer2,
  datepicker: CalendarRange,
  dialog: AppWindow,
  empty: Inbox,
  fileupload: CloudUpload,
  input: TextCursorInput,
  kbd: Keyboard,
  menu: SquareMenu,
  navbar: PanelTop,
  navmenu: Rows3,
  number: Hash,
  otp: RectangleEllipsis,
  pagination: ListOrdered,
  popover: MessageSquare,
  progress: Gauge,
  radio: CircleDot,
  rating: Star,
  resizable: Columns2,
  scrollarea: ScrollText,
  select: ChevronsUpDown,
  separator: SeparatorHorizontal,
  sidebar: PanelLeft,
  skeleton: SquareStack,
  slider: SlidersHorizontal,
  spinner: LoaderCircle,
  stepper: Footprints,
  switch: ToggleRight,
  table: Table2,
  tabs: Layers,
  tags: Tags,
  timeline: GitCommitVertical,
  toast: Bell,
  toggle: Blocks,
  toolbar: Rows3,
  tooltip: Info,
  tour: Map,
  treeview: ListTree,
};

/** The guides: what each one is about. */
export const GUIDE_ICONS: Record<string, LucideIcon> = {
  introduction: BookOpen,
  installation: Package,
  cli: Terminal,
  shadcn: Blocks,
  ai: Bot,
  theming: Palette,
  tailwind: Wind,
  accessibility: Accessibility,
  'whats-new': Sparkles,
  quickstart: Rocket,
};

export function PageIcon({ name, size = 16 }: { name: string; size?: number }) {
  const Icon = COMPONENT_ICONS[name] ?? GUIDE_ICONS[name] ?? Blocks;
  return <Icon size={size} strokeWidth={1.75} aria-hidden="true" />;
}

/* Brand marks (simple-icons, CC0), drawn in their own colour or the text colour. */
const BRANDS = {
  github: siGithub,
  stackblitz: siStackblitz,
  codesandbox: siCodesandbox,
  typescript: siTypescript,
  javascript: siJavascript,
  npm: siNpm,
  pnpm: siPnpm,
  yarn: siYarn,
  bun: siBun,
  claude: siClaude,
  cursor: siCursor,
  windsurf: siWindsurf,
  shadcn: siShadcnui,
  react: siReact,
  nextjs: siNextdotjs,
  vite: siVite,
  tailwind: siTailwindcss,
} as const;
export type BrandName = keyof typeof BRANDS;

/** Brands whose own colour reads on both the light and the dark site; the rest follow the text colour. */
const COLOURED = new Set<BrandName>(['stackblitz', 'typescript', 'javascript', 'npm', 'pnpm', 'yarn', 'claude']);

export function Brand({ name, size = 16, mono = false }: { name: BrandName; size?: number; mono?: boolean }) {
  const icon = BRANDS[name];
  const fill = !mono && COLOURED.has(name) ? `#${icon.hex}` : 'currentColor';
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill={fill} aria-hidden="true" focusable="false">
      <path d={icon.path} />
    </svg>
  );
}

/** A square language tag (TS blue, JS yellow) like an editor's file icon. */
export function LangIcon({ lang, size = 16 }: { lang: 'ts' | 'js'; size?: number }) {
  const ts = lang === 'ts';
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} aria-hidden="true" focusable="false">
      <rect width="16" height="16" rx="3" fill={ts ? '#3178C6' : '#F7DF1E'} />
      <text x="15" y="14" textAnchor="end" fontFamily="'Geist Variable', system-ui, sans-serif" fontWeight="700" fontSize="8" fill={ts ? '#fff' : '#1a1a1a'}>
        {ts ? 'TS' : 'JS'}
      </text>
    </svg>
  );
}
