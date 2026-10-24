import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { useLocale } from '@/hooks/useLocale';
import { useTheme } from '@/hooks/useTheme';

export default function HelloScreen() {
  const { t } = useTranslation();
  const { locale, setLocale } = useLocale();
  const { theme, setTheme } = useTheme();
  const dark = theme === 'dark';

  return (
    <View className={`flex-1 items-center justify-center gap-sp-4 p-sp-6 ${dark ? 'dark' : ''}`} data-theme={theme}>
      <View className="items-center gap-sp-3 rounded-r-card bg-surface-card p-sp-6">
        <Text className="text-primary text-fs-h1">{t('common.appName')}</Text>
        <Text className="text-text-primary">{t('common.shellProof')}</Text>
        <Text testID="token-swatch" className="bg-primary rounded-r-control p-sp-4 text-on-primary">
          {t('common.tokenSample')}
        </Text>
      </View>
      <Pressable
        testID="locale-switch"
        accessibilityRole="button"
        onPress={() => void setLocale(locale === 'en' ? 'ar' : 'en')}
      >
        <Text className="text-text-primary">{t(locale === 'en' ? 'common.switchToArabic' : 'common.switchToEnglish')}</Text>
      </Pressable>
      <Pressable testID="theme-switch" accessibilityRole="button" onPress={() => void setTheme(dark ? 'light' : 'dark')}>
        <Text className="text-text-primary">{t(dark ? 'common.switchToLight' : 'common.switchToDark')}</Text>
      </Pressable>
    </View>
  );
}
