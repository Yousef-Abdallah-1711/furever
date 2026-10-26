import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { useColorScheme } from 'nativewind';
import { trackMobileEvent } from '../lib/observability';

export type AppTheme = 'light' | 'dark';
const THEME_STORAGE_KEY = 'furever.theme';

type ThemeState = {
  theme: AppTheme;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  setTheme: (theme: AppTheme) => Promise<void>;
};

const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'light',
  isHydrated: false,
  hydrate: async () => {
    if (get().isHydrated) return;
    const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
    set({ theme: saved === 'dark' ? 'dark' : 'light', isHydrated: true });
  },
  setTheme: async (theme) => {
    if (get().theme === theme) return;
    await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
    set({ theme, isHydrated: true });
    trackMobileEvent('theme_changed', theme);
  },
}));

export function useTheme() {
  const theme = useThemeStore((state) => state.theme);
  const isHydrated = useThemeStore((state) => state.isHydrated);
  const hydrate = useThemeStore((state) => state.hydrate);
  const setTheme = useThemeStore((state) => state.setTheme);
  const { setColorScheme } = useColorScheme();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    setColorScheme(theme);
  }, [setColorScheme, theme]);

  return { theme, isHydrated, setTheme };
}
