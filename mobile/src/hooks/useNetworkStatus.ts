import { useEffect, useState } from 'react';
import { addEventListener } from '@react-native-community/netinfo';

export function useNetworkStatus(): { isOnline: boolean } {
  // Until the first NetInfo update arrives, the network status is unknown and treated as offline.
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const unsubscribe = addEventListener((state) => {
      setIsOnline((state.isInternetReachable ?? state.isConnected) === true);
    });

    return unsubscribe;
  }, []);

  return { isOnline };
}
