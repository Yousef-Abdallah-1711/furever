import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Banner } from './Banner';

export function OfflineBanner() {
  const { isOnline } = useNetworkStatus();
  const { t } = useTranslation();

  if (isOnline) return null;

  return (
    <View accessibilityRole="alert" accessibilityLiveRegion="polite">
      <Banner tone="warning">{t('common.offlineActionRequiresConnection')}</Banner>
    </View>
  );
}
