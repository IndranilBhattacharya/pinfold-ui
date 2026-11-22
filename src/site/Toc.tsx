import * as React from 'react';
import { TableOfContents } from 'lucide-react';

interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

/** The headings of the page that have an id: section titles (h2) and their parts (h3). */
function collect(root: HTMLElement | null): Heading[] {
  if (!root) return [];
  return [...root.querySelectorAll<HTMLElement>('h2[id], h3[id]')]
    .filter((h) => !h.closest('[data-toc-skip], .dx-stage, iframe'))
    .map((h) => ({ id: h.id, text: (h.dataset.tocLabel ?? h.textContent ?? '').trim(), level: h.tagName === 'H2' ? 2 : 3 }));
}

/** The section being read: the last heading above the upper third of the window. */
function useActive(ids: string[]): string {
  const [active, setActive] = React.useState(ids[0] ?? '');
  React.useEffect(() => {
    if (!ids.length) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.3;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      // At the very bottom the last section is the one being read, however short.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = ids[ids.length - 1];
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [ids.join('|')]); // eslint-disable-line react-hooks/exhaustive-deps
  return active;
}

/** "On this page": the page's sections, the one in view marked, kept in step while reading. */
export function Toc({ page }: { page: string }) {
  const [headings, setHeadings] = React.useState<Heading[]>([]);
  React.useEffect(() => {
    const read = () => {
      const root = document.getElementById('dx-article');
      setHeadings(collect(root));
    };
    read();
    // Lazy pages and examples add headings after the first paint.
    const container = document.getElementById('dx-main') ?? document.body;
    const observer = new MutationObserver(() => read());
    observer.observe(container, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [page]);
  const active = useActive(headings.map((h) => h.id));
  if (headings.length < 2) return null;
  return (
    <div className="dx-toc">
      <p className="dx-toc__title">
        <TableOfContents size={14} aria-hidden="true" /> On this page
      </p>
      <nav aria-label="On this page">
        <ul className="dx-toc__list">
          {headings.map((h) => (
            <li key={h.id} data-level={h.level}>
              <a href={`#${h.id}`} aria-current={h.id === active ? 'location' : undefined}>
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
