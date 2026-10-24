import '../global.css';

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { View } from 'react-native';
import { I18nProvider } from '@/i18n/provider';
import { useTheme } from '@/hooks/useTheme';
import { useFonts } from '@/lib/fonts';

const ThemedView = View as typeof View & React.ComponentType<React.ComponentProps<typeof View> & { dataSet?: { theme: string } }>;
import { startMobileObservability } from '@/lib/observability';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts();
  const { theme } = useTheme();

  useEffect(() => {
    if (fontsLoaded || fontError) void SplashScreen.hideAsync();
  }, [fontError, fontsLoaded]);

  useEffect(() => { void startMobileObservability(); }, []);

  if (!fontsLoaded && !fontError) return null;

  return (
    <I18nProvider>
      <ThemedView className={`flex-1 ${theme === 'dark' ? 'dark' : ''}`} dataSet={{ theme }}>
        <Stack screenOptions={{ headerShown: false }} />
      </ThemedView>
    </I18nProvider>
  );
}
