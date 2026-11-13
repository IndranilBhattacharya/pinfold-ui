import * as React from 'react';
import { HUES, type Theme } from '@pinfold/core/palette';
import { defineSlider } from '@pinfold/react/slider';
import { defineSelect } from '@pinfold/react/select';
import type { Palette } from './theme';

const Hue = defineSlider({ size: 'sm', min: 0, max: 360 });
const Chroma = defineSlider({ size: 'sm', min: 0, max: 150, showValue: 'never' });
const Radius = defineSelect({ size: 'sm' });

const ROLES = ['primary', 'accent', 'neutral', 'success', 'warning', 'danger', 'info'] as const;
const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
const TUNABLE = ['primary', 'accent', 'neutral'] as const;
const RADII = ['none', 'sm', 'md', 'lg', 'full'] as const;

export function PaletteStudio({
  palette,
  onChange,
  theme,
}: {
  palette: Palette;
  onChange: (next: Palette) => void;
  theme: Theme;
}) {
  const set = (key: keyof Palette, value: unknown) => onChange({ ...palette, [key]: value });
  const hue = (role: (typeof TUNABLE)[number]) => Number(palette[role] ?? 274);

  return (
    <div className="dx-studio">
      <div className="dx-studio__controls">
        {TUNABLE.map((role) => (
          <div key={role} className="dx-hue">
            <div className="dx-hue__head">
              <span>{role}</span>
              <b>{hue(role)}°</b>
            </div>
            <Hue label={`${role} hue`} hideLabel value={[hue(role)]} onChange={([n]) => set(role, n)} />
            <div className="dx-hue__presets">
              {Object.entries(HUES).map(([name, value]) => (
                <button
                  key={name}
                  type="button"
                  title={`${name} · ${value}°`}
                  aria-label={`${role}: ${name}`}
                  aria-pressed={hue(role) === value}
                  className="dx-chip"
                  style={{ background: swatch(theme, role, value) }}
                  onClick={() => set(role, value)}
                />
              ))}
            </div>
          </div>
        ))}

        <div className="dx-studio__row">
          <div className="dx-dim">
            <span>
              chroma <b>{(palette.intensity ?? 1).toFixed(2)}×</b>
            </span>
            <Chroma label="chroma" hideLabel value={[(palette.intensity ?? 1) * 100]} onChange={([n]) => set('intensity', n / 100)} />
          </div>
          <div className="dx-opt">
            <Radius label="radius" items={[...RADII]} value={palette.radius ?? 'md'} onChange={(r) => r && set('radius', r)} />
          </div>
        </div>

        <div className="dx-code dx-code--accent">
          <span className="dx-code__label">reproduce this exact palette</span>
          <pre>
            <code>{command(palette)}</code>
          </pre>
        </div>
      </div>

      <div className="dx-studio__output">
        <div className="dx-ramps">
          {ROLES.map((role) => (
            <div key={role} className="dx-ramp">
              <span className="dx-ramp__name">{role}</span>
              <div className="dx-ramp__steps">
                {STEPS.map((step) => (
                  <i
                    key={step}
                    className="dx-ramp__step"
                    title={`--pinfold-${role}-${step}: ${theme.vars[`--pinfold-${role}-${step}`]}`}
                    style={{ background: theme.vars[`--pinfold-${role}-${step}`] }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <ContrastReport theme={theme} />
      </div>
    </div>
  );
}

/** The same WCAG report `npx pinfold theme --check` prints in the terminal. */
function ContrastReport({ theme }: { theme: Theme }) {
  const rows = theme.contrast.filter((row) => row.role === 'primary' || row.role === 'danger');

  return (
    <div className="dx-table-wrap">
      <table className="dx-table">
        <caption className="dx-caption">
          WCAG 2.2 contrast — 4.5:1 for body text, 3:1 for large text and UI edges
        </caption>
        <thead>
          <tr>
            <th>Step</th>
            <th>Surface</th>
            <th>Ratio</th>
            <th>Body</th>
            <th>Large / UI</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.role}-${row.step}-${row.against}`}>
              <td>
                <code>
                  {row.role}-{row.step}
                </code>
              </td>
              <td>{row.against === 'light-surface' ? 'light' : 'dark'}</td>
              <td>
                <code className="dx-type">{row.ratio.toFixed(2)}</code>
              </td>
              <td>{verdict(row.passes.text)}</td>
              <td>{verdict(row.passes.ui)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const verdict = (ok: boolean) => (
  <span className={ok ? 'dx-pass' : 'dx-fail'}>{ok ? 'pass' : 'fail'}</span>
);

function command(palette: Palette) {
  const parts = [`npx pinfold theme`];
  for (const role of TUNABLE) {
    const value = palette[role];
    if (value != null) parts.push(`--${role} ${value}`);
  }
  if (palette.intensity !== 1) parts.push(`--intensity ${(palette.intensity ?? 1).toFixed(2)}`);
  if (palette.radius) parts.push(`--radius ${palette.radius}`);
  return parts.join(' ') + ' --check';
}

/** Preview chip colour: mid step of the ramp that hue would produce. */
function swatch(theme: Theme, role: string, hue: number) {
  return `oklch(0.606 ${role === 'neutral' ? 0.019 : 0.201} ${hue})`;
}

