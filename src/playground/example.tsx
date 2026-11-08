import * as React from 'react';
import type { ComponentMeta } from '@pinfold/core/meta';
import { appSetup, type Env } from './shared';

/**
 * One source for a preview and its code. A spec says what the page shows; `Live` renders it through
 * the component's real `define<Name>(preset)`, and `exampleCode` prints the same objects. Nothing
 * else reaches the preview (`previewOnly` is the one exception, and the page says so), so what the
 * code panel shows is what is on screen.
 */

/** A value that renders as `value` and prints as `code`: an icon, a picture, a handler. */
export interface Source<T = unknown> {
  $code: string;
  value: T;
}
export const src = <T,>(value: T, code: string): Source<T> => ({ $code: code, value });
const isSource = (v: unknown): v is Source => typeof v === 'object' && v !== null && '$code' in v;

export type ExampleNode =
  | string
  | { use: Record<string, unknown> }
  | { element: React.ReactNode; code: string }
  | { tag: string; props?: Record<string, unknown>; children: ExampleNode[] }
  | AppNode;

/**
 * The component inside a small app that holds state: the preview renders `app` (which renders
 * the preset with `props` plus its own state), the code prints `code` with `$TAG` standing for
 * the preset's tag printed from `use`.
 */
export interface AppNode {
  app: React.ComponentType<{ Preset: React.ElementType; props: Record<string, any> }>;
  use: Record<string, unknown>;
  code: string[];
}
const isApp = (node: ExampleNode): node is AppNode => typeof node === 'object' && 'app' in node;

export interface ExampleSpec {
  /** The name the preset is exported as. */
  name: string;
  preset: Record<string, unknown>;
  tree: ExampleNode[];
  /** Extra import lines the tree needs. */
  imports?: string[];
  /** Lines in the example component before `return`: its state and data. */
  body?: string[];
  /** Lines after the component, e.g. how to call its controller. */
  after?: string[];
  /** Applied in the preview only, never printed: keeps an overlay open so its options show. */
  previewOnly?: Record<string, unknown>;
}

/** The runtime value of a config: sources resolved, recursively. */
export function plain(v: unknown): any {
  if (isSource(v)) return v.value;
  if (Array.isArray(v)) return v.map(plain);
  if (v && typeof v === 'object' && !React.isValidElement(v)) return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, plain(x)]));
  return v;
}

const clean = (o: Record<string, unknown>) => Object.entries(o).filter(([, v]) => v !== undefined && v !== '');

/** A value the way a developer writes it. */
function print(v: unknown): string {
  if (isSource(v)) return v.$code;
  if (typeof v === 'string') return `'${v.replace(/'/g, "\\'")}'`;
  if (Array.isArray(v)) return `[${v.map(print).join(', ')}]`;
  if (v && typeof v === 'object') return `{ ${clean(v as Record<string, unknown>).map(([k, x]) => `${k}: ${print(x)}`).join(', ')} }`;
  return String(v);
}

function attr(key: string, v: unknown): string {
  if (v === true) return key;
  if (typeof v === 'string' && !/["{}]/.test(v)) return `${key}="${v}"`;
  return `${key}={${print(v)}}`;
}

function printTree(nodes: ExampleNode[], name: string, indent: string): string[] {
  return nodes.flatMap((node) => {
    if (typeof node === 'string') return [indent + node];
    if ('element' in node) return [indent + node.code];
    if (isApp(node)) {
      // `_` keys are the demo's own switches: the preview reads them, the code never shows them.
      const tag = `<${[name, ...clean(node.use).filter(([k]) => !k.startsWith('_')).map(([k, v]) => attr(k, v))].join(' ')} />`;
      return node.code.map((line) => indent + line.replace('$TAG', tag));
    }
    if ('use' in node) return [`${indent}<${[name, ...clean(node.use).map(([k, v]) => attr(k, v))].join(' ')} />`];
    const open = [node.tag, ...clean(node.props ?? {}).map(([k, v]) => attr(k, v))].join(' ');
    return [`${indent}<${open}>`, ...printTree(node.children, name, indent + '  '), `${indent}</${node.tag}>`];
  });
}

/** The whole file a developer would write. */
export function exampleCode(meta: ComponentMeta, spec: ExampleSpec, env: Env): string {
  const define = `define${meta.pascal ?? meta.displayName.split(' ')[0]}`;
  const preset = clean(spec.preset);
  const body = printTree(spec.tree, spec.name, '    ');
  return [
    `import { ${define} } from '${meta.importPath}';`,
    ...(spec.imports ?? []),
    '',
    '// Define once, outside components.',
    preset.length ? `export const ${spec.name} = ${define}(${print(Object.fromEntries(preset))});` : `export const ${spec.name} = ${define}();`,
    '',
    '// Use it anywhere.',
    'export function Example() {',
    ...(spec.body ?? []).map((l) => '  ' + l),
    ...(spec.body?.length ? [''] : []),
    '  return (',
    ...(spec.tree.length > 1 || spec.tree.some((n) => typeof n === 'string' || (isApp(n) && n.code.length > 1)) ? ['    <>', ...body.map((l) => '  ' + l), '    </>'] : body),
    '  );',
    '}',
    ...(spec.after?.length ? ['', ...spec.after] : []),
    ...appSetup(env, meta.name, meta.requires),
  ].join('\n');
}

function renderTree(nodes: ExampleNode[], Preset: React.ElementType, previewOnly?: Record<string, unknown>): React.ReactNode {
  return nodes.map((node, i) => {
    if (typeof node === 'string') return <React.Fragment key={i}>{node}</React.Fragment>;
    if ('element' in node) return <React.Fragment key={i}>{node.element}</React.Fragment>;
    if (isApp(node)) return <node.app key={i} Preset={Preset} props={{ ...plain(node.use), ...previewOnly }} />;
    if ('use' in node) return <Preset key={i} {...plain(node.use)} {...previewOnly} />;
    return React.createElement(node.tag, { key: i, ...plain(node.props ?? {}) }, renderTree(node.children, Preset, previewOnly));
  });
}

/**
 * The spec on screen, through the component's real preset. It is keyed by the printed code, so a
 * change that the code shows (a `defaultChecked`, say) takes effect as it would on a fresh mount.
 */
export function Live({ define, spec, meta }: { define: (preset: any) => React.ElementType; spec: ExampleSpec; meta: ComponentMeta }) {
  const key = exampleCode(meta, spec, ENV_FOR_KEY);
  const Preset = React.useMemo(() => define(plain(spec.preset)), [key]); // eslint-disable-line react-hooks/exhaustive-deps
  return <React.Fragment key={key}>{renderTree(spec.tree, Preset, spec.previewOnly)}</React.Fragment>;
}
const ENV_FOR_KEY = { stylePack: 'default', theme: '', rtl: false, reducedMotion: false, width: 100, size: '', tone: '' } as Env;

/* ------------------------------------------------------------------ reflow */

const OPEN: Record<string, string> = { '(': ')', '[': ']', '{': '}' };

/** Index of the bracket closing the one at `at`, skipping strings. */
function closing(line: string, at: number): number {
  let depth = 0;
  let quote = '';
  for (let i = at; i < line.length; i++) {
    const c = line[i];
    if (quote) {
      if (c === '\\') i++;
      else if (c === quote) quote = '';
    } else if (c === "'" || c === '"' || c === '`') quote = c;
    else if (c in OPEN) depth++;
    else if (c === ')' || c === ']' || c === '}') {
      if (--depth === 0) return i;
    }
  }
  return -1;
}

/** Split on a separator at depth 0, outside strings. */
function splitTop(text: string, sep: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let quote = '';
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quote) {
      if (c === '\\') i++;
      else if (c === quote) quote = '';
    } else if (c === "'" || c === '"' || c === '`') quote = c;
    else if (c in OPEN) depth++;
    else if (c === ')' || c === ']' || c === '}') depth--;
    else if (c === sep && depth === 0) {
      parts.push(text.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(text.slice(start));
  return parts.map((p) => p.trim()).filter(Boolean);
}

function breakLine(line: string, width: number): string[] {
  if (line.length <= width || /^\s*\/\//.test(line)) return [line];
  const indent = line.match(/^\s*/)![0];
  const inner = indent + '  ';
  const body = line.slice(indent.length);

  // A self-closing or opening JSX tag: one attribute per line.
  const tag = body.match(/^<([A-Za-z][\w.]*)\s(.*?)(\s*\/?>)$/s);
  if (tag && closing(`(${tag[2]})`, 0) !== -1) {
    const attrs = splitTop(tag[2], ' ');
    return [`${indent}<${tag[1]}`, ...attrs.flatMap((a) => breakLine(inner + a, width)), indent + tag[3].trim()];
  }
  const returned = body.match(/^return (<.*>);?$/s);
  if (returned) return [`${indent}return (`, ...breakLine(inner + returned[1], width), `${indent});`];

  // The first bracket that holds something: its items go one per line, and a bracket that wraps
  // a single bracket hugs it, as in `items={[` or `define({`.
  for (let i = 0; i < line.length; i++) {
    if (!(line[i] in OPEN)) continue;
    let end = closing(line, i);
    if (end <= i + 1) continue;
    let open = i;
    while (line[open + 1] in OPEN && closing(line, open + 1) === end - 1) {
      open += 1;
      end -= 1;
    }
    const close = line.slice(end);
    const items = splitTop(line.slice(open + 1, end), ',');
    if (!items.length) continue;
    // One item in a call, or the one value of a JSX attribute: no trailing comma.
    const comma = items.length === 1 && (line[open] === '(' || line[open - 1] === '=') ? '' : ',';
    return [line.slice(0, open + 1), ...items.flatMap((item) => breakLine(`${inner}${item}${comma}`, width)), indent + close];
  }
  return [line];
}

/** Long lines become the shape a formatter would give them, so code never needs dragging sideways. */
export function reflow(code: string, width = 74): string {
  return code.split('\n').flatMap((line) => breakLine(line, width)).join('\n');
}
