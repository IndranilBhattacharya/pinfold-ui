import * as React from 'react';
import { FileCode2, Terminal } from 'lucide-react';
import { defineButton } from '@pinfold/react/button';
import { defineToggle } from '@pinfold/react/toggle';
import { reflow } from '../playground/example';
import { highlight, toJs, type Line } from './highlight';
import { Brand, LangIcon } from './icons';
import { openCodeSandbox, openStackBlitz, project } from './sandbox';
import { SiteToasts } from '../playground/site-toast';
import { type CodeLang, LangProvider, useLang, copyText, CopyButton } from './code-context';

export { type CodeLang, LangProvider, useLang, copyText, CopyButton };

const Tool = defineButton({ variant: 'ghost', tone: 'neutral', size: 'sm', iconOnly: true });
const Lang = defineToggle({ size: 'sm', variant: 'segmented', selection: 'single', tone: 'neutral' });
const More = defineButton({ variant: 'ghost', tone: 'neutral', size: 'sm', fullWidth: true });

function Lines({ lines, numbers }: { lines: Line[]; numbers: boolean }) {
  return (
    <code className={numbers ? 'dx-src dx-src--numbers' : 'dx-src'}>
      {lines.map((line, i) => (
        <span key={i} className="dx-src__line" data-pinfold={line.pinfold ? '' : undefined}>
          {line.tokens.map((tok, j) => (tok.k ? <span key={j} className={`dx-tk-${tok.k}`}>{tok.t}</span> : tok.t))}
          {'\n'}
        </span>
      ))}
    </code>
  );
}

export interface CodeBlockProps {
  /** The code, or the code for each language (TS is turned into JS when no JS is given). */
  code: string | ((lang: CodeLang) => string);
  /** tsx (default), ts, js, jsx, bash, css, json. */
  language?: string;
  /** A file name for the header; the extension follows the language toggle. */
  file?: string;
  title?: string;
  /** Offer TypeScript and JavaScript. Default: on for tsx and ts code. */
  langToggle?: boolean;
  /** Tint the Pinfold lines and count them. Default: on for tsx/ts/js. */
  showPinfold?: boolean;
  /** Open the snippet as a project (needs an `export function Example`). */
  sandbox?: { styles: readonly string[]; title: string };
  /** Extra actions in the header (copy the CLI command, an AI prompt). */
  actions?: React.ReactNode;
  numbers?: boolean;
  /** Collapse code longer than this many lines behind a "show all" button. */
  maxLines?: number;
}

export function CodeBlock({ code, language = 'tsx', file, title, langToggle, showPinfold, sandbox, actions, numbers, maxLines }: CodeBlockProps) {
  const { lang, setLang } = useLang();
  const typed = language === 'tsx' || language === 'ts';
  const toggles = langToggle ?? typed;
  const active: CodeLang = toggles ? lang : language.startsWith('j') ? 'js' : 'ts';
  const raw = typeof code === 'function' ? code(active) : code;
  const text = reflow(toggles && active === 'js' ? toJs(raw) : raw);
  const shownLang = toggles ? (active === 'ts' ? 'tsx' : 'jsx') : language;
  const lines = React.useMemo(() => highlight(text, shownLang), [text, shownLang]);
  const tint = showPinfold ?? /^(tsx|ts|jsx|js)$/.test(language);
  const pinCount = tint ? lines.filter((l) => l.pinfold).length : 0;
  const [open, setOpen] = React.useState(false);
  const clipped = !!maxLines && lines.length > maxLines && !open;
  const shell = language === 'bash' || language === 'sh';
  const name = file ? `${file}.${toggles ? (active === 'ts' ? 'tsx' : 'jsx') : language}` : title;
  const run = async (where: 'stackblitz' | 'codesandbox') => {
    if (!sandbox) return;
    const files = project(text, active, sandbox.styles, sandbox.title);
    try {
      if (where === 'stackblitz') openStackBlitz(files, sandbox.title);
      else await openCodeSandbox(files);
    } catch {
      void SiteToasts.show({ title: 'Could not open the sandbox', description: 'Copy the code instead, or try StackBlitz.', tone: 'danger' });
    }
  };
  return (
    <figure className="dx-codeblock" data-tint={tint ? '' : undefined} data-lang={shownLang}>
      <figcaption className="dx-codeblock__bar">
        <span className="dx-codeblock__file">
          {toggles ? <LangIcon lang={active} size={15} /> : shell ? <Terminal size={15} aria-hidden="true" /> : <FileCode2 size={15} aria-hidden="true" />}
          {name ?? (shell ? 'Terminal' : language.toUpperCase())}
        </span>
        <span className="dx-codeblock__tools">
          {toggles ? (
            <Lang
              label="Language"
              hideLabel
              value={[active]}
              onChange={(v) => Array.isArray(v) && v[0] && setLang(v[0] as CodeLang)}
              items={[
                { value: 'ts', label: 'TypeScript', icon: <LangIcon lang="ts" size={14} />, iconOnly: true },
                { value: 'js', label: 'JavaScript', icon: <LangIcon lang="js" size={14} />, iconOnly: true },
              ]}
            />
          ) : null}
          {sandbox ? (
            <>
              <Tool label="Open in StackBlitz" icon={<Brand name="stackblitz" size={15} />} onClick={() => run('stackblitz')} />
              <Tool label="Open in CodeSandbox" icon={<Brand name="codesandbox" size={15} />} onClick={() => run('codesandbox')} />
            </>
          ) : null}
          {actions}
          <CopyButton text={text} label={shell ? 'Copy command' : 'Copy code'} what={shell ? 'Command' : 'Code'} />
        </span>
      </figcaption>
      <pre className={clipped ? 'dx-codeblock__pre dx-codeblock__pre--clipped' : 'dx-codeblock__pre'} style={clipped ? ({ '--dx-max-lines': maxLines } as React.CSSProperties) : undefined} tabIndex={0} aria-label={name ? `Code: ${name}` : 'Code'}>
        <Lines lines={lines} numbers={numbers ?? lines.length > 6} />
      </pre>
      {clipped ? (
        <More className="dx-codeblock__more" label={`Show all ${lines.length} lines`} onClick={() => setOpen(true)} />
      ) : null}
      {tint && pinCount ? (
        <p className="dx-codeblock__count">
          <span className="dx-codeblock__swatch" aria-hidden="true" />
          {pinCount} of {lines.length} lines are Pinfold
        </p>
      ) : null}
    </figure>
  );
}
