import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { Button } from '@/components/Button';

export default function SplashScreen() {
  const { t } = useTranslation();
  return (
    <View className="flex-1 items-center justify-center bg-background px-sp-6">
      <View className="w-full max-w-xl items-center gap-sp-6 rounded-r-card bg-surface p-sp-8">
        <Text accessibilityRole="header" className="text-fs-display font-bold text-primary">
          FurEver
        </Text>
        <Text className="text-center text-fs-body text-text-secondary">
          {t('screens.welcome.theBestCareForYourFurFamily')}
        </Text>
        <Button block size="l" onClick={() => router.replace('/language')}>
          {t('screens.welcome.getStarted')}
        </Button>
      </View>
    </View>
  );
}
