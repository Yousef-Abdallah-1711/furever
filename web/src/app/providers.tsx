'use client';

import { ThemeProvider } from '@/components/ThemeProvider';
import { ObservabilityInit } from '@/components/ObservabilityInit';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import type { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <NuqsAdapter>
      <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem={false}>
        <ObservabilityInit />
        {children}
      </ThemeProvider>
    </NuqsAdapter>
  );
}
