import { I18nManager, Platform } from 'react-native';
import * as Updates from 'expo-updates';
import type { AppLocale } from '../i18n';

export async function applyRtlForLocale(nextLocale: AppLocale, currentLocale: AppLocale) {
  const isArabic = nextLocale === 'ar';
  const wasArabic = currentLocale === 'ar';
  if (isArabic === wasArabic) return;

  I18nManager.allowRTL(true);
  I18nManager.forceRTL(isArabic);
  if (Platform.OS !== 'web') await Updates.reloadAsync();
}
