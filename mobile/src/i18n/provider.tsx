import { useEffect, type ReactNode } from 'react';
import { readSavedLocale, i18n } from './index';
import { I18nextProvider } from 'react-i18next';

export function I18nProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    void readSavedLocale().then((locale) => i18n.changeLanguage(locale));
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
