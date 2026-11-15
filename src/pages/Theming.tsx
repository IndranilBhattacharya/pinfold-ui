import * as React from 'react';
import type { Theme } from '@pinfold/core/palette';
import type { PinfoldStylePack } from '@pinfold/core';
import { PinfoldProvider } from '@pinfold/react';
import { defineButton } from '@pinfold/react/button';
import { defineSwitch } from '@pinfold/react/switch';
import { defineBadge } from '@pinfold/react/badge';
import { defineInput } from '@pinfold/react/input';
import { PaletteStudio } from '../PaletteStudio';
import type { Palette } from '../theme';
import { CodeBlock } from '../site/CodeBlock';
import { PageIcon } from '../site/icons';
import { Guide, P, Section } from './parts';
import { PrevNext } from './ComponentPage';

const Btn = defineButton({ size: 'sm' });
const Sw = defineSwitch({ size: 'sm' });
const Tag = defineBadge({ size: 'sm', variant: 'soft' });
const Field = defineInput({ size: 'sm' });

const PACKS: Array<[PinfoldStylePack, string, string]> = [
  ['default', 'Plain', 'Solid surfaces and crisp hairlines. The default.'],
  ['glass', 'Glass', 'Frosted, translucent surfaces with a light rim and a sheen.'],
  ['material', 'Material', 'Raised surfaces with soft, layered shadows.'],
  ['noise', 'Noise', 'Frosted surfaces with a fine film grain.'],
  ['brutalist', 'Brutalist', 'Hard edges, heavy borders and offset shadows.'],
];

function PackPreview({ pack, name, text }: { pack: PinfoldStylePack; name: string; text: string }) {
  return (
    <figure className="dx-pack">
      <PinfoldProvider stylePack={pack} className="dx-pack__stage">
        <div className="dx-pack__row">
          <Btn label="Save" />
          <Btn label="Cancel" variant="outline" tone="neutral" />
        </div>
        <Field label={`${name} field`} hideLabel placeholder="Search…" />
        <div className="dx-pack__row">
          <Sw label="Alerts" defaultChecked />
          <Tag label="Live" tone="success" />
        </div>
      </PinfoldProvider>
      <figcaption>
        <strong>{name}</strong>
        <span>{text}</span>
        {pack !== 'default' ? <code>stylePack="{pack}"</code> : <code>no pack</code>}
      </figcaption>
    </figure>
  );
}

export function Theming({ palette, onPalette, theme, pack, onPack }: { palette: Palette; onPalette: (p: Palette) => void; theme: Theme; pack: PinfoldStylePack | 'default'; onPack: (p: PinfoldStylePack | 'default') => void }) {
  return (
    <Guide title="Theming" icon={<PageIcon name="theming" size={26} />} lede="Give Pinfold your brand colours in any format. It builds eleven steps for each role in OKLCH, keeps text readable on every fill, and writes the CSS for you.">
      <Section id="studio" title="Palette studio" lede="Type a colour or pick one. The whole site wears it as you go, and the command underneath writes exactly this theme into your project." wide>
        <PaletteStudio palette={palette} onChange={onPalette} theme={theme} pack={pack} onPack={onPack} />
      </Section>
      <Section id="colours" title="Your colours">
        <P>{'Each role takes a hue name (`emerald`), a hue angle (`262`) or any CSS colour: `#4f46e5`, `rgb(79 70 229)`, `hsl(243 75% 59%)`, `oklch(0.51 0.23 277)`. Your exact colour sits on the step nearest its lightness, and the other ten are built around it.'}</P>
        <P>{'Solid fills pick white or near-black text, whichever reads better, and nudge the fill until the text reaches 5:1. A pale yellow brand stays yellow; its buttons just get dark text.'}</P>
        <CodeBlock language="bash" code={`npx pinfold theme --primary "#4f46e5" --success "rgb(22 163 74)" --check`} />
        <CodeBlock file="theme" code={`import { createTheme } from '@pinfold/core/palette';\n\nconst theme = createTheme({ primary: '#4f46e5', neutral: 'slate', danger: 'oklch(0.6 0.22 25)' });\ntheme.css;      // the CSS variables, light and dark\ntheme.contrast; // the WCAG report`} />
      </Section>
      <Section id="packs" title="Style packs" lede="A pack changes surfaces, edges and shadows of every component at once, never the colours or the layout.">
        <div className="dx-packs">
          {PACKS.map(([p, name, text]) => (
            <PackPreview key={name} pack={p} name={name} text={text} />
          ))}
        </div>
        <CodeBlock file="layout" code={`import '@pinfold/css/packs.css';\nimport { PinfoldProvider } from '@pinfold/react';\n\n<PinfoldProvider stylePack="glass">{children}</PinfoldProvider>`} />
      </Section>
      <Section id="modes" title="Light and dark">
        <P>{'`theme="system"` follows the reader’s setting; `"light"` or `"dark"` fixes it. Every token has both values, so components need no dark styles of their own.'}</P>
        <CodeBlock file="layout" code={`<PinfoldProvider theme="system">{children}</PinfoldProvider>`} />
      </Section>
      <Section id="tokens" title="Tokens">
        <P>{'Everything is a CSS variable: `--pinfold-primary-50` to `-950` for each role, semantic colours (`--pinfold-color-bg`, `-surface`, `-text`, `-border`, `-accent`), radii, spacing, shadows and motion. Export them as W3C design tokens for Figma or Style Dictionary.'}</P>
        <CodeBlock language="bash" code={`npx pinfold theme --format dtcg`} />
      </Section>
      <Section id="defaults" title="App-wide defaults">
        <P>{'Set a default for any component once. A preset or a prop still wins.'}</P>
        <CodeBlock file="pinfold.config" code={`import { defineConfig } from '@pinfold/react';\n\nexport const config = defineConfig({\n  size: 'sm',\n  defaults: { button: { variant: 'soft' }, table: { density: 'compact' } },\n});\n\n<PinfoldProvider config={config}>{children}</PinfoldProvider>`} />
      </Section>
      <PrevNext name="theming" />
    </Guide>
  );
}
