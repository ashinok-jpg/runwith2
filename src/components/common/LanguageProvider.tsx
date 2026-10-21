import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { I18nContext } from '../../i18n/context';
import { LANGS, translate, type Lang, type MessageKey, type MessageParams } from '../../i18n/strings';

const STORAGE_KEY = 'runwith.lang';

// Saved choice first, then the browser's language
const initialLang = (): Lang => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && (LANGS as string[]).includes(saved)) return saved as Lang;
  } catch {
    // Storage can be blocked; fall back to the browser language
  }
  return navigator.language?.toLowerCase().startsWith('ja') ? 'ja' : 'en';
};

const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(initialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Not saved; the choice still applies for this visit
    }
  }, []);

  const value = useMemo(
    () => ({ lang, setLang, t: (key: MessageKey, params?: MessageParams) => translate(lang, key, params) }),
    [lang, setLang]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export default LanguageProvider;
