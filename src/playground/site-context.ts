import * as React from 'react';
import type { PaletteConfig } from '@pinfold/core/palette';

/** The site's own colour mode, set by the toggle in the header. */
export const SiteMode = React.createContext<'light' | 'dark'>('dark');

/** The palette chosen in the palette studio: the site and every preview frame wear it. */
export const SitePalette = React.createContext<PaletteConfig | null>(null);
