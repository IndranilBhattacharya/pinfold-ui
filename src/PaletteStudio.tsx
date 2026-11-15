import * as React from 'react';
import { RotateCcw } from 'lucide-react';
import { HUES, roleFromColor, type Theme } from '@pinfold/core/palette';
import { defineSlider } from '@pinfold/react/slider';
import { defineToggle } from '@pinfold/react/toggle';
import { defineInput } from '@pinfold/react/input';
import { definePopover } from '@pinfold/react/popover';
import { defineColorPicker } from '@pinfold/react/colorpicker';
import { defineButton } from '@pinfold/react/button';
import { defineBadge } from '@pinfold/react/badge';
import { defineSwitch } from '@pinfold/react/switch';
import { defineTable } from '@pinfold/react/table';
import { defineProgress } from '@pinfold/react/progress';
import type { PinfoldStylePack } from '@pinfold/core';
import { CodeBlock } from './site/CodeBlock';
import type { Palette } from './theme';

const Intensity = defineSlider({ size: 'sm', min: 0, max: 150, showValue: 'never' });
const Choice = defineToggle({ size: 'sm', variant: 'segmented', selection: 'single' });
const ColorField = defineInput({ size: 'sm' });
const Pick = definePopover({ placement: 'bottom-start', size: 'sm' });
const Picker = defineColorPicker({ format: 'hex' });
const Reset = defineButton({ variant: 'ghost', tone: 'neutral', size: 'sm' });
const Sample = defineButton({ size: 'sm' });
const Tag = defineBadge({ variant: 'soft', size: 'sm' });
const On = defineSwitch({ size: 'sm' });
const Report = defineTable<ReportRow>({ variant: 'outline', density: 'compact', lines: 'rows', columnMenu: false });
const Meter = defineProgress({ size: 'sm' });

interface ReportRow {
  id: string;
  step: string;
  surface: string;
  ratio: string;
  text: string;
  ui: string;
}

const ROLES = [
  ['primary', 'Buttons, links, focus and selection.'],
  ['accent', 'A second hue for your own UI.'],
  ['neutral', 'Text, surfaces and borders.'],
  ['success', 'Confirmation and done states.'],
  ['warning', 'Caution, ratings.'],
  ['danger', 'Errors and destructive actions.'],
  ['info', 'Neutral news and tips.'],
] as const;
type Role = (typeof ROLES)[number][0];
const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
const RADII = ['none', 'sm', 'md', 'lg', 'full'] as const;
const PACKS: Array<[PinfoldStylePack | 'default', string]> = [
  ['default', 'Plain'],
  ['glass', 'Glass'],
  ['material', 'Material'],
  ['noise', 'Noise'],
  ['brutalist', 'Brutalist'],
];

/** A role's value as the field shows it: a colour, a hue name, a hue angle, or empty (the default). */
const shown = (v: unknown) => (v == null ? '' : typeof v === 'object' ? String((v as { hue?: number }).hue ?? '') : String(v));
/** Whether text is a value the theme engine takes: a hue name, a hue angle or any CSS colour. */
const valid = (text: string) => !text || text in HUES || Number.isFinite(Number(text)) || roleFromColor(text) !== null;

function RoleRow({ role, hint, value, theme, onChange }: { role: Role; hint: string; value: unknown; theme: Theme; onChange: (next: string | number | undefined) => void }) {
  const [draft, setDraft] = React.useState(shown(value));
  React.useEffect(() => setDraft(shown(value)), [value]);
  const ok = valid(draft.trim());
  const commit = (text: string) => {
    const t = text.trim();
    if (!valid(t)) return;
    onChange(t === '' ? undefined : Number.isFinite(Number(t)) ? Number(t) : t);
  };
  const mid = theme.vars[`--pinfold-${role}-500`];
  return (
    <div className="dx-role">
      <div className="dx-role__head">
        <Pick
          aria-label={`Pick the ${role} colour`}
          trigger={{ label: `Pick the ${role} colour`, iconOnly: true, variant: 'outline', tone: 'neutral', className: 'dx-role__swatch', icon: <span className="dx-role__chip" style={{ background: mid }} /> }}
          content={
            <Picker
              label={`${role} colour`}
              value={theme.anchors[role]?.color ?? theme.vars[`--pinfold-${role}-600`]}
              onChange={(hex: string) => {
                setDraft(hex);
                onChange(hex);
              }}
            />
          }
        />
        <span className="dx-role__name">
          <strong>{role}</strong>
          <span>{hint}</span>
        </span>
      </div>
      <ColorField
        label={`${role} colour`}
        hideLabel
        value={draft}
        placeholder={role === 'primary' ? 'violet, 262 or #7c3aed' : 'default'}
        invalid={!ok}
        error={ok ? undefined : 'A hue name, an angle (0 to 360), or a CSS colour: #hex, rgb(), hsl(), oklch().'}
        onChange={(v: string) => setDraft(v)}
        onBlur={() => commit(draft)}
        onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && commit(draft)}
      />
    </div>
  );
}

export function PaletteStudio({
  palette,
  onChange,
  theme,
  pack,
  onPack,
}: {
  palette: Palette;
  onChange: (next: Palette) => void;
  theme: Theme;
  pack: PinfoldStylePack | 'default';
  onPack: (p: PinfoldStylePack | 'default') => void;
}) {
  const set = (key: keyof Palette, value: unknown) => {
    const next = { ...palette, [key]: value } as Palette;
    if (value === undefined) delete (next as unknown as Record<string, unknown>)[key];
    onChange(next);
  };
  const rows: ReportRow[] = theme.contrast
    // The steps the theme uses for text: 600 on light surfaces, 400 on dark ones (what `--check` tests).
    .filter((r) => r.role !== 'neutral' && r.role !== 'accent' && ((r.step === 600 && r.against === 'light-surface') || (r.step === 400 && r.against === 'dark-surface')))
    .map((r) => ({
      id: `${r.role}-${r.step}-${r.against}`,
      step: `${r.role}-${r.step}`,
      surface: r.against === 'light-surface' ? 'Light' : 'Dark',
      ratio: `${r.ratio.toFixed(2)}:1`,
      text: r.passes.text ? 'Pass' : 'Fail',
      ui: r.passes.ui ? 'Pass' : 'Fail',
    }));
  return (
    <div className="dx-studio">
      <div className="dx-studio__controls">
        <div className="dx-studio__roles">
          {ROLES.map(([role, hint]) => (
            <RoleRow key={role} role={role} hint={hint} value={palette[role]} theme={theme} onChange={(v) => set(role, v)} />
          ))}
        </div>
        <div className="dx-studio__row">
          <div className="dx-studio__field">
            <span className="dx-studio__label">
              Colour intensity <b>{(palette.intensity ?? 1).toFixed(2)}×</b>
            </span>
            <Intensity label="Colour intensity" hideLabel value={[(palette.intensity ?? 1) * 100]} onChange={([n]: number[]) => set('intensity', n / 100)} />
          </div>
          <div className="dx-studio__field">
            <span className="dx-studio__label">Corner radius</span>
            <Choice label="Corner radius" hideLabel items={RADII.map((r) => ({ value: r, label: r }))} value={[palette.radius ?? 'md']} onChange={(v: string[]) => v[0] && set('radius', v[0])} />
          </div>
        </div>
        <div className="dx-studio__field">
          <span className="dx-studio__label">Style pack (the whole site follows)</span>
          <Choice label="Style pack" hideLabel items={PACKS.map(([value, label]) => ({ value, label }))} value={[pack]} onChange={(v: string[]) => v[0] && onPack(v[0] as PinfoldStylePack | 'default')} />
        </div>
        <Reset label="Back to the defaults" icon={<RotateCcw size={14} aria-hidden="true" />} onClick={() => onChange({ primary: 274, intensity: 1, radius: 'md' })} />
        <CodeBlock language="bash" title="Reproduce this palette" code={command(palette, pack)} />
      </div>

      <div className="dx-studio__output">
        <div className="dx-ramps">
          {ROLES.map(([role]) => (
            <div key={role} className="dx-ramp">
              <span className="dx-ramp__name">{role}</span>
              <div className="dx-ramp__steps">
                {STEPS.map((step) => (
                  <span key={step} className="dx-ramp__step" title={`--pinfold-${role}-${step}: ${theme.vars[`--pinfold-${role}-${step}`]}`} style={{ background: theme.vars[`--pinfold-${role}-${step}`] }} data-anchor={theme.anchors[role]?.step === step ? '' : undefined}>
                    <span className="dx-ramp__label" data-dark={step >= 500 ? "" : undefined}>{step}</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="dx-studio__preview" aria-label="Preview">
          <div className="dx-studio__samples">
            <Sample label="Primary" />
            <Sample label="Soft" variant="soft" />
            <Sample label="Outline" variant="outline" />
            <Sample label="Delete" tone="danger" />
            <Sample label="Approve" tone="success" variant="soft" />
          </div>
          <div className="dx-studio__samples">
            <Tag label="New" />
            <Tag label="Paid" tone="success" />
            <Tag label="Due" tone="warning" />
            <Tag label="Failed" tone="danger" />
            <Tag label="Beta" tone="info" />
            <On label="Notifications" defaultChecked />
          </div>
          <Meter label="Upload" value={64} />
        </div>
        <Report
          label="Text contrast, the steps each role uses for text (WCAG 2.2: 4.5:1 for text, 3:1 for controls)"
          rows={rows}
          rowKey="id"
          columns={[
            { key: 'step', header: 'Colour', cell: ({ row }) => <code>{row.step}</code> },
            { key: 'surface', header: 'On' },
            { key: 'ratio', header: 'Ratio', align: 'end' },
            { key: 'text', header: 'Text', cell: ({ row }) => <Tag label={row.text} tone={row.text === 'Pass' ? 'success' : 'danger'} /> },
            { key: 'ui', header: 'Controls', cell: ({ row }) => <Tag label={row.ui} tone={row.ui === 'Pass' ? 'success' : 'danger'} /> },
          ]}
        />
      </div>
    </div>
  );
}

function command(palette: Palette, pack: string) {
  const parts = ['npx pinfold theme'];
  for (const [role] of ROLES) {
    const v = palette[role];
    if (v == null || (role === 'primary' && v === 274)) continue;
    const text = shown(v);
    parts.push(`--${role} ${/^[\w-]+$/.test(text) ? text : `"${text}"`}`);
  }
  if ((palette.intensity ?? 1) !== 1) parts.push(`--intensity ${(palette.intensity ?? 1).toFixed(2)}`);
  if (palette.radius && palette.radius !== 'md') parts.push(`--radius ${palette.radius}`);
  if (pack !== 'default') parts.push(`--style ${pack}`);
  return parts.join(' ') + ' --check';
}
