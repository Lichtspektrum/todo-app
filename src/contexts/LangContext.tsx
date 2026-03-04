import { createContext, useContext, useState } from 'react';
import type { Lang } from '../i18n';
import { translations } from '../i18n';

type Translations = (typeof translations)[Lang];

interface LangContextValue {
  lang: Lang;
  t: Translations;
  toggleLang: () => void;
}

const LangContext = createContext<LangContextValue>({
  lang: 'zh',
  t: translations.zh as Translations,
  toggleLang: () => {},
});

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('zh');
  const toggleLang = () => setLang(l => l === 'zh' ? 'en' : 'zh');

  return (
    <LangContext.Provider value={{ lang, t: translations[lang], toggleLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
