import { useState, useCallback } from 'react';
import { LANG_KEY } from '@/shared/config/constants';
import { Lang, TRANSLATIONS, TranslationKey } from '@/shared/lib/translations';

function getInitialLang(): Lang {
  const saved = localStorage.getItem(LANG_KEY) as Lang | null;
  if (saved === 'pt' || saved === 'en') return saved;
  return navigator.language?.toLowerCase().startsWith('en') ? 'en' : 'pt';
}

export function useLang() {
  const [lang, setLang] = useState<Lang>(getInitialLang);

  const toggleLang = useCallback(() => {
    setLang(prev => {
      const next: Lang = prev === 'pt' ? 'en' : 'pt';
      localStorage.setItem(LANG_KEY, next);
      document.documentElement.setAttribute('lang', next);
      return next;
    });
  }, []);

  const t = useCallback(
    (key: TranslationKey): string =>
      TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.pt[key] ?? key,
    [lang],
  );

  return { lang, toggleLang, t };
}
