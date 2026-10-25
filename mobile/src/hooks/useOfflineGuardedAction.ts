import { useCallback, useLayoutEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNetworkStatus } from './useNetworkStatus';

type OfflineGuardedAction<Args extends unknown[]> = {
  disabled: boolean;
  onPress: (...args: Args) => void;
  disabledReason: string | null;
};

export function useOfflineGuardedAction<Args extends unknown[]>(
  handler: (...args: Args) => void,
): OfflineGuardedAction<Args> {
  const { isOnline } = useNetworkStatus();
  const { t } = useTranslation();
  const isOnlineRef = useRef(isOnline);
  const handlerRef = useRef(handler);

  // Update before the browser/native event loop can invoke a held callback.
  useLayoutEffect(() => {
    isOnlineRef.current = isOnline;
    handlerRef.current = handler;
  }, [handler, isOnline]);

  const onPress = useCallback((...args: Args) => {
    if (!isOnlineRef.current) return;
    handlerRef.current(...args);
  }, []);

  return {
    disabled: !isOnline,
    onPress,
    disabledReason: isOnline
      ? null
      : t('common.offlineActionRequiresConnection'),
  };
}
