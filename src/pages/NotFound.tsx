import { defineEmpty } from '@pinfold/react/empty';
import { SearchX } from 'lucide-react';
import { docsHref } from '../site/router';

const Missing = defineEmpty({ variant: 'plain' });

export function NotFound() {
  return (
    <article id="dx-article" className="dx-article dx-notfound">
      <h1 className="dx-sr">Page not found</h1>
      <Missing
        title="This page does not exist"
        description="It may have moved when the docs got their new address. The search (Ctrl K) finds every page."
        media={<SearchX size={28} aria-hidden="true" />}
        actions={[{ label: 'Go to the docs', href: docsHref('introduction') }]}
      />
    </article>
  );
}
