import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

export default function HomeTabScreen() {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-text-primary">{t('nav.tabs.home')}</Text>
    </View>
  );
}
