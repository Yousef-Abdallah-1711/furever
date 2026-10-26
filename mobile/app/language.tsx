import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Button } from '@/components/Button';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useLocale } from '@/hooks/useLocale';
import { onboardingRoutes } from '@/features/onboarding/router';

export default function LanguageScreen() {
  const { t } = useTranslation();
  const { locale, setLocale } = useLocale();

  return (
    <View className="flex-1 justify-center bg-background px-sp-6 py-sp-8">
      <View className="mx-auto w-full max-w-xl gap-sp-6">
        <ScreenHeader title={t('screens.auth.onboarding.language')} />
        <View className="gap-sp-3">
          <Button block variant={locale === 'en' ? 'primary' : 'outline'} onClick={() => void setLocale('en')}>
            English
          </Button>
          <Button block variant={locale === 'ar' ? 'primary' : 'outline'} onClick={() => void setLocale('ar')}>
            العربية
          </Button>
        </View>
        <Button block onClick={() => router.replace(onboardingRoutes.onboarding)}>
          {t('screens.auth.onboarding.continue')}
        </Button>
      </View>
    </View>
  );
}
