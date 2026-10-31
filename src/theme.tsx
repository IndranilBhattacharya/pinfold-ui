import * as React from 'react';
import { LumaeProvider as CoreProvider, type LumaeProviderProps } from '@lumae/core';
import { createTheme, type PaletteConfig, type Theme } from '@lumae/core/palette';

/** Docs wrapper: themes the whole document so the page chrome follows too. */
export function LumaeProvider(props: LumaeProviderProps) {
  return <CoreProvider applyToDocument {...props} />;
}

export type Palette = PaletteConfig;

export const DEFAULT_PALETTE: Palette = {
  primary: 274,
  accent: 274,
  neutral: 274,
  intensity: 1,
  radius: 'lg',
};

/**
 * Applies a palette to the live document using the very same `createTheme()`
 * the CLI runs. What the sliders show is exactly what `npx lumae theme`
 * would write to disk — there is no separate preview implementation to drift.
 */
export function useLiveTheme(palette: Palette, mode: 'light' | 'dark'): Theme {
  const theme = React.useMemo(() => createTheme(palette), [palette]);

  React.useLayoutEffect(() => {
    const root = document.documentElement;
    for (const [key, value] of Object.entries(theme.vars)) root.style.setProperty(key, value);
    root.setAttribute('data-lumae-theme', mode);
    return () => {
      for (const key of Object.keys(theme.vars)) root.style.removeProperty(key);
    };
  }, [theme, mode]);

  return theme;
}
