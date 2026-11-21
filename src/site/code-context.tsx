import * as React from 'react';
import { Check, Copy } from 'lucide-react';
import { defineButton } from '@pinfold/react/button';
import { SiteToasts } from '../playground/site-toast';

const Tool = defineButton({ variant: 'ghost', tone: 'neutral', size: 'sm', iconOnly: true });

export type CodeLang = 'ts' | 'js';

/** One language choice for every snippet on the site, remembered. */
const LangContext = React.createContext<{ lang: CodeLang; setLang: (l: CodeLang) => void }>({ lang: 'ts', setLang: () => {} });

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<CodeLang>(() => {
    try {
      return localStorage.getItem('pinfold-lang') === 'js' ? 'js' : 'ts';
    } catch {
      return 'ts';
    }
  });
  const setLang = React.useCallback((l: CodeLang) => {
    setLangState(l);
    try {
      localStorage.setItem('pinfold-lang', l);
    } catch {
      /* private mode */
    }
  }, []);
  const value = React.useMemo(() => ({ lang, setLang }), [lang, setLang]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export const useLang = () => React.useContext(LangContext);

export async function copyText(label: string, text: string) {
  try {
    await navigator.clipboard.writeText(text);
    void SiteToasts.show({ title: `${label} copied`, tone: 'success' });
    return true;
  } catch {
    void SiteToasts.show({ title: 'Copy failed', description: 'Select the text and copy it instead.', tone: 'danger' });
    return false;
  }
}

/** A copy button that shows a tick for a moment after it copied. */
export function CopyButton({ text, label = 'Copy code', what = 'Code' }: { text: string; label?: string; what?: string }) {
  const [done, setDone] = React.useState(false);
  React.useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setDone(false), 1600);
    return () => clearTimeout(t);
  }, [done]);
  return <Tool label={done ? 'Copied' : label} icon={done ? <Check size={15} /> : <Copy size={15} />} onClick={async () => setDone(await copyText(what, text))} />;
}
