import { version } from '@pinfold/core';

/**
 * A runnable Vite + React project for a snippet, opened in StackBlitz or CodeSandbox. The snippet is the
 * app; the stylesheets it needs are imported in main.
 */

type Files = Record<string, string>;

const range = `^1.2.0 || ^${version}`;

/** Names a snippet uses without declaring them: custom components, handlers, and data. */
function standIns(code: string, lang: 'ts' | 'js'): string[] {
  const declared = new Set<string>();
  for (const m of code.matchAll(/\b(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/g)) declared.add(m[1]);
  for (const m of code.matchAll(/\[\s*([A-Za-z_$][\w$]*)\s*,\s*([A-Za-z_$][\w$]*)\s*\]\s*=/g)) {
    declared.add(m[1]);
    declared.add(m[2]);
  }
  for (const m of code.matchAll(/import\s+(?:type\s+)?\{([^}]*)\}/g)) {
    for (const n of m[1].split(',')) declared.add(n.trim().split(/\s+as\s+/).pop()!.replace(/^type\s+/, ''));
  }
  for (const m of code.matchAll(/import\s+([A-Za-z_$][\w$]*)\s+from/g)) declared.add(m[1]);

  const out: string[] = [];
  const added = new Set<string>();

  // 1. Any JSX tag used as <Component ... /> that is not declared.
  for (const m of code.matchAll(/<([A-Z][A-Za-z0-9_$]*)/g)) {
    const name = m[1];
    if (declared.has(name) || added.has(name) || /^(React|Fragment|StrictMode|Suspense)$/.test(name)) continue;
    added.add(name);
    if (/icon/i.test(name)) {
      out.push(
        `const ${name} = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ verticalAlign: 'middle', display: 'inline-block' }}><circle cx="12" cy="12" r="9" /></svg>;`,
      );
    } else if (/panel/i.test(name)) {
      out.push(
        `const ${name} = () => <div style={{ padding: '16px 20px', border: '1px dashed rgba(124,58,237,0.3)', borderRadius: 8, margin: '8px 0', background: 'rgba(124,58,237,0.04)' }}><strong style={{ fontSize: '0.875rem' }}>${name.replace(/([A-Z])/g, ' $1').trim()}</strong><p style={{ margin: '4px 0 0', opacity: 0.7, fontSize: '0.8125rem' }}>Sample panel content</p></div>;`,
      );
    } else {
      out.push(
        lang === 'ts'
          ? `const ${name} = (props: { children?: React.ReactNode }) => <div style={{ padding: 12, border: '1px dashed #8884', borderRadius: 6, margin: '4px 0' }}>{props.children ?? '${name}'}</div>;`
          : `const ${name} = (props) => <div style={{ padding: 12, border: '1px dashed #8884', borderRadius: 6, margin: '4px 0' }}>{props.children ?? '${name}'}</div>;`,
      );
    }
  }

  // 2. Handlers and variables passed as attr={name}
  for (const m of code.matchAll(/(\w+)=\{([A-Za-z_$][\w$]*)\}/g)) {
    const [, attr, name] = m;
    if (declared.has(name) || added.has(name) || /^(true|false|null|undefined|window|document|console|Math|Date|JSON|Object|Array|String|Number|Boolean|RegExp)$/.test(name)) continue;
    added.add(name);
    const fn = /^on[A-Z]/.test(attr) || /^(set|handle|save|remove|delete|load|fetch|run|go|close|open|submit|retry|follow)/.test(name);
    out.push(
      `const ${name} = ${fn ? (lang === 'ts' ? '(...args: unknown[]) => console.log(' + JSON.stringify(name) + ', ...args)' : '(...args) => console.log(' + JSON.stringify(name) + ', ...args)') : (lang === 'ts' ? '[] as never[]' : '[]')};`,
    );
  }

  // 3. Object property values: key: Identifier
  for (const m of code.matchAll(/\b([A-Za-z_$][\w$]*)\s*:\s*([A-Za-z_$][\w$]*)\b/g)) {
    const [, key, name] = m;
    if (
      declared.has(name) ||
      added.has(name) ||
      /^(true|false|null|undefined|return|typeof|instanceof|void|delete|new|in|default|case|window|document|console|Math|Date|JSON|Object|Array|String|Number|Boolean|RegExp)$/.test(name) ||
      /^(string|number|boolean|any|unknown|never|void|object|symbol|bigint)$/.test(name)
    )
      continue;
    added.add(name);
    if (/^[A-Z]/.test(name)) {
      out.push(
        `const ${name} = () => <span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: '50%', background: 'currentColor', opacity: 0.6 }} />;`,
      );
    } else if (
      /(items|rows|columns|data|options|list|people|users|cards|tags)/i.test(key) ||
      /(items|rows|columns|data|options|list|people|users|cards|tags)/i.test(name)
    ) {
      out.push(`const ${name} = ${lang === 'ts' ? '[] as never[]' : '[]'};`);
    } else if (/^(on[A-Z]|render|format|filter|validate)/.test(key) || /^(set|handle|get|format|filter)/.test(name)) {
      out.push(
        `const ${name} = ${lang === 'ts' ? '(...args: unknown[]) => console.log(' + JSON.stringify(name) + ', ...args)' : '(...args) => console.log(' + JSON.stringify(name) + ', ...args)'};`,
      );
    } else {
      out.push(`const ${name} = undefined;`);
    }
  }

  return out;
}

export function project(code: string, lang: 'ts' | 'js', styles: readonly string[], title: string): Files {
  const x = lang === 'ts' ? 'tsx' : 'jsx';
  // The app-wide part of a snippet (stylesheets, the provider) lives in main here; the app's own
  // component files are the packages themselves.
  let app = code.split(/\n\/\/ ---- once for the whole app/)[0].trimEnd().replace(/from '@\/components\/ui\/([\w-]+)'/g, "from '@pinfold/react/$1'") + '\n';
  const name = /export function ([A-Z]\w*)\s*\(/.exec(app)?.[1];
  const usesExample = !!name;
  const stubs = standIns(app, lang);
  if (stubs.length) {
    const lines = app.split('\n');
    let at = 0;
    lines.forEach((l, i) => /^import\b/.test(l) && (at = i + 1));
    lines.splice(at, 0, '', '// Stand-ins for your own components, functions and data.', ...stubs);
    app = lines.join('\n');
  }
  const css = ['core', ...styles.filter((s) => s !== 'core')].map((s) => `import '@pinfold/css/${s}.css';`).join('\n');
  const files: Files = {
    'package.json': JSON.stringify(
      {
        name: 'pinfold-example',
        private: true,
        type: 'module',
        scripts: { dev: 'vite', build: 'vite build' },
        dependencies: { '@pinfold/react': range, '@pinfold/css': range, '@pinfold/core': range, react: '^19.0.0', 'react-dom': '^19.0.0' },
        devDependencies: { vite: '^6.0.0', '@vitejs/plugin-react': '^4.3.0', ...(lang === 'ts' ? { typescript: '^5.6.0', '@types/react': '^19.0.0', '@types/react-dom': '^19.0.0' } : {}) },
      },
      null,
      2,
    ),
    'vite.config.js': "import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\n\nexport default defineConfig({ plugins: [react()] });\n",
    'index.html': `<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1" />\n    <title>${title}</title>\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/main.${x}"></script>\n  </body>\n</html>\n`,
    [`src/main.${x}`]: `${css}\nimport { StrictMode } from 'react';\nimport { createRoot } from 'react-dom/client';\nimport { PinfoldProvider } from '@pinfold/react';\nimport { ${name ?? 'Example'} as Example } from './Example';\n\ncreateRoot(document.getElementById('root')${lang === 'ts' ? '!' : ''}).render(\n  <StrictMode>\n    <PinfoldProvider theme="system">\n      <main style={{ padding: 32 }}>\n        <Example />\n      </main>\n    </PinfoldProvider>\n  </StrictMode>,\n);\n`,
    [`src/Example.${x}`]: usesExample ? app : `export function Example() {\n  return null;\n}\n\n/*\n${app}*/\n`,
  };
  if (lang === 'ts')
    files['tsconfig.json'] = JSON.stringify({ compilerOptions: { target: 'ES2022', module: 'ESNext', moduleResolution: 'bundler', jsx: 'react-jsx', strict: true, skipLibCheck: true, lib: ['ES2022', 'DOM', 'DOM.Iterable'] }, include: ['src'] }, null, 2);
  return files;
}

/** StackBlitz: a form POST that opens the project in a new tab. */
export function openStackBlitz(files: Files, title: string) {
  const form = document.createElement('form');
  form.method = 'POST';
  const fileExt = files['src/Example.tsx'] ? 'tsx' : 'jsx';
  form.action = `https://stackblitz.com/run?file=src/Example.${fileExt}`;
  form.target = '_blank';
  const field = (name: string, value: string) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.append(input);
  };
  field('project[title]', title);
  field('project[description]', 'Pinfold example');
  field('project[template]', 'node');
  for (const [path, content] of Object.entries(files)) field(`project[files][${path}]`, content);
  document.body.append(form);
  form.submit();
  form.remove();
}

/** CodeSandbox: the define API returns a sandbox id; the tab is opened first so no popup blocker stops it. */
export async function openCodeSandbox(files: Files): Promise<void> {
  const tab = window.open('about:blank', '_blank');
  try {
    const res = await fetch('https://codesandbox.io/api/v1/sandboxes/define?json=1', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ files: Object.fromEntries(Object.entries(files).map(([p, content]) => [p, { content }])) }),
    });
    const { sandbox_id: id } = (await res.json()) as { sandbox_id?: string };
    if (!id) throw new Error('No sandbox id');
    const url = `https://codesandbox.io/p/sandbox/${id}`;
    if (tab) tab.location.href = url;
    else window.open(url, '_blank');
  } catch (error) {
    tab?.close();
    throw error;
  }
}
