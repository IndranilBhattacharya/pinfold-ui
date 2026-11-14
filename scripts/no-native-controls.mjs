// The site is built from the library: its controls are Pinfold components, never native form widgets
// (a native select or checkbox would not wear the theme, the style pack or the size). Fails on any.
//   node scripts/no-native-controls.mjs
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('../src', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const BANNED = [
  [/<select[\s>]/, 'a native <select>: use Select'],
  [/<textarea[\s>]/, 'a native <textarea>: use Input with multiline'],
  [/<input[\s/>]/, 'a native <input>: use Input, Checkbox, Switch, Radio, Slider or NumberField'],
  [/type=["'](checkbox|radio|range)["']/, 'a native checkbox, radio or range: use Checkbox, Radio, Switch or Slider'],
];

const files = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (/\.(tsx|ts|jsx|js)$/.test(name)) files.push(path);
  }
};
walk(ROOT);

const problems = [];
for (const file of files) {
  readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line, i) => {
      // Code shown on the page is text, not markup.
      if (/^\s*(\/\/|\*)/.test(line)) return;
      for (const [re, why] of BANNED) if (re.test(line.replace(/(['"`])(?:\\.|(?!\1).)*\1/g, '""'))) problems.push(`${relative(ROOT, file)}:${i + 1}: ${why}`);
    });
}
console.log(problems.length ? problems.join('\n') : `no native form controls in ${files.length} files`);
process.exitCode = problems.length || !files.length ? 1 : 0;
