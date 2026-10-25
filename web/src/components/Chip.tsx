'use client';

import type { ReactElement } from 'react';
import { Icon } from './Icon';

export interface ChipProps {
  on?: boolean;
  icon?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

export function Chip({ on = false, icon, children, onClick }: ChipProps): ReactElement {
  return (
    <button type="button" aria-pressed={on} onClick={onClick}
      className={`inline-flex items-center gap-sp-2 rounded-r-chip border px-sp-4 py-sp-2 text-fs-button ${on ? 'border-primary bg-primary text-on-primary' : 'border-border bg-surface text-text-primary'}`}>
      {icon ? <Icon name={icon} size={16} style={{ color: 'currentColor' }} /> : null}
      {children}
    </button>
  );
}
