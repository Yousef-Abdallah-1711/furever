'use client';

import { ThemeProvider } from '@/components/ThemeProvider';
import { ObservabilityInit } from '@/components/ObservabilityInit';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>
        <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem={false}>
          <ObservabilityInit />
          {children}
        </ThemeProvider>
      </NuqsAdapter>
    </QueryClientProvider>
  );
}
