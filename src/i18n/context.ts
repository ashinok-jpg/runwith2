import { createContext, useContext } from 'react';
import { translate, type Lang, type MessageKey, type MessageParams } from './strings';

export interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: MessageKey, params?: MessageParams) => string;
}

export const I18nContext = createContext<I18nContextValue>({
  lang: 'en',
  setLang: () => {},
  t: (key, params) => translate('en', key, params),
});

export const useI18n = (): I18nContextValue => useContext(I18nContext);
