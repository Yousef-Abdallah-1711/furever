'use client';

import { ThemeProvider } from '@/components/ThemeProvider';
import { ObservabilityInit } from '@/components/ObservabilityInit';
import type { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem={false}>
      <ObservabilityInit />
      {children}
    </ThemeProvider>
  );
}
