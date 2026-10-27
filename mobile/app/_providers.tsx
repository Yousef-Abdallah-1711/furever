import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { shouldClearPrivateCacheOnAuthChange, shouldPersistQuery } from '@/lib/query-cache-policy';

const queryClient = new QueryClient();
const asyncStoragePersister = createAsyncStoragePersister({ storage: AsyncStorage });

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    let currentUserId: string | null | undefined;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const nextUserId = session?.user.id ?? null;
      if (shouldClearPrivateCacheOnAuthChange({ event, previousUserId: currentUserId, nextUserId })) {
        queryClient.clear();
        void asyncStoragePersister.removeClient();
      }
      currentUserId = nextUserId;
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: asyncStoragePersister,
        dehydrateOptions: {
          shouldDehydrateQuery: shouldPersistQuery,
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
