import { useEffect } from 'react';
import { create } from 'zustand';
import { applyRtlForLocale } from '../lib/rtl';
import { changeLocale, readSavedLocale, type AppLocale } from '../i18n';

type LocaleState = {
  locale: AppLocale;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  setLocale: (locale: AppLocale) => Promise<void>;
};

const useLocaleStore = create<LocaleState>((set, get) => ({
  locale: 'en',
  isHydrated: false,
  hydrate: async () => {
    if (get().isHydrated) return;
    const locale = await readSavedLocale();
    set({ locale, isHydrated: true });
  },
  setLocale: async (locale) => {
    const previous = get().locale;
    if (previous === locale) return;
    await changeLocale(locale);
    set({ locale, isHydrated: true });
    await applyRtlForLocale(locale, previous);
  },
}));

export function useLocale() {
  const locale = useLocaleStore((state) => state.locale);
  const isHydrated = useLocaleStore((state) => state.isHydrated);
  const hydrate = useLocaleStore((state) => state.hydrate);
  const setLocale = useLocaleStore((state) => state.setLocale);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return { locale, isHydrated, setLocale };
}
