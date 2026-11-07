/**
 * Sample people for the avatar page, drawn inline: portraits with no network request and nobody's
 * real photo. To the component they are ordinary image URLs.
 */

interface Look {
  bg: [string, string];
  skin: string;
  hair: string;
  shirt: string;
  style: 'short' | 'long' | 'bun' | 'curly' | 'bald';
}

const HAIR: Record<Look['style'], (c: string) => string> = {
  short: (c) => `<path d="M28 40c-1-17 10-24 21-24 12 0 21 8 19 25-2-7-7-12-13-13-8 2-19 1-23-2-2 3-3 8-4 14z" fill="${c}"/>`,
  long: (c) => `<path d="M26 74V40c0-16 10-25 22-25s22 9 22 25v34h-8V42c-2-6-7-10-12-12-5 4-13 6-16 6v38z" fill="${c}"/>`,
  bun: (c) => `<circle cx="48" cy="12" r="8" fill="${c}"/><path d="M28 40c-2-15 8-23 20-23s22 8 20 23c-2-6-6-10-11-11-7 3-17 3-22 0-4 2-6 6-7 11z" fill="${c}"/>`,
  curly: (c) => `<g fill="${c}"><circle cx="30" cy="32" r="8"/><circle cx="36" cy="22" r="9"/><circle cx="48" cy="18" r="10"/><circle cx="60" cy="22" r="9"/><circle cx="66" cy="32" r="8"/></g>`,
  bald: (c) => `<path d="M34 52c2 12 8 16 14 16s12-4 14-16c-3 3-8 4-14 4s-11-1-14-4z" fill="${c}"/>`,
};

function portrait({ bg, skin, hair, shirt, style }: Look): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><defs><linearGradient id="b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg[0]}"/><stop offset="1" stop-color="${bg[1]}"/></linearGradient></defs><rect width="96" height="96" fill="url(#b)"/>${style === 'long' ? HAIR.long(hair) : ''}<path d="M14 96c1-17 14-26 34-26s33 9 34 26z" fill="${shirt}"/><rect x="41" y="54" width="14" height="19" rx="7" fill="${skin}"/><path d="M41 62c4 4 10 4 14 0v5c-4 3-10 3-14 0z" fill="#000" opacity=".1"/><ellipse cx="48" cy="41" rx="19" ry="21" fill="${skin}"/><circle cx="41" cy="41" r="1.9" fill="#29221f"/><circle cx="55" cy="41" r="1.9" fill="#29221f"/><path d="M42.5 50c3 3 8 3 11 0" fill="none" stroke="#29221f" stroke-opacity=".65" stroke-width="1.7" stroke-linecap="round"/>${style === 'long' ? HAIR.short(hair) : HAIR[style](hair)}</svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

export interface SamplePerson {
  name: string;
  file: string;
  photo: string;
}

const make = (name: string, file: string, look: Look): SamplePerson => ({ name, file, photo: portrait(look) });

export const PEOPLE: SamplePerson[] = [
  make('Ada Lovelace', '/people/ada.png', { bg: ['#c7d2fe', '#a5b4fc'], skin: '#f2c9ac', hair: '#3b2a24', shirt: '#4f46e5', style: 'long' }),
  make('Alan Turing', '/people/alan.png', { bg: ['#bbf7d0', '#6ee7b7'], skin: '#eec1a2', hair: '#4a3427', shirt: '#0f766e', style: 'short' }),
  make('Grace Hopper', '/people/grace.png', { bg: ['#fde68a', '#fbbf24'], skin: '#f0c6a8', hair: '#d6d3d1', shirt: '#1e3a8a', style: 'bun' }),
  make('Katherine Johnson', '/people/katherine.png', { bg: ['#fecdd3', '#fda4af'], skin: '#8d5a3c', hair: '#1f1a17', shirt: '#be123c', style: 'curly' }),
  make('Edsger Dijkstra', '/people/edsger.png', { bg: ['#bae6fd', '#7dd3fc'], skin: '#f1cbb0', hair: '#78716c', shirt: '#334155', style: 'bald' }),
  make('Barbara Liskov', '/people/barbara.png', { bg: ['#e9d5ff', '#c4b5fd'], skin: '#f3cfb4', hair: '#57534e', shirt: '#6d28d9', style: 'short' }),
  make('Radia Perlman', '/people/radia.png', { bg: ['#fed7aa', '#fdba74'], skin: '#e6b48f', hair: '#292524', shirt: '#c2410c', style: 'long' }),
];

/** A wide picture for the card page. */
export const LANDSCAPE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8ec5ff"/><stop offset="1" stop-color="#e0e7ff"/></linearGradient></defs><rect width="320" height="180" fill="url(#g)"/><circle cx="250" cy="48" r="20" fill="#fde68a"/><path d="M0 150 90 70l60 55 40-30 130 85H0z" fill="#6366f1" opacity=".75"/><path d="M0 180 120 110l80 70z" fill="#4338ca" opacity=".8"/></svg>',
  );
