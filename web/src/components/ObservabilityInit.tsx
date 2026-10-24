'use client';

import { useEffect } from 'react';
import { startWebObservability } from '@/lib/observability';

export function ObservabilityInit() {
  useEffect(() => { void startWebObservability(); }, []);
  return null;
}
