'use client';

import { useTranslations } from 'next-intl';
import { Banner } from './Banner';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export function OfflineBanner() {
  const { isOnline } = useNetworkStatus();
  const t = useTranslations('common');

  if (isOnline) return null;

  return (
    <div role="status" aria-live="polite">
      <Banner tone="warning">{t('offlineActionRequiresConnection')}</Banner>
    </div>
  );
}
