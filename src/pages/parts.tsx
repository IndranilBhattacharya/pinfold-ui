import * as React from 'react';
import { Link2 } from 'lucide-react';

/** A titled section of a docs page; its heading is a deep link and an entry of "On this page". */
export function Section({ id, title, lede, children, wide }: { id: string; title: string; lede?: React.ReactNode; children: React.ReactNode; wide?: boolean }) {
  return (
    <section className={wide ? 'dx-section dx-section--wide' : 'dx-section'} aria-labelledby={id}>
      <h2 id={id}>
        <a className="dx-anchor" href={`#${id}`} aria-label={`Link to ${title}`}>
          <Link2 size={16} aria-hidden="true" />
        </a>
        {title}
      </h2>
      {lede ? <p className="dx-section__lede">{lede}</p> : null}
      {children}
    </section>
  );
}

export function H3({ id, children }: { id: string; children: React.ReactNode }) {
  return <h3 id={id}>{children}</h3>;
}

/** A guide page: title, lede, then sections. */
export function Guide({ title, lede, icon, children }: { title: string; lede: React.ReactNode; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <article id="dx-article" className="dx-article">
      <header className="dx-head">
        <div className="dx-head__title">
          <span className="dx-head__icon">{icon}</span>
          <h1>{title}</h1>
        </div>
        <p className="dx-head__lede">{lede}</p>
      </header>
      {children}
    </article>
  );
}

/** Prose with inline code: `backticks` become <code>. */
export function P({ children }: { children: string }) {
  const parts = children.split(/(`[^`]+`)/g);
  return <p className="dx-p">{parts.map((p, i) => (p.startsWith('`') ? <code key={i}>{p.slice(1, -1)}</code> : p))}</p>;
}
