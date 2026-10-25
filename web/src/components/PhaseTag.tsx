'use client';

import type { ReactNode } from 'react';
export interface PhaseTagProps { phase?: 2 | 3 | 4; children?: ReactNode; }
export function PhaseTag({ phase = 2, children }: PhaseTagProps) {
  return <span className="inline-flex rounded-r-chip bg-surface-secondary px-sp-3 py-sp-1 text-fs-caption text-text-secondary">{children ?? 'Phase ' + phase}</span>;
}
