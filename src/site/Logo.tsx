import * as React from 'react';

/** The Pinfold mark: a glossy tile with a P whose bowl ends in a folded corner (pin + fold). */
export function Mark({ size = 28 }: { size?: number }) {
  const id = React.useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false" className="dx-mark">
      <defs>
        <linearGradient id={`${id}t`} x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#a78bfa" />
          <stop offset=".55" stopColor="#7c3aed" />
          <stop offset="1" stopColor="#4f46e5" />
        </linearGradient>
        <linearGradient id={`${id}s`} x1="32" y1="2" x2="32" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" stopOpacity=".45" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}f`} x1="36" y1="34" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ede9fe" />
          <stop offset="1" stopColor="#c4b5fd" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="32" fill={`url(#${id}t)`} />
      <circle cx="32" cy="32" r="32" fill={`url(#${id}s)`} />
      <circle cx="32" cy="32" r="31" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="1.5" />
      <g transform="translate(-2 0)">
        <path d="M29 38h11L29 49z" fill="#1e1b4b" fillOpacity=".28" transform="translate(1.5 1.5)" />
        <path d="M21 15h14.5a11.5 11.5 0 0 1 0 23H29v11h-8z" fill="#fff" />
        <path d="M29 23h6a3.5 3.5 0 0 1 0 7h-6z" fill="#7c3aed" />
        <path d="M35.5 38H29v11l11-11z" fill={`url(#${id}f)`} />
      </g>
    </svg>
  );
}

export function Wordmark() {
  return (
    <span className="dx-wordmark">
      <Mark size={26} />
      <span>pinfold</span>
    </span>
  );
}
