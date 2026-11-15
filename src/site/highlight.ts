/**
 * Syntax colours for the snippets on the site (TSX, JS, CSS, JSON, shell), and which lines are Pinfold:
 * imports from @pinfold, a define/use call with its config, a preset's tag, the provider and the CLI.
 */

export type Token = { t: string; k?: 'kw' | 'str' | 'com' | 'num' | 'tag' | 'attr' | 'fn' | 'type' | 'pin' | 'punc' | 'prop' };
export interface Line {
  tokens: Token[];
  pinfold: boolean;
}

/** React's own hooks: never Pinfold, though they share the use prefix. */
const REACT_HOOKS = /^use(State|Effect|LayoutEffect|InsertionEffect|Ref|Memo|Callback|Reducer|Context|Id|Transition|DeferredValue|SyncExternalStore|ImperativeHandle|DebugValue|Optimistic|ActionState|FormStatus)$/;

const KEYWORDS = new Set(
  'import export from const let var function return if else for of in while await async new typeof as default type interface extends implements class true false null undefined satisfies void try catch throw this keyof readonly enum declare'.split(' '),
);

const RULES: Array<[RegExp, Token['k'] | ((m: string) => Token['k'])]> = [
  [/^\/\/.*/, 'com'],
  [/^\/\*.*?(\*\/|$)/, 'com'],
  [/^#(?!\{).*/, 'com'],
  [/^(['"`])(?:\\.|(?!\1).)*\1?/, 'str'],
  [/^@pinfold\/[\w/.-]+/, 'pin'],
  [/^<\/?[A-Za-z][\w.]*/, 'tag'],
  [/^\/?>/, 'tag'],
  [/^\b((define|use)[A-Z]\w*|createTheme|toDTCG)(?=\s*[(<])/, (m) => (REACT_HOOKS.test(m) ? 'fn' : 'pin')],
  [/^\bPinfold\w*/, 'pin'],
  [/^\b\d[\d_.]*(px|rem|em|ms|%)?\b/, 'num'],
  [/^[A-Za-z_$][\w$-]*(?==)/, 'attr'],
  [/^[A-Za-z_$][\w$]*(?=\s*:(?!:))/, 'prop'],
  [/^[A-Za-z_$][\w$]*(?=\s*\()/, 'fn'],
  [/^[A-Z][\w$]*/, 'type'],
  [/^[A-Za-z_$][\w$]*/, (m) => (KEYWORDS.has(m) ? 'kw' : undefined)],
  [/^[{}()[\];,.=<>+\-*/!?:&|]+/, 'punc'],
  [/^\s+/, undefined],
  [/^./, undefined],
];

function tokenize(line: string, lang: string): Token[] {
  const out: Token[] = [];
  let rest = line;
  const shell = lang === 'bash' || lang === 'sh';
  while (rest) {
    let matched = false;
    for (const [re, kind] of RULES) {
      if (shell && re.source.startsWith('^\\/\\/')) continue;
      if (!shell && re.source.startsWith('^#')) continue;
      const m = re.exec(rest);
      if (!m) continue;
      const text = m[0];
      const k = typeof kind === 'function' ? kind(text) : kind;
      const last = out[out.length - 1];
      if (last && last.k === k && k === undefined) last.t += text;
      else out.push({ t: text, k });
      rest = rest.slice(text.length);
      matched = true;
      break;
    }
    if (!matched) {
      out.push({ t: rest[0] });
      rest = rest.slice(1);
    }
  }
  if (shell) for (const tok of out) if (tok.k === undefined && /\bpinfold\b|shadcn/.test(tok.t)) tok.k = 'pin';
  return out;
}

/** The bracket balance of a line, ignoring strings and comments. */
function balance(line: string): number {
  const bare = line.replace(/(['"`])(?:\\.|(?!\1).)*\1/g, '').replace(/\/\/.*$/, '');
  let n = 0;
  for (const ch of bare) {
    if (ch === '(' || ch === '{' || ch === '[') n++;
    else if (ch === ')' || ch === '}' || ch === ']') n--;
  }
  return n;
}

/** Marks the Pinfold lines: what a developer writes for Pinfold, as opposed to their own app code. */
function pinfoldLines(lines: string[], lang: string): boolean[] {
  if (lang === 'bash' || lang === 'sh') return lines.map((l) => /\bpinfold\b|@pinfold|shadcn add @pinfold/.test(l));
  if (lang === 'css') return lines.map((l) => /--pinfold|pinfold/.test(l));
  const presets = new Set<string>();
  for (const l of lines) {
    const m = /(?:const|let)\s+(\w+)\s*=\s*((?:define|use)[A-Z]\w*)\s*[(<]/.exec(l);
    if (m && !REACT_HOOKS.test(m[2])) presets.add(m[1]);
  }
  const flags = lines.map(() => false);
  let depth = 0;
  let open: 'call' | 'tag' | null = null;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (open) {
      flags[i] = true;
      depth += balance(l);
      if (open === 'call' && depth <= 0) open = null;
      else if (open === 'tag' && /\/>|<\/\w+>\s*$/.test(l) && depth <= 0) open = null;
      continue;
    }
    const tag = /<([A-Z]\w*)/.exec(l);
    const isPreset = tag && presets.has(tag[1]);
    const call = /\b((?:define|use)[A-Z]\w*|createTheme|toDTCG)\s*[(<]/.exec(l);
    const isCall = !!call && !REACT_HOOKS.test(call[1]);
    if (/@pinfold|\bPinfoldProvider\b|\bdefineConfig\b|npx pinfold/.test(l) || isCall || isPreset) {
      flags[i] = true;
      if (isCall) {
        depth = balance(l);
        if (depth > 0) open = 'call';
      } else if (isPreset && !/\/>|<\/\w+>/.test(l)) {
        depth = balance(l);
        open = 'tag';
      }
    }
  }
  return flags;
}

export function highlight(code: string, lang: string): Line[] {
  const lines = code.replace(/\n$/, '').split('\n');
  const flags = pinfoldLines(lines, lang);
  return lines.map((l, i) => ({ tokens: tokenize(l, lang), pinfold: flags[i] }));
}

/**
 * TypeScript to JavaScript for the snippets the site prints: type-only imports, type and interface
 * declarations, generic arguments on calls, `as` casts, `satisfies` and parameter annotations.
 */
export function toJs(code: string): string {
  const lines = code.split('\n');
  const out: string[] = [];
  let skipping = 0;
  for (const line of lines) {
    if (skipping > 0) {
      skipping += balance(line);
      continue;
    }
    if (/^\s*import type\b/.test(line)) continue;
    if (/^\s*(export\s+)?(type|interface)\s+\w+/.test(line)) {
      const b = balance(line);
      if (b > 0) skipping = b;
      continue;
    }
    out.push(
      line
        .replace(/import \{([^}]*)\}/, (m, names: string) => {
          const kept = names.split(',').filter((n) => !/^\s*type\s/.test(n));
          return kept.length ? `import {${kept.join(',')}}` : m;
        })
        // Generic arguments on any call or constructor: useState<string | null>(…), new Promise<void>(…).
        .replace(/\b([A-Za-z_$][\w$.]*)<(?:[\w\s|.,'[\]]|<[^<>]*>)*>(?=\()/g, '$1')
        // A type on a destructured parameter: ({ signal }: { signal: AbortSignal }) => …
        .replace(/(\})\s*:\s*\{[^{}]*\}(?=\s*[,)])/g, '$1')
        .replace(/\s+as\s+(const|[A-Z][\w.<>[\]|' ]*)(?=[),;\]}]|$)/g, '')
        .replace(/\s+satisfies\s+[\w.<>[\]|' ]+(?=[),;]|$)/g, '')
        .replace(/\(([\w$]+)\s*:\s*[\w.<>[\]|' ]+\)\s*=>/g, '($1) =>')
        .replace(/([(,]\s*[\w$]+)\??\s*:\s*(string|number|boolean|unknown|any|[A-Z][\w.]*(?:<[^>]*>)?(?:\[\])?)(?=\s*[,)])/g, '$1'),
    );
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n');
}
