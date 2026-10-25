'use client';

import type { ReactElement } from 'react';

export interface SlotChipProps {
  time: string;
  on?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export function SlotChip({ time, on = false, disabled = false, onClick }: SlotChipProps): ReactElement {
  return (
    <button
      type="button"
      aria-pressed={on}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-r-chip border px-sp-4 py-sp-2 ${on ? 'border-primary bg-primary text-on-primary' : 'border-border bg-surface text-text-primary'} ${disabled ? 'opacity-50' : ''}`}
    >
      {time}
    </button>
  );
}
